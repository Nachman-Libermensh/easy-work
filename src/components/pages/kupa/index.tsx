"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getKupaHistory } from "@/src/api-services/reports.service";
import { deleteDonationById } from "@/src/api-services/donations.service";
import { deleteExpenseById } from "@/src/api-services/expenses.service";
import DataTable from "@/src/components/ui/custom/data-table";
import { ColumnConfig } from "@/src/components/ui/custom/data-table/data-table.types";
import { useState } from "react";
import { CreateTransactionDialog } from "../transactions/create-transaction-dialog";
import { CreateExpenseDialog } from "./create-expense-dialog";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";

const columns: ColumnConfig[] = [
  {
    accessorKey: "date",
    header: "תאריך",
    type: "heb-date",
  },
  {
    accessorKey: "project",
    header: "פרויקט",
    type: "text",
  },
  {
    accessorKey: "description",
    header: "פרטים / מהות",
    type: "text",
    cell: ({ row }) => (
      <span title={row.original.description}>{row.original.description}</span>
    ),
  },
  {
    accessorKey: "entityName",
    header: "שם (תורם / מוטב)",
    type: "text",
  },
  {
    accessorKey: "creditAmount",
    header: "זכות (הכנסה)",
    type: "currency",
    enableSummary: true,
    // ביטול צביעה אוטומטית של המספר כדי להשתמש בעיצוב שלנו
    meta: { numberOptions: { colorize: false } },
    classNameFn: (v) => {
      return ` ${
        v.getValue() > 0 ? "text-green-700 font-bold bg-green-50/50" : ""
      }`;
    },
  },
  {
    accessorKey: "debitAmount",
    header: "חובה (הוצאה)",
    type: "currency",
    enableSummary: true,
    // ביטול צביעה אוטומטית של המספר כדי להשתמש בעיצוב שלנו (אדום להוצאות)
    meta: { numberOptions: { colorize: false } },
    classNameFn: (v) => {
      return ` ${
        v.getValue() > 0 ? "text-red-700 font-bold bg-red-50/50" : ""
      }`;
    },
  },
];

const KupaPage = () => {
  const queryClient = useQueryClient();
  // State for Create/Edit Dialogs
  const [openIncomeDialog, setOpenIncomeDialog] = useState(false);
  const [openExpenseDialog, setOpenExpenseDialog] = useState(false);

  // State for Selection
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["kupa-history"],
    queryFn: () => getKupaHistory(),
  });

  const deleteIncomeMutation = useMutation({
    mutationFn: (id: string) => deleteDonationById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kupa-history"] });
      toast.success("הכנסה נמחקה");
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (id: string) => deleteExpenseById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kupa-history"] });
      toast.success("הוצאה נמחקה");
    },
  });

  const handleDelete = (row: any) => {
    const toastId = toast.info(
      row.type === "INCOME" ? "למחוק הכנסה זו?" : "למחוק הוצאה זו?",
      {
        action: {
          label: "מחק",
          onClick: () => {
            toast.dismiss(toastId);
            if (row.type === "INCOME") {
              deleteIncomeMutation.mutate(row.id);
            } else {
              deleteExpenseMutation.mutate(row.id);
            }
          },
        },
        cancel: {
          label: "ביטול",
          onClick: () => toast.dismiss(toastId),
        },
      },
    );
  };

  return (
    <div className="p-4 space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">ניהול קופה (עובר ושב)</h1>
      </div>

      <DataTable
        data={data || []}
        columns={columns}
        status={isLoading ? "pending" : "success"}
        title="תנועות קופה"
        showSelectColumn={false}
        rowClassNameFn={(row) =>
          cn(
            row.original.type === "INCOME" ? "bg-green-50/20 " : "bg-red-50/20",
          )
        }
        headerActions={[
          {
            type: "custom",
            title: "הוסף הכנסה",
            icon: <ArrowDownIcon size={16} className="text-green-600" />,
            onClick: () => {
              setSelectedItem(null);
              setOpenIncomeDialog(true);
            },
            variant: "outline",
          },
          {
            type: "custom",
            title: "הוסף הוצאה",
            icon: <ArrowUpIcon size={16} className="text-red-600" />,
            onClick: () => {
              setSelectedItem(null);
              setOpenExpenseDialog(true);
            },
            variant: "outline",
          },
        ]}
        rowActions={[
          {
            type: "edit",
            title: "עריכה",
            onClick: (row) => {
              setSelectedItem(row.original.originalData);
              if (row.original.type === "INCOME") {
                setOpenIncomeDialog(true);
              } else {
                setOpenExpenseDialog(true);
              }
            },
          },
          {
            type: "delete",
            title: "מחיקה",
            onClick: (row) => handleDelete(row.original),
          },
        ]}
      />

      <CreateTransactionDialog
        open={openIncomeDialog}
        onOpenChange={setOpenIncomeDialog}
        transactionToEdit={selectedItem}
        onSuccess={() => {
          setOpenIncomeDialog(false);
          queryClient.invalidateQueries({ queryKey: ["kupa-history"] });
        }}
      />

      <CreateExpenseDialog
        open={openExpenseDialog}
        onOpenChange={setOpenExpenseDialog}
        expenseToEdit={selectedItem}
        onSuccess={() => {
          setOpenExpenseDialog(false);
          queryClient.invalidateQueries({ queryKey: ["kupa-history"] });
        }}
      />
    </div>
  );
};

export default KupaPage;
