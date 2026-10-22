import type { ReactNode } from "react";
import type { Column } from "../components/ui/DataTable";
import { StatusBadge } from "../components/ui/StatusBadge";
import type { StatusVariant } from "../components/ui/StatusBadge";
import type { ResourceRow } from "../components/resource/types";
import {
  getField,
  formatDate,
  displayValue,
} from "../components/resource/helpers";

export function formatCell(value: unknown): ReactNode {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string" || typeof value === "number")
    return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    if (typeof value[0] === "object")
      return `${value.length} item${value.length === 1 ? "" : "s"}`;
    return value.join(", ");
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const name = record.name ?? record.key ?? record.label ?? record.email;
    if (name !== undefined) return String(name);
    const keys = Object.keys(record);
    return keys.length === 0 ? "—" : `{${keys.length} props}`;
  }
  return String(value);
}

export interface TextColOptions {
  className?: string;
  sortable?: boolean;
  truncate?: number;
  headerClassName?: string;
}

export function textCol(
  key: string,
  header: string,
  opts: TextColOptions = {},
): Column<ResourceRow> {
  const value = opts.truncate
    ? (row: ResourceRow) => {
        const text = displayValue(getField(row, key));
        return text.length > opts.truncate!
          ? `${text.slice(0, opts.truncate! - 1)}…`
          : text;
      }
    : (row: ResourceRow) => formatCell(getField(row, key));
  return {
    key,
    header,
    className: opts.className,
    headerClassName: opts.headerClassName,
    sortable: opts.sortable ?? true,
    render: value,
  };
}

export function dateCol(
  key: string,
  header: string,
  opts: TextColOptions = {},
): Column<ResourceRow> {
  return {
    key,
    header,
    className: opts.className,
    headerClassName: opts.headerClassName,
    sortable: opts.sortable ?? true,
    render: (row) => <>{formatDate(getField(row, key))}</>,
  };
}

export function statusCol(
  key: string,
  header: string,
  variant?: (row: ResourceRow) => StatusVariant,
  opts: TextColOptions = {},
): Column<ResourceRow> {
  return {
    key,
    header,
    className: opts.className,
    headerClassName: opts.headerClassName,
    sortable: opts.sortable ?? true,
    render: (row) => {
      const raw = getField(row, key);
      const status =
        raw && typeof raw === "object"
          ? String((raw as { name?: unknown }).name ?? "")
          : String(raw ?? "");
      return (
        <StatusBadge
          status={status || "—"}
          variant={variant ? variant(row) : "default"}
        />
      );
    },
  };
}

export type { ResourceRow };
