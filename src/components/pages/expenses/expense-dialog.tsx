"use client";

import { useAppForm } from "@/src/components/ui/custom/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { z } from "zod";
import {
  createExpense,
  updateExpense,
} from "@/src/api-services/expenses.service";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { getAllPaymentMethods } from "@/src/api-services/donations.service";
import { getAllProjects } from "@/src/api-services/projects.service";

interface ExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: any;
  onSuccess: () => void;
}

export function ExpenseDialog({
  open,
  onOpenChange,
  expense,
  onSuccess,
}: ExpenseDialogProps) {
  const { data: paymentMethods } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: () => getAllPaymentMethods(),
    enabled: open,
  });

  const { data: projectsData } = useQuery({
    queryKey: ["projects-select"],
    queryFn: () => getAllProjects(),
    enabled: open,
  });

  // Safe fallback for projects array
  const projects = Array.isArray(projectsData) ? projectsData : [];
  console.log("projectsData", projectsData);

  const form = useAppForm({
    defaultValues: {
      amount: expense ? Number(expense.amount) : 0,
      date: expense ? new Date(expense.date) : new Date(),
      purpose: expense?.purpose || "",
      payee: expense?.payee || "",
      projectId: expense?.projectId || "null",
      paymentMethodId: expense ? String(expense.paymentMethodId) : "",
      reference: expense?.reference || "",
    },
    validators: {
      onChange: z.object({
        amount: z.number().positive("סכום חייב להיות חיובי"),
        date: z.date(),
        purpose: z.string().min(2, "חובה להזין מטרת הוצאה"),
        payee: z.string().min(2, "חובה להזין שם מוטב"),
        projectId: z.string(),
        paymentMethodId: z.string().min(1, "חובה לבחור אמצעי תשלום"),
        reference: z.string(),
      }),
    },
    onSubmit: async ({ value }) => {
      try {
        const payload = {
          amount: value.amount,
          date: value.date,
          purpose: value.purpose,
          payee: value.payee,
          projectId: value.projectId === "null" ? undefined : value.projectId,
          paymentMethodId: Number(value.paymentMethodId),
          reference: value.reference,
        };

        if (expense) {
          await updateExpense(expense.id, payload);
          toast.success("עודכן בהצלחה");
        } else {
          await createExpense(payload);
          toast.success("נוצר בהצלחה");
        }
        onSuccess();
      } catch (error) {
        toast.error("שגיאה בשמירת הנתונים");
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{expense ? "עריכת הוצאה" : "הוספת הוצאה"}</DialogTitle>
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
            name="purpose"
            children={(f) => <f.TextField label="תיאור / מטרת הוצאה" />}
          />

          <form.AppField
            name="payee"
            children={(f) => <f.TextField label="שם המוטב / ספק" />}
          />

          <div className="grid grid-cols-2 gap-4">
            <form.AppField
              name="projectId"
              children={(f) => (
                <f.SelectField
                  label="פרויקט (אופציונלי)"
                  options={[
                    { label: "--- ללא פרויקט ---", value: "null" },
                    ...projects.map((p: any) => ({
                      label: p.name,
                      value: p.id,
                    })),
                  ]}
                />
              )}
            />
            <form.AppField
              name="paymentMethodId"
              children={(f) => (
                <f.SelectField
                  label="אמצעי תשלום"
                  options={
                    paymentMethods?.map((m: any) => ({
                      label: m.name,
                      value: String(m.id),
                    })) || []
                  }
                />
              )}
            />
          </div>

          <form.AppField
            name="reference"
            children={(f) => <f.TextField label="אסמכתא" />}
          />

          <form.AppForm>
            <form.SubmitButton lable="שמור" />
          </form.AppForm>
        </form>
      </DialogContent>
    </Dialog>
  );
}
