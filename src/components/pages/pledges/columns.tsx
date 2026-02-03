"use client";

import { ColumnConfig } from "@/src/components/ui/custom/data-table/data-table.types";

export const columns: ColumnConfig[] = [
  { accessorKey: "donorName", header: "שם התורם", type: "text" },
  { accessorKey: "projectName", header: "פרויקט", type: "text" },
  { accessorKey: "installments", header: "מס׳ תשלומים", type: "text" },
  { accessorKey: "totalPledge", header: "סכום התחייבות", type: "currency" },
  { accessorKey: "totalPaid", header: "שולם בפועל", type: "currency" },
  { accessorKey: "balance", header: "יתרה לתשלום", type: "currency" },
  { accessorKey: "status", header: "סטטוס", type: "text" },
];
