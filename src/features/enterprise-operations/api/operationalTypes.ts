import type { ApiRecord } from "@shared/api/itsmTypes";

export type OperationalResponse = {
  success?: boolean;
  data?: ApiRecord[] | ApiRecord;
  items?: ApiRecord[];
  records?: ApiRecord[];
  assets?: ApiRecord[];
  approvals?: ApiRecord[];
  releases?: ApiRecord[];
  outages?: ApiRecord[];
};

export function operationalRows(payload?: OperationalResponse): ApiRecord[] {
  if (Array.isArray(payload?.data)) return payload.data;
  if (payload?.data) return [payload.data];
  return payload?.items ?? payload?.records ?? payload?.assets ?? payload?.approvals ?? payload?.releases ?? payload?.outages ?? [];
}

export type ResourceQuery = { resource: string; search?: string; status?: string };
export type ResourceMutation = { resource: string; id?: string; body?: Record<string, unknown> };
