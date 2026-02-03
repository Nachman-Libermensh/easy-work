"use client";

import { useAppForm } from "@/src/components/ui/custom/form";
import { Button } from "@/src/components/ui/button"; // ייבוא כפתור של shadcn
import { authClient } from "@/src/lib/auth-client";
import { z } from "zod";
import { toast } from "sonner";

export const SignInForm = () => {
  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validators: {
      onChange: z.object({
        email: z.string().email("כתובת אימייל לא תקינה"),
        password: z.string().min(1, "נא להזין סיסמא"),
        rememberMe: z.boolean(),
      }),
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
          rememberMe: value.rememberMe,
          callbackURL: "/",
        },
        {
          onRequest: () => {
            toast.loading("מתחבר...", { id: "sign-in" });
          },
          onSuccess: () => {
            toast.success("התחברת בהצלחה, מעביר...", { id: "sign-in" });
          },
          onError: (ctx) => {
            if (ctx.error.code === "INVALID_EMAIL_OR_PASSWORD") {
              toast.error("אימייל או סיסמא שגויים", { id: "sign-in" });
            } else {
              toast.error(ctx.error.message, { id: "sign-in" });
            }
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
      className="flex flex-col gap-6"
    >
      {/* כפתור גוגל */}
      <div className="flex flex-col gap-4">
        <Button
          className="w-full"
          variant="outline"
          type="button"
          disabled={true} // הוספה עתידית
        >
          <svg
            viewBox="0 0 24 24"
            className="mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              fill="currentColor"
            />
          </svg>
          התחבר באמצעות Google
        </Button>
      </div>

      {/* מפריד מעוצב */}
      <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t">
        <span className="relative z-10 bg-card px-2 text-muted-foreground">
          או כניסה עם סיסמא
        </span>
      </div>

      {/* שדות הטופס */}
      <div className="grid gap-4">
        <form.AppField
          name="email"
          children={(field) => (
            <field.EmailInputField
              label="אימייל"
              placeholder="name@example.com"
            />
          )}
        />

        <form.AppField
          name="password"
          children={(field) => <field.PasswordInputField label="סיסמא" />}
        />

        <form.AppField
          name="rememberMe"
          children={(field) => <field.CheckboxField label="זכור אותי" />}
        />

        <form.AppForm>
          <form.SubmitButton className="w-full mt-2" lable="התחברות" />
        </form.AppForm>
      </div>
    </form>
  );
};
