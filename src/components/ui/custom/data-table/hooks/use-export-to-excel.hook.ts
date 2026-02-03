import { Table } from "@tanstack/react-table";
import XLSX from "xlsx-js-style";
import { columnTypes } from "../data-table.types";
import { formatHebrewDate, formatTime } from "@/src/lib/date-utils";
import { lookupRegistry, LookupKey } from "@/src/lib/lookups";

// Cache for lookup data to avoid multiple fetches
const lookupCache = new Map<LookupKey, Map<string, string>>();

const initializeLookupCache = async (lookupKey: LookupKey) => {
  if (lookupCache.has(lookupKey)) {
    return lookupCache.get(lookupKey)!;
  }

  const config = lookupRegistry[lookupKey];
  const data = await config.queryFn();

  const map = new Map<string, string>();
  data.forEach((item) => {
    const id = String(config.getId(item));
    const label = config.getLabel(item);
    map.set(id, label);
  });

  lookupCache.set(lookupKey, map);
  return map;
};

const formatValueForExport = async (
  value: any,
  type?: columnTypes,
  lookupKey?: LookupKey,
) => {
  if (value === null || value === undefined) return "";

  switch (type) {
    case "lookup":
      if (!lookupKey) return String(value);
      const lookupMap = await initializeLookupCache(lookupKey);
      return lookupMap.get(String(value)) || String(value);
    case "date":
      return new Date(value).toLocaleDateString("he-IL");
    case "datetime":
      return new Date(value).toLocaleString("he-IL");
    case "heb-date":
      return formatHebrewDate(value);
    case "heb-datetime":
      return `${formatHebrewDate(value)} ${formatTime(value)}`;
    case "currency":
    case "number":
      return Number(value);
    case "precent":
      return Number(value) / 100;
    case "boolean":
    case "boolean-badge":
    case "boolean-icon":
      return value ? "כן" : "לא";
    default:
      return String(value);
  }
};

const getExcelFormat = (type?: columnTypes) => {
  switch (type) {
    case "currency":
      return "#,##0.00 ₪";
    case "precent":
      return "0.00%";
    case "number":
      return "#,##0";
    default:
      return undefined;
  }
};

export const useExportToExcel = <TData>(
  table: Table<TData>,
  filename: string = "export",
) => {
  const exportToExcel = async () => {
    const rows = table.getFilteredRowModel().rows;
    const columns = table
      .getAllLeafColumns()
      .filter(
        (col) =>
          col.id !== "select" && col.id !== "actions" && col.id !== "collapse",
      );

    // Helper to extract title safely from meta, falling back to id
    const getColumnTitle = (col: any) => {
      return (col.columnDef.meta as any)?.title || col.id;
    };

    // Headers
    const headers = columns.map(getColumnTitle);

    // Pre-initialize all lookup caches
    const lookupColumns = columns.filter(
      (col) => col.columnDef.meta?.type === "lookup",
    );
    await Promise.all(
      lookupColumns.map((col) => {
        const lookupKey = (col.columnDef.meta as any)?.lookupKey as
          | LookupKey
          | undefined;

        return lookupKey ? initializeLookupCache(lookupKey) : Promise.resolve();
      }),
    );

    // Data - now async to handle lookups
    const data = await Promise.all(
      rows.map(async (row) => {
        return await Promise.all(
          columns.map(async (col) => {
            const value = row.getValue(col.id);
            const type = col.columnDef.meta?.type as columnTypes | undefined;
            const lookupKey = (col.columnDef.meta as any)?.lookupKey as
              | LookupKey
              | undefined;

            const formattedValue = await formatValueForExport(
              value,
              type,
              lookupKey,
            );

            return {
              v: formattedValue,
              t:
                type === "number" || type === "currency" || type === "precent"
                  ? "n"
                  : "s",
              z: getExcelFormat(type),
            };
          }),
        );
      }),
    );

    // Create Sheet
    const ws = XLSX.utils.aoa_to_sheet([headers]);

    // Add data
    data.forEach((row, rIndex) => {
      row.forEach((cell, cIndex) => {
        const cellRef = XLSX.utils.encode_cell({ r: rIndex + 1, c: cIndex });
        ws[cellRef] = cell;
      });
    });

    // Update Range
    if (data.length > 0) {
      ws["!ref"] = XLSX.utils.encode_range({
        s: { r: 0, c: 0 },
        e: { r: data.length, c: columns.length - 1 },
      });
    }

    // Styles
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "36454F" } }, // Dark Slate Gray
      alignment: { horizontal: "center", vertical: "center", readingOrder: 2 },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      },
    };

    const bodyStyle = {
      alignment: {
        vertical: "center",
        wrapText: true,
        horizontal: "right",
        readingOrder: 2,
      },
      border: {
        top: { style: "thin", color: { rgb: "CCCCCC" } },
        bottom: { style: "thin", color: { rgb: "CCCCCC" } },
        left: { style: "thin", color: { rgb: "CCCCCC" } },
        right: { style: "thin", color: { rgb: "CCCCCC" } },
      },
    };

    // Apply Header Styles
    for (let c = 0; c < columns.length; c++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: c });
      if (!ws[cellRef]) continue;
      ws[cellRef].s = headerStyle;
    }

    // Apply Body Styles
    for (let r = 0; r < data.length; r++) {
      for (let c = 0; c < columns.length; c++) {
        const cellRef = XLSX.utils.encode_cell({ r: r + 1, c: c });
        if (!ws[cellRef]) continue;

        const type = columns[c].columnDef.meta?.type as columnTypes | undefined;
        const isNumber =
          type === "number" || type === "currency" || type === "precent";

        ws[cellRef].s = {
          ...bodyStyle,
          alignment: {
            ...bodyStyle.alignment,
            horizontal: isNumber ? "center" : "right",
          },
        };
      }
    }

    // Column Widths
    const colWidths = columns.map((col, i) => {
      const headerTitle = getColumnTitle(col);
      const headerLen = String(headerTitle).length;

      const sampleData = data.slice(0, 10);
      const maxDataLen = Math.max(
        ...sampleData.map((row) => String(row[i]?.v || "").length),
        0,
      );
      return { wch: Math.max(headerLen, maxDataLen) + 10 };
    });
    ws["!cols"] = colWidths;

    // RTL View
    ws["!views"] = [{ rightToLeft: true }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  return { exportToExcel };
};
