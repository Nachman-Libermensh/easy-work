"use client";

import { useMemo } from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/src/components/ui/sidebar";
import AppSidebar from "./app-sidebar";
import { TopNav } from "./top-nav";
import { UserNav } from "./user-nav";
import { Separator } from "@/src/components/ui/separator";
import Link from "next/link";
import Image from "next/image";
import { navigationConfig } from "@/src/config/navigation";
import { Building } from "lucide-react";
import { useSession } from "@/src/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "./page-header";
import { useUIStore } from "@/src/store/ui-store"; // אימפורט ל-store החדש
import { LoadingWithImage } from "../ui/custom/loading-with-image";
import { getQuickListProjects } from "@/src/api-services/projects.service";

interface ShellProps {
  children: React.ReactNode;
}

export function Shell({ children }: ShellProps) {
  // נשתמש ב-Zustand במקום ב-useState מקומי
  const { layoutMode, setLayoutMode, _hasHydrated } = useUIStore();

  const { data: session, isPending: isSessionPending } = useSession();

  // 1. שליפת המידע + הסטטוס isLoading
  const {
    data: projects,
    isLoading: projectsIsLoading,
    refetch: refetchProjects,
    isError: projectsIsError,
  } = useQuery({
    queryKey: ["projects", "quick-list"],
    queryFn: () => getQuickListProjects(),
    staleTime: 5 * 60 * 1000, // 5 דקות
    enabled: !!session?.user,
  });

  // Centralized Navigation Logic
  const navItems = useMemo(() => {
    if (!session?.user) return [];

    const items = navigationConfig.map((item) => ({
      ...item,
      items: item.items ? [...item.items] : undefined,
      isLoading: false, // Default
    }));

    // Inject Projects
    const projectsItem = items.find((item) => item.title === "פרויקטים");
    if (projectsItem) {
      // 2. עדכון הדגל isLoading ספציפית לפריט הזה
      projectsItem.isLoading = projectsIsLoading;

      projectsItem.items = [
        {
          title: "כל הפרויקטים",
          href: "/projects",
          icon: Building,
          color: "var(--destructive)",
        },
        // 3. שימוש במערך ריק כברירת מחדל כדי למנוע שבירה
        ...(projects ?? []).map((p) => ({
          title: p.name,
          href: `/projects/${p.id}`,
          icon: Building,
          color: p.color || undefined,

          description: p.description || "", // הוספת תיאור ריק אם אין
        })),
      ];
    }

    return items;
  }, [session?.user?.role, projects, projectsIsLoading]); // הוספת projectsIsLoading לתלויות

  // מניעת ריצוד: אם ה-Auth בטעינה או שההגדרות מהלוקל סטורג' טרם נטענו
  if (isSessionPending || !_hasHydrated) {
    return <LoadingWithImage />;
  }

  if (!session?.user) {
    return <main className="w-full">{children}</main>;
  }

  if (layoutMode === "side") {
    return (
      <SidebarProvider defaultOpen={true}>
        <AppSidebar
          user={session.user}
          layoutMode={layoutMode}
          setLayoutMode={setLayoutMode} // העברה ישירה
          navItems={navItems}
        />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4 h-5">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 " />
              <PageHeader navItems={navItems} />
            </div>
          </header>
          <main className="flex-1 p-4 pt-0">
            <div className="py-4">{children}</div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background/35">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-0.5 flex h-14 items-center justify-between">
          <div className="flex items-center gap-2 shrink-0">
            <Image
              src="/logo.png"
              alt="Logo"
              width={32}
              height={32}
              className="object-contain"
            />
            <Link className="font-bold text-lg hidden md:block" href="/">
              ברכת הנחל
            </Link>
          </div>

          <TopNav navItems={navItems} />

          <UserNav
            layoutMode={layoutMode}
            setLayoutMode={setLayoutMode} // העברה ישירה
          />
        </div>
      </header>
      <main className="w-full px-1 mt-4 mx-1">{children}</main>
    </div>
  );
}
