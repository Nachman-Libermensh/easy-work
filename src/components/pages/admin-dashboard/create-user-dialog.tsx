"use client";

import { useAppForm } from "@/src/components/ui/custom/form";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Plus } from "lucide-react";
import { authClient } from "@/src/lib/auth-client";

type CreateUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function CreateUserDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateUserDialogProps) {
  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
      isAdmin: false,
    },
    validators: {
      onChange: z.object({
        email: z.string().email("כתובת אימייל לא תקינה"),
        password: z.string().min(6, "סיסמה חייבת להכיל לפחות 6 תווים"),
        name: z.string().min(2, "שם חייב להכיל לפחות 2 תווים"),
        isAdmin: z.boolean(),
      }),
    },
    onSubmit: async ({ value }) => {
      const toastId = "create-user";
      try {
        toast.loading("יוצר משתמש...", { id: toastId });
        await authClient.admin.createUser({
          email: value.email,
          password: value.password,
          name: value.name,
          role: value.isAdmin ? "admin" : "user",
        });

        toast.success("משתמש נוצר בהצלחה", { id: toastId });
        form.reset();
        onSuccess?.();
      } catch (error: any) {
        toast.error(error?.message || "שגיאה ביצירת משתמש", { id: toastId });
        console.error(error);
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>הוספת משתמש חדש</DialogTitle>
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
            children={(field) => (
              <field.TextField label="שם מלא" placeholder="הכנס שם מלא" />
            )}
          />

          <form.AppField
            name="email"
            children={(field) => (
              <field.EmailInputField
                label="אימייל"
                type="email"
                placeholder="user@example.com"
              />
            )}
          />

          <form.AppField
            name="password"
            children={(field) => (
              <field.PasswordInputField
                label="סיסמה"
                placeholder="הכנס סיסמה"
              />
            )}
          />

          <form.AppField
            name="isAdmin"
            children={(field) => (
              <field.SwitchField
                label="מנהל מערכת"
                description="האם המשתמש יהיה מנהל?"
              />
            )}
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
              <form.SubmitButton lable="צור משתמש" className="w-1/2" />
            </form.AppForm>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
