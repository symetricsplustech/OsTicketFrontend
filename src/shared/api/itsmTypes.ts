export type ApiRecord = Record<string, unknown> & { _id?: string; id?: string };
export type ApiListResponse = {
  success?: boolean;
  data?: ApiRecord[] | { items?: ApiRecord[]; records?: ApiRecord[] };
  items?: ApiRecord[];
  records?: ApiRecord[];
  total?: number;
};
export type ApiRecordResponse = { success?: boolean; data: ApiRecord; item?: ApiRecord };
export type ListParams = { search?: string; status?: string; page?: number; limit?: number };

export function apiRows(payload?: ApiListResponse): ApiRecord[] {
  if (Array.isArray(payload?.data)) return payload.data;
  if (payload?.data && Array.isArray(payload.data.items)) return payload.data.items;
  if (payload?.data && Array.isArray(payload.data.records)) return payload.data.records;
  return payload?.items ?? payload?.records ?? [];
}

/** Single-record payload, accepting either the `item` or `data` envelope. */
export function apiRecord(payload?: ApiRecordResponse): ApiRecord {
  return payload?.item ?? payload?.data ?? {};
}
