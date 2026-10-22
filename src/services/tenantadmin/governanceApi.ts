import { tenantadminApi } from "./base";
import {
  crudEndpoints,
  qs,
  resourceUrl,
  transitionEndpoint,
  type ListArgs,
  type ListResponse,
} from "./crudFactory";
import type { ApiSuccess, PaginationMeta } from "@services/http";

export interface AccessPolicy {
  id: string;
  name: string;
  description: string | null;
  policyType: string | null;
  rules: Record<string, unknown> | null;
  priority: number;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { assignments: number };
}

export interface AccessPolicyAssignment {
  id: string;
  policyId: string;
  subjectType: string;
  subjectId: string;
  createdAt: string;
}

export interface Delegation {
  id: string;
  delegatorId: string;
  delegateeId: string;
  scope: Record<string, unknown> | null;
  reason: string | null;
  status: string;
  startsAt: string | null;
  endsAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
  delegator?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  delegatee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export interface AccessReview {
  id: string;
  name: string;
  description: string | null;
  scope: string | null;
  status: string;
  dueAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { items: number };
}

export interface AccessReviewItem {
  id: string;
  reviewId: string;
  subjectType: string;
  subjectId: string;
  decision: string | null;
  decidedById: string | null;
  decidedAt: string | null;
  notes: string | null;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  actorId: string | null;
  actorEmail: string | null;
  outcome: string;
  ipAddress: string | null;
  createdAt: string;
}

export interface SecurityEvent {
  id: string;
  eventType: string;
  severity: string;
  details: unknown;
  createdAt: string;
  userId: string | null;
}

export interface SecurityOverview {
  eventSeverity: Record<string, number>;
  activeSessions: number;
  mfaAdoption: { enrolled: number; total: number };
}

export interface SecuritySession {
  id: string;
  userId: string | null;
  email: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
}

export const ACCESS_POLICIES_PATH = "/itsm/access-policies";
export const DELEGATIONS_PATH = "/itsm/delegations";
export const ACCESS_REVIEWS_PATH = "/itsm/access-reviews";

export const governanceApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    ...crudEndpoints<AccessPolicy, "AccessPolicy">(build, {
      path: ACCESS_POLICIES_PATH,
      tag: "AccessPolicy",
    }),
    listAccessPolicyAssignments: build.query<
      ListResponse<AccessPolicyAssignment>,
      { policyId: string } & ListArgs
    >({
      query: ({ policyId, ...args }) => ({
        url: `${resourceUrl(ACCESS_POLICIES_PATH, policyId)}/assignments${qs(args)}`,
      }),
      providesTags: (_r, _e, args) => [
        { type: "AccessPolicy", id: args.policyId },
      ],
    }),
    createAccessPolicyAssignment: build.mutation<
      ApiSuccess<AccessPolicyAssignment>,
      { policyId: string; body: { subjectType: string; subjectId: string } }
    >({
      query: ({ policyId, body }) => ({
        url: `${resourceUrl(ACCESS_POLICIES_PATH, policyId)}/assignments`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["AccessPolicy"],
    }),
    deleteAccessPolicyAssignment: build.mutation<
      ApiSuccess<unknown>,
      { policyId: string; assignmentId: string }
    >({
      query: ({ policyId, assignmentId }) => ({
        url: `${resourceUrl(ACCESS_POLICIES_PATH, policyId)}/assignments/${encodeURIComponent(assignmentId)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AccessPolicy"],
    }),
    ...crudEndpoints<Delegation, "Delegation">(build, {
      path: DELEGATIONS_PATH,
      tag: "Delegation",
    }),
    revokeDelegation: transitionEndpoint<Delegation, "Delegation">(
      build,
      DELEGATIONS_PATH,
      "Delegation",
      "/revoke",
    ),
    ...crudEndpoints<AccessReview, "AccessReview">(build, {
      path: ACCESS_REVIEWS_PATH,
      tag: "AccessReview",
    }),
    startAccessReview: transitionEndpoint<AccessReview, "AccessReview">(
      build,
      ACCESS_REVIEWS_PATH,
      "AccessReview",
      "/start",
    ),
    completeAccessReview: transitionEndpoint<AccessReview, "AccessReview">(
      build,
      ACCESS_REVIEWS_PATH,
      "AccessReview",
      "/complete",
    ),
    cancelAccessReview: transitionEndpoint<AccessReview, "AccessReview">(
      build,
      ACCESS_REVIEWS_PATH,
      "AccessReview",
      "/cancel",
    ),
    listAccessReviewItems: build.query<
      ListResponse<AccessReviewItem>,
      { reviewId: string } & ListArgs
    >({
      query: ({ reviewId, ...args }) => ({
        url: `${resourceUrl(ACCESS_REVIEWS_PATH, reviewId)}/items${qs(args)}`,
      }),
      providesTags: (_r, _e, args) => [
        { type: "AccessReview", id: args.reviewId },
      ],
    }),
    createAccessReviewItem: build.mutation<
      ApiSuccess<AccessReviewItem>,
      { reviewId: string; body: { subjectType: string; subjectId: string } }
    >({
      query: ({ reviewId, body }) => ({
        url: `${resourceUrl(ACCESS_REVIEWS_PATH, reviewId)}/items`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["AccessReview"],
    }),
    decideAccessReviewItem: build.mutation<
      ApiSuccess<AccessReviewItem>,
      {
        reviewId: string;
        itemId: string;
        body: { decision: string; notes?: string };
      }
    >({
      query: ({ reviewId, itemId, body }) => ({
        url: `${resourceUrl(ACCESS_REVIEWS_PATH, reviewId)}/items/${encodeURIComponent(itemId)}/decide`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["AccessReview"],
    }),
    deleteAccessReviewItem: build.mutation<
      ApiSuccess<unknown>,
      { reviewId: string; itemId: string }
    >({
      query: ({ reviewId, itemId }) => ({
        url: `${resourceUrl(ACCESS_REVIEWS_PATH, reviewId)}/items/${encodeURIComponent(itemId)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AccessReview"],
    }),
  }),
});

export const {
  useListAccessPolicyQuery,
  useGetAccessPolicyQuery,
  useCreateAccessPolicyMutation,
  useUpdateAccessPolicyMutation,
  useDeleteAccessPolicyMutation,
  useListAccessPolicyAssignmentsQuery,
  useCreateAccessPolicyAssignmentMutation,
  useDeleteAccessPolicyAssignmentMutation,
  useListDelegationQuery,
  useGetDelegationQuery,
  useCreateDelegationMutation,
  useUpdateDelegationMutation,
  useDeleteDelegationMutation,
  useRevokeDelegationMutation,
  useListAccessReviewQuery,
  useGetAccessReviewQuery,
  useCreateAccessReviewMutation,
  useUpdateAccessReviewMutation,
  useDeleteAccessReviewMutation,
  useStartAccessReviewMutation,
  useCompleteAccessReviewMutation,
  useCancelAccessReviewMutation,
  useListAccessReviewItemsQuery,
  useCreateAccessReviewItemMutation,
  useDecideAccessReviewItemMutation,
  useDeleteAccessReviewItemMutation,
} = governanceApi;

export interface AuditListArgs extends ListArgs {
  action?: string;
  resourceType?: string;
  actorId?: string;
  outcome?: string;
  from?: string;
  to?: string;
}

export const auditApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    listAuditEvents: build.query<
      ListResponse<AuditEvent> & { meta?: PaginationMeta },
      AuditListArgs | void
    >({
      query: (args) => ({ url: `/itsm/audit/events${qs(args ?? {})}` }),
      providesTags: ["AuditEvent"],
    }),
    getAuditEvent: build.query<ApiSuccess<AuditEvent>, string>({
      query: (eventId) => ({ url: resourceUrl("/itsm/audit/events", eventId) }),
      providesTags: ["AuditEvent"],
    }),
    getAuditResourceHistory: build.query<
      ListResponse<AuditEvent>,
      { resourceType: string; resourceId: string } & ListArgs
    >({
      query: ({ resourceType, resourceId, ...args }) => ({
        url: `/itsm/audit/resource/${encodeURIComponent(resourceType)}/${encodeURIComponent(resourceId)}${qs(args)}`,
      }),
      providesTags: ["AuditEvent"],
    }),
    listAuditActors: build.query<
      ApiSuccess<Record<string, unknown>[]>,
      ListArgs | void
    >({
      query: (args) => ({ url: `/itsm/audit/actors${qs(args ?? {})}` }),
      providesTags: ["AuditEvent"],
    }),
    listAuditSecurityEvents: build.query<
      ListResponse<SecurityEvent>,
      ListArgs | void
    >({
      query: (args) => ({
        url: `/itsm/audit/security-events${qs(args ?? {})}`,
      }),
      providesTags: ["SecurityEvent"],
    }),
    exportAuditEvents: build.mutation<
      ApiSuccess<Record<string, unknown>>,
      Record<string, unknown>
    >({
      query: (body) => ({ url: "/itsm/audit/export", method: "POST", body }),
      invalidatesTags: ["AuditEvent"],
    }),
  }),
});

