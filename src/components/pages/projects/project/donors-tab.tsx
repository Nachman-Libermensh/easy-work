"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllDonors } from "@/src/api-services/donors.service";
import DataTable from "../../../ui/custom/data-table";
import { ColumnConfig } from "../../../ui/custom/data-table/data-table.types";
import Link from "next/link";
import { User } from "lucide-react";

export function DonorsTab({ projectId }: { projectId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["project-donors", projectId],
    queryFn: () => getAllDonors(projectId),
  });
  const columns: ColumnConfig[] = [
    {
      accessorKey: "firstName",
      header: "שם פרטי",
      type: "text",
    },
    {
      accessorKey: "lastName",
      header: "שם משפחה",
      type: "text",
    },
    {
      accessorKey: "email",
      header: "אימייל",
      type: "text",
    },
    {
      accessorKey: "phone",
      header: "טלפון",
      type: "text",
    },
    {
      accessorKey: "city.name",
      header: "עיר",
      type: "text",
    },
    {
      accessorKey: "pledges",
      header: "התחייבויות",
      type: "custom",
      cell: ({ row }: any) => <span>{row.original.pledges?.length ?? 0}</span>,
    },
    {
      accessorKey: "transactions",
      header: "תרומות",
      type: "custom",
      cell: ({ row }: any) => (
        <span>{row.original.transactions?.length ?? 0}</span>
      ),
    },
  ];

  return (
    <DataTable
      data={data || []}
      status={isLoading ? "pending" : "success"}
      columns={columns}
      title="תורמים"
      storageKey={`project-donors-${projectId}`}
      showSelectColumn={false}
      rowActions={[
        {
          type: "custom",
          title: "כרטיס תורם",
          icon: (row) => (
            <Link href={`/donors/${row.original.id}`}>
              <User className="h-4 w-4" />
            </Link>
          ),
        },
      ]}
    />
  );
}
