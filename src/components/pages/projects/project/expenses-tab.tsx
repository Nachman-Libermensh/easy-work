"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllExpenses } from "@/src/api-services/expenses.service";
import DataTable from "../../../ui/custom/data-table";
import { ColumnConfig } from "../../../ui/custom/data-table/data-table.types";

export function ExpensesTab({ projectId }: { projectId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["project-expenses", projectId],
    queryFn: () => getAllExpenses(projectId),
  });

  const columns: ColumnConfig[] = [
    {
      accessorKey: "purpose",
      header: "מטרה",
      type: "text",
    },
    {
      accessorKey: "payee",
      header: "נהנה",
      type: "text",
    },
    {
      accessorKey: "amount",
      header: "סכום",
      type: "currency",
      enableSummary: true,
    },
    {
      accessorKey: "paymentMethod.name",
      header: "אמצעי תשלום",
      type: "text",
    },
    {
      accessorKey: "date",
      header: "תאריך",
      type: "heb-date",
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
      title="הוצאות"
      storageKey={`project-expenses-${projectId}`}
      showSelectColumn={false}
    />
  );
}
