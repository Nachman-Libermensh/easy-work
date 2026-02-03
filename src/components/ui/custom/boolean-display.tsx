import { Check, X } from "lucide-react";
import { Badge } from "../badge";
import { cn } from "@/src/lib/utils";

export interface BooleanDisplayProps {
  value: boolean | null | undefined;
  variant?: "text" | "badge" | "icon";
  trueLabel?: string;
  falseLabel?: string;
  className?: string;
}

export const BooleanDisplay = ({
  value,
  variant = "text",
  trueLabel = "כן",
  falseLabel = "לא",
  className,
}: BooleanDisplayProps) => {
  if (value === null || value === undefined) {
    return <span className={className}>-</span>;
  }

  if (variant === "badge") {
    return (
      <Badge
        variant={value ? "default" : "secondary"}
        className={cn(
          "text-xs",
          value
            ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
            : "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
          className
        )}
      >
        {value ? trueLabel : falseLabel}
      </Badge>
    );
  }

  if (variant === "icon") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        {value ? (
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
        ) : (
          <X className="h-4 w-4 text-red-600 dark:text-red-400" />
        )}
      </div>
    );
  }

  // variant === "text"
  return (
    <span
      className={cn(
        value
          ? "text-green-600 dark:text-green-400"
          : "text-gray-600 dark:text-gray-400",
        className
      )}
    >
      {value ? trueLabel : falseLabel}
    </span>
  );
};
