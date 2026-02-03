import * as React from "react";
import { Check, Copy, Mail } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Badge } from "../badge";

export interface EmailDisplayProps {
  email?: string | null;
  variant?: "text" | "badge";
  className?: string;
}

export function EmailDisplay({
  email,
  variant = "text",
  className,
}: EmailDisplayProps) {
  const [copied, setCopied] = React.useState(false);

  if (!email) {
    return <span className={className}>-</span>;
  }

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const Icon = copied ? Check : Copy;

  const innerContent = (
    <>
      <span className="truncate">{email}</span>
      <span
        className={cn(
          "ms-1.5 inline-flex items-center justify-center transition-all duration-200",
          copied
            ? "opacity-100 scale-110"
            : "opacity-0 group-hover:opacity-100",
        )}
      >
        <Icon
          className={cn(
            "h-3 w-3",
            copied
              ? "text-green-600 dark:text-green-500"
              : "text-muted-foreground",
          )}
        />
      </span>
    </>
  );

  if (variant === "badge") {
    return (
      <Badge
        variant="secondary"
        className={cn(
          "group cursor-pointer select-none gap-0 pr-1.5 hover:bg-secondary/80",
          className,
        )}
        onClick={handleCopy}
        title="לחץ להעתקה"
      >
        <Mail className="me-1.5 h-3 w-3 text-muted-foreground" />
        {innerContent}
      </Badge>
    );
  }

  return (
    <span
      className={cn(
        "group inline-flex max-w-full cursor-pointer items-center select-none transition-opacity hover:opacity-70 font-medium",
        className,
      )}
      onClick={handleCopy}
      title="לחץ להעתקה"
    >
      {innerContent}
    </span>
  );
}
