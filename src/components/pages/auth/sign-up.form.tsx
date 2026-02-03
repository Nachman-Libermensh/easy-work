"use client";

import { useAppForm } from "@/src/components/ui/custom/form";
import { authClient } from "@/src/lib/auth-client";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const SignUpForm = () => {
  const router = useRouter();
  const form = useAppForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
    validators: {
      onChange: z
        .object({
          name: z.string().min(2, "שם מלא חייב להכיל לפחות 2 תווים"),
          email: z.string().email("כתובת אימייל לא תקינה"),
          password: z.string().min(8, "סיסמא חייבת להכיל לפחות 8 תווים"),
          passwordConfirmation: z.string(),
        })
        .refine((data) => data.password === data.passwordConfirmation, {
          message: "הסיסמאות אינן תואמות",
          path: ["passwordConfirmation"],
        }),
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
          callbackURL: "/",
        },
        {
          onRequest: () => {
            toast.loading("נרשם...", { id: "sign-up" });
          },
          onSuccess: () => {
            router.push("/");
            toast.success("נרשמת בהצלחה, מעביר...", { id: "sign-up" });
          },
          onError: (ctx) => {
            toast.error(ctx.error.message, { id: "sign-up" });
          },
        }
      );
    },
  });

  return (
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
          <field.TextField label="שם מלא" placeholder="ישראל ישראלי" />
        )}
      />

      <form.AppField
        name="email"
        children={(field) => (
          <field.TextField
            label="אימייל"
            placeholder="name@example.com"
            type="email"
          />
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <form.AppField
          name="password"
          children={(field) => <field.PasswordInputField label="סיסמא" />}
        />
        <form.AppField
          name="passwordConfirmation"
          children={(field) => <field.PasswordInputField label="אימות סיסמא" />}
        />
      </div>

      <form.AppForm>
        <form.SubmitButton className="w-full" lable="הרשמה" />
      </form.AppForm>
    </form>
  );
};
