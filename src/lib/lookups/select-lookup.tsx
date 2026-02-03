import * as React from "react";
import { useLookup } from "./use-lookup";
import { LookupKey } from "./index";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { cn } from "@/src/lib/utils";

interface SelectLookupProps extends Omit<
  React.ComponentProps<typeof Select>,
  "children" | "value" | "onValueChange"
> {
  lookup: LookupKey;
  placeholder?: string;
  className?: string;
  error?: boolean;
  value?: string | number | null;
  onValueChange?: (value: string | number | null) => void;
}

export function SelectLookup({
  lookup,
  placeholder = "בחר...",
  className,
  error,
  value,
  onValueChange,
  ...props
}: SelectLookupProps) {
  const { options, isLoading, isError } = useLookup(lookup);

  // Convert value to string, handle null/undefined
  const stringValue = value != null ? String(value) : "";

  return (
    <Select
      dir="rtl"
      disabled={isLoading || isError || props.disabled}
      value={stringValue}
      onValueChange={onValueChange}
      {...props}
    >
      <SelectTrigger
        className={cn(
          "w-full",
          error && "border-destructive focus-visible:ring-destructive",
          className,
        )}
      >
        <SelectValue placeholder={isLoading ? "טוען..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
        {options.length === 0 && !isLoading && (
          <div className="p-2 text-sm text-muted-foreground text-center">
            אין נתונים
          </div>
        )}
      </SelectContent>
    </Select>
  );
}
