import { Clock, Settings, Music, LayoutDashboard } from "lucide-react";

export type NavItem = {
  title: string;
  href?: string;
  icon?: any;
  items?: NavItem[];
  color?: string;
  description?: string;
};

export const navigationConfig: NavItem[] = [
  {
    title: "לוח ראשי",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "מוזיקה",
    href: "/music",
    icon: Music,
  },
  {
    title: "הגדרות",
    href: "/settings",
    icon: Settings,
  },
];
