import { tenantadminApi } from "./base";
import {
  crudEndpoints,
  qs,
  transitionEndpoint,
} from "./crudFactory";

export interface SlaPolicy {
  id: string;
  name: string;
  description: string | null;
  status: string;
  serviceLevels: unknown[] | null;
  settings: Record<string, unknown> | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EscalationRule {
  id: string;
  name: string;
  slaPolicyId: string | null;
  trigger: string;
  thresholdMinutes: number;
  actions: unknown[] | null;
  isEnabled: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface BusinessCalendar {
  id: string;
  name: string;
  timezone: string;
  workingHours: Record<string, unknown> | null;
  holidays: unknown[] | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export const SLA_POLICIES_PATH = "/itsm/sla/policies";
export const SLA_ESCALATION_RULES_PATH = "/itsm/sla/escalation-rules";
export const SLA_CALENDARS_PATH = "/itsm/sla/calendars";

export const slaApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    ...crudEndpoints<SlaPolicy, "SlaPolicy">(build, {
      path: SLA_POLICIES_PATH,
      tag: "SlaPolicy",
    }),
    activateSlaPolicy: transitionEndpoint<SlaPolicy, "SlaPolicy">(
      build,
      SLA_POLICIES_PATH,
      "SlaPolicy",
      "/activate",
    ),
    deactivateSlaPolicy: transitionEndpoint<SlaPolicy, "SlaPolicy">(
      build,
      SLA_POLICIES_PATH,
      "SlaPolicy",
      "/deactivate",
    ),
    ...crudEndpoints<EscalationRule, "EscalationRule">(build, {
      path: SLA_ESCALATION_RULES_PATH,
      tag: "EscalationRule",
    }),
    enableEscalationRule: transitionEndpoint<EscalationRule, "EscalationRule">(
      build,
      SLA_ESCALATION_RULES_PATH,
      "EscalationRule",
      "/enable",
    ),
    disableEscalationRule: transitionEndpoint<EscalationRule, "EscalationRule">(
      build,
      SLA_ESCALATION_RULES_PATH,
      "EscalationRule",
      "/disable",
    ),
    ...crudEndpoints<BusinessCalendar, "BusinessCalendar">(build, {
      path: SLA_CALENDARS_PATH,
      tag: "BusinessCalendar",
    }),
    setDefaultBusinessCalendar: transitionEndpoint<
      BusinessCalendar,
      "BusinessCalendar"
    >(build, SLA_CALENDARS_PATH, "BusinessCalendar", "/set-default"),
    // SLA engine - per-ticket SLA instances and clock events
    listSlaInstances: build.query<
      Array<{
        id: string;
        tenantId: string;
        incidentId: string | null;
        slaPolicyId: string | null;
        milestone: string;
        priorityKey: string;
        targetMinutes: number;
        startedAt: string | null;
        deadlineAt: string | null;
        completedAt: string | null;
        pausedAt: string | null;
        pausedDuration: number;
        status: string;
        breached: boolean;
        breachedAt: string | null;
        policyKey: string | null;
        metadata: Record<string, unknown> | null;
        createdById: string | null;
        createdAt: string;
        updatedAt: string;
        deletedAt: string | null;
        incident?: { id: string; number: string; title: string; statusKey: string } | null;
        slaPolicy?: { id: string; name: string } | null;
      }>,
      { incidentId?: string; milestone?: string; status?: string } | void
    >({
      query: (args) => ({
        url: `/itsm/sla/engine/instances${qs(args)}`,
      }),
      providesTags: ["SlaInstance"],
    }),
    listSlaClockEvents: build.query<
      Array<{
        id: string;
        tenantId: string;
        slaInstanceId: string;
        type: string;
        occurredAt: string;
        actorId: string | null;
        reason: string | null;
        pausedMinutes: number | null;
        metadata: Record<string, unknown> | null;
        createdAt: string;
        actor?: { id: string; firstName: string; lastName: string; email: string } | null;
      }>,
      { slaInstanceId?: string; type?: string } | void
    >({
      query: (args) => ({
        url: `/itsm/sla/engine/clock-events${qs(args)}`,
      }),
      providesTags: ["SlaClockEvent"],
    }),
    pauseSlaClock: build.mutation<
      { id: string },
      { incidentId: string; milestone: string; reason?: string }
    >({
      query: (body) => ({
        url: "/itsm/sla/engine/pause",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SlaInstance", "SlaClockEvent"],
    }),
    resumeSlaClock: build.mutation<
      { id: string },
      { incidentId: string; milestone: string; reason?: string }
    >({
      query: (body) => ({
        url: "/itsm/sla/engine/resume",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SlaInstance", "SlaClockEvent"],
    }),
    completeResponseSla: build.mutation<
      { id: string },
      { incidentId: string }
    >({
      query: (body) => ({
        url: "/itsm/sla/engine/response/complete",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SlaInstance", "SlaClockEvent"],
    }),
    detectSlaBreaches: build.mutation<
      Array<{ id: string }>,
      void
    >({
      query: () => ({
        url: "/itsm/sla/engine/detect-breaches",
        method: "POST",
      }),
      invalidatesTags: ["SlaInstance", "SlaClockEvent"],
    }),
  }),
});

export const {
  useListSlaPolicyQuery,
  useGetSlaPolicyQuery,
  useCreateSlaPolicyMutation,
  useUpdateSlaPolicyMutation,
  useDeleteSlaPolicyMutation,
  useActivateSlaPolicyMutation,
  useDeactivateSlaPolicyMutation,
  useListEscalationRuleQuery,
  useGetEscalationRuleQuery,
  useCreateEscalationRuleMutation,
  useUpdateEscalationRuleMutation,
  useDeleteEscalationRuleMutation,
  useEnableEscalationRuleMutation,
  useDisableEscalationRuleMutation,
  useListBusinessCalendarQuery,
  useGetBusinessCalendarQuery,
  useCreateBusinessCalendarMutation,
  useUpdateBusinessCalendarMutation,
  useDeleteBusinessCalendarMutation,
  useSetDefaultBusinessCalendarMutation,
  // SLA engine
  useListSlaInstancesQuery,
  useListSlaClockEventsQuery,
  usePauseSlaClockMutation,
  useResumeSlaClockMutation,
  useCompleteResponseSlaMutation,
  useDetectSlaBreachesMutation,
} = slaApi;
