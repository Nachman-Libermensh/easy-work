"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeftIcon,
  Minimize,
  Minus,
  Plus,
  ChevronsUp,
  ChevronsDown,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarRail,
  SidebarMenuSkeleton,
  SidebarGroupAction,
} from "@/src/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/src/components/ui/collapsible";
import { UserNav } from "./user-nav";
import Image from "next/image";
import { NavItem } from "@/src/config/navigation";
import { Button } from "../ui/button";

type ExtendedNavItem = NavItem & { isLoading?: boolean };

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: any;
  layoutMode: "top" | "side";
  setLayoutMode: (mode: "top" | "side") => void;
  navItems: ExtendedNavItem[];
}

export default function AppSidebar({
  user,
  layoutMode,
  setLayoutMode,
  navItems,
  ...props
}: AppSidebarProps) {
  const pathname = usePathname();

  // ניהול מצב פתיחה של כל תת-תפריט
  const [openStates, setOpenStates] = React.useState<Record<string, boolean>>(
    {},
  );

  // עדכון מצב פתיחה/סגירה של תפריט מסוים
  const handleToggle = (key: string, open: boolean) => {
    setOpenStates((prev) => ({ ...prev, [key]: open }));
  };

  // בדוק אם לפחות אחד פתוח
  const anyOpen = navItems.some((item) => item.items && openStates[item.title]);
  // בדוק אם כולם סגורים (רק תתי תפריט)
  const allClosed =
    navItems.filter((item) => item.items).length > 0 &&
    navItems
      .filter((item) => item.items)
      .every((item) => !openStates[item.title]);

  // פעולת "צמצם הכל"
  const collapseAll = () => {
    const newState: Record<string, boolean> = {};
    navItems.forEach((item) => {
      if (item.items) newState[item.title] = false;
    });
    setOpenStates(newState);
  };

  // פעולת "הרחב הכל"
  const expandAll = () => {
    const newState: Record<string, boolean> = {};
    navItems.forEach((item) => {
      if (item.items) newState[item.title] = true;
    });
    setOpenStates(newState);
  };

  // פונקציית עזר לרינדור אייקון בצורה נקייה
  const renderIcon = (Icon: any, color?: string | null) => {
    if (!Icon) return null;
    if (typeof Icon === "string") {
      return (
        <Image
          src={Icon}
          alt=""
          width={20}
          height={20}
          className="size-5 object-contain"
        />
      );
    }
    return (
      <Icon className="size-5 shrink-0" style={color ? { color } : undefined} />
    );
  };

  return (
    <Sidebar side="right" variant="inset" collapsible="offcanvas" {...props}>
      <SidebarHeader className="border-b px-4 py-2 flex flex-row items-center gap-2 h-16">
        <Image
          src="/logo.png"
          alt="Logo"
          width={32}
          height={32}
          className="object-contain"
        />
        <h2 className="text-lg font-bold truncate">ברכת הנחל</h2>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm px-2 mb-2 text-muted-foreground/70">
            תפריט
            <SidebarGroupAction
              asChild
              className="text-muted-foreground/70"
              title={anyOpen ? "צמצם הכל" : "הרחב הכל"}
              onClick={anyOpen ? collapseAll : expandAll}
            >
              <Button variant={"ghost"} size={"icon-sm"}>
                {anyOpen ? (
                  <ChevronsUp className="cursor-pointer w-4 h-4" />
                ) : (
                  <ChevronsDown className="cursor-pointer w-4 h-4" />
                )}
              </Button>
            </SidebarGroupAction>
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  item.items?.some((sub) =>
                    pathname.startsWith(sub.href || ""),
                  );

                if (item.items && item.items.length > 0) {
                  const isOpen =
                    (openStates[item.title] ?? isActive) || item.isLoading;

                  return (
                    <Collapsible
                      key={item.title}
                      asChild
                      open={isOpen}
                      onOpenChange={(open) => handleToggle(item.title, open)}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            isActive={isActive}
                            tooltip={item.title}
                            className="h-11 text-[15px] font-medium px-3"
                          >
                            {renderIcon(item.icon, item.color)}
                            <span>{item.title}</span>
                            <ChevronLeftIcon className="mr-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:-rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <SidebarMenuSub className="mr-4 ml-0 border-r border-l-0 pr-2 py-1 gap-1">
                            {item.isLoading
                              ? Array.from({ length: 3 }).map((_, index) => (
                                  <SidebarMenuSubItem key={index}>
                                    <SidebarMenuSkeleton
                                      showIcon={false}
                                      className="h-8 w-full"
                                    />
                                  </SidebarMenuSubItem>
                                ))
                              : item.items.map((subItem) => (
                                  <SidebarMenuSubItem key={subItem.title}>
                                    <SidebarMenuSubButton
                                      asChild
                                      isActive={pathname === subItem.href}
                                      className="h-9 text-[14px]"
                                    >
                                      <Link
                                        href={subItem.href || "#"}
                                        className="flex items-center gap-2"
                                      >
                                        {/* תמיכה באייקון וצבע גם בתת-תפריט (למשל פרויקטים ספציפיים) */}
                                        {renderIcon(
                                          subItem.icon,
                                          subItem.color,
                                        )}
                                        <span className="truncate">
                                          {subItem.title}
                                        </span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className="h-11 text-[15px] font-medium px-3"
                    >
                      <Link href={item.href || "#"}>
                        {renderIcon(item.icon, item.color)}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <UserNav layoutMode={layoutMode} setLayoutMode={setLayoutMode} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
