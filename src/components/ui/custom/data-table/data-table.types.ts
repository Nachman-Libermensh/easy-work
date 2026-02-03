import { LookupKey } from "@/src/lib/lookups";
import { type QueryStatus } from "@tanstack/react-query";
import {
  Cell,
  CellContext,
  ColumnDefTemplate,
  FilterFn,
  type Row,
  type Table,
} from "@tanstack/react-table";
import { type ReactNode } from "react";

// Extend FilterFns to include custom filters
declare module "@tanstack/react-table" {
  interface FilterFns {
    numberRange: FilterFn<unknown>;
    booleanCheck: FilterFn<unknown>;
    multiSelect: FilterFn<unknown>;
  }
}

export type DataTableProps = {
  data: any[] | undefined;
  columns: ColumnConfig[];
  status: QueryStatus;
  isRefetching?: boolean;
  title: ReactNode;
  storageKey?: string;

  rowActions?: RowAction[];
  rowActionsPosition?: "right" | "left";
  rowActionVariant?: "popover" | "inline";

  headerActions?: HeaderAction[];

  collapseComponent?: (row: Row<any>) => ReactNode;
  openCollapseByDefault?: boolean | ((row: Row<any>) => boolean);
  disableCollapseFn?: (row: Row<any>) => boolean;
  enableExpandAll?: boolean;

  showSelectColumn?: boolean;
  selectColumnPosition?: "right" | "left";
  enableRowSelection?: (row: Row<any>) => boolean;
  onSelectedChange?: (table: Table<any>) => void;

  syncWithQueryParams?: boolean;
  variant?: "normal" | "minimal";

  showSearchInput?: boolean;
  showPagination?: boolean;
  showHeaderActions?: boolean;

  rowClassNameFn?: (row: Row<any>) => string;
};

export type ColumnConfig = {
  type: columnTypes;
  header: string;
  accessorKey: string;
  id?: string;
  cell?: ColumnDefTemplate<CellContext<any, any>>;

  size?: number;
  maxSize?: number;
  minSize?: number;
  enableSorting?: boolean;
  enableHiding?: boolean;
  enableFiltering?: boolean;
  filterFn?: string;
  enableSummary?: boolean;
  enableGrouping?: boolean; // New property
  meta?: ColumnsMetaOptions;
  classNameFn?: (value: Cell<any, any>) => string;
};
export type ColumnsMetaOptions = {
  lookupKey?: LookupKey; // Added for lookup columns
  lookupVariant?: "text" | "badge"; // How to display lookup values
  lookupBadgeVariant?: "default" | "secondary" | "destructive" | "outline";
  sticky?: "right" | "left";
  type?: columnTypes;
  title?: string;
  classNameFn?: (value: Cell<any, any>) => string;
  numberOptions?: {
    format?: "currency" | "percent" | "number";
    currency?: string;
    decimals?: number;
    prefix?: string;
    suffix?: string;
    colorize?: boolean;
  };
  //   options
};
export type columnTypes =
  | "text"
  | "text-long"
  | "text-copy"
  | "lookup"
  | "lookup-multi"
  | "boolean"
  | "boolean-badge"
  | "boolean-icon"
  | "options"
  | "number"
  | "currency"
  | "precent"
  | "date"
  | "datetime"
  | "heb-date"
  | "heb-datetime"
  | "user-avatar"
  | "status"
  | "live-status"
  | "custom";

interface Action {
  type:
    | "edit"
    | "delete"
    | "add"
    | "view"
    | "custom"
    | "export"
    | "fullscreen"
    | "reset"
    | "columns";
  isDeleteConfirm?: boolean;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
}

export interface RowAction extends Action {
  title?: string | ((row: Row<any>) => string);
  icon?: ReactNode | ((row: Row<any>) => ReactNode);
  label?: string | ((row: Row<any>) => string);
  onClick?: (row: Row<any>) => void;
  disableFn?: (row: Row<any>) => boolean;
  hiddenFn?: (row: Row<any>) => boolean;
}

export interface HeaderAction extends Action {
  component?: ReactNode;
  title?: string;
  icon: ReactNode | ((table: Table<any>) => ReactNode);
  onClick?: (table: Table<any>) => void;
  disableFn?: (table: Table<any>) => boolean;
  hiddenFn?: (table: Table<any>) => boolean;
}