export const {
  useListAuditEventsQuery,
  useGetAuditEventQuery,
  useGetAuditResourceHistoryQuery,
  useListAuditActorsQuery,
  useListAuditSecurityEventsQuery,
  useExportAuditEventsMutation,
} = auditApi;

export const securityApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    getSecurityOverview: build.query<ApiSuccess<SecurityOverview>, void>({
      query: () => ({ url: "/itsm/security/overview" }),
      providesTags: ["SecurityEvent"],
    }),
    listSecurityEvents: build.query<
      ListResponse<SecurityEvent>,
      ListArgs | void
    >({
      query: (args) => ({ url: `/itsm/security/events${qs(args ?? {})}` }),
      providesTags: ["SecurityEvent"],
    }),
    listSecuritySessions: build.query<
      ListResponse<SecuritySession>,
      ListArgs | void
    >({
      query: (args) => ({ url: `/itsm/security/sessions${qs(args ?? {})}` }),
      providesTags: ["SecuritySession"],
    }),
    revokeSecuritySession: build.mutation<ApiSuccess<unknown>, string>({
      query: (sessionId) => ({
        url: `/itsm/security/sessions/${encodeURIComponent(sessionId)}/revoke`,
        method: "POST",
      }),
      invalidatesTags: ["SecuritySession"],
    }),
  }),
});

export const {
  useGetSecurityOverviewQuery,
  useListSecurityEventsQuery,
  useListSecuritySessionsQuery,
  useRevokeSecuritySessionMutation,
} = securityApi;
