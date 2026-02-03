"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useBreadcrumbStore } from "@/src/store/breadcrumb-store";

interface BreadcrumbUpdateProps {
  title: string;
  /**
   * Optional: If provided, updates a specific path.
   * If not provided, updates the current pathname.
   */
  path?: string;
}

export function BreadcrumbUpdate({ title, path }: BreadcrumbUpdateProps) {
  const pathname = usePathname();
  const setBreadcrumb = useBreadcrumbStore((state) => state.setBreadcrumb);

  const targetPath = path || pathname;

  useEffect(() => {
    if (targetPath && title) {
      setBreadcrumb(targetPath, title);
    }
  }, [targetPath, title, setBreadcrumb]);

  return null;
}
