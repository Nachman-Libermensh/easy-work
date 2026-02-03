"use client";

import { useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/src/components/ui/dropdown-menu";
import {
  User,
  LogOut,
  Key,
  Moon,
  Sun,
  Monitor,
  LayoutDashboard,
  ChevronsUpDown,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { authClient, useSession } from "@/src/lib/auth-client";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/src/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { PasswordInput } from "@/src/components/ui/custom/inputs/password-input";
import { toast } from "sonner";
import Link from "next/link";
import { Spinner } from "../ui/spinner";

interface UserNavProps {
  layoutMode: "top" | "side";
  setLayoutMode: (mode: "top" | "side") => void;
}

export function UserNav(props: UserNavProps) {
  const { data: session, isPending } = useSession();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("נא למלא את כל השדות");
      return;
    }

    setIsLoading(true);
    await authClient.changePassword(
      {
        newPassword: newPassword,
        currentPassword: currentPassword,
        revokeOtherSessions: true,
      },
      {
        onSuccess: () => {
          toast.success("הסיסמה שונתה בהצלחה");
          setIsPasswordDialogOpen(false);
          setCurrentPassword("");
          setNewPassword("");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "שגיאה בשינוי הסיסמה");
        },
      }
    );
    setIsLoading(false);
  };

  const openPasswordDialog = () => {
    setCurrentPassword("");
    setNewPassword("");
    setIsPasswordDialogOpen(true);
  };

  if (isPending) {
    return <Spinner />;
  }
  if (!session?.user) {
    return null;
  }

  return (
    <>
      {props.layoutMode === "side" ? (
        <SidebarUserNav
          {...props}
          user={session.user}
          onOpenPasswordChange={openPasswordDialog}
        />
      ) : (
        <TopBarUserNav
          {...props}
          user={session.user}
          onOpenPasswordChange={openPasswordDialog}
        />
      )}

      <AlertDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      >
        <AlertDialogContent className="sm:max-w-106.25">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">
              שינוי סיסמה
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              הזינו את הסיסמה הנוכחית ואת הסיסמה החדשה.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4" dir="rtl">
            <div className="grid gap-2">
              <label htmlFor="current" className="text-sm font-medium">
                סיסמה נוכחית
              </label>
              <PasswordInput
                id="current"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="new" className="text-sm font-medium">
                סיסמה חדשה
              </label>
              <PasswordInput
                id="new"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          <AlertDialogFooter className="sm:justify-start gap-2">
            <AlertDialogCancel disabled={isLoading}>ביטול</AlertDialogCancel>
            <Button onClick={handlePasswordChange} disabled={isLoading}>
              {isLoading ? "מעדכן..." : "עדכן סיסמה"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface UserNavInternalProps extends UserNavProps {
  user: any;
  onOpenPasswordChange: () => void;
}

function SidebarUserNav({
  user,
  layoutMode,
  setLayoutMode,
  onOpenPasswordChange,
}: UserNavInternalProps) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const { isMobile } = useSidebar();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/sign-in");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu dir="rtl">
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {user.name?.slice(0, 2).toUpperCase() || "US"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-right text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <ChevronsUpDown className="mr-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "left"} // Left because sidebar is on right
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-right text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.image} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {user.name?.slice(0, 2).toUpperCase() || "US"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-right text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <UserMenuContent
              layoutMode={layoutMode}
              setLayoutMode={setLayoutMode}
              setTheme={setTheme}
              handleSignOut={handleSignOut}
              router={router}
              onOpenPasswordChange={onOpenPasswordChange}
              user={user}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function TopBarUserNav({
  user,
  layoutMode,
  setLayoutMode,
  onOpenPasswordChange,
}: UserNavInternalProps) {
  const router = useRouter();
  const { setTheme } = useTheme();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/sign-in");
  };

  return (
    <>
      <DropdownMenu dir="rtl">
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback>
                {user.name?.slice(0, 2).toUpperCase() || "US"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56"
          align="start" // Aligns correctly in RTL
          side="bottom"
          forceMount
        >
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs text-muted-foreground leading-none">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <UserMenuContent
            layoutMode={layoutMode}
            setLayoutMode={setLayoutMode}
            setTheme={setTheme}
            handleSignOut={handleSignOut}
            router={router}
            onOpenPasswordChange={onOpenPasswordChange}
            user={user}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

// Shared Content Component to avoid duplication
function UserMenuContent({
  layoutMode,
  setLayoutMode,
  setTheme,
  handleSignOut,
  router,
  onOpenPasswordChange,
  user,
}: {
  layoutMode: "top" | "side";
  setLayoutMode: (mode: "top" | "side") => void;
  setTheme: (theme: string) => void;
  handleSignOut: () => void;
  router: any;
  onOpenPasswordChange: () => void;
  user: any;
}) {
  const isAdmin = user?.role === "admin";

  return (
    <>
      <DropdownMenuGroup>
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <User className="mr-2 h-4 w-4" />
            <span>פרופיל</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onOpenPasswordChange}>
          <Key className="mr-2 h-4 w-4" />
          <span>שינוי סיסמה</span>
        </DropdownMenuItem>

        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>ממשק ניהול</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href="/admin">
                <UsersIcon className="mr-2 h-4 w-4" />
                <span>הגדרות משתמשים</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/system-settings">
                <SettingsIcon className="mr-2 h-4 w-4" />
                <span>הגדרות מערכת</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger dir="rtl">
            <Monitor className="mr-2 h-4 w-4" />
            <span>ערכת נושא</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="mr-2 h-4 w-4" /> אור
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" /> חושך
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Monitor className="mr-2 h-4 w-4" /> מערכת
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>סוג תפריט</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem
              onClick={() => setLayoutMode("top")}
              disabled={layoutMode === "top"}
            >
              תפריט עליון
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setLayoutMode("side")}
              disabled={layoutMode === "side"}
            >
              תפריט צד
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={handleSignOut}
        className="text-red-500 cursor-pointer"
      >
        <span>התנתקות</span>
        <LogOut className="mr-auto h-4 w-4 text-red-400" />
      </DropdownMenuItem>
    </>
  );
}
