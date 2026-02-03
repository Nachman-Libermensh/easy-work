"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/src/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/src/components/ui/navigation-menu";
import { NavItem } from "@/src/config/navigation";

type ExtendedNavItem = NavItem & { isLoading?: boolean; description?: string };

interface TopNavProps {
  navItems: ExtendedNavItem[];
}

export function TopNav({ navItems }: TopNavProps) {
  return (
    <NavigationMenu dir="rtl" className="max-w-full justify-start">
      <NavigationMenuList className="gap-1 flex-wrap">
        {navItems.map((item) => {
          // תיקון TS: השמה למשתנה שמתחיל באות גדולה
          const IconComponent = item.icon;

          const renderIcon = (Icon: any, color?: string) => {
            if (!Icon) return null;
            if (typeof Icon === "string") {
              return (
                <Image
                  src={Icon}
                  alt=""
                  width={16}
                  height={16}
                  className="h-4 w-4 object-contain"
                />
              );
            }
            // שימוש בקומפוננטה עם אות גדולה
            return <Icon className="h-4 w-4" style={{ color: color }} />;
          };

          return (
            <NavigationMenuItem key={item.title}>
              {item.items ? (
                <>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-accent/50">
                    <div className="flex items-center gap-2">
                      {renderIcon(IconComponent, item.color)}
                      <span className="font-medium text-sm">{item.title}</span>
                    </div>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-1 p-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {item.isLoading
                        ? Array.from({ length: 4 }).map((_, i) => (
                            <div
                              key={i}
                              className="h-10 w-full animate-pulse rounded bg-muted/50"
                            />
                          ))
                        : item.items.map((subItem) => (
                            <ListItem
                              key={subItem.title}
                              title={subItem.title}
                              href={subItem.href || "#"}
                              icon={subItem.icon}
                              color={subItem.color}
                            >
                              {subItem.description}
                            </ListItem>
                          ))}
                    </ul>
                  </NavigationMenuContent>
                </>
              ) : (
                <NavigationMenuLink asChild>
                  <Link
                    href={item.href || "#"}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "bg-transparent"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {renderIcon(IconComponent, item.color)}
                      <span className="text-sm">{item.title}</span>
                    </div>
                  </Link>
                </NavigationMenuLink>
              )}
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & {
    title: string;
    icon?: any;
    color?: string | null; // תמיכה ב-null מה-API
  }
>(({ className, title, children, href, icon: Icon, color, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          href={href as string}
          className={cn(
            // flex-row בשילוב עם dir="rtl" ב-NavigationMenu יסדר את זה נכון
            "group flex select-none items-center gap-4 rounded-md p-3 leading-none no-underline outline-none transition-all duration-200 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            "min-h-[64px] w-full border border-transparent hover:border-border/40", // הוספת בורדר עדין בריחוק
            className
          )}
          {...props}
        >
          {/* אייקון - נקי, ללא מסגרות, צבע דינמי רק אם קיים */}
          {Icon && (
            <div className="flex shrink-0 items-center justify-center transition-transform group-hover:scale-110">
              {typeof Icon === "string" ? (
                <Image
                  src={Icon}
                  alt=""
                  width={20}
                  height={20}
                  className="h-5 w-5 object-contain"
                />
              ) : (
                <Icon
                  className="h-5 w-5"
                  // צבע מוגדר רק אם קיים HEX, אחרת לא נשלח סטייל בכלל
                  style={color ? { color } : undefined}
                />
              )}
            </div>
          )}

          {/* גוש טקסט - מיושר לימין (RTL) */}
          <div className="flex flex-1 flex-col gap-1 text-right overflow-hidden">
            <div className="text-[14px] font-semibold leading-none tracking-tight">
              {title}
            </div>
            {children && (
              <p className="line-clamp-1 text-[12px] leading-snug text-muted-foreground transition-colors group-hover:text-accent-foreground/80">
                {children}
              </p>
            )}
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
