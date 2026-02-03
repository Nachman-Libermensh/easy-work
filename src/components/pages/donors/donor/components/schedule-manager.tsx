"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
// HALP: החלף את הייבוא מ-server actions לשירותי API
import {
  getPledgeScheduleByPledgeId,
  updatePledgeScheduleItem,
  deletePledgeScheduleItemById,
  createPledgeScheduleItem,
} from "@/src/api-services/pledges.service";
import { getAllDonations } from "@/src/api-services/donations.service";

import DataTable from "@/src/components/ui/custom/data-table";
import { ColumnConfig } from "@/src/components/ui/custom/data-table/data-table.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { PlusIcon, Link as LinkIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAppForm } from "@/src/components/ui/custom/form";
import { z } from "zod";

export function ScheduleManager({
  pledgeId,
  currencyCode,
  refetchPledges,
}: {
  pledgeId: string;
  currencyCode: string;
  refetchPledges: () => void;
}) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const {
    data: schedule,
    isLoading,
    refetch: refetchSchedule,
  } = useQuery({
    queryKey: ["pledge-schedule", pledgeId],
    queryFn: () => getPledgeScheduleByPledgeId(pledgeId),
  });

  // Fetch donations for linking (only when editing)
  const { data: donationsData } = useQuery({
    queryKey: ["pledge-donations-select", pledgeId],
    queryFn: () => getAllDonations({ pledgeId }), // שימוש ב-API החדש
    enabled: isEditMode,
  });
  const donations = donationsData || [];

  const deleteMutation = useMutation({
    mutationFn: deletePledgeScheduleItemById,
    onSuccess: () => {
      refetchSchedule();
      refetchPledges();
      toast.success("נמחק בהצלחה");
    },
  });

  // Inline Form for Add/Edit
  const FormDialog = () => {
    const form = useAppForm({
      defaultValues: {
        dueDate: editingItem ? new Date(editingItem.dueDate) : new Date(),
        amount: editingItem ? Number(editingItem.amount) : 0,
        isPaid: editingItem ? editingItem.isPaid : false,
        donationId: editingItem?.donationId || null,
      },
      validators: {
        onChange: z.object({
          dueDate: z.date(),
          amount: z.number().positive(),
          isPaid: z.boolean(),
          donationId: z.string().nullable(),
        }),
      },
      onSubmit: async ({ value }) => {
        try {
          const payload = {
            ...value,
            donationId: value.donationId === "null" ? null : value.donationId,
          };

          if (editingItem) {
            await updatePledgeScheduleItem(editingItem.id, payload);
            toast.success("עודכן");
          } else {
            // שינוי חתימה: pledgeId מועבר כפרמטר ראשון
            await createPledgeScheduleItem(pledgeId, {
              dueDate: value.dueDate,
              amount: Number(value.amount), // Ensure number type
              currencyCode,
              donationId: payload.donationId,
              isPaid: value.isPaid,
              isManuallyEdited: true, // סמן כעריכה ידנית
              note: "",
            });
            toast.success("נוצר");
          }
          refetchSchedule();
          refetchPledges();
          setIsEditMode(false);
          setEditingItem(null);
        } catch (e) {
          toast.error("שגיאה");
          console.error(e);
        }
      },
    });

    return (
      <Dialog open={isEditMode} onOpenChange={setIsEditMode}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "עריכת תשלום" : "הוספת תשלום"}
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
              name="dueDate"
              children={(f) => <f.DatePickerField label="תאריך יעד" />}
            />
            <form.AppField
              name="amount"
              children={(f) => <f.TextField type="number" label="סכום" />}
            />
            {/* Donation Link */}
            <form.AppField
              name="donationId"
              children={(f) => (
                <f.SelectField
                  label="קישור לתרומה (אופציונלי)"
                  placeholder="ללא קישור (בחר לניקוי)"
                  options={[
                    { label: "--- ללא קישור ---", value: "null" },
                    ...(donations.map((t: any) => ({
                      label: `${new Date(
                        t.receivedAt,
                      ).toLocaleDateString()} - ₪${Number(
                        t.amountILS,
                      ).toLocaleString()} ${
                        t.reference ? `(${t.reference})` : ""
                      }`,
                      value: t.id,
                    })) || []),
                  ]}
                />
              )}
            />

            <form.AppField
              name="isPaid"
              children={(f) => <f.CheckboxField label="שולם?" />}
            />
            <form.AppForm>
              <form.SubmitButton lable="שמור" />
            </form.AppForm>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const columns: ColumnConfig[] = [
    { accessorKey: "dueDate", header: "תאריך יעד", type: "heb-date" },
    { accessorKey: "amount", header: "סכום", type: "currency" },
    {
      accessorKey: "donation",
      header: "תרומה מקושרת",
      type: "custom",
      cell: ({ row }: any) => {
        const t = row.original.donation;
        if (!t) return <span className="text-muted-foreground">-</span>;
        return (
          <div className="flex items-center gap-2 text-xs bg-muted/50 p-1 px-2 rounded-md border w-fit">
            <LinkIcon size={12} className="text-green-600" />
            <div className="flex flex-col">
              <span>{new Date(t.receivedAt).toLocaleDateString()}</span>
              <span className="font-semibold">
                ₪{Number(t.amountILS).toLocaleString()}
              </span>
            </div>
          </div>
        );
      },
    },
    { accessorKey: "isPaid", header: "שולם?", type: "boolean-icon" },
  ];

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-background">
      <div className="border rounded-md">
        <DataTable
          data={schedule || []}
          status={isLoading ? "pending" : "success"}
          columns={columns}
          title="תכנית תשלומים ופירוט לתרומה"
          showSearchInput={false}
          headerActions={[
            {
              type: "add",
              title: "הוסף תשלום ידני",
              icon: <PlusIcon size={16} />,
              onClick: () => {
                setEditingItem(null);
                setIsEditMode(true);
              },
            },
          ]}
          rowActions={[
            {
              type: "edit",
              title: "ערוך",
              onClick: (row) => {
                setEditingItem(row.original);
                setIsEditMode(true);
              },
            },
            {
              type: "delete",
              title: "מחק",
              onClick: (row) => {
                const toastId = toast.info("האם למחוק תשלום זה?", {
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
                  duration: 5000,
                });
              },
            },
          ]}
        />
      </div>
      <FormDialog />
    </div>
  );
}
