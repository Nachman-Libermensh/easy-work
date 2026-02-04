"use client";

import { useMemo } from "react";
import { SidebarProvider } from "@/src/components/ui/sidebar";
import AppSidebar from "./app-sidebar"; // Import locally as it is in the same folder now
import { navigationConfig } from "@/src/config/navigation";
import { MusicFloatingControl } from "./music-floating-control";
import { GlobalMusicPlayer } from "./global-music-player";

// Placeholder for LoadingWithImage if it doesn't exist or needs cleanup
// Ensuring we have a fallback or valid import.
// Assuming LoadingWithImage exists based on previous file read.

interface ShellProps {
  children: React.ReactNode;
}

export function Shell({ children }: ShellProps) {
  const navItems = useMemo(() => {
    return navigationConfig;
  }, []);

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar navItems={navItems} />
      {/* Changed overflow-hidden to overflow-y-auto to allow scrolling */}
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 w-full h-screen overflow-y-auto">
        {children}
      </main>
      <MusicFloatingControl />
      <GlobalMusicPlayer />
    </SidebarProvider>
  );
}
