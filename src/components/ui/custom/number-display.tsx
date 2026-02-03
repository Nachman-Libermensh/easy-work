import { cn } from "@/src/lib/utils";

export interface NumberDisplayProps {
  value: number | string | null | undefined;
  format?: "currency" | "percent" | "number";
  currency?: string;
  locale?: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  colorize?: boolean;
  className?: string;
  emptyValue?: string;
}

export const NumberDisplay = ({
  value,
  format = "number",
  currency = "ILS",
  locale = "he-IL",
  decimals,
  prefix,
  suffix,
  colorize = false,
  className,
  emptyValue = "-",
}: NumberDisplayProps) => {
  if (value === null || value === undefined || value === "") {
    return <span className={className}>{emptyValue}</span>;
  }

  const numValue = Number(value);
  if (isNaN(numValue)) {
    return <span className={className}>{String(value)}</span>;
  }

  let formattedValue = "";

  const options: Intl.NumberFormatOptions = {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  };

  if (format === "currency") {
    options.style = "currency";
    options.currency = currency;
  }
  
  formattedValue = new Intl.NumberFormat(locale, options).format(numValue);

  if (format === "percent") {
      formattedValue = `${formattedValue}%`;
  }

  // Prefix/Suffix overrides
  if (prefix) formattedValue = `${prefix} ${formattedValue}`;
  if (suffix) formattedValue = `${formattedValue} ${suffix}`;

  let colorClass = "";
  if (colorize) {
    if (numValue > 0) colorClass = "text-green-600 font-medium";
    else if (numValue < 0) colorClass = "text-red-600 font-medium";
    else colorClass = "text-muted-foreground";
  }

  return (
    <span className={cn("whitespace-nowrap", colorClass, className)} dir="ltr">
      {formattedValue}
    </span>
  );
};
