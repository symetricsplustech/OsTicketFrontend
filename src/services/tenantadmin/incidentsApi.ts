import { tenantadminApi } from "./base";
import {
  crudEndpoints,
  qs,
  resourceUrl,
  transitionEndpoint,
  type ListArgs,
  type ListResponse,
} from "./crudFactory";
import type { ApiSuccess } from "@services/http";

export type ImpactLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Incident {
  id: string;
  number: string;
  title: string;
  description: string | null;
  statusKey: string;
  priorityKey: string;
  impact: ImpactLevel | null;
  urgency: ImpactLevel | null;
  categoryId: string | null;
  source: string | null;
  channel: string | null;
  callerId: string | null;
  assigneeId: string | null;
  teamId: string | null;
  departmentId: string | null;
  locationId: string | null;
  customerId: string | null;
  tags: string[];
  dueAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  reopenedCount: number;
  resolutionCode: string | null;
  resolutionNotes: string | null;
  firstResponseAt: string | null;
  slaBreached: boolean;
  metadata: Record<string, unknown> | null;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  team?: { id: string; name: string } | null;
  caller?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  department?: { id: string; name: string; code: string | null } | null;
  location?: { id: string; name: string; code: string | null } | null;
  category?: { id: string; name: string } | null;
}

export interface TicketComment {
  id: string;
  body: string;
  isInternal: boolean;
  authorId: string | null;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export interface IncidentListArgs extends ListArgs {
  status?: string;
  priorityKey?: string;
  assigneeId?: string;
  callerId?: string;
  teamId?: string;
  customerId?: string;
}

export const INCIDENTS_PATH = "/itsm/incidents";

export const incidentsApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    ...crudEndpoints<Incident, "Incident">(build, {
      path: INCIDENTS_PATH,
      tag: "Incident",
    }),
    assignIncident: transitionEndpoint<Incident, "Incident">(
      build,
      INCIDENTS_PATH,
      "Incident",
      "/assign",
    ),
    escalateIncident: transitionEndpoint<Incident, "Incident">(
      build,
      INCIDENTS_PATH,
      "Incident",
      "/escalate",
    ),
    resolveIncident: transitionEndpoint<Incident, "Incident">(
      build,
      INCIDENTS_PATH,
      "Incident",
      "/resolve",
    ),
    reopenIncident: transitionEndpoint<Incident, "Incident">(
      build,
      INCIDENTS_PATH,
      "Incident",
      "/reopen",
    ),
    listIncidentComments: build.query<
      ListResponse<TicketComment>,
      { incidentId: string } & ListArgs
    >({
      query: ({ incidentId, ...args }) => ({
        url: `${resourceUrl(INCIDENTS_PATH, incidentId)}/comments${qs(args)}`,
      }),
      providesTags: (_r, _e, args) => [
        { type: "IncidentComment", id: args.incidentId },
      ],
    }),
    createIncidentComment: build.mutation<
      ApiSuccess<TicketComment>,
      { incidentId: string; body: { body: string; isInternal?: boolean } }
    >({
      query: ({ incidentId, body }) => ({
        url: `${resourceUrl(INCIDENTS_PATH, incidentId)}/comments`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["IncidentComment"],
    }),
  }),
});

export const {
  useListIncidentQuery,
  useGetIncidentQuery,
  useCreateIncidentMutation,
  useUpdateIncidentMutation,
  useDeleteIncidentMutation,
  useAssignIncidentMutation,
  useEscalateIncidentMutation,
  useResolveIncidentMutation,
  useReopenIncidentMutation,
  useListIncidentCommentsQuery,
  useCreateIncidentCommentMutation,
} = incidentsApi;

export interface IncidentCategory {
  id: string;
  name: string;
  code: string;
  description: string | null;
  parentId: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface IncidentPriority {
  id: string;
  name: string;
  key: string;
  level: number;
  responseMinutes: number | null;
  resolveMinutes: number | null;
  color: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface ResolutionCode {
  id: string;
  code: string;
  label: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface MajorIncident {
  id: string;
  number: string;
  title: string;
  description: string | null;
  status: string;
  severity: string;
  incidentId: string | null;
  commanderId: string | null;
  impactSummary: string | null;
  communicationPlan: string | null;
  startedAt: string | null;
  resolvedAt: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export const incidentConfigApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    ...crudEndpoints<IncidentCategory, "IncidentCategory">(build, {
      path: "/itsm/incident-config/categories",
      tag: "IncidentCategory",
    }),
    ...crudEndpoints<IncidentPriority, "IncidentPriority">(build, {
      path: "/itsm/incident-config/priorities",
      tag: "IncidentPriority",
    }),
    ...crudEndpoints<ResolutionCode, "ResolutionCode">(build, {
      path: "/itsm/incident-config/resolution-codes",
      tag: "ResolutionCode",
    }),
  }),
});

export const {
  useListIncidentCategoryQuery,
  useGetIncidentCategoryQuery,
  useCreateIncidentCategoryMutation,
  useUpdateIncidentCategoryMutation,
  useDeleteIncidentCategoryMutation,
  useListIncidentPriorityQuery,
  useGetIncidentPriorityQuery,
  useCreateIncidentPriorityMutation,
  useUpdateIncidentPriorityMutation,
  useDeleteIncidentPriorityMutation,
  useListResolutionCodeQuery,
  useGetResolutionCodeQuery,
  useCreateResolutionCodeMutation,
  useUpdateResolutionCodeMutation,
  useDeleteResolutionCodeMutation,
} = incidentConfigApi;

export const MAJOR_INCIDENTS_PATH = "/itsm/major-incidents";

export const majorIncidentsApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    ...crudEndpoints<MajorIncident, "MajorIncident">(build, {
      path: MAJOR_INCIDENTS_PATH,
      tag: "MajorIncident",
    }),
    investigateMajorIncident: transitionEndpoint<
      MajorIncident,
      "MajorIncident"
    >(build, MAJOR_INCIDENTS_PATH, "MajorIncident", "/investigate"),
    monitorMajorIncident: transitionEndpoint<MajorIncident, "MajorIncident">(
      build,
      MAJOR_INCIDENTS_PATH,
      "MajorIncident",
      "/monitor",
    ),
    resolveMajorIncident: transitionEndpoint<MajorIncident, "MajorIncident">(
      build,
      MAJOR_INCIDENTS_PATH,
      "MajorIncident",
      "/resolve",
    ),
    closeMajorIncident: transitionEndpoint<MajorIncident, "MajorIncident">(
      build,
      MAJOR_INCIDENTS_PATH,
      "MajorIncident",
      "/close",
    ),
  }),
});

export const {
  useListMajorIncidentQuery,
  useGetMajorIncidentQuery,
  useCreateMajorIncidentMutation,
  useUpdateMajorIncidentMutation,
  useDeleteMajorIncidentMutation,
  useInvestigateMajorIncidentMutation,
  useMonitorMajorIncidentMutation,
  useResolveMajorIncidentMutation,
  useCloseMajorIncidentMutation,
} = majorIncidentsApi;
