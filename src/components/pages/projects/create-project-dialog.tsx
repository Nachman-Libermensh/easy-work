"use client";

import { useAppForm } from "@/src/components/ui/custom/form";
import { z } from "zod";
import { toast } from "sonner";
import {
  createProject,
  updateProject,
} from "@/src/api-services/projects.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";

type CreateProjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  project?: any;
};

export function CreateProjectDialog({
  open,
  onOpenChange,
  onSuccess,
  project,
}: CreateProjectDialogProps) {
  const form = useAppForm({
    defaultValues: {
      name: project?.name || "",
      description: project?.description || "",
      targetAmount: project?.targetAmount || null,
      currencyCode: project?.currencyCode || "ILS",
      managerName: project?.managerName || "",
      status: project?.status || "ACTIVE",
    },
    validators: {
      onChange: z.object({
        name: z.string().min(2, "שם הפרויקט חייב להכיל לפחות 2 תווים"),
        description: z.string(),
        targetAmount: z
          .number()
          .positive("יעד חייב להיות מספר חיובי")
          .nullable(),
        currencyCode: z.string(),
        managerName: z.string(),
        status: z.enum(["PLANNING", "ACTIVE", "COMPLETED", "PAUSED"]),
      }),
    },
    onSubmit: async ({ value }) => {
      const toastId = project ? "update-project" : "create-project";
      try {
        toast.loading(project ? "מעדכן פרויקט..." : "יוצר פרויקט...", {
          id: toastId,
        });

        if (project) {
          await updateProject(project.id, value);
          toast.success("פרויקט עודכן בהצלחה", { id: toastId });
        } else {
          await createProject(value);
          toast.success("פרויקט נוצר בהצלחה", { id: toastId });
        }

        form.reset();
        onSuccess?.();
      } catch (error: any) {
        toast.error(error?.message || "שגיאה בשמירת פרויקט", { id: toastId });
        console.error(error);
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {project ? "עריכת פרויקט" : "הוספת פרויקט חדש"}
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
            name="name"
            children={(field) => (
              <field.TextField
                label="שם הפרויקט"
                placeholder="הכנס שם פרויקט"
              />
            )}
          />

          <form.AppField
            name="description"
            children={(field) => (
              <field.TextAreaField label="תיאור" placeholder="תיאור הפרויקט" />
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <form.AppField
              name="targetAmount"
              children={(field) => (
                <field.TextField
                  label="יעד גיוס"
                  type="number"
                  placeholder="0"
                />
              )}
            />

            <form.AppField
              name="managerName"
              children={(field) => (
                <field.TextField
                  label="אחראי פרויקט"
                  placeholder="שם אחראי הפרויקט"
                />
              )}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-1/2"
            >
              ביטול
            </Button>
            <form.AppForm>
              <form.SubmitButton
                className="w-1/2"
                lable={project ? "עדכן" : "צור פרויקט"}
              />
            </form.AppForm>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
