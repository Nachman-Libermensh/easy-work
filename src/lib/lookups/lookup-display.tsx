import { useLookup } from "./use-lookup";
import { LookupKey } from "./index";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";
import { Skeleton } from "@/src/components/ui/skeleton";

export interface LookupDisplayProps {
  lookup: LookupKey;
  value: string | number | null | undefined;
  variant?: "text" | "badge";
  className?: string;
  emptyValue?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";

  props?: React.HTMLAttributes<HTMLSpanElement>;
}

export const LookupDisplay = ({
  lookup,
  value,
  variant = "text",
  className,
  emptyValue = "-",
  badgeVariant = "secondary",
  ...props
}: LookupDisplayProps) => {
  const { getLabel, isLoading, isError } = useLookup(lookup);

  if (isLoading) {
    return <Skeleton className="h-5 w-20" />;
  }

  if (isError) {
    return (
      <span className={cn("text-destructive text-xs", className)}>שגיאה</span>
    );
  }

  if (value === null || value === undefined || value === "") {
    return <span className={className}>{emptyValue}</span>;
  }

  const label = getLabel(value);

  if (!label) {
    return <span className={className}>{emptyValue}</span>;
  }

  if (variant === "badge") {
    return (
      <Badge variant={badgeVariant} className={cn("text-xs", className)}>
        {label}
      </Badge>
    );
  }

  // variant === "text"
  return (
    <span className={className} {...props}>
      {label}
    </span>
  );
};
