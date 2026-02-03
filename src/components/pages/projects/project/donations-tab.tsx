"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllDonations } from "@/src/api-services/donations.service";
import DataTable from "../../../ui/custom/data-table";
import { ColumnConfig } from "../../../ui/custom/data-table/data-table.types";

export function DonationsTab({ projectId }: { projectId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["project-donations", projectId],
    queryFn: () => getAllDonations({ projectId }),
  });

  const columns: ColumnConfig[] = [
    {
      accessorKey: "donor.firstName",
      header: "תורם",
      type: "custom",
      cell: ({ row }: any) =>
        row.original.donor ? (
          <span>
            {row.original.donor.firstName} {row.original.donor.lastName}
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      accessorKey: "amountILS",
      header: "סכום (₪)",
      type: "currency",
      enableSummary: true,
    },
    {
      accessorKey: "paymentMethod.name",
      header: "אמצעי תשלום",
      type: "text",
    },
    {
      accessorKey: "incomeSource.name",
      header: "מקור הכנסה",
      type: "text",
    },
    {
      accessorKey: "receivedAt",
      header: "תאריך קבלה",
      type: "heb-datetime",
    },
    {
      accessorKey: "reference",
      header: "אסמכתא",
      type: "text",
    },
  ];

  return (
    <DataTable
      data={data || []}
      status={isLoading ? "pending" : "success"}
      columns={columns}
      title="תרומות"
      storageKey={`project-donations-${projectId}`}
      showSelectColumn={false}
    />
  );
}
