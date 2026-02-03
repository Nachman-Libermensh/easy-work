"use client";

import { useAppForm } from "@/src/components/ui/custom/form";
import { z } from "zod";
import { toast } from "sonner";
import { createPledge, updatePledge } from "@/src/api-services/pledges.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../ui/dialog";
import { Button } from "../../../ui/button";
import { useSession } from "@/src/lib/auth-client";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import { Label } from "../../../ui/label";

type CreatePledgeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  donorId: string;
  pledgeToEdit?: any; // New prop for editing
};

export function CreatePledgeDialog({
  open,
  onOpenChange,
  onSuccess,
  donorId,
  pledgeToEdit,
}: CreatePledgeDialogProps) {
  const { data: session } = useSession();

  const form = useAppForm({
    defaultValues: {
      projectId: pledgeToEdit?.projectId || "",
      totalAmount: pledgeToEdit ? Number(pledgeToEdit.totalAmount) : 0,
      installments: pledgeToEdit ? pledgeToEdit.installments : 1,
      currencyCode: pledgeToEdit?.currencyCode || "ILS",
      purpose: pledgeToEdit?.purpose || "",
      startDate: pledgeToEdit?.startDate
        ? new Date(pledgeToEdit.startDate)
        : new Date(),
    },
    validators: {
      onChange: z.object({
        projectId: z.string().min(1, "בחר פרויקט"),
        totalAmount: z.number().positive(),
        installments: z.number().int().min(1),
        currencyCode: z.string(),
        purpose: z.string(),
        startDate: z.date(),
      }),
    },
    onSubmit: async ({ value }) => {
      // אין צורך לבדוק session עבור שליחת ה-ID, זה בודק רק אותנטיקציה כללית
      if (!session) {
        toast.error("משתמש לא מחובר");
        return;
      }

      const toastId = "save-pledge";
      try {
        toast.loading(pledgeToEdit ? "מעדכן..." : "יוצר...", { id: toastId });

        if (pledgeToEdit) {
          // הסרנו את updatedById - השרת יקח מהסשן
          await updatePledge(pledgeToEdit.id, {
            ...value,
            purpose: value.purpose || undefined,
          });
          toast.success("עודכן בהצלחה", { id: toastId });
        } else {
          // הסרנו את createdById - השרת יקח מהסשן
          await createPledge({
            ...value,
            donorId,
            purpose: value.purpose || undefined,
          } as any); // Type cast נדרש לעתים בגלל שינויים בטיפוסים בגנריקה
          toast.success("נוצר בהצלחה", { id: toastId });
        }

        onOpenChange(false);
        onSuccess?.();
      } catch (error) {
        toast.error("שגיאה בשמירה", { id: toastId });
        console.error(error);
      }
    },
  });

  // Reset form when opening/closing or changing pledge
  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open, pledgeToEdit]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {pledgeToEdit ? "עריכת התחייבות" : "הוספת התחייבות"}
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
          {/* <form.AppField
            name="projectId"
            children={(field) => (
              <field.SelectField
                label="פרויקט"
                placeholder="בחר פרויקט"
                options={projects.map((p) => ({
                  label: p.name,
                  value: p.id,
                }))}
              />
            )}
          /> */}

          <form.AppField
            name="projectId"
            children={(f) => (
              <f.SelectLookupField lookup="projects" label="בחר פרויקט" />
            )}
          />

          <form.AppField
            name="startDate"
            children={(f) => <f.DatePickerField label="תאריך התחלה" />}
          />

          <form.AppField
            name="totalAmount"
            children={(f) => <f.TextField type="number" label="סכום כולל" />}
          />
          <form.AppField
            name="installments"
            children={(f) => <f.TextField type="number" label="מספר תשלומים" />}
          />
          <form.AppField
            name="purpose"
            children={(f) => <f.TextField label="מטרת התרומה" />}
          />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="w-1/2"
              onClick={() => onOpenChange(false)}
            >
              ביטול
            </Button>
            <form.AppForm>
              <form.SubmitButton
                lable={pledgeToEdit ? "עדכן" : "שמור"}
                className="w-1/2"
              />
            </form.AppForm>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
