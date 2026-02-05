"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Switch } from "@/src/components/ui/switch";
import { Label } from "@/src/components/ui/label";
import { useSidebar } from "@/src/components/ui/sidebar";

export function AccessThemeSwitch() {
  const { setTheme, theme } = useTheme();
  const { state } = useSidebar();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-14" />;
  }

  const isDark = theme === "dark";
  const isCollapsed = state === "collapsed";

  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  if (isCollapsed) {
    return (
      <div
        onClick={toggleTheme}
        role="button"
        className="group flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border bg-sidebar-accent/50 p-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        title={isDark ? "עבור למצב יום" : "עבור למצב לילה"}
      >
        {isDark ? (
          <Moon className="size-5 text-indigo-400 transition-transform group-hover:scale-110" />
        ) : (
          <Sun className="size-5 text-orange-500 transition-transform group-hover:scale-110" />
        )}
      </div>
    );
  }

  return (
    <div
      onClick={toggleTheme}
      role="button"
      className="group flex cursor-pointer items-center justify-between rounded-lg border bg-sidebar-accent/50 p-4 shadow-sm transition-all hover:bg-sidebar-accent/70"
      dir="rtl"
    >
      <div className="flex flex-col gap-1">
        <Label className="cursor-pointer text-base font-bold">
          {isDark ? "מצב לילה" : "מצב יום"}
        </Label>
        <span className="text-xs text-muted-foreground">
          {isDark ? "מציג צבעים כהים" : "מציג צבעים בהירים"}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Switch
          checked={isDark}
          onCheckedChange={toggleTheme}
          className="pointer-events-none scale-125 data-[state=checked]:bg-indigo-500"
          aria-label="החלף ערכת נושא"
          tabIndex={-1}
        />
        {isDark ? (
          <Moon className="h-6 w-6 text-indigo-400 transition-transform group-hover:rotate-12" />
        ) : (
          <Sun className="h-6 w-6 text-orange-500 transition-transform group-hover:rotate-12" />
        )}
      </div>
    </div>
  );
}
