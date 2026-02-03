"use client";

import { useAppForm } from "@/src/components/ui/custom/form";
import { authClient } from "@/src/lib/auth-client";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Save, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { uploadFile } from "@/src/api-services/uploads.service";
import { Button } from "@/src/components/ui/button";

const MAX_FILE_SIZE = 1024 * 1024; // 1MB (Next.js server action default limit)
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
];

const ProfilePage = () => {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">פרופיל משתמש</h1>
        <p className="text-muted-foreground">נהל את פרטי החשבון וההגדרות שלך</p>
      </div>

      <div className="grid gap-6">
        <ProfileImageForm
          currentImage={session?.user?.image || null}
          currentName={session?.user?.name || ""}
        />
        <ProfileNameForm currentName={session?.user?.name || ""} />
        <ProfileEmailReadOnly email={session?.user?.email || ""} />
      </div>
    </div>
  );
};

// --- Sub Components for Separate Actions ---

const ProfileImageForm = ({
  currentImage,
  currentName,
}: {
  currentImage: string | null;
  currentName: string;
}) => {
  const router = useRouter();

  const form = useAppForm({
    defaultValues: {
      image: currentImage as string | File | null,
    },
    validators: {
      onChange: z.object({
        image: z
          .custom<File | string | null>()
          .refine((val) => {
            if (val instanceof File) {
              return val.size <= MAX_FILE_SIZE;
            }
            return true;
          }, "הקובץ גדול מדי (מקסימום 1MB)")
          .refine((val) => {
            if (val instanceof File) {
              return ACCEPTED_IMAGE_TYPES.includes(val.type);
            }
            return true;
          }, "הקובץ חייב להיות מסוג תמונה (JPG, PNG, WEBP)"),
      }),
    },
    onSubmit: async ({ value }) => {
      const file = value.image;

      if (!(file instanceof File)) {
        toast.info("לא נבחרה תמונה חדשה", { id: "update-image" });
        return;
      }

      try {
        toast.loading("מעלה תמונה...", { id: "update-image" });

        // 1. Upload to server
        const uploadResult = await uploadFile(file);

        // 2. Update user profile with URL
        if (uploadResult.url) {
          await authClient.updateUser({
            image: uploadResult.url,
          });
        }

        toast.success("תמונת פרופיל עודכנה", { id: "update-image" });
        router.refresh();
      } catch (error: any) {
        console.error(error);
        toast.error(error.message || "שגיאה בהעלאת התמונה", {
          id: "update-image",
        });
      }
    },
  });

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex-1">
        <h3 className="font-semibold text-lg">תמונת פרופיל</h3>
        <p className="text-sm text-muted-foreground">
          תמונה זו תוצג במערכת לצד שמך (עד 1MB, פורמט תמונה בלבד)
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="flex flex-col items-center gap-4 w-full md:w-auto"
      >
        <form.AppField
          name="image"
          children={(field) => (
            <field.FileInputField
              label="" // No label needed inside this layout
              placeholder={currentName}
            />
          )}
        />

        <form.Subscribe
          selector={(state) => ({
            isDirty: state.isDirty,
            canSubmit: state.canSubmit,
            isSubmitting: state.isSubmitting,
          })}
          children={({ isDirty, canSubmit, isSubmitting }) =>
            isDirty ? (
              <Button
                type="submit"
                size="sm"
                className="w-full"
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                שמור תמונה
              </Button>
            ) : null
          }
        />
      </form>
    </div>
  );
};

const ProfileNameForm = ({ currentName }: { currentName: string }) => {
  const router = useRouter();

  const form = useAppForm({
    defaultValues: {
      name: currentName,
    },
    validators: {
      onChange: z.object({
        name: z.string().min(2, "שם חייב להכיל לפחות 2 תווים"),
      }),
    },
    onSubmit: async ({ value }) => {
      await authClient.updateUser(
        {
          name: value.name,
        },
        {
          onRequest: () => {
            toast.loading("מעדכן שם...", { id: "update-name" });
          },
          onSuccess: () => {
            toast.success("השם עודכן בהצלחה", { id: "update-name" });
            router.refresh();
          },
          onError: (ctx) => {
            toast.error(ctx.error.message, { id: "update-name" });
          },
        },
      );
    },
  });

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="flex flex-col md:flex-row md:items-end gap-4"
      >
        <div className="flex-1 space-y-1">
          <form.AppField
            name="name"
            children={(field) => (
              <field.TextField label="שם מלא" placeholder="ישראל ישראלי" />
            )}
          />
        </div>

        <form.Subscribe
          selector={(state) => state.isDirty}
          children={(isDirty) => (
            <Button
              type="submit"
              disabled={!isDirty}
              variant={isDirty ? "default" : "secondary"}
              className={!isDirty ? "opacity-50" : ""}
            >
              <Save className="mr-2 h-4 w-4" />
              שמור
            </Button>
          )}
        />
      </form>
    </div>
  );
};

const ProfileEmailReadOnly = ({ email }: { email: string }) => {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm opacity-80">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          כתובת אימייל
        </label>
        <div className="flex h-9 w-full rounded-md border border-input bg-muted px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 items-center text-muted-foreground">
          {email}
        </div>
        <p className="text-[0.8rem] text-muted-foreground">
          לא ניתן לשנות כתובת אימייל באופן עצמאי.
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;
