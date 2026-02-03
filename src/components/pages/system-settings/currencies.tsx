"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllCurrencies,
  upsertCurrency,
  deleteCurrencyByCode,
} from "@/src/api-services/system-settings.service";
import DataTable from "../../ui/custom/data-table";
import { ColumnConfig } from "../../ui/custom/data-table/data-table.types";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { useAppForm } from "../../ui/custom/form";
import { z } from "zod";
import { Button } from "../../ui/button";

const columns: ColumnConfig[] = [
  { accessorKey: "code", header: "קוד מטבע", type: "text", size: 50 },
  { accessorKey: "name", header: "שם מטבע", type: "text" },
  { accessorKey: "symbol", header: "סמל", type: "text", size: 50 },
  { accessorKey: "isActive", header: "פעיל", type: "boolean-badge" },
];

export default function CurrenciesTab() {
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["settings-currencies"],
    queryFn: () => getAllCurrencies(),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCurrencyByCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings-currencies"] });
    },
  });

  const form = useAppForm({
    defaultValues: {
      code: "",
      name: "",
      symbol: "",
      isActive: true,
    },
    validators: {
      onChange: z.object({
        code: z.string().min(1, "חובה").max(3, "עד 3 תווים"),
        name: z.string().min(1, "חובה"),
        symbol: z.string(),
        isActive: z.boolean(),
      }),
    },
    onSubmit: async ({ value }) => {
      const promise = upsertCurrency({
        ...value,
        code: value.code.toUpperCase(),
        symbol: value.symbol || undefined,
        isNew: !editingItem,
      });

      toast.promise(promise, {
        loading: "שומר נתונים...",
        success: "נשמר בהצלחה",
        error: (err) => err.message || "שגיאה בשמירה",
      });

      try {
        await promise;
        setOpenDialog(false);
        queryClient.invalidateQueries({ queryKey: ["settings-currencies"] });
      } catch (err: any) {
        // handled by toast
      }
    },
  });

  const handleEdit = (item: any) => {
    setEditingItem(item);
    if (item) {
      form.reset({
        code: item.code,
        name: item.name,
        symbol: item.symbol || "",
        isActive: item.isActive,
      });
    } else {
      form.reset({ code: "", name: "", symbol: "", isActive: true });
    }
    setOpenDialog(true);
  };

  return (
    <>
      <DataTable
        data={data}
        columns={columns}
        status={isLoading ? "pending" : "success"}
        title="ניהול מטבעות"
        headerActions={[
          {
            type: "add",
            title: "הוסף מטבע",
            icon: <PlusIcon size={16} />,
            onClick: () => handleEdit(null),
          },
        ]}
        rowActions={[
          {
            type: "edit",
            title: "ערוך",
            onClick: (row) => handleEdit(row.original),
          },
          {
            type: "delete",
            title: "מחק",
            onClick: (row) => {
              if (confirm("האם למחוק מטבע זה?")) {
                toast.promise(deleteMutation.mutateAsync(row.original.code), {
                  loading: "מוחק...",
                  success: "נמחק בהצלחה",
                  error: (err) => err.message,
                });
              }
            },
          },
        ]}
      />

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "עריכת מטבע" : "הוספת מטבע"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            <form.AppField
              name="code"
              children={(f) => (
                <f.TextField
                  label="קוד מטבע (לדוגמה ILS)"
                  disabled={!!editingItem} // Cannot change key
                  className="uppercase"
                />
              )}
            />
            <form.AppField
              name="name"
              children={(f) => <f.TextField label="שם מטבע" />}
            />
            <form.AppField
              name="symbol"
              children={(f) => <f.TextField label="סמל (₪, $)" />}
            />
            <form.AppField
              name="isActive"
              children={(f) => <f.SwitchField label="פעיל במערכת" />}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-1/2"
                onClick={() => setOpenDialog(false)}
              >
                ביטול
              </Button>
              <form.AppForm>
                <form.SubmitButton lable="שמור" className="w-1/2" />
              </form.AppForm>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
