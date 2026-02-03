"use client";

import { useAppForm } from "@/src/components/ui/custom/form";
import { z } from "zod";
import { toast } from "sonner";
// ייבוא משירותי API החדשים
import {
  createDonation,
  updateDonation,
  getAllPaymentMethods,
} from "@/src/api-services/donations.service";
import { getAllProjects } from "@/src/api-services/projects.service";
import { getAllDonors } from "@/src/api-services/donors.service";
import { getAllPledges } from "@/src/api-services/pledges.service";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

type CreateDonationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  donationToEdit?: any;
};

export function CreateDonationDialog({
  open,
  onOpenChange,
  onSuccess,
  donationToEdit,
}: CreateDonationDialogProps) {
  // טעינת רשימות במקביל
  const { data: donorsData } = useQuery({
    queryKey: ["donors-list"],
    queryFn: () => getAllDonors(),
    enabled: open,
  });
  const { data: projectsData } = useQuery({
    queryKey: ["projects-list"],
    queryFn: () => getAllProjects(),
    enabled: open,
  });
  const { data: methods } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: () => getAllPaymentMethods(),
    enabled: open,
  });

  const form = useAppForm({
    defaultValues: {
      donorId: donationToEdit?.donorId || "",
      projectId: donationToEdit?.projectId || "",
      pledgeId: donationToEdit?.pledgeId || "",
      amountILS: donationToEdit ? Number(donationToEdit.amountILS) : 0,
      paymentMethodId: donationToEdit?.paymentMethodId
        ? String(donationToEdit.paymentMethodId)
        : "",
      receivedAt: donationToEdit?.receivedAt
        ? new Date(donationToEdit.receivedAt)
        : new Date(),
      reference: donationToEdit?.reference || "",
      notes: donationToEdit?.notes || "",
    },
    validators: {
      onChange: z.object({
        donorId: z.string(),
        projectId: z.string(),
        pledgeId: z.string(),
        amountILS: z.number().positive("סכום חייב להיות חיובי"),
        paymentMethodId: z.string().min(1, "בחר אמצעי תשלום"),
        receivedAt: z.date(),
        reference: z.string(),
        notes: z.string(),
      }),
    },
    onSubmit: async ({ value }) => {
      // אין צורך לבדוק session עבור ID, זה מטופל בשרת
      const toastId = "save-donation";
      try {
        toast.loading(donationToEdit ? "מעדכן..." : "יוצר...", {
          id: toastId,
        });

        const payload = {
          ...value,
          amountOriginal: value.amountILS as any, // טיפול ב-Decimal
          amountILS: value.amountILS as any,
          paymentMethodId: Number(value.paymentMethodId),
          donorId: value.donorId || undefined,
          projectId: value.projectId || undefined,
          pledgeId: value.pledgeId || undefined,
          reference: value.reference || undefined,
          notes: value.notes || undefined,
        };

        if (donationToEdit) {
          await updateDonation(donationToEdit.id, payload);
        } else {
          await createDonation(payload);
        }

        toast.success(donationToEdit ? "עודכן בהצלחה" : "נוצר בהצלחה", {
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
  }, [open, donationToEdit]);

  // רכיב לבחירת התחייבות המתעדכן לפי התורם שנבחר
  const PledgeSelect = ({ donorId }: { donorId: string | undefined }) => {
    const { data: pledgesData, isLoading } = useQuery({
      queryKey: ["donor-pledges-options", donorId],
      queryFn: () => getAllPledges({ donorId: donorId || "" }),
      enabled: !!donorId,
    });

    const pledges = pledgesData || [];

    if (!donorId || (!isLoading && (!pledges || pledges.length === 0))) {
      return null;
    }

    const pledgeOptions = pledges.map((p) => ({
      label: `${p.project?.name || "כללי"} - ₪${Number(
        p.totalAmount,
      ).toLocaleString()} (${new Date(p.createdAt).toLocaleDateString()})`,
      value: p.id,
    }));

    return (
      <form.AppField
        name="pledgeId"
        children={(f) => (
          <f.SelectField
            label="קשר להתחייבות (אופציונלי)"
            placeholder={isLoading ? "טוען..." : "בחר התחייבות"}
            options={pledgeOptions}
          />
        )}
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {donationToEdit ? "עריכת הכנסה" : "הוספת הכנסה"}
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
            name="receivedAt"
            children={(f) => <f.DatePickerField label="תאריך" />}
          />
          <form.AppField
            name="amountILS"
            children={(f) => <f.TextField type="number" label="סכום (₪)" />}
          />

          <form.AppField
            name="donorId"
            children={(f) => (
              <f.SelectField
                label="תורם (אופציונלי)"
                placeholder="בחר תורם"
                options={
                  donorsData?.map((d) => ({
                    label: `${d.firstName} ${d.lastName}`,
                    value: d.id,
                  })) || []
                }
              />
            )}
          />

          {/* Reactive Pledges Area */}
          <form.Subscribe
            selector={(state) => state.values.donorId}
            children={(donorId) => <PledgeSelect donorId={donorId} />}
          />

          <form.AppField
            name="projectId"
            children={(f) => (
              <f.SelectField
                label="פרויקט (אופציונלי)"
                placeholder="בחר פרויקט"
                options={
                  projectsData?.map((p) => ({
                    label: p.name,
                    value: p.id,
                  })) || []
                }
              />
            )}
          />
          <form.AppField
            name="paymentMethodId"
            children={(f) => (
              <f.SelectField
                label="אמצעי תשלום"
                placeholder="בחר אמצעי תשלום"
                options={
                  methods?.map((m) => ({
                    label: m.name,
                    value: String(m.id),
                  })) || []
                }
              />
            )}
          />
          <form.AppField
            name="reference"
            children={(f) => <f.TextField label="אסמכתא" />}
          />
          <form.AppField
            name="notes"
            children={(f) => <f.TextAreaField label="הערות" />}
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
                className="w-1/2"
                lable={donationToEdit ? "עדכן" : "שמור"}
              />
            </form.AppForm>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
