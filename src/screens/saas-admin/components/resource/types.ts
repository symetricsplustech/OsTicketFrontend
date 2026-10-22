import type { ReactNode } from "react";
import type { Column } from "../ui/DataTable";
import type { FilterConfig } from "../ui/SearchFilters";
import type { StatusVariant } from "../ui/StatusBadge";
import type { StatCardProps } from "../ui/StatCard";

export type ResourceRow = Record<string, unknown>;

export interface ResourceQueryResult {
  data?: unknown;
  isLoading?: boolean;
  isFetching?: boolean;
  error?: unknown;
  refetch?: () => void;
}

export type ResourceMutationResult = [
  trigger: (body?: unknown) => Promise<unknown>,
  result?: { isLoading?: boolean; error?: unknown; status?: string },
];

export interface ResourceListState {
  search: string;
  filters: Record<string, string | number | boolean>;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder: "asc" | "desc";
}

export type ResourceDataSource =
  | {
      kind: "api";
      useList: (args: unknown) => ResourceQueryResult;
      buildParams?: (state: ResourceListState) => unknown;
      extractRows?: (payload: unknown) => ResourceRow[];
      /**
       * When true the API performs filtering, sorting and pagination. The
       * screen then renders the returned page as-is and reads the total record
       * count from the payload instead of slicing client-side.
       */
      serverPagination?: boolean;
      /** Override how the total record count is read from the payload. */
      extractTotal?: (payload: unknown) => number | undefined;
    }
  | {
      kind: "static";
      rows: ResourceRow[];
    };

export type FieldType =
  "text" | "textarea" | "number" | "select" | "boolean" | "password";

export interface FormField {
  key: string;
  label: string;
  type: FieldType;
  options?: { value: string | number; label: string }[];
  /**
   * Reusable dynamic option source for `select` fields. Rendered by a
   * dedicated component so hook rules are respected (e.g. `tenants` loads the
   * tenant list through the shared RTK Query hook).
   */
  optionsSource?: "tenants";
  placeholder?: string;
  required?: boolean;
  help?: string;
  readOnly?: boolean;
}

export type ResourceMutationHook = (
  ...args: unknown[]
) => ResourceMutationResult;

/**
 * One-time secret/material surfaced after a create or an action (e.g. an API
 * key secret, a webhook signing secret). Rendered in a modal with copy buttons.
 */
export interface RevealPayload {
  title: string;
  description?: string;
  fields: { label: string; value: string; masked?: boolean }[];
  warning?: string;
}

export interface ResourceCreateConfig {
  title: string;
  description?: string;
  fields: FormField[];
  useCreate: ResourceMutationHook;
  buildBody?: (values: Record<string, unknown>) => unknown;
  successMessage?: string;
  buttonLabel?: string;
  /** Return a payload to show a one-time reveal modal after a successful create. */
  reveal?: (result: unknown) => RevealPayload | null;
}

export interface ResourceRowAction {
  label: string;
  icon?: ReactNode;
  variant?: "default" | "danger" | "ghost";
  /** Imperative action (navigation, opening a dialog, etc.). */
  onClick?: (row: ResourceRow) => void;
  /** Mutation-backed action; when set, the screen invokes it directly. */
  useAction?: ResourceMutationHook;
  buildArg?: (row: ResourceRow, input?: string) => unknown;
  /** Collect a single line of text from the operator before running the action. */
  promptFor?: {
    label: string;
    default?: string;
    required?: boolean;
    minLength?: number;
  };
  successMessage?: string | ((row: ResourceRow) => string);
  /** Return a payload to show a one-time reveal modal after a successful action. */
  reveal?: (result: unknown) => RevealPayload | null;
  show?: (row: ResourceRow) => boolean;
  /** When set, show a confirmation prompt before running the action. */
  confirm?: string | ((row: ResourceRow) => string);
}

export interface ResourceStatConfig {
  key: string;
  label: string;
  compute: (rows: ResourceRow[]) => number;
  color?: StatCardProps["color"];
  icon?: ReactNode;
}

export interface ResourceQuickAction {
  label: string;
  icon?: ReactNode;
  useAction: ResourceMutationHook;
  buildArg: (row: ResourceRow) => unknown;
  successMessage?: (row: ResourceRow) => string;
  /** When set, show a confirmation prompt before running the action. */
  confirm?: string | ((row: ResourceRow) => string);
}

export interface ResourceListConfig {
  path: string;
  title: string;
  description?: string;
  sectionLabel: string;
  columns: Column<ResourceRow>[];
  rowId: string;
  source: ResourceDataSource;
  searchable?: (row: ResourceRow) => string;
  filters?: FilterConfig[];
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  detailPath?: (row: ResourceRow) => string | undefined;
  actions?: ResourceRowAction[];
  quickAction?: ResourceQuickAction;
  create?: ResourceCreateConfig;
  stats?: ResourceStatConfig[];
  statusVariant?: (row: ResourceRow) => StatusVariant;
  backTo?: string;
  backLabel?: string;
}

export interface ConfigPanelConfig {
  path: string;
  title: string;
  description?: string;
  sectionLabel: string;
  fields: FormField[];
  useGet: (args: unknown) => ResourceQueryResult;
  useUpdate?: ResourceMutationHook;
  getValues: (payload: unknown) => Record<string, unknown>;
  buildBody: (values: Record<string, unknown>) => unknown;
  saveLabel?: string;
  savedMessage?: string;
  stats?: (
    value: unknown,
  ) => Array<{
    label: string;
    value: string | number;
    color?: StatCardProps["color"];
  }>;
  /** Reads the current configuration version from the payload, when versioned. */
  getVersion?: (payload: unknown) => string | number | undefined;
  backTo?: string;
  backLabel?: string;
}

export function asQueryHook(
  fn: unknown,
): (args: unknown) => ResourceQueryResult {
  return fn as (args: unknown) => ResourceQueryResult;
}

export function asMutationHook(fn: unknown): ResourceMutationHook {
  return fn as ResourceMutationHook;
}

export type StatusVariantFor = (status: string | undefined) => StatusVariant;

export const VARIANT_FROM_STATUS: StatusVariantFor = (status) => {
  const s = String(status ?? "").toLowerCase();
  if (
    s === "active" ||
    s === "enabled" ||
    s === "published" ||
    s === "completed" ||
    s === "sent" ||
    s === "success" ||
    s === "ok" ||
    s === "running"
  )
    return "active";
  if (
    s === "pending" ||
    s === "queued" ||
    s === "draft" ||
    s === "in_progress" ||
    s === "unconfigured" ||
    s === "unverified" ||
    s === "cancelled"
  )
    return "pending";
  if (
    s === "suspended" ||
    s === "disabled" ||
    s === "retired" ||
    s === "failed" ||
    s === "error" ||
    s === "denied" ||
    s === "degraded" ||
    s === "down" ||
    s === "bounced" ||
    s === "suppressed" ||
    s === "rejected"
  )
    return "suspended";
  if (
    s === "closed" ||
    s === "archived" ||
    s === "expired" ||
    s === "revoked" ||
    s === "inactive"
  )
    return "archived";
  return "default";
};
