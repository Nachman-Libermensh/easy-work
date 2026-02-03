"use client";

import * as React from "react";
import { UploadCloud, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";

export interface FileInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange"
  > {
  value?: string | null;
  onChange?: (file: File | null) => void;
  preview?: boolean;
}

const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  ({ className, value, onChange, preview = true, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);

    // מאפשר להשתמש ב-ref חיצוני וגם לפנימי בו זמנית
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      if (onChange) {
        onChange(file);
      }
    };

    const clearFile = () => {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      if (onChange) {
        onChange(null);
      }
    };

    // מצב תצוגה מקדימה (כשיש תמונה)
    if (preview && value) {
      return (
        <div
          className={cn(
            "relative flex items-center justify-center w-32 h-32",
            className
          )}
        >
          <Avatar className="h-full w-full border-2 border-border rounded-lg">
            <AvatarImage src={value} className="object-cover" />
            <AvatarFallback className="bg-secondary">
              <ImageIcon className="h-8 w-8 text-muted-foreground opacity-50" />
            </AvatarFallback>
          </Avatar>

          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-7 w-7 rounded-full shadow-sm"
            onClick={clearFile}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove image</span>
          </Button>
        </div>
      );
    }

    // מצב העלאה (כשאין תמונה)
    return (
      <div className={cn("w-full max-w-sm", className)}>
        <div
          className="relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/5 p-6 hover:bg-muted/10 transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <div className="rounded-full bg-background p-2 shadow-sm border">
              <UploadCloud className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-primary">לחץ להעלאה</span> או
              גרור קובץ לכאן
            </div>
            <p className="text-xs text-muted-foreground/70">
              SVG, PNG, JPG (מקסימום 5MB)
            </p>
          </div>

          <Input
            {...props}
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden" // מוסתר כי אנחנו משתמשים בעיצוב המותאם אישית למעלה
            onChange={handleFileChange}
          />
        </div>
      </div>
    );
  }
);

FileInput.displayName = "FileInput";

export { FileInput };
