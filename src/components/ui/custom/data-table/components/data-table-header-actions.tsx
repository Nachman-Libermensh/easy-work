import { Table, ColumnMeta } from "@tanstack/react-table";
import {
  Download,
  Maximize2,
  Minimize2,
  FunnelX,
  Settings2,
} from "lucide-react";
import { Button } from "../../../button";
import { HeaderAction, columnTypes } from "../data-table.types";
import { useExportToExcel } from "../hooks/use-export-to-excel.hook";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    type?: columnTypes;
  }
}
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../dropdown-menu";

interface DataTableHeaderActionsProps<TData> {
  table: Table<TData>;
  actions?: HeaderAction[];
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export function DataTableHeaderActions<TData>({
  table,
  actions = [],
  isFullscreen,
  onToggleFullscreen,
}: DataTableHeaderActionsProps<TData>) {
  const { exportToExcel } = useExportToExcel(table, "נתונים");

  // Default actions configuration
  const defaultActions: HeaderAction[] = [
    {
      type: "fullscreen",
      title: isFullscreen ? "יציאה ממסך מלא" : "מסך מלא",
      icon: isFullscreen ? (
        <Minimize2 className="h-4 w-4" />
      ) : (
        <Maximize2 className="h-4 w-4" />
      ),
      onClick: onToggleFullscreen,
      variant: "outline",
    },
    {
      type: "export",
      title: "ייצוא לאקסל",
      icon: <Download className="h-4 w-4" />,
      onClick: () => exportToExcel(),
      variant: "outline",
    },
    {
      type: "reset",
      title: "איפוס מסננים",
      icon: <FunnelX className="h-4 w-4" />,
      onClick: (table) => {
        table.resetColumnFilters();
        table.resetSorting();
        table.resetGlobalFilter();
      },
      variant: "outline",
      disableFn: (table) => {
        const hasColumnFilters = table.getState().columnFilters.length > 0;
        const hasGlobalFilter = !!table.getState().globalFilter;
        const hasSorting = table.getState().sorting.length > 0;
        return !hasColumnFilters && !hasGlobalFilter && !hasSorting;
      },
    },
    {
      type: "columns",
      title: "עמודות",
      icon: <Settings2 className="h-4 w-4" />,
      variant: "outline",
    },
  ];

  // Merge user actions with defaults
  // 1. Identify which defaults are overridden or disabled (if hiddenFn returns true)
  // 2. Add custom actions

  // We'll start with user actions that are NOT overrides of defaults (custom ones)
  const customActions = actions.filter(
    (a) => !["fullscreen", "export", "reset", "columns"].includes(a.type)
  );

  // Then map defaults, checking if there's an override in props
  const mergedDefaults = defaultActions.map((defaultAction) => {
    const override = actions.find((a) => a.type === defaultAction.type);
    if (override) {
      return { ...defaultAction, ...override };
    }
    return defaultAction;
  });

  // Combine: Custom actions first, then the standard tools
  const finalActions = [...customActions, ...mergedDefaults];

  const visibleActions = finalActions.filter(
    (action) => !action.hiddenFn || !action.hiddenFn(table)
  );

  return (
    <div className="flex items-center gap-2">
      {visibleActions.map((action, index) => {
        const isDisabled = action.disableFn ? action.disableFn(table) : false;
        // title תמיד יהיה string ב-HeaderAction
        const title = typeof action.title === "string" ? action.title : "";
        const icon =
          typeof action.icon === "function" ? action.icon(table) : action.icon;

        if (action.type === "columns") {
          return (
            <DropdownMenu key={action.type} dir="rtl">
              <DropdownMenuTrigger asChild>
                <Button
                  variant={action.variant || "default"}
                  size="icon"
                  className="h-8 w-8"
                  disabled={isDisabled}
                  title={title}
                >
                  {icon}
                  <span className="sr-only">{title}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-75">
                <div className="flex items-center justify-between px-2">
                  <DropdownMenuLabel>הצגת עמודות</DropdownMenuLabel>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto px-2 py-1 text-xs"
                    onClick={() => table.toggleAllColumnsVisible(true)}
                  >
                    אפס
                  </Button>
                </div>
                <DropdownMenuSeparator />
                <div className="grid grid-cols-2 gap-1 max-h-[300px] overflow-y-auto p-1">
                  {table
                    .getAllLeafColumns()
                    .filter(
                      (column) =>
                        typeof column.accessorFn !== "undefined" &&
                        column.getCanHide()
                    )
                    .map((column) => {
                      const title =
                        (column.columnDef.meta as any)?.title || column.id;
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          <span className="truncate" title={String(title)}>
                            {String(title)}
                          </span>
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }

        // For custom actions with component
        if (action.component) {
          return <div key={index}>{action.component}</div>;
        }

        return (
          <Button
            key={index}
            variant={action.variant || "default"}
            size="icon"
            className="h-8 w-8"
            onClick={() => action.onClick?.(table)}
            disabled={isDisabled}
            title={title}
          >
            {icon}
            <span className="sr-only">{title}</span>
          </Button>
        );
      })}
    </div>
  );
}
