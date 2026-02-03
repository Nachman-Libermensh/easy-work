"use client";
import {
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableFooter,
} from "../../table";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  getGroupedRowModel,
  getFilteredRowModel,
  flexRender,
  getFacetedRowModel,
  getFacetedUniqueValues,
  OnChangeFn,
  VisibilityState,
  RowSelectionState,
  ExpandedState,
  ColumnFiltersState,
  SortingState,
} from "@tanstack/react-table";
import { DataTableProps } from "./data-table.types";
import useCreateColumns, {
  booleanFilter,
  multiSelectFilter,
  numberRangeFilter,
} from "./hooks/use-create-columns.hook";
import { useState, Fragment, useEffect, useMemo } from "react";
import { Button } from "../../button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "../../input-group";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardAction,
} from "../../card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../dropdown-menu";
import { AlertCircle, ChevronDown, FileX, Search, X } from "lucide-react";
import { DataTableHeaderActions } from "./components/data-table-header-actions";
import { cn } from "@/src/lib/utils";
import { Spinner } from "../../spinner";
import { Skeleton } from "../../skeleton";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../../empty";

const DataTable = ({
  data,
  columns,
  status = "success",
  isRefetching,
  title = "",
  storageKey,
  rowActions,
  rowActionsPosition = "left",
  rowActionVariant = "inline",
  headerActions,
  collapseComponent,
  openCollapseByDefault,
  disableCollapseFn,
  showSelectColumn = false,
  selectColumnPosition = "right",
  enableRowSelection,
  onSelectedChange,
  syncWithQueryParams = false,
  variant = "normal",
  showSearchInput = true,
  showPagination = true,
  showHeaderActions = true,
  rowClassNameFn,
  enableExpandAll = true,
}: DataTableProps) => {
  const mappedColumns = useCreateColumns({
    columns,
    showSelectColumn,
    selectColumnPosition,
    rowActions,
    rowActionsPosition,
    rowActionVariant,
    enableCollapsible: !!collapseComponent,
    enableExpandAll: enableExpandAll,
  });

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [grouping, setGrouping] = useState<string[]>([]);
  const [filters, setFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const table = useReactTable<any>({
    data: data || [],
    columns: mappedColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getRowCanExpand: (row) => !disableCollapseFn || !disableCollapseFn(row),
    enableFilters: true,
    enableColumnFilters: true,
    enableSorting: true,

    enableRowSelection:
      typeof enableRowSelection === "function" ? enableRowSelection : true,
    filterFns: {
      numberRange: numberRangeFilter,
      booleanCheck: booleanFilter,
      multiSelect: multiSelectFilter,
    },
    // Preventing state updates during render phase by disabling auto resets
    autoResetPageIndex: false,
    autoResetExpanded: false,
    state: {
      columnVisibility: columnVisibility,
      rowSelection: rowSelection,
      expanded: expanded,
      globalFilter: globalFilter,
      sorting: sorting,
      columnFilters: filters,
      grouping: grouping,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setFilters,
    onSortingChange: setSorting,
    onGroupingChange: setGrouping,
  });

  // בדיקה אם יש עמודות עם סיכום
  const hasSummaryColumns = useMemo(
    () => columns.some((col) => col.enableSummary === true),
    [columns]
  );

  return (
    <Card
      className={cn(
        "flex flex-col py-1 transition-all duration-200 gap-1",
        isFullscreen
          ? "fixed inset-0 z-50 h-screen max-h-screen w-screen rounded-none border-0"
          : "max-h-[calc(100vh-100px)]"
      )}
    >
      {(title || showHeaderActions || showSearchInput) && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CardTitle>{title}</CardTitle>
              {isRefetching && <Spinner className="text-muted-foreground" />}
            </div>
            {showSearchInput && (
              <InputGroup dir="rtl" className="h-8 w-37.5 lg:w-62.5">
                <InputGroupAddon align="inline-start">
                  <Search className="size-3.5 text-muted-foreground" />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder="חיפוש..."
                  value={globalFilter ?? ""}
                  onChange={(event) => setGlobalFilter(event.target.value)}
                  className="h-8 text-sm"
                />
                {globalFilter ? (
                  <InputGroupAddon align="inline-end" className="p-0">
                    <InputGroupButton
                      size="icon-xs"
                      onClick={() => setGlobalFilter("")}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3" />
                    </InputGroupButton>
                  </InputGroupAddon>
                ) : null}
              </InputGroup>
            )}
          </div>
          {showHeaderActions && (
            <div className="flex items-center gap-2">
              <CardAction>
                <DataTableHeaderActions
                  table={table}
                  actions={headerActions}
                  isFullscreen={isFullscreen}
                  onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
                />
              </CardAction>
            </div>
          )}
        </CardHeader>
      )}
      <CardContent className="flex-1 overflow-auto p-0 relative">
        <table className="w-full caption-top text-sm relative">
          <TableHeader className="sticky top-0  bg-card shadow-2xs">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className="bg-card"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {status === "pending" ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {table.getVisibleLeafColumns().map((column) => (
                    <TableCell key={column.id}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : status === "error" ? (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className="h-24 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-2 text-destructive">
                    <AlertCircle className="size-6" />
                    <span>שגיאה בטעינת הנתונים</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                    className={rowClassNameFn ? rowClassNameFn(row) : undefined}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const meta = cell.column.columnDef.meta as any;
                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            meta?.classNameFn ? meta.classNameFn(cell) : ""
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                  {row.getIsExpanded() && !row.getIsGrouped() && (
                    <TableRow className="relative">
                      <TableCell
                        colSpan={mappedColumns.length}
                        className="p-0.5 bg-transparent border-0"
                      >
                        <div className="sticky right-0 p-0.5 left-0 w-[calc(100vw-1.5rem)] max-w-full overflow-auto max-h-125">
                          {collapseComponent && collapseComponent(row)}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className="h-24 text-center"
                >
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <FileX />
                      </EmptyMedia>
                      <EmptyTitle>אין תוצאות</EmptyTitle>
                      <EmptyDescription>לא נמצאו נתונים להצגה</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {/* Add TableFooter Logic - only if there are summary columns */}
          {hasSummaryColumns &&
            table
              .getFooterGroups()
              .some((group) =>
                group.headers.some((header) => header.column.columnDef.footer)
              ) && (
              <TableFooter className="bg-muted/50 font-medium">
                {table.getFooterGroups().map((footerGroup) => (
                  <TableRow key={footerGroup.id}>
                    {footerGroup.headers.map((header) => (
                      <TableCell key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.footer,
                              header.getContext()
                            )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableFooter>
            )}
        </table>
      </CardContent>

      {showPagination && (
        <CardFooter className="flex items-center justify-between p-6 pt-0 pb-1">
          <div
            className="flex items-center gap-4 text-sm text-muted-foreground whitespace-nowrap"
            dir="rtl"
          >
            <div className="flex items-center gap-2">
              <span>שורות בעמוד:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    {table.getState().pagination.pageSize}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <DropdownMenuItem
                      key={pageSize}
                      onClick={() => table.setPageSize(pageSize)}
                    >
                      {pageSize}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="hidden sm:block">
              {table.getFilteredSelectedRowModel().rows.length} מתוך{" "}
              {table.getFilteredRowModel().rows.length} נבחרו
            </div>
          </div>

          <Pagination className="justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  dir="rtl"
                  title="הקודם"
                  onClick={() => table.previousPage()}
                  className={
                    !table.getCanPreviousPage()
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              {/* <PaginationItem> */}
              <span className="text-sm font-medium px-2">
                עמוד {table.getState().pagination.pageIndex + 1} מתוך{" "}
                {table.getPageCount()}
              </span>
              {/* </PaginationItem> */}
              <PaginationItem>
                <PaginationNext
                  dir="rtl"
                  title="הבא"
                  onClick={() => table.nextPage()}
                  aria-disabled={!table.getCanNextPage()}
                  className={
                    !table.getCanNextPage()
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      )}
    </Card>
  );
};

export default DataTable;
