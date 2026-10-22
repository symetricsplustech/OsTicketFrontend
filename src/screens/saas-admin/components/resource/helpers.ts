import type { ResourceRow } from "./types";

export function extractRows(payload: unknown): ResourceRow[] {
  if (Array.isArray(payload)) return payload as ResourceRow[];
  if (!payload || typeof payload !== "object") return [];
  const data = (payload as { data?: unknown }).data;
  if (Array.isArray(data)) return data as ResourceRow[];
  if (data && typeof data === "object") {
    const items =
      (data as { items?: unknown; results?: unknown }).items ??
      (data as { results?: unknown }).results;
    if (Array.isArray(items)) return items as ResourceRow[];
  }
  return [];
}

/**
 * Reads a total record count from a paginated API payload. Supports the common
 * shapes used across the API surface: `total`, `count`, `meta.total`,
 * `pagination.total` and `totalCount`.
 */
export function extractTotal(payload: unknown): number | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const record = payload as Record<string, unknown>;
  const candidates: unknown[] = [
    record.total,
    record.count,
    record.totalCount,
    (record.meta as Record<string, unknown> | undefined)?.total,
    (record.pagination as Record<string, unknown> | undefined)?.total,
    (record.data as Record<string, unknown> | undefined)?.total,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === "number" && Number.isFinite(candidate))
      return candidate;
  }
  return undefined;
}

export function extractValue(payload: unknown): unknown {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in (payload as Record<string, unknown>)
  ) {
    return (payload as { data: unknown }).data;
  }
  return payload;
}

/**
 * Drills through nested `data` envelopes (RTK Query result → API `{ success,
 * data }` envelope → payload) to reach the innermost object, so callers can read
 * fields like `secret` regardless of how many wrappers the trigger returned.
 */
export function mutationBody(result: unknown): ResourceRow {
  let current: unknown = result;
  for (let depth = 0; depth < 4; depth += 1) {
    if (
      current &&
      typeof current === "object" &&
      "data" in (current as Record<string, unknown>)
    ) {
      const next = (current as { data: unknown }).data;
      if (next && typeof next === "object") {
        current = next;
        continue;
      }
    }
    break;
  }
  return current && typeof current === "object" ? (current as ResourceRow) : {};
}

export function rowText(row: ResourceRow): string {
  return JSON.stringify(row) ?? "";
}

export function getField(row: ResourceRow, key: string): unknown {
  if (!key) return undefined;
  const parts = key.split(".");
  let value: unknown = row;
  for (const part of parts) {
    if (value === null || value === undefined) return undefined;
    value = (value as Record<string, unknown>)[part];
  }
  return value;
}

export function formatValue(row: ResourceRow, key: string): string {
  const value = getField(row, key);
  return displayValue(value);
}

export function displayValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value || "—";
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    if (typeof value[0] === "object")
      return `${value.length} item${value.length === 1 ? "" : "s"}`;
    return value.join(", ");
  }
  if (typeof value === "object") {
    const count = Object.keys(value).length;
    return count === 0 ? "—" : `{${count} props}`;
  }
  return String(value);
}

export function truncate(value: unknown, max = 60): string {
  const text = displayValue(value);
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export function comparable(value: unknown): string | number {
  if (typeof value === "number") return value;
  if (value && typeof value === "object") {
    const name =
      (value as { name?: unknown; key?: unknown; label?: unknown }).name ??
      (value as { key?: unknown }).key ??
      (value as { label?: unknown }).label;
    if (name !== undefined) return String(name);
    return "";
  }
  return String(value ?? "");
}

export function formatDate(value: unknown): string {
  if (value === null || value === undefined) return "—";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

export function matchFilter(
  row: ResourceRow,
  key: string,
  kind: "select" | "boolean" | "date" | "text",
  expected: string | number | boolean,
): boolean {
  const actual = getField(row, key);
  if (expected === "" || expected === undefined) return true;
  if (kind === "boolean") return Boolean(actual) === Boolean(expected);
  return comparable(actual)
    .toString()
    .toLowerCase()
    .includes(String(expected).toLowerCase());
}

export function emailTemplateVariant(status: string | undefined) {
  const s = String(status ?? "").toLowerCase();
  if (s === "draft") return "draft" as const;
  if (s === "enabled" || s === "active") return "active" as const;
  if (s === "disabled" || s === "retired") return "disabled" as const;
  return "default" as const;
}
