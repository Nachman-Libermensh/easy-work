import { useMemo } from "react";
import { ColumnDef, FilterFn } from "@tanstack/react-table";
import { ColumnConfig, RowAction, columnTypes } from "../data-table.types";
import { Checkbox } from "../../../checkbox";
import { Button } from "../../../button";
import {
  ChevronDown,
  ChevronLeft,
  ChevronsDown,
  ChevronsLeft,
  Calendar,
  Clock,
} from "lucide-react";
import { DataTableRowActions } from "../components/data-table-row-actions";
import { DataTableColumnHeader } from "../components/data-table-column-header";
import { NumberDisplay } from "../../number-display";
import { BooleanDisplay } from "../../boolean-display";
import { formatDate, formatTime, formatHebrewDate } from "@/src/lib/date-utils";
import { flexRender } from "@tanstack/react-table";
import { LookupDisplay } from "@/src/lib/lookups/lookup-display";

type useCreateColumnsProps = {
  columns: ColumnConfig[];
  showSelectColumn: boolean;
  selectColumnPosition: "right" | "left";
  rowActions?: RowAction[];
  rowActionsPosition?: "right" | "left";
  rowActionVariant?: "popover" | "inline";
  enableCollapsible?: boolean;
  enableExpandAll?: boolean;
};

// --- Custom Filter Functions ---
export const numberRangeFilter: FilterFn<any> = (row, columnId, value) => {
  const rowValue = Number(row.getValue(columnId));
  const [min, max] = value || ["", ""];
  if (
    (min !== "" && rowValue < Number(min)) ||
    (max !== "" && rowValue > Number(max))
  ) {
    return false;
  }
  return true;
};
numberRangeFilter.autoRemove = (val: any) =>
  !val || (val[0] === "" && val[1] === "");

export const booleanFilter: FilterFn<any> = (row, columnId, value) => {
  if (!value || !value.length) return true;
  const rowValue = String(!!row.getValue(columnId));
  return value.includes(rowValue);
};
booleanFilter.autoRemove = (val: any) => !val || !val.length;

export const multiSelectFilter: FilterFn<any> = (row, columnId, value) => {
  // If undefined or null, it means no filter is active -> Show All
  if (value === undefined || value === null) return true;
  // If it's an array and empty, it means user actively deselected everything -> Show None
  if (Array.isArray(value) && value.length === 0) return false;

  return value.includes(String(row.getValue(columnId)));
};
// Prevent auto-removing empty arrays, so we can support "Deselect All" state
multiSelectFilter.autoRemove = (val: any) => val === undefined || val === null;
// -------------------------------

