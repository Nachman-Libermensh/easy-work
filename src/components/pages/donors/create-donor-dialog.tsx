"use client";

import { useAppForm } from "@/src/components/ui/custom/form";
import { z } from "zod";
import { toast } from "sonner";
import { createDonor, updateDonor } from "@/src/api-services/donors.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { useSession } from "@/src/lib/auth-client";
import SelectLookupField from "../../ui/custom/form/form-components/fields/select-lookup.field";
import { Donor } from "@repo/database";

type CreateDonorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  donor?: Donor;
};

export function CreateDonorDialog({
  open,
  onOpenChange,
  onSuccess,
  donor,
}: CreateDonorDialogProps) {
  const { data: session } = useSession();

  const form = useAppForm({
    defaultValues: {
      firstName: donor?.firstName || "",
      lastName: donor?.lastName || "",
      email: donor?.email || "",
      phone: donor?.phone || "",
      address: donor?.address || "",
      cityId: donor?.cityId || null,
      notes: donor?.notes || "",
    },
    validators: {
      onChange: z.object({
        firstName: z.string().min(2, "חובה להזין שם פרטי"),
        lastName: z.string().min(2, "חובה להזין שם משפחה"),
        email: z.string().email("אימייל לא תקין").or(z.literal("")),
        phone: z.string(),
        address: z.string(),
        cityId: z.number().nullable(),
        notes: z.string(),
      }),
    },
    onSubmit: async ({ value }) => {
      const toastId = donor ? "update-donor" : "create-donor";
      const userId = session?.user?.id;

      if (!userId) {
        toast.error("משתמש לא מחובר", { id: toastId });
        return;
      }

      try {
        toast.loading(donor ? "מעדכן תורם..." : "יוצר תורם...", {
          id: toastId,
        });

        if (donor) {
          await updateDonor(donor.id, {
            ...value,
          });
          toast.success("תורם עודכן בהצלחה", { id: toastId });
        } else {
          await createDonor({
            ...value,
            cityId: value.cityId === null ? undefined : value.cityId,
          });
          toast.success("תורם נוצר בהצלחה", { id: toastId });
        }
        form.reset();
        onSuccess?.();
      } catch (error: any) {
        toast.error("שגיאה בשמירת תורם", { id: toastId });
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{donor ? "עריכת תורם" : "הוספת תורם חדש"}</DialogTitle>
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
              name="firstName"
              children={(f) => <f.TextField label="שם פרטי" />}
            />
            <form.AppField
              name="lastName"
              children={(f) => <f.TextField label="שם משפחה" />}
            />
          </div>
          <form.AppField
            name="email"
            children={(f) => <f.EmailInputField label="אימייל" type="email" />}
          />
          <form.AppField
            name="phone"
            children={(f) => <f.TextField label="טלפון" />}
          />

          {/* שדה בחירת עיר עם Lookup */}
          <form.AppField
            name="cityId"
            children={() => (
              <SelectLookupField
                label="עיר"
                lookup="cities"
                placeholder="בחר עיר"
              />
            )}
          />

          <form.AppField
            name="notes"
            children={(f) => <f.TextAreaField label="הערות" />}
          />

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              ביטול
            </Button>
            <form.AppForm>
              <form.SubmitButton lable={donor ? "עדכן" : "צור"} />
            </form.AppForm>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
