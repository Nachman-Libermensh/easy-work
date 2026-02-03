"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getAllExpenses,
  deleteExpenseById,
} from "@/src/api-services/expenses.service";
import DataTable from "@/src/components/ui/custom/data-table";
import { ColumnConfig } from "@/src/components/ui/custom/data-table/data-table.types";
import { ExpenseDialog } from "@/src/components/pages/expenses/expense-dialog";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

export default function ExpensesPage() {
  const [open, setOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);

  const {
    data: expenses,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["expenses"],
    queryFn: () => getAllExpenses(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteExpenseById(id),
    onSuccess: () => {
      refetch();
      toast.success("הוצאה נמחקה");
    },
  });

  const columns = useMemo<ColumnConfig[]>(
    () => [
      { accessorKey: "date", header: "תאריך", type: "heb-date" },
      { accessorKey: "payee", header: "מוטב", type: "text" },
      { accessorKey: "purpose", header: "תיאור", type: "text" },
      { accessorKey: "project.name", header: "פרויקט", type: "text" },
      {
        accessorKey: "paymentMethod.name",
        header: "אמצעי תשלום",
        type: "text",
      },
      { accessorKey: "reference", header: "אסמכתא", type: "text" },
      { accessorKey: "amount", header: "סכום", type: "currency" },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">ניהול הוצאות</h1>
      </div>

      <DataTable
        columns={columns}
        data={expenses || []}
        status={isLoading ? "pending" : "success"}
        title="רשימת הוצאות"
        headerActions={[
          {
            type: "add",
            title: "הוסף הוצאה",
            icon: <PlusIcon size={16} />,
            onClick: () => {
              setSelectedExpense(null);
              setOpen(true);
            },
          },
        ]}
        rowActions={[
          {
            type: "edit",
            title: "ערוך",
            onClick: (row) => {
              setSelectedExpense(row.original);
              setOpen(true);
            },
          },
          {
            type: "delete",
            title: "מחק",
            onClick: (row) => {
              const toastId = toast.info("למחוק הוצאה זו?", {
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

      {open && (
        <ExpenseDialog
          open={open}
          onOpenChange={setOpen}
          expense={selectedExpense}
          onSuccess={() => {
            setOpen(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}
