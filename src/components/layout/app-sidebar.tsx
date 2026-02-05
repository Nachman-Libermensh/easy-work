"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarRail,
  SidebarFooter,
} from "@/src/components/ui/sidebar";
import { NavItem } from "@/src/config/navigation";
import { Clock } from "lucide-react";
import { AccessThemeSwitch } from "../ui/custom/access-theme-switch";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  navItems: NavItem[];
}

export default function AppSidebar({ navItems, ...props }: AppSidebarProps) {
  const pathname = usePathname();

  const renderIcon = (Icon: any, color?: string | null) => {
    if (!Icon) return null;
    if (typeof Icon === "string") {
      return <span className="text-lg">{Icon}</span>;
    }
    return <Icon className="h-4 w-4" style={{ color: color ?? undefined }} />;
  };

  return (
    <Sidebar collapsible="icon" className="border-l" side="right" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Clock className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Easy Work</span>
                  <span className="">Focus & Relax</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                  >
                    <Link href={item.href || "#"}>
                      {renderIcon(item.icon, item.color)}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <AccessThemeSwitch />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