// פונקציית עזר לפרמוט לפי סוג
const renderCellByType = (type: columnTypes, value: any, meta?: any) => {
  if (value === null || value === undefined) return "-";

  switch (type) {
    case "lookup":
      if (!meta?.lookupKey) {
        console.warn("Lookup column missing lookupKey in meta");
        return String(value);
      }
      return (
        <LookupDisplay
          lookup={meta.lookupKey}
          value={value}
          variant={meta.lookupVariant || "text"}
          badgeVariant={meta.lookupBadgeVariant}
        />
      );
    case "date":
      return formatDate(value);
    case "datetime":
      return (
        <div className="flex flex-col text-xs gap-0.5">
          <div className="flex items-center gap-1.5 direction-ltr">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span dir="ltr">{formatDate(value)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span dir="ltr">{formatTime(value)}</span>
          </div>
        </div>
      );
    case "heb-date":
      return formatHebrewDate(value);
    case "heb-datetime":
      return (
        <div className="flex flex-col text-xs gap-0.5">
          <div className="flex items-center gap-1.5 direction-ltr">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span dir="rtl">{formatHebrewDate(value)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span dir="ltr">{formatTime(value)}</span>
          </div>
        </div>
      );
    case "currency":
      return (
        <NumberDisplay
          value={value}
          format="currency"
          colorize={meta?.numberOptions?.colorize ?? true}
          currency={meta?.numberOptions?.currency}
          decimals={meta?.numberOptions?.decimals}
        />
      );
    case "number":
      return (
        <NumberDisplay
          value={value}
          format="number"
          colorize={meta?.numberOptions?.colorize ?? false}
          decimals={meta?.numberOptions?.decimals}
          prefix={meta?.numberOptions?.prefix}
          suffix={meta?.numberOptions?.suffix}
        />
      );
    case "precent":
      return (
        <NumberDisplay
          value={value}
          format="percent"
          colorize={meta?.numberOptions?.colorize ?? true}
          decimals={meta?.numberOptions?.decimals}
        />
      );
    case "boolean":
      return <BooleanDisplay value={value} variant="text" />;
    case "boolean-badge":
      return <BooleanDisplay value={value} variant="badge" />;
    case "boolean-icon":
      return <BooleanDisplay value={value} variant="icon" />;
    case "text":
    default:
      return String(value);
  }
};

const useCreateColumns = ({
  columns,
  showSelectColumn,
  selectColumnPosition,
  rowActions,
  rowActionsPosition,
  rowActionVariant,
  enableCollapsible,
  enableExpandAll,
}: useCreateColumnsProps): ColumnDef<any>[] => {
  const tableColumns = useMemo(() => {
    const generatedColumns: ColumnDef<any>[] = columns.map((col) => {
      // יצירת ColumnDef בסיסי
      const columnDef: ColumnDef<any> = {
        accessorKey: col.accessorKey as keyof any,
        id: col.id || col.accessorKey,
        enableColumnFilter: col.enableFiltering ?? true,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={col.header} />
        ),
        footer: ({ table }) => {
          if (!col.enableSummary) return null;

          // Calculate total from filtered rows
          const rows = table.getFilteredRowModel().rows;
          const total = rows.reduce((sum, row) => {
            const val = row.getValue(col.id || col.accessorKey);
            const num = Number(val);
            return sum + (isNaN(num) ? 0 : num);
          }, 0);

          // Render based on type
          if (col.type === "currency") {
            return (
              <NumberDisplay
                value={total}
                format="currency"
                colorize={col.meta?.numberOptions?.colorize ?? true}
                currency={col.meta?.numberOptions?.currency}
                decimals={col.meta?.numberOptions?.decimals}
                className="font-bold"
              />
            );
          }
          if (col.type === "precent") {
            return (
              <NumberDisplay
                value={total}
                format="number"
                decimals={2}
                className="font-bold"
              />
            );
          }

          return (
            <NumberDisplay
              value={total}
              format="number"
              decimals={col.meta?.numberOptions?.decimals}
              className="font-bold"
            />
          );
        },
        enableSorting: col.enableSorting ?? true,
        enableHiding: col.enableHiding ?? true,
        enableGrouping: col.enableGrouping ?? true, // Default to true
        meta: {
          ...col.meta,
          type: col.type,
          title: col.header,
          classNameFn: col.classNameFn,
        } as any,
        size: col.size,
        maxSize: col.maxSize,
        minSize: col.minSize,
      };

      // קביעת ה-Cell Renderer
      if (col.cell) {
        // אם המשתמש סיפק cell ספציפי, נשתמש בו
        columnDef.cell = col.cell;
      } else {
        // אחרת, נשתמש בברירת המחדל לפי ה-Type
        columnDef.cell = ({ getValue, column }) => {
          const value = getValue();
          return renderCellByType(col.type, value, column.columnDef.meta);
        };
      }

      // הגדרות ספציפיות לסינון לפי סוג
      if (col.filterFn) {
        columnDef.filterFn = col.filterFn as any;
      } else if (
        col.type === "number" ||
        col.type === "currency" ||
        col.type === "precent"
      ) {
        columnDef.filterFn = "numberRange";
      } else if (
        col.type === "boolean" ||
        col.type === "boolean-badge" ||
        col.type === "boolean-icon"
      ) {
        columnDef.filterFn = "booleanCheck";
      } else {
        // Default faceted filter for text/others (array of selected values)
        columnDef.filterFn = "multiSelect";
      }

      return columnDef;
    });

    // הוספת עמודת בחירה (Select)
    if (showSelectColumn) {
      const selectCol: ColumnDef<any> = {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
            className="translate-y-0.5"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-0.5"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      };

      if (selectColumnPosition === "left") {
        generatedColumns.push(selectCol);
      } else {
        generatedColumns.unshift(selectCol);
      }
    }

    // הוספת עמודת הרחבה (Collapsible)
    if (enableCollapsible) {
      const collapseCol: ColumnDef<any> = {
        id: "collapse",
        header: ({ table }) =>
          enableExpandAll ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={table.getToggleAllRowsExpandedHandler()}
              className="h-8 w-8 p-0"
              title={table.getIsAllRowsExpanded() ? "כווץ הכל" : "הרחב הכל"}
            >
              {table.getIsAllRowsExpanded() ? (
                <ChevronsDown className="h-2.5 w-2.5" />
              ) : (
                <ChevronsLeft className="h-2.5 w-2.5" />
              )}
            </Button>
          ) : (
            ""
          ),
        cell: ({ row }) => {
          if (row.getIsGrouped()) {
            return (
              <Button
                variant="ghost"
                size="icon"
                onClick={row.getToggleExpandedHandler()}
                className="h-8 w-8 p-0 font-bold"
              >
                {row.getIsExpanded() ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            );
          }

          return row.getCanExpand() ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={row.getToggleExpandedHandler()}
              className="h-8 w-8 p-0"
            >
              {row.getIsExpanded() ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          ) : null;
        },
        size: 40,
        enableSorting: false,
        enableHiding: false,
        enableGrouping: false,
      };
      generatedColumns.unshift(collapseCol);
    }

    // לוגיקה ל-Row Actions
    if (rowActions && rowActions.length > 0) {
      const actionsCol: ColumnDef<any> = {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <DataTableRowActions
            row={row}
            actions={rowActions}
            variant={rowActionVariant}
          />
        ),
        size: 100,
        enableGrouping: false,
      };

      if (rowActionsPosition === "left") {
        generatedColumns.push(actionsCol);
      } else {
        generatedColumns.unshift(actionsCol);
      }
    }
    // console.log(generatedColumns);

    return generatedColumns;
  }, [
    columns,
    showSelectColumn,
    selectColumnPosition,
    rowActions,
    rowActionsPosition,
    rowActionVariant,
    enableCollapsible,
    enableExpandAll,
  ]);

  return tableColumns;
};

export default useCreateColumns;
