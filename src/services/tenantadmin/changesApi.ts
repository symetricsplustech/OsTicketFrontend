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

export interface Change {
  id: string;
  number: string;
  title: string;
  description: string | null;
  statusKey: string;
  priorityKey: string;
  changeTypeKey: string | null;
  riskKey: string | null;
  impact: string | null;
  categoryId: string | null;
  assigneeId: string | null;
  teamId: string | null;
  requestedById: string | null;
  approvalStatus: string | null;
  implementationPlan: string | null;
  rollbackPlan: string | null;
  testPlan: string | null;
  plannedStartAt: string | null;
  plannedEndAt: string | null;
  actualStartAt: string | null;
  actualEndAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  team?: { id: string; name: string } | null;
}

export interface ChangeType {
  id: string;
  name: string;
  code: string;
  description: string | null;
  riskLevel: string;
  requiresApproval: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface ChangeTemplate {
  id: string;
  name: string;
  changeTypeId: string | null;
  description: string | null;
  template: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: string;
}

export interface ChangeWindow {
  id: string;
  name: string;
  windowType: "MAINTENANCE" | "BLACKOUT";
  startAt: string;
  endAt: string;
  recurrence: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export const CHANGES_PATH = "/itsm/changes";

export const changesApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    ...crudEndpoints<Change, "Change">(build, {
      path: CHANGES_PATH,
      tag: "Change",
    }),
    assignChange: transitionEndpoint<Change, "Change">(
      build,
      CHANGES_PATH,
      "Change",
      "/assign",
    ),
    decideChange: transitionEndpoint<Change, "Change">(
      build,
      CHANGES_PATH,
      "Change",
      "/decision",
    ),
    implementChange: transitionEndpoint<Change, "Change">(
      build,
      CHANGES_PATH,
      "Change",
      "/implement",
    ),
    completeChange: transitionEndpoint<Change, "Change">(
      build,
      CHANGES_PATH,
      "Change",
      "/complete",
    ),
    rollbackChange: transitionEndpoint<Change, "Change">(
      build,
      CHANGES_PATH,
      "Change",
      "/rollback",
    ),
    listChangeComments: build.query<
      ListResponse<Record<string, unknown>>,
      { changeId: string } & ListArgs
    >({
      query: ({ changeId, ...args }) => ({
        url: `${resourceUrl(CHANGES_PATH, changeId)}/comments${qs(args)}`,
      }),
      providesTags: (_r, _e, args) => [
        { type: "ChangeComment", id: args.changeId },
      ],
    }),
    createChangeComment: build.mutation<
      ApiSuccess<Record<string, unknown>>,
      { changeId: string; body: { body: string; isInternal?: boolean } }
    >({
      query: ({ changeId, body }) => ({
        url: `${resourceUrl(CHANGES_PATH, changeId)}/comments`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["ChangeComment"],
    }),
  }),
});

export const {
  useListChangeQuery,
  useGetChangeQuery,
  useCreateChangeMutation,
  useUpdateChangeMutation,
  useDeleteChangeMutation,
  useAssignChangeMutation,
  useDecideChangeMutation,
  useImplementChangeMutation,
  useCompleteChangeMutation,
  useRollbackChangeMutation,
  useListChangeCommentsQuery,
  useCreateChangeCommentMutation,
} = changesApi;

export const changeConfigApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    ...crudEndpoints<ChangeType, "ChangeType">(build, {
      path: "/itsm/change-config/types",
      tag: "ChangeType",
    }),
    ...crudEndpoints<ChangeTemplate, "ChangeTemplate">(build, {
      path: "/itsm/change-config/templates",
      tag: "ChangeTemplate",
    }),
    ...crudEndpoints<ChangeWindow, "ChangeWindow">(build, {
      path: "/itsm/change-calendar/windows",
      tag: "ChangeWindow",
    }),
  }),
});

export const {
  useListChangeTypeQuery,
  useGetChangeTypeQuery,
  useCreateChangeTypeMutation,
  useUpdateChangeTypeMutation,
  useDeleteChangeTypeMutation,
  useListChangeTemplateQuery,
  useGetChangeTemplateQuery,
  useCreateChangeTemplateMutation,
  useUpdateChangeTemplateMutation,
  useDeleteChangeTemplateMutation,
  useListChangeWindowQuery,
  useGetChangeWindowQuery,
  useCreateChangeWindowMutation,
  useUpdateChangeWindowMutation,
  useDeleteChangeWindowMutation,
} = changeConfigApi;

export interface ServiceRequest {
  id: string;
  number: string;
  title: string;
  description: string | null;
  statusKey: string;
  priorityKey: string;
  catalogItemId: string | null;
  requestedForId: string | null;
  assigneeId: string | null;
  teamId: string | null;
  approvalStatus: string | null;
  fulfilledAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  team?: { id: string; name: string } | null;
}

export const REQUESTS_PATH = "/itsm/requests";

export const requestsApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    ...crudEndpoints<ServiceRequest, "ServiceRequest">(build, {
      path: REQUESTS_PATH,
      tag: "ServiceRequest",
    }),
    assignServiceRequest: transitionEndpoint<ServiceRequest, "ServiceRequest">(
      build,
      REQUESTS_PATH,
      "ServiceRequest",
      "/assign",
    ),
    decideServiceRequest: transitionEndpoint<ServiceRequest, "ServiceRequest">(
      build,
      REQUESTS_PATH,
      "ServiceRequest",
      "/decision",
    ),
    fulfillServiceRequest: transitionEndpoint<ServiceRequest, "ServiceRequest">(
      build,
      REQUESTS_PATH,
      "ServiceRequest",
      "/fulfill",
    ),
    cancelServiceRequest: transitionEndpoint<ServiceRequest, "ServiceRequest">(
      build,
      REQUESTS_PATH,
      "ServiceRequest",
      "/cancel",
    ),
    listServiceRequestComments: build.query<
      ListResponse<Record<string, unknown>>,
      { requestId: string } & ListArgs
    >({
      query: ({ requestId, ...args }) => ({
        url: `${resourceUrl(REQUESTS_PATH, requestId)}/comments${qs(args)}`,
      }),
      providesTags: (_r, _e, args) => [
        { type: "ServiceRequestComment", id: args.requestId },
      ],
    }),
    createServiceRequestComment: build.mutation<
      ApiSuccess<Record<string, unknown>>,
      { requestId: string; body: { body: string; isInternal?: boolean } }
    >({
      query: ({ requestId, body }) => ({
        url: `${resourceUrl(REQUESTS_PATH, requestId)}/comments`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["ServiceRequestComment"],
    }),
  }),
});

export const {
  useListServiceRequestQuery,
  useGetServiceRequestQuery,
  useCreateServiceRequestMutation,
  useUpdateServiceRequestMutation,
  useDeleteServiceRequestMutation,
  useAssignServiceRequestMutation,
  useDecideServiceRequestMutation,
  useFulfillServiceRequestMutation,
  useCancelServiceRequestMutation,
  useListServiceRequestCommentsQuery,
  useCreateServiceRequestCommentMutation,
} = requestsApi;
