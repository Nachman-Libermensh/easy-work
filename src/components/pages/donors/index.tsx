"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import DataTable from "../../ui/custom/data-table";
import { ColumnConfig } from "../../ui/custom/data-table/data-table.types";
import { CreateDonorDialog } from "./create-donor-dialog";
import {
  getAllDonors,
  deleteDonorById,
} from "@/src/api-services/donors.service";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, User } from "lucide-react";
import Link from "next/link";

export default function DonorsPage() {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<any>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["donors"],
    queryFn: () => getAllDonors(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDonorById(id),
    onSuccess: () => {
      refetch();
      toast.success("תורם נמחק");
    },
  });

  const columns: ColumnConfig[] = [
    { accessorKey: "firstName", header: "שם פרטי", type: "text" },
    { accessorKey: "lastName", header: "שם משפחה", type: "text" },
    { accessorKey: "email", header: "אימייל", type: "text" },
    { accessorKey: "phone", header: "טלפון", type: "text" },
    {
      accessorKey: "cityId",
      header: "עיר",
      type: "lookup",
      meta: {
        lookupKey: "cities",
        lookupVariant: "badge", // או "text"
        lookupBadgeVariant: "secondary",
      },
    },
    // { accessorKey: "city.name", header: "עיר", type: "text" },
  ];

  return (
    <div dir="rtl" className="p-2">
      <h1 className="text-2xl font-bold mb-4">ניהול תורמים</h1>
      <DataTable
        data={data || []}
        status={isLoading ? "pending" : "success"}
        columns={columns}
        title="רשימת תורמים"
        headerActions={[
          {
            type: "add",
            title: "תורם חדש",
            icon: <PlusIcon size={16} />,
            onClick: () => {
              setSelectedDonor(null);
              setDialogOpen(true);
            },
          },
        ]}
        rowActions={[
          {
            type: "custom",
            title: "כרטיס תורם",
            icon: (row) => (
              <Link href={`/donors/${row.original.id}`}>
                <User className="h-4 w-4" />
              </Link>
            ),
            onClick: (row) => router.push(`/donors/${row.original.id}`),
          },
          {
            type: "edit",
            title: "עריכה",
            onClick: (row) => {
              setSelectedDonor(row.original);
              setDialogOpen(true);
            },
          },
          {
            type: "delete",
            title: "מחיקה",
            onClick: (row) => {
              if (confirm("למחוק?")) deleteMutation.mutate(row.original.id);
            },
          },
        ]}
      />
      <CreateDonorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        donor={selectedDonor}
        onSuccess={() => {
          refetch();
          setDialogOpen(false);
        }}
      />
    </div>
  );
}
