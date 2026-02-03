/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useStore } from "@tanstack/react-form";
import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { cn } from "@/src/lib/utils";
import { useFormContext } from "../../form-context";
import { Copy, Download, X } from "lucide-react";
import { toast } from "sonner";

type DebugPart =
  | "values"
  | "errors"
  | "dirtyFields"
  | "touchedFields"
  | "state";

type DebugButtonProps = {
  /** טקסט הכפתור */
  label?: string;
  /** מחלקות CSS לכפתור */
  className?: string;
  /** האם להציג מודל עם המידע */
  showModal?: boolean;
  /** אילו חלקים מהטופס להציג */
  parts?: DebugPart[];
  /** כותרת המודל */
  modalTitle?: string;
  /** הפעלת קולבק אחרי דיבוג */
  onDebug?: (formState: any) => void;
  /** להציג גם בסביבת ייצור (ברירת מחדל: false) */
  showInProduction?: boolean;
} & Omit<React.ComponentProps<typeof Button>, "onClick">;

const DebugButton = ({
  className,
  label = "Debug",
  showModal = true,
  parts = ["values", "errors", "dirtyFields", "touchedFields", "state"],
  modalTitle = "מידע על הטופס",
  onDebug,
  showInProduction = false,
  ...props
}: DebugButtonProps) => {
  const form = useFormContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isSubmitting, canSubmit] = useStore(form.store, (state) => [
    state.isSubmitting,
    state.canSubmit,
  ]);
  // בדיקה האם להציג את הכפתור בהתבסס על סביבת הריצה
  const isDevelopment = process.env.NODE_ENV !== "production";
  const shouldShow = isDevelopment || showInProduction;

  // אם לא צריך להציג את הכפתור בסביבה הנוכחית, החזר null
  if (!shouldShow) {
    return null;
  }

  const handleDebugClick = () => {
    // מדפיסים לקונסול בצורה מסודרת
    console.log("Form State:", form.store.state);
    console.log("Form Values:", form.store.state.values);
    console.log("Form Errors:", form.store.state.errors);

    // הפעלת קולבק אם קיים
    if (onDebug) {
      onDebug(form.store.state);
    }

    // אם מוגדר להציג מודל
    if (showModal) {
      setIsModalOpen(true);
    }
  };

  const copyToClipboard = () => {
    const data = JSON.stringify(form.state, null, 2);
    navigator.clipboard.writeText(data);
    toast.success("המידע הועתק ללוח!");
  };

  const downloadAsJson = () => {
    const data = JSON.stringify(form.state, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.download = "form-debug-data.json";
    link.href = url;
    link.click();

    URL.revokeObjectURL(url);
  };

  // פורמט מסודר של JSON להצגה במודל
  const formatJson = (obj: any) => {
    return JSON.stringify(obj, null, 2);
  };

  return (
    <>
      <Button
        type="button"
        variant={props.variant ?? "outline"}
        className={cn(className)}
        onClick={handleDebugClick}
        {...props}
      >
        {label}
      </Button>

      {showModal && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-h-[80vh] max-w-4xl overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{modalTitle}</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    title="העתק ללוח"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadAsJson}
                    title="הורד כקובץ JSON"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsModalOpen(false)}
                    title="סגור"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="overflow-y-auto">
              {parts.includes("values") && (
                <div className="mb-4">
                  <p className="mb-2 font-medium">ערכי הטופס:</p>
                  <pre className="bg-muted overflow-x-auto rounded p-3 text-sm">
                    {formatJson(form.state.values)}
                  </pre>
                </div>
              )}

              {parts.includes("errors") &&
                form.state.errors &&
                Object.keys(form.state.errors).length > 0 && (
                  <div className="mb-4">
                    <p className="mb-2 font-medium">שגיאות הטופס:</p>
                    <pre className="bg-muted overflow-x-auto rounded p-3 text-sm">
                      {formatJson(form.state.errors)}
                    </pre>
                  </div>
                )}

              {parts.includes("dirtyFields") && (
                <div className="mb-4">
                  <p className="mb-2 font-medium">שדות שהשתנו:</p>
                  <pre className="bg-muted overflow-x-auto rounded p-3 text-sm">
                    {formatJson(
                      Object.entries(form.store.state.fieldMeta || {})
                        .filter(
                          ([_, meta]) => (meta as { isDirty: boolean }).isDirty
                        )
                        .reduce<Record<string, boolean>>((acc, [key]) => {
                          acc[key] = true;
                          return acc;
                        }, {})
                    )}
                  </pre>
                </div>
              )}

              {parts.includes("touchedFields") && (
                <div className="mb-4">
                  <p className="mb-2 font-medium">שדות שנגעו בהם:</p>
                  <pre className="bg-muted overflow-x-auto rounded p-3 text-sm">
                    {formatJson(
                      Object.entries(form.store.state.fieldMeta || {})
                        .filter(
                          ([_, meta]) =>
                            (meta as { isTouched: boolean }).isTouched
                        )
                        .reduce<Record<string, boolean>>((acc, [key]) => {
                          acc[key] = true;
                          return acc;
                        }, {})
                    )}
                  </pre>
                </div>
              )}

              {parts.includes("state") && (
                <div className="mb-4">
                  <p className="mb-2 font-medium">מצב הטופס המלא:</p>
                  <pre className="bg-muted overflow-x-auto rounded p-3 text-sm">
                    {formatJson(form.state)}
                  </pre>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default DebugButton;
