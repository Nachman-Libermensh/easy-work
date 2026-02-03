"use client";
import { Column } from "@tanstack/react-table";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronsUpDown,
  EyeOff,
  Filter,
  Funnel,
  FunnelX,
  Group,
  ListRestart,
  Ungroup,
  X,
} from "lucide-react";

import { cn } from "@/src/lib/utils";
import { Button } from "../../../button";
import { Popover, PopoverContent, PopoverTrigger } from "../../../popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../../../command";
import { Input } from "../../../input";
import { useState, useMemo } from "react";
import { columnTypes } from "../data-table.types";
import { Checkbox } from "../../../checkbox";
import { useLookup } from "@/src/lib/lookups/use-lookup";
import { LookupKey } from "@/src/lib/lookups";

interface DataTableColumnHeaderProps<
  TData,
  TValue,
> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const [isOpen, setIsOpen] = useState(false);

  // Determine sorting labels based on type
  const type: columnTypes = column.columnDef.meta?.type || "text";
  const lookupKey = (column.columnDef.meta as any)?.lookupKey as
    | LookupKey
    | undefined;

  // Use lookup hook if this is a lookup column
  const { getLabel: getLookupLabel, isLoading: isLookupLoading } = useLookup(
    lookupKey || ("currencies" as LookupKey), // Fallback to prevent hook errors
  );

  // Filter Logic helpers
  const uniqueValues = useMemo(() => {
    if (
      type === "number" ||
      type === "currency" ||
      type === "precent" ||
      type === "boolean" ||
      type === "boolean-badge" ||
      type === "boolean-icon"
    )
      return [];

    // For text types and lookup types, get unique values for the faceted filter
    const unique = new Set<string>();
    const faceted = column.getFacetedUniqueValues();
    for (const key of faceted.keys()) {
      if (key !== null && key !== undefined) unique.add(String(key));
    }
    return Array.from(unique).sort();
  }, [column, type]);

  const filterValue = column.getFilterValue() as string[] | undefined;

  // "All" is selected if filterValue is undefined (no filter active)
  const isAllSelected = !filterValue;

  // Helper to check if a specific value is selected
  const isSelected = (value: string) =>
    isAllSelected || filterValue?.includes(value);

  // Helper for "Select All" checkbox state
  const isAllCheckboxChecked =
    isAllSelected || filterValue?.length === uniqueValues.length;
  const isAllCheckboxIndeterminate =
    !isAllSelected &&
    filterValue &&
    filterValue.length > 0 &&
    filterValue.length < uniqueValues.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      column.setFilterValue(undefined); // Clear filter -> Select All
    } else {
      column.setFilterValue([]);
    }
  };

  const updateNumberFilter = (min: string, max: string) => {
    column.setFilterValue(min === "" && max === "" ? undefined : [min, max]);
  };

  // Helper to get display value (with lookup support)
  const getDisplayValue = (value: string) => {
    if (type === "lookup" && lookupKey && !isLookupLoading) {
      return getLookupLabel(value) || value;
    }
    return value;
  };

  const sortAscLabel =
    type === "number" || type === "currency" || type === "precent"
      ? "מהנמוך לגבוה"
      : type === "date" || type === "datetime" || type === "heb-date"
        ? "מהישן לחדש"
        : "א-ת";

  const sortDescLabel =
    type === "number" || type === "currency" || type === "precent"
      ? "מהגבוה לנמוך"
      : type === "date" || type === "datetime" || type === "heb-date"
        ? "מהחדש לישן"
        : "ת-א";

  if (!column.getCanSort() && !column.getCanFilter() && !column.getCanGroup()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            showTitleInTooltip={false}
            className="data-[state=open]:bg-accent -ml-3 h-8 w-full justify-start text-xs hover:bg-transparent"
            title={title}
          >
            <span>{title}</span>
            {column.getIsSorted() === "desc" ? (
              <ArrowDownIcon className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUpIcon className="ml-2 h-4 w-4" />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
            )}
            {column.getIsFiltered() && (
              <Filter className="ml-2 h-3.5 w-3.5 text-primary" />
            )}
            {column.getIsGrouped() && (
              <Group className="ml-2 h-3.5 w-3.5 text-primary" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-50 p-0" align="start">
          <div className="flex flex-col">
            {/* Sorting Section */}
            {column.getCanSort() && (
              <div className="p-2 pb-1">
                <div className="flex items-center justify-between mb-1 px-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    מיון
                  </span>
                  {column.getIsSorted() && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-muted-foreground hover:text-foreground"
                      onClick={() => column.clearSorting()}
                      title="נקה מיון"
                    >
                      <ListRestart className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-xs h-8 px-2"
                  onClick={() => column.toggleSorting(false)}
                >
                  <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                  {sortAscLabel}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-xs h-8 px-2"
                  onClick={() => column.toggleSorting(true)}
                >
                  <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                  {sortDescLabel}
                </Button>
              </div>
            )}

            <div className="bg-border h-px w-full" />

            {/* General Actions Section */}
            <div className="p-2 py-1">
              {/* Grouping */}
              {column.getCanGroup() && (
                <Button
                  variant="ghost"
                  className="w-full justify-start text-xs h-8 px-2"
                  onClick={() => column.toggleGrouping()}
                >
                  {column.getIsGrouped() ? (
                    <>
                      <Ungroup className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                      בטל קיבוץ
                    </>
                  ) : (
                    <>
                      <Group className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                      קבץ לפי עמודה זו
                    </>
                  )}
                </Button>
              )}

              {/* Hide Column */}
              <Button
                variant="ghost"
                className="w-full justify-start text-xs h-8 px-2"
                onClick={() => column.toggleVisibility(false)}
              >
                <EyeOff className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                הסתר עמודה
              </Button>
            </div>

            {/* Filtering Section */}
            {column.getCanFilter() && (
              <>
                <div className="bg-border h-px w-full" />
                <div className="p-2 pt-2">
                  <div className="flex items-center justify-between mb-2 px-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      סינון
                    </span>
                    {column.getIsFiltered() && (
                      <Button
                        variant="link"
                        size="icon-sm"
                        className="h-5 w-5 text-destructive hover:text-destructive "
                        onClick={() => column.setFilterValue(undefined)}
                        title="נקה סינון"
                      >
                        <FunnelX className="h-3.5 w-3.5 " />
                      </Button>
                    )}
                  </div>

                  {/* Number Range Filter */}
                  {(type === "number" ||
                    type === "currency" ||
                    type === "precent") && (
                    <div className="flex flex-col gap-2 px-2 pb-2">
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="מ-"
                          className="h-7 text-xs px-2"
                          type="number"
                          value={
                            (
                              column.getFilterValue() as [string, string]
                            )?.[0] ?? ""
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            const currentMax =
                              (
                                column.getFilterValue() as [string, string]
                              )?.[1] ?? "";
                            updateNumberFilter(val, currentMax);
                          }}
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input
                          placeholder="עד"
                          className="h-7 text-xs px-2"
                          type="number"
                          value={
                            (
                              column.getFilterValue() as [string, string]
                            )?.[1] ?? ""
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            const currentMin =
                              (
                                column.getFilterValue() as [string, string]
                              )?.[0] ?? "";
                            updateNumberFilter(currentMin, val);
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Boolean Filter */}
                  {(type === "boolean" ||
                    type === "boolean-badge" ||
                    type === "boolean-icon") && (
                    <div className="flex flex-col gap-1 px-2 pb-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`filter-true-${column.id}`}
                          checked={(
                            column.getFilterValue() as string[]
                          )?.includes("true")}
                          onCheckedChange={(checked) => {
                            const current =
                              (column.getFilterValue() as string[]) ?? [];
                            const next = checked
                              ? [...current, "true"]
                              : current.filter((v) => v !== "true");
                            column.setFilterValue(
                              next.length ? next : undefined,
                            );
                          }}
                        />
                        <label
                          htmlFor={`filter-true-${column.id}`}
                          className="text-xs cursor-pointer"
                        >
                          כן
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`filter-false-${column.id}`}
                          checked={(
                            column.getFilterValue() as string[]
                          )?.includes("false")}
                          onCheckedChange={(checked) => {
                            const current =
                              (column.getFilterValue() as string[]) ?? [];
                            const next = checked
                              ? [...current, "false"]
                              : current.filter((v) => v !== "false");
                            column.setFilterValue(
                              next.length ? next : undefined,
                            );
                          }}
                        />
                        <label
                          htmlFor={`filter-false-${column.id}`}
                          className="text-xs cursor-pointer"
                        >
                          לא
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Text/Lookup Faceted Filter */}
                  {uniqueValues.length > 0 && (
                    <Command className="border rounded-md">
                      <CommandInput
                        placeholder="חפש..."
                        className="h-8 text-xs"
                      />
                      <CommandList className="max-h-40 overflow-y-auto">
                        <CommandEmpty className="py-2 text-xs text-center">
                          אין תוצאות
                        </CommandEmpty>
                        <CommandGroup>
                          {/* Select All */}
                          <CommandItem
                            onSelect={() =>
                              handleSelectAll(!isAllCheckboxChecked)
                            }
                            className="gap-2"
                          >
                            <Checkbox
                              checked={
                                isAllCheckboxChecked ||
                                (isAllCheckboxIndeterminate
                                  ? "indeterminate"
                                  : false)
                              }
                              onCheckedChange={(val) => handleSelectAll(!!val)}
                              className="pointer-events-none"
                            />
                            <span>בחר הכל</span>
                          </CommandItem>
                          <CommandSeparator />

                          {uniqueValues.map((value) => {
                            const checked = isSelected(value);
                            const displayValue = getDisplayValue(value);

                            return (
                              <CommandItem
                                key={value}
                                onSelect={() => {
                                  let newSelected: string[];
                                  if (isAllSelected) {
                                    newSelected = uniqueValues.filter(
                                      (v) => v !== value,
                                    );
                                  } else {
                                    if (checked) {
                                      newSelected =
                                        filterValue?.filter(
                                          (v) => v !== value,
                                        ) || [];
                                    } else {
                                      newSelected = [
                                        ...(filterValue || []),
                                        value,
                                      ];
                                    }
                                  }

                                  column.setFilterValue(
                                    newSelected.length === uniqueValues.length
                                      ? undefined
                                      : newSelected,
                                  );
                                }}
                                className="gap-2"
                              >
                                <Checkbox
                                  checked={!!checked}
                                  className="pointer-events-none"
                                />
                                <span>{displayValue}</span>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  )}
                </div>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
