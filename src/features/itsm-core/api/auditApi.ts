import { baseApi } from "@shared/api/base";

export type AuditEvent = {
  id: string;
  action: string;
  target: string;
  actor: string;
  at: string;
};

type AuditPayload = {
  data?: Array<Record<string, unknown>>;
  events?: Array<Record<string, unknown>>;
  items?: Array<Record<string, unknown>>;
};

function normalizeAuditEvents(payload?: AuditPayload): AuditEvent[] {
  const rows = payload?.data ?? payload?.events ?? payload?.items ?? [];
  return rows.map((row, index) => ({
    id: String(row._id ?? row.id ?? index),
    action: String(row.action ?? row.eventType ?? "Activity recorded"),
    target: String(row.entityId ?? row.target ?? row.entityType ?? "ITSM record"),
    actor: String(row.actorName ?? row.actor ?? row.userId ?? "System"),
    at: String(row.createdAt ?? row.timestamp ?? new Date(0).toISOString()),
  }));
}

export const auditApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listAuditEvents: build.query<AuditEvent[], { entityType?: string; limit?: number }>({
      query: (params) => ({ url: "/core/audit", params }),
      transformResponse: normalizeAuditEvents,
      providesTags: [{ type: "ItsmAudit", id: "LIST" }],
    }),
  }),
});

export const { useListAuditEventsQuery } = auditApi;

