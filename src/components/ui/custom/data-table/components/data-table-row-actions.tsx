import { Row } from "@tanstack/react-table";
import {
  MoreHorizontalIcon,
  Pencil,
  Trash2,
  Plus,
  Eye,
  Settings,
} from "lucide-react";

import { Button } from "../../../button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../dropdown-menu";
import { RowAction } from "../data-table.types";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  actions: RowAction[];
  variant?: "popover" | "inline";
}

const getDefaultIcon = (type: string) => {
  switch (type) {
    case "edit":
      return <Pencil className="h-4 w-4" />;
    case "delete":
      return <Trash2 className="h-4 w-4" />;
    case "add":
      return <Plus className="h-4 w-4" />;
    case "view":
      return <Eye className="h-4 w-4" />;
    default:
      return <Settings className="h-4 w-4" />;
  }
};
const getDefaultTitle = (type: string) => {
  switch (type) {
    case "edit":
      return "עריכה";
    case "delete":
      return "מחיקה";
    case "add":
      return "הוספה";
    case "view":
      return "צפייה";
    default:
      return "";
  }
};
export function DataTableRowActions<TData>({
  row,
  actions,
  variant = "popover",
}: DataTableRowActionsProps<TData>) {
  const visibleActions = actions.filter(
    (action) => !action.hiddenFn || !action.hiddenFn(row)
  );

  if (visibleActions.length === 0) return null;

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-2">
        {visibleActions.map((action, index) => {
          const isDisabled = action.disableFn ? action.disableFn(row) : false;
          const icon = action.icon || getDefaultIcon(action.type);
          const title =
            typeof action.title === "function"
              ? action.title(row)
              : action.title || getDefaultTitle(action.type);

          return (
            <Button
              key={index}
              variant={"ghost"}
              size="icon"
              onClick={() => action.onClick?.(row)}
              disabled={isDisabled}
              className={`h-8 w-8 ${
                action.type === "delete"
                  ? "text-destructive hover:text-destructive/70"
                  : ""
              }`}
              title={title}
            >
              {typeof icon === "function" ? icon(row) : icon}
              <span className="sr-only">{title}</span>
            </Button>
          );
        })}
      </div>
    );
  }

  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontalIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>פעולות</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {visibleActions.map((action, index) => {
          const isDisabled = action.disableFn ? action.disableFn(row) : false;
          const icon = action.icon || getDefaultIcon(action.type);
          const title =
            typeof action.title === "function"
              ? action.title(row)
              : action.title || getDefaultTitle(action.type);

          return (
            <DropdownMenuItem
              key={index}
              onClick={() => action.onClick?.(row)}
              disabled={isDisabled}
              className={`gap-2 justify-between ${
                action.type === "delete" ? "text-destructive" : ""
              }`}
            >
              <span>{title}</span>
              {typeof icon === "function" ? icon(row) : icon}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
