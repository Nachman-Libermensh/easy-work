"use client";

import { useMemo } from "react";
import { SidebarProvider } from "@/src/components/ui/sidebar";
import AppSidebar from "./app-sidebar"; // Import locally as it is in the same folder now
import { useUIStore } from "@/src/store/ui-store";
import { navigationConfig } from "@/src/config/navigation";
import { MusicFloatingControl } from "./music-floating-control";

// Placeholder for LoadingWithImage if it doesn't exist or needs cleanup
// Ensuring we have a fallback or valid import.
// Assuming LoadingWithImage exists based on previous file read.

interface ShellProps {
  children: React.ReactNode;
}

export function Shell({ children }: ShellProps) {
  const { layoutMode, setLayoutMode, _hasHydrated } = useUIStore();

  const navItems = useMemo(() => {
    return navigationConfig;
  }, []);

  if (!_hasHydrated) {
    return null; // Or a simple loading spinner
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar
        layoutMode={layoutMode}
        setLayoutMode={setLayoutMode}
        navItems={navItems}
      />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 w-full h-screen overflow-hidden">
        {children}
      </main>
      <MusicFloatingControl />
    </SidebarProvider>
  );
}
