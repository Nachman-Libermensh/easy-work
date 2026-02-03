"use client";

import { useAppForm } from "@/src/components/ui/custom/form";
import { z } from "zod";
import { toast } from "sonner";
import {
  createExpense,
  updateExpense,
  getExpenseFormOptions,
} from "@/src/api-services/server-actions/expenses.actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { useSession } from "@/src/lib/auth-client";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

type CreateExpenseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  expenseToEdit?: any;
};

export function CreateExpenseDialog({
  open,
  onOpenChange,
  onSuccess,
  expenseToEdit,
}: CreateExpenseDialogProps) {
  const { data: session } = useSession();

  const { data: options } = useQuery({
    queryKey: ["expense-form-options"],
    queryFn: () => getExpenseFormOptions(),
    enabled: open,
  });

  const form = useAppForm({
    defaultValues: {
      projectId: expenseToEdit?.projectId || "",
      amount: expenseToEdit ? Number(expenseToEdit.amount) : 0,
      paymentMethodId: expenseToEdit?.paymentMethodId
        ? String(expenseToEdit.paymentMethodId)
        : "",
      date: expenseToEdit?.date ? new Date(expenseToEdit.date) : new Date(),
      purpose: expenseToEdit?.purpose || "",
      payee: expenseToEdit?.payee || "",
      reference: expenseToEdit?.reference || "",
    },
    validators: {
      onChange: z.object({
        projectId: z.string(),
        amount: z.number().positive("סכום חייב להיות חיובי"),
        paymentMethodId: z.string().min(1, "בחר אמצעי תשלום"),
        date: z.date(),
        purpose: z.string().min(1, "נא להזין מהות הוצאה"),
        payee: z.string().min(1, "נא להזין שם מוטב"),
        reference: z.string(),
      }),
    },
    onSubmit: async ({ value }) => {
      if (!session?.user?.id) {
        toast.error("משתמש לא מחובר");
        return;
      }

      const toastId = "save-expense";
      try {
        toast.loading(expenseToEdit ? "מעדכן..." : "יוצר...", {
          id: toastId,
        });

        const payload = {
          ...value,
          paymentMethodId: Number(value.paymentMethodId),
          projectId: value.projectId || undefined,
          reference: value.reference || undefined,
        };

        if (expenseToEdit) {
          await updateExpense(expenseToEdit.id, {
            ...payload,
            updatedById: session.user.id,
          });
        } else {
          await createExpense({
            ...payload,
            createdById: session.user.id,
          });
        }

        toast.success(expenseToEdit ? "עודכן בהצלחה" : "נוצר בהצלחה", {
          id: toastId,
        });
        form.reset();
        onSuccess?.();
      } catch (error) {
        toast.error("שגיאה בשמירה", { id: toastId });
        console.error(error);
      }
    },
  });

  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open, expenseToEdit]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {expenseToEdit ? "עריכת הוצאה" : "הוספת הוצאה"}
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
          <div className="grid grid-cols-2 gap-4">
            <form.AppField
              name="date"
              children={(f) => <f.DatePickerField label="תאריך" />}
            />
            <form.AppField
              name="amount"
              children={(f) => <f.TextField type="number" label="סכום (₪)" />}
            />
          </div>

          <form.AppField
            name="payee"
            children={(f) => <f.TextField label="שם מוטב / ספק" />}
          />

          <form.AppField
            name="purpose"
            children={(f) => <f.TextField label="מהות הוצאה" />}
          />

          <div className="grid grid-cols-2 gap-4">
            <form.AppField
              name="projectId"
              children={(f) => (
                <f.SelectField
                  label="פרויקט (אופציונלי)"
                  placeholder="בחר פרויקט"
                  options={options?.projects || []}
                />
              )}
            />
            <form.AppField
              name="paymentMethodId"
              children={(f) => (
                <f.SelectField
                  label="אמצעי תשלום"
                  placeholder="בחר אמצעי תשלום"
                  options={options?.methods || []}
                />
              )}
            />
          </div>

          <form.AppField
            name="reference"
            children={(f) => <f.TextField label="אסמכתא" />}
          />

          <div className="flex justify-end gap-2 pt-2">
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
                className="w-1/2"
                lable={expenseToEdit ? "עדכן" : "שמור"}
              />
            </form.AppForm>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
