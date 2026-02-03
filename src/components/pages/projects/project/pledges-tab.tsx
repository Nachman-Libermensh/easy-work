"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllPledges } from "@/src/api-services/pledges.service";
import DataTable from "../../../ui/custom/data-table";
import { ColumnConfig } from "../../../ui/custom/data-table/data-table.types";
import { Badge } from "../../../ui/badge";

export function PledgesTab({ projectId }: { projectId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["project-pledges", projectId],
    queryFn: () => getAllPledges({ projectId }),
  });

  const columns: ColumnConfig[] = [
    {
      accessorKey: "donor.firstName",
      header: "תורם",
      type: "custom",
      cell: ({ row }: any) => (
        <span>
          {row.original.donor.firstName} {row.original.donor.lastName}
        </span>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: "סכום התחייבות",
      type: "currency",
      enableSummary: true,
    },
    {
      accessorKey: "installments",
      header: "תשלומים",
      type: "number",
    },
    {
      accessorKey: "status",
      header: "סטטוס",
      type: "custom",
      cell: ({ row }: any) => {
        const statusMap: Record<string, { label: string; variant: any }> = {
          ACTIVE: { label: "פעיל", variant: "default" },
          COMPLETED: { label: "הושלם", variant: "success" },
          CANCELLED: { label: "בוטל", variant: "destructive" },
          ARCHIVED: { label: "בארכיון", variant: "secondary" },
        };
        const status = statusMap[row.original.status] || statusMap.ACTIVE;
        return <Badge variant={status.variant}>{status.label}</Badge>;
      },
    },
    {
      accessorKey: "startDate",
      header: "תאריך התחלה",
      type: "heb-date",
    },
    {
      accessorKey: "createdAt",
      header: "נוצר ב",
      type: "heb-datetime",
    },
  ];

  return (
    <DataTable
      data={data || []}
      status={isLoading ? "pending" : "success"}
      columns={columns}
      title="התחייבויות"
      storageKey={`project-pledges-${projectId}`}
      showSelectColumn={false}
    />
  );
}
