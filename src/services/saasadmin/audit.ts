import { saasadminApi } from "./base";
import type { ApiSuccess, ApiRecord, ListQuery } from "./types";

/**
 * Audit trail — mounted at `/admin/audit`.
 */
export const auditApi = saasadminApi.injectEndpoints({
  endpoints: (build) => ({
    listAuditEvents: build.query<ApiSuccess<ApiRecord[]>, ListQuery | void>({
      query: (params) => ({ url: "/admin/audit/events", params: params ?? undefined }),
      providesTags: ["AuditEvent"],
    }),
    getAuditEvent: build.query<ApiSuccess<ApiRecord>, string>({
      query: (eventId) => ({ url: `/admin/audit/events/${encodeURIComponent(eventId)}` }),
      providesTags: (_r, _e, eventId) => [{ type: "AuditEvent", id: eventId }],
    }),
    listAuditActors: build.query<ApiSuccess<ApiRecord[]>, ListQuery | void>({
      query: (params) => ({ url: "/admin/audit/actors", params: params ?? undefined }),
      providesTags: ["AuditEvent"],
    }),
    auditResourceHistory: build.query<ApiSuccess<ApiRecord[]>, ListQuery | void>({
      query: (params) => ({ url: "/admin/audit/resource-history", params: params ?? undefined }),
      providesTags: ["AuditEvent"],
    }),
    auditSecurityEvents: build.query<ApiSuccess<ApiRecord[]>, ListQuery | void>({
      query: (params) => ({ url: "/admin/audit/security-events", params: params ?? undefined }),
      providesTags: ["AuditEvent"],
    }),
    auditLoginEvents: build.query<ApiSuccess<ApiRecord[]>, ListQuery | void>({
      query: (params) => ({ url: "/admin/audit/login-events", params: params ?? undefined }),
      providesTags: ["AuditEvent"],
    }),
    auditPrivilegedActions: build.query<ApiSuccess<ApiRecord[]>, ListQuery | void>({
      query: (params) => ({ url: "/admin/audit/privileged-actions", params: params ?? undefined }),
      providesTags: ["AuditEvent"],
    }),
    createAuditExport: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>({
      query: (body) => ({ url: "/admin/audit/exports", method: "POST", body }),
      invalidatesTags: ["AuditEvent"],
    }),
  }),
});

export const {
  useListAuditEventsQuery,
  useGetAuditEventQuery,
  useListAuditActorsQuery,
  useAuditResourceHistoryQuery,
  useAuditSecurityEventsQuery,
  useAuditLoginEventsQuery,
  useAuditPrivilegedActionsQuery,
  useCreateAuditExportMutation,
} = auditApi;
