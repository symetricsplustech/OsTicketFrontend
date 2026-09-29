import { baseApi } from "@shared/api/base";
import type {
  AssignedWorkResponse,
  AuditListResponse,
  AuditQueryArgs,
  CreateDelegationArgs,
  DelegationsQueryArgs,
  DelegationsResponse,
  DirectoryQueryArgs,
  DirectoryResponse,
  EffectiveAccessResponse,
  EngineerProfileResponse,
  ListResponse,
  OrgUnitSummary,
  OrganizationUnitPlaceArgs,
  ReportingLineResponse,
  RoleSummaryOptions,
  SessionsResponse,
  SetReportingLineArgs,
  SingleDelegationResponse,
  TeamSummary,
  UpsertEngineerProfileArgs,
  WorkHistoryResponse,
} from "@shared/types";

export const instanceApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    directory: build.query<DirectoryResponse, DirectoryQueryArgs>({
      query: ({ instanceId, search, page, limit, userId }) => ({
        url: `/instances/${instanceId}/directory`,
        params: { search, page, limit, userId },
      }),
      providesTags: (result, _error, arg) => [
        { type: "Directory", id: arg.userId ?? "LIST" },
      ],
    }),

    myEffectiveAccess: build.query<EffectiveAccessResponse, string>({
      query: (instanceId) => ({
        url: `/instances/${instanceId}/me/effective-access`,
      }),
      providesTags: ["EffectiveAccess"],
    }),

    effectiveAccess: build.query<
      EffectiveAccessResponse,
      { instanceId: string; userId: string }
    >({
      query: ({ instanceId, userId }) => ({
        url: `/instances/${instanceId}/users/${userId}/effective-access`,
      }),
      providesTags: (_result, _error, arg) => [
        { type: "EffectiveAccess", id: arg.userId },
      ],
    }),

    reportingLine: build.query<
      ReportingLineResponse,
      { instanceId: string; userId: string }
    >({
      query: ({ instanceId, userId }) => ({
        url: `/instances/${instanceId}/users/${userId}/reporting-line`,
      }),
      providesTags: (_result, _error, arg) => [
        { type: "ReportingLine", id: arg.userId },
      ],
    }),

    setReportingLine: build.mutation<
      { success: boolean; reportingLine: ReportLineShape },
      SetReportingLineArgs
    >({
      query: ({ instanceId, userId, body }) => ({
        url: `/instances/${instanceId}/users/${userId}/reporting-line`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "ReportingLine", id: arg.userId },
        { type: "Directory", id: arg.userId },
      ],
    }),

    clearReportingLine: build.mutation<
      { success: boolean; cleared: number },
      { instanceId: string; userId: string }
    >({
      query: ({ instanceId, userId }) => ({
        url: `/instances/${instanceId}/users/${userId}/reporting-line`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "ReportingLine", id: arg.userId },
        { type: "Directory", id: arg.userId },
      ],
    }),

    engineerProfile: build.query<
      EngineerProfileResponse,
      { instanceId: string; userId: string }
    >({
      query: ({ instanceId, userId }) => ({
        url: `/instances/${instanceId}/users/${userId}/engineer-profile`,
      }),
      providesTags: (_result, _error, arg) => [
        { type: "EngineerProfile", id: arg.userId },
      ],
    }),

    upsertEngineerProfile: build.mutation<
      EngineerProfileResponse,
      UpsertEngineerProfileArgs
    >({
      query: ({ instanceId, userId, body }) => ({
        url: `/instances/${instanceId}/users/${userId}/engineer-profile`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "EngineerProfile", id: arg.userId },
      ],
    }),

    delegations: build.query<DelegationsResponse, DelegationsQueryArgs>({
      query: ({ instanceId, userId, includeInactive }) => ({
        url: `/instances/${instanceId}/delegations`,
        params: { userId, includeInactive },
      }),
      providesTags: (_result, _error, arg) => [
        { type: "Delegations", id: arg.userId ?? "ALL" },
      ],
    }),

    createDelegation: build.mutation<
      SingleDelegationResponse,
      CreateDelegationArgs
    >({
      query: ({ instanceId, body }) => ({
        url: `/instances/${instanceId}/delegations`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Delegations"],
    }),

    revokeDelegation: build.mutation<
      SingleDelegationResponse,
      { instanceId: string; delegationId: string }
    >({
      query: ({ instanceId, delegationId }) => ({
        url: `/instances/${instanceId}/delegations/${delegationId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Delegations"],
    }),

    assignedWork: build.query<
      AssignedWorkResponse,
      { instanceId: string; userId: string }
    >({
      query: ({ instanceId, userId }) => ({
        url: `/instances/${instanceId}/users/${userId}/assigned-work`,
      }),
      providesTags: (_result, _error, arg) => [
        { type: "AssignedWork", id: arg.userId },
      ],
    }),

    workHistory: build.query<
      WorkHistoryResponse,
      { instanceId: string; userId: string; limit?: number }
    >({
      query: ({ instanceId, userId, limit }) => ({
        url: `/instances/${instanceId}/users/${userId}/work-history`,
        params: { limit },
      }),
      providesTags: (_result, _error, arg) => [
        { type: "WorkHistory", id: arg.userId },
      ],
    }),

    sessions: build.query<
      SessionsResponse,
      { instanceId: string; userId: string }
    >({
      query: ({ instanceId, userId }) => ({
        url: `/instances/${instanceId}/users/${userId}/sessions`,
      }),
      providesTags: (_result, _error, arg) => [
        { type: "Sessions", id: arg.userId },
      ],
    }),

    revokeSession: build.mutation<
      { success: boolean; session: unknown },
      { instanceId: string; userId: string; sessionId: string }
    >({
      query: ({ instanceId, userId, sessionId }) => ({
        url: `/instances/${instanceId}/users/${userId}/sessions/${sessionId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Sessions", id: arg.userId },
      ],
    }),

    audit: build.query<AuditListResponse, AuditQueryArgs>({
      query: (params) => ({ url: "/core/audit", params }),
      providesTags: ["Audit"],
    }),

    teams: build.query<ListResponse<TeamSummary>, string>({
      query: (instanceId) => ({ url: `/instances/${instanceId}/teams` }),
      providesTags: ["Teams"],
    }),

    roles: build.query<ListResponse<RoleSummaryOptions>, string>({
      query: (instanceId) => ({ url: `/instances/${instanceId}/roles` }),
      providesTags: ["Roles"],
    }),

    organizationUnits: build.query<ListResponse<OrgUnitSummary>, string>({
      query: (instanceId) => ({ url: `/instances/${instanceId}/organization-units` }),
      providesTags: ["OrgUnits"],
    }),

    placeOrganizationUnit: build.mutation<
      { success: boolean; organizationUnit: string | null },
      OrganizationUnitPlaceArgs
    >({
      query: ({ instanceId, userId, organizationUnit }) => ({
        url: `/instances/${instanceId}/members/${userId}/organization-unit`,
        method: "PUT",
        body: { organizationUnit },
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Directory", id: arg.userId },
      ],
    }),
  }),
});

export const {
  useDirectoryQuery,
  useMyEffectiveAccessQuery,
  useEffectiveAccessQuery,
  useReportingLineQuery,
  useSetReportingLineMutation,
  useClearReportingLineMutation,
  useEngineerProfileQuery,
  useUpsertEngineerProfileMutation,
  useDelegationsQuery,
  useCreateDelegationMutation,
  useRevokeDelegationMutation,
  useAssignedWorkQuery,
  useWorkHistoryQuery,
  useSessionsQuery,
  useRevokeSessionMutation,
  useAuditQuery,
  useTeamsQuery,
  useRolesQuery,
  useOrganizationUnitsQuery,
  usePlaceOrganizationUnitMutation,
} = instanceApi;

/* Reporting line shape reflected from the backend hierarchy service. */
export type ReportLineShape = {
  _id: string;
  id: string;
  memberUserId: string;
  managerUserId: string | null;
  teamLeadUserId: string | null;
  delegatedManagerUserId: string | null;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  isActive: boolean;
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};