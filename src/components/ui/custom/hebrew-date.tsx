import { Calendar, Clock } from "lucide-react";
import { formatHebrewDate, formatTime } from "@/src/lib/date-utils";
import { cn } from "@/src/lib/utils";

interface HebrewDateProps {
  date: string | Date | number | null | undefined;
  showTime?: boolean;
  className?: string;
}

export function HebrewDate({
  date,
  showTime = false,
  className,
}: HebrewDateProps) {
  if (!date) return <span className={className}>-</span>;

  if (showTime) {
    return (
      <div className={cn("flex flex-col text-xs gap-0.5", className)}>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <span dir="rtl">{formatHebrewDate(date)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span dir="ltr">{formatTime(date)}</span>
        </div>
      </div>
    );
  }

  return (
    <span className={cn("whitespace-nowrap", className)}>
      {formatHebrewDate(date)}
    </span>
  );
}
