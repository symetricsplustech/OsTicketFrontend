import { saasadminApi } from "./base";
import type { ApiSuccess, ApiRecord, ListQuery } from "./types";

/**
 * SLA policies, calendars and escalation rules — mounted at
 * `/admin/sla-management`.
 */
export const slaManagementApi = saasadminApi.injectEndpoints({
  endpoints: (build) => ({
    listSlaPolicies: build.query<ApiSuccess<ApiRecord[]>, ListQuery | void>({
      query: (params) => ({
        url: "/admin/sla-management/policies",
        params: params ?? undefined,
      }),
      providesTags: ["SlaPolicy"],
    }),
    createSlaPolicy: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>({
      query: (body) => ({
        url: "/admin/sla-management/policies",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SlaPolicy"],
    }),
    getSlaPolicy: build.query<ApiSuccess<ApiRecord>, string>({
      query: (policyId) => ({
        url: `/admin/sla-management/policies/${encodeURIComponent(policyId)}`,
      }),
      providesTags: (_r, _e, policyId) => [{ type: "SlaPolicy", id: policyId }],
    }),
    updateSlaPolicy: build.mutation<
      ApiSuccess<ApiRecord>,
      { policyId: string; body: ApiRecord }
    >({
      query: ({ policyId, body }) => ({
        url: `/admin/sla-management/policies/${encodeURIComponent(policyId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { policyId }) => [
        "SlaPolicy",
        { type: "SlaPolicy", id: policyId },
      ],
    }),
    enableSlaPolicy: build.mutation<ApiSuccess<ApiRecord>, string>({
      query: (policyId) => ({
        url: `/admin/sla-management/policies/${encodeURIComponent(policyId)}/enable`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, policyId) => [
        "SlaPolicy",
        { type: "SlaPolicy", id: policyId },
      ],
    }),
    disableSlaPolicy: build.mutation<ApiSuccess<ApiRecord>, string>({
      query: (policyId) => ({
        url: `/admin/sla-management/policies/${encodeURIComponent(policyId)}/disable`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, policyId) => [
        "SlaPolicy",
        { type: "SlaPolicy", id: policyId },
      ],
    }),
    listSlaCalendars: build.query<ApiSuccess<ApiRecord[]>, void>({
      query: () => ({ url: "/admin/sla-management/calendars" }),
      providesTags: ["SlaPolicy"],
    }),
    createSlaCalendar: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>({
      query: (body) => ({
        url: "/admin/sla-management/calendars",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SlaPolicy"],
    }),
    updateSlaCalendar: build.mutation<
      ApiSuccess<ApiRecord>,
      { calendarId: string; body: ApiRecord }
    >({
      query: ({ calendarId, body }) => ({
        url: `/admin/sla-management/calendars/${encodeURIComponent(calendarId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["SlaPolicy"],
    }),
    listEscalationRules: build.query<ApiSuccess<ApiRecord[]>, void>({
      query: () => ({ url: "/admin/sla-management/escalation-rules" }),
      providesTags: ["SlaPolicy"],
    }),
    createEscalationRule: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>({
      query: (body) => ({
        url: "/admin/sla-management/escalation-rules",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SlaPolicy"],
    }),
    updateEscalationRule: build.mutation<
      ApiSuccess<ApiRecord>,
      { ruleId: string; body: ApiRecord }
    >({
      query: ({ ruleId, body }) => ({
        url: `/admin/sla-management/escalation-rules/${encodeURIComponent(ruleId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["SlaPolicy"],
    }),
    getTenantSlaAssignments: build.query<ApiSuccess<ApiRecord>, string>({
      query: (tenantId) => ({
        url: `/admin/sla-management/tenants/${encodeURIComponent(tenantId)}/assignments`,
      }),
      providesTags: (_r, _e, tenantId) => [{ type: "SlaPolicy", id: tenantId }],
    }),
    setTenantSlaAssignments: build.mutation<
      ApiSuccess<ApiRecord>,
      { tenantId: string; body: ApiRecord }
    >({
      query: ({ tenantId, body }) => ({
        url: `/admin/sla-management/tenants/${encodeURIComponent(tenantId)}/assignments`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["SlaPolicy", "Tenant"],
    }),
  }),
});

export const {
  useListSlaPoliciesQuery,
  useCreateSlaPolicyMutation,
  useGetSlaPolicyQuery,
  useUpdateSlaPolicyMutation,
  useEnableSlaPolicyMutation,
  useDisableSlaPolicyMutation,
  useListSlaCalendarsQuery,
  useCreateSlaCalendarMutation,
  useUpdateSlaCalendarMutation,
  useListEscalationRulesQuery,
  useCreateEscalationRuleMutation,
  useUpdateEscalationRuleMutation,
  useGetTenantSlaAssignmentsQuery,
  useSetTenantSlaAssignmentsMutation,
} = slaManagementApi;
