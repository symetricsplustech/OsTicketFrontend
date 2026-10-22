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

export interface Problem {
  id: string;
  number: string;
  title: string;
  description: string | null;
  statusKey: string;
  priorityKey: string;
  impact: string | null;
  categoryId: string | null;
  assigneeId: string | null;
  teamId: string | null;
  rootCause: string | null;
  workaround: string | null;
  isKnownError: boolean;
  resolvedAt: string | null;
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

export interface ProblemCategory {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface RootCauseCategory {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface KnownError {
  id: string;
  number: string;
  title: string;
  description: string | null;
  status: string;
  problemId: string | null;
  workaround: string | null;
  rootCause: string | null;
  resolvedAt: string | null;
  ownerId: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export const PROBLEMS_PATH = "/itsm/problems";
export const KNOWN_ERRORS_PATH = "/itsm/known-errors";

export const problemsApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    ...crudEndpoints<Problem, "Problem">(build, {
      path: PROBLEMS_PATH,
      tag: "Problem",
    }),
    assignProblem: transitionEndpoint<Problem, "Problem">(
      build,
      PROBLEMS_PATH,
      "Problem",
      "/assign",
    ),
    resolveProblem: transitionEndpoint<Problem, "Problem">(
      build,
      PROBLEMS_PATH,
      "Problem",
      "/resolve",
    ),
    listProblemComments: build.query<
      ListResponse<Record<string, unknown>>,
      { problemId: string } & ListArgs
    >({
      query: ({ problemId, ...args }) => ({
        url: `${resourceUrl(PROBLEMS_PATH, problemId)}/comments${qs(args)}`,
      }),
      providesTags: (_r, _e, args) => [
        { type: "ProblemComment", id: args.problemId },
      ],
    }),
    createProblemComment: build.mutation<
      ApiSuccess<Record<string, unknown>>,
      { problemId: string; body: { body: string; isInternal?: boolean } }
    >({
      query: ({ problemId, body }) => ({
        url: `${resourceUrl(PROBLEMS_PATH, problemId)}/comments`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["ProblemComment"],
    }),
  }),
});

export const {
  useListProblemQuery,
  useGetProblemQuery,
  useCreateProblemMutation,
  useUpdateProblemMutation,
  useDeleteProblemMutation,
  useAssignProblemMutation,
  useResolveProblemMutation,
  useListProblemCommentsQuery,
  useCreateProblemCommentMutation,
} = problemsApi;

export const problemConfigApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    ...crudEndpoints<ProblemCategory, "ProblemCategory">(build, {
      path: "/itsm/problem-config/categories",
      tag: "ProblemCategory",
    }),
    ...crudEndpoints<RootCauseCategory, "RootCauseCategory">(build, {
      path: "/itsm/problem-config/root-causes",
      tag: "RootCauseCategory",
    }),
  }),
});

export const {
  useListProblemCategoryQuery,
  useGetProblemCategoryQuery,
  useCreateProblemCategoryMutation,
  useUpdateProblemCategoryMutation,
  useDeleteProblemCategoryMutation,
  useListRootCauseCategoryQuery,
  useGetRootCauseCategoryQuery,
  useCreateRootCauseCategoryMutation,
  useUpdateRootCauseCategoryMutation,
  useDeleteRootCauseCategoryMutation,
} = problemConfigApi;

export const knownErrorsApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    ...crudEndpoints<KnownError, "KnownError">(build, {
      path: KNOWN_ERRORS_PATH,
      tag: "KnownError",
    }),
    resolveKnownError: transitionEndpoint<KnownError, "KnownError">(
      build,
      KNOWN_ERRORS_PATH,
      "KnownError",
      "/resolve",
    ),
    reopenKnownError: transitionEndpoint<KnownError, "KnownError">(
      build,
      KNOWN_ERRORS_PATH,
      "KnownError",
      "/reopen",
    ),
    archiveKnownError: transitionEndpoint<KnownError, "KnownError">(
      build,
      KNOWN_ERRORS_PATH,
      "KnownError",
      "/archive",
    ),
  }),
});

export const {
  useListKnownErrorQuery,
  useGetKnownErrorQuery,
  useCreateKnownErrorMutation,
  useUpdateKnownErrorMutation,
  useDeleteKnownErrorMutation,
  useResolveKnownErrorMutation,
  useReopenKnownErrorMutation,
  useArchiveKnownErrorMutation,
} = knownErrorsApi;
