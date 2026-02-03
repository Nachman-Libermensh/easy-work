"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/src/components/ui/breadcrumb";
import { NavItem } from "@/src/config/navigation";
import { useBreadcrumbStore } from "@/src/store/breadcrumb-store";

interface PageHeaderProps {
  navItems: (NavItem & { items?: any[] })[];
}

export function PageHeader({ navItems }: PageHeaderProps) {
  const pathname = usePathname();
  // Subscribe to overrides
  const overrides = useBreadcrumbStore((state) => state.overrides);

  // Create a flat map of href -> title for O(1) lookup
  const breadcrumbNameMap = useMemo(() => {
    const map = new Map<string, string>();

    const traverse = (items: any[]) => {
      items.forEach((item) => {
        if (item.href) {
          // Remove trailing slash for consistency if needed, though usually strict match is better
          map.set(item.href, item.title);
        }
        if (item.items) {
          traverse(item.items);
        }
      });
    };

    traverse(navItems);
    return map;
  }, [navItems]);

  const pathSegments = pathname.split("/").filter(Boolean);

  const breadcrumbs = useMemo(() => {
    // Use reduce to accumulate the path without mutating variables
    return pathSegments.reduce<{ href: string; title: string }[]>(
      (acc, segment) => {
        const prevPath = acc.length > 0 ? acc[acc.length - 1].href : "";
        const currentPath = `${prevPath}/${segment}`;

        // Check priority: 1. Dynamic Override (Store), 2. Static Map (Nav Config), 3. Raw segment
        const title =
          overrides[currentPath] ||
          breadcrumbNameMap.get(currentPath) ||
          segment;

        acc.push({ href: currentPath, title });
        return acc;
      },
      [],
    );
  }, [pathSegments, breadcrumbNameMap, overrides]); // Add overrides to dependencies

  if (breadcrumbs.length === 0) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>דף הבית</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Adds a generic Home link if not on home page */}
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="/">דף הבית</BreadcrumbLink>
        </BreadcrumbItem>
        {breadcrumbs.length > 0 && (
          <BreadcrumbSeparator dir="rtl" className="hidden md:block" />
        )}

        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <React.Fragment key={crumb.href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={crumb.href}>
                    {crumb.title}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
