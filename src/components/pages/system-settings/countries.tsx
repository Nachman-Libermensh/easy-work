"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllCities,
  upsertCity,
  deleteCityById,
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
import type { City } from "@repo/database";

const columns: ColumnConfig[] = [
  { accessorKey: "name", header: "שם עיר", type: "text" },
];

export default function CountriesTab() {
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<City | null>(null);

  useEffect(() => {
    console.log("editingItem", editingItem);
  }, [editingItem]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["settings-cities"],
    queryFn: () => getAllCities(),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCityById,
    onSuccess: () => {
      refetch();
    },
  });

  const form = useAppForm({
    defaultValues: { name: editingItem ? editingItem.name : "" },
    validators: {
      onChange: z.object({ name: z.string().min(1, "נא להזין שם") }),
    },
    onSubmit: async ({ value }) => {
      const promise = upsertCity({ id: editingItem?.id, name: value.name });
      toast.promise(promise, {
        loading: "שומר נתונים...",
        success: "נשמר בהצלחה",
        error: "שגיאה בשמירה",
      });

      try {
        await promise;
        setOpenDialog(false);
        refetch();
      } catch (err: any) {
        // handled by toast
      }
    },
  });

  const handleEdit = (item: City | null) => {
    setEditingItem(item);
    form.reset({ name: item ? item.name : "" });
    setOpenDialog(true);
  };

  return (
    <>
      <DataTable
        data={data}
        columns={columns}
        status={isLoading ? "pending" : "success"}
        title="ניהול ערים"
        headerActions={[
          {
            type: "add",
            title: "הוסף עיר",
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
              if (confirm("האם אתה בטוח?")) {
                toast.promise(deleteMutation.mutateAsync(row.original.id), {
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
            <DialogTitle>{editingItem ? "עריכת עיר" : "הוספת עיר"}</DialogTitle>
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
              name="name"
              children={(f) => <f.TextField label="שם העיר" />}
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
