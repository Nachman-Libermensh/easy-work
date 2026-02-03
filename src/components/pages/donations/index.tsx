"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// מעבר ל-API
import {
  getAllDonations,
  deleteDonationById,
} from "@/src/api-services/donations.service";
import DataTable from "../../ui/custom/data-table";
import { ColumnConfig } from "../../ui/custom/data-table/data-table.types";
import { useState } from "react";
import { CreateDonationDialog } from "./create-donation-dialog";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

const columns: ColumnConfig[] = [
  {
    accessorKey: "receivedAt",
    header: "תאריך",
    type: "heb-date",
  },
  {
    accessorKey: "amountILS",
    header: "סכום",
    type: "currency",
    enableSummary: true,
  },
  {
    accessorKey: "donor",
    header: "תורם",
    type: "custom",
    cell: ({ row }) => {
      const d = row.original.donor;
      return d ? `${d.firstName} ${d.lastName}` : "-";
    },
  },
  {
    accessorKey: "paymentMethod.name",
    header: "אמצעי תשלום",
    type: "text",
  },
  {
    accessorKey: "reference",
    header: "אסמכתא",
    type: "text",
  },
  {
    accessorKey: "project.name",
    header: "פרויקט",
    type: "text",
  },
  {
    accessorKey: "notes",
    header: "הערות",
    type: "text-long",
  },
  {
    accessorKey: "createdAt",
    header: "נוצר ב",
    type: "heb-datetime",
    enableHiding: true,
  },
];

const DonationsPage = () => {
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDonations, setSelectedDonations] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["donations-list"],
    queryFn: () => getAllDonations(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDonationById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations-list"] });
      toast.success("נמחק בהצלחה");
    },
    onError: () => toast.error("שגיאה במחיקה"),
  });

  return (
    <div className="p-4 space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">ניהול הכנסות</h1>
      </div>

      <DataTable
        data={data || []}
        columns={columns}
        status={isLoading ? "pending" : "success"}
        title="רשימת הכנסות"
        showSelectColumn={false}
        headerActions={[
          {
            type: "add",
            title: "הכנסה חדשה",
            icon: <PlusIcon size={16} />,
            onClick: () => {
              setSelectedDonations(null);
              setOpenDialog(true);
            },
          },
        ]}
        rowActions={[
          {
            type: "edit",
            title: "עריכה",
            onClick: (row) => {
              setSelectedDonations(row.original);
              setOpenDialog(true);
            },
          },
          {
            type: "delete",
            title: "מחיקה",
            onClick: (row) => {
              const toastId = toast.info("האם למחוק הכנסה זו?", {
                action: {
                  label: "מחק",
                  onClick: () => {
                    toast.dismiss(toastId);
                    deleteMutation.mutate(row.original.id);
                  },
                },
                cancel: {
                  label: "ביטול",
                  onClick: () => toast.dismiss(toastId),
                },
              });
            },
          },
        ]}
      />

      <CreateDonationDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        donationToEdit={selectedDonations}
        onSuccess={() => {
          setOpenDialog(false);
          queryClient.invalidateQueries({ queryKey: ["donations-list"] });
        }}
      />
    </div>
  );
};
export default DonationsPage;
