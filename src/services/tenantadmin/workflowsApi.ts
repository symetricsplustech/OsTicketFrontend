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

export interface Workflow {
  id: string;
  name: string;
  description: string | null;
  moduleKey: string | null;
  status: string;
  trigger: string | null;
  conditions: Record<string, unknown> | null;
  definition: Record<string, unknown> | null;
  currentVersion: number;
  runCount: number;
  lastRunAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowVersion {
  id: string;
  workflowId: string;
  version: number;
  changelog: string | null;
  snapshot: Record<string, unknown> | null;
  publishedAt: string;
}

export interface WorkflowRun {
  id: string;
  workflowId: string | null;
  resourceType: string;
  resourceId: string | null;
  status: string;
  steps: unknown[] | null;
  error: string | null;
  context: Record<string, unknown> | null;
  startedAt: string;
  completedAt: string | null;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string | null;
  moduleKey: string | null;
  trigger: string;
  eventKey: string | null;
  schedule: string | null;
  conditions: Record<string, unknown> | null;
  actions: unknown[] | null;
  isEnabled: boolean;
  status: string;
  runCount: number;
  lastRunAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationRun {
  id: string;
  ruleId: string | null;
  status: string;
  context: Record<string, unknown> | null;
  error: string | null;
  startedAt: string;
  completedAt: string | null;
}

export interface ApprovalPolicy {
  id: string;
  name: string;
  description: string | null;
  actionScope: string;
  conditions: Record<string, unknown> | null;
  approverRoleIds: string[];
  minApprovals: number;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalRequest {
  id: string;
  actionKey: string;
  resourceType: string;
  resourceId: string | null;
  policyId: string | null;
  status: string;
  payload: Record<string, unknown> | null;
  reason: string | null;
  requestedById: string | null;
  decidedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalDecision {
  id: string;
  requestId: string;
  approverId: string | null;
  decision: string;
  reason: string | null;
  createdAt: string;
}

export const WORKFLOWS_PATH = "/itsm/workflows";
export const WORKFLOW_RUNS_PATH = "/itsm/workflows/runs";
export const AUTOMATION_RULES_PATH = "/itsm/automation/rules";
export const AUTOMATION_RUNS_PATH = "/itsm/automation/runs";
export const APPROVAL_POLICIES_PATH = "/itsm/approvals/policies";
export const APPROVAL_REQUESTS_PATH = "/itsm/approvals/requests";

export const workflowsApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    ...crudEndpoints<Workflow, "Workflow">(build, {
      path: WORKFLOWS_PATH,
      tag: "Workflow",
    }),
    publishWorkflow: transitionEndpoint<Workflow, "Workflow">(
      build,
      WORKFLOWS_PATH,
      "Workflow",
      "/publish",
    ),
    activateWorkflow: transitionEndpoint<Workflow, "Workflow">(
      build,
      WORKFLOWS_PATH,
      "Workflow",
      "/activate",
    ),
    deactivateWorkflow: transitionEndpoint<Workflow, "Workflow">(
      build,
      WORKFLOWS_PATH,
      "Workflow",
      "/deactivate",
    ),
    retireWorkflow: transitionEndpoint<Workflow, "Workflow">(
      build,
      WORKFLOWS_PATH,
      "Workflow",
      "/retire",
    ),
    listWorkflowVersions: build.query<
      ListResponse<WorkflowVersion>,
      { workflowId: string } & ListArgs
    >({
      query: ({ workflowId, ...args }) => ({
        url: `${resourceUrl(WORKFLOWS_PATH, workflowId)}/versions${qs(args)}`,
      }),
      providesTags: (_r, _e, args) => [
        { type: "WorkflowVersion", id: args.workflowId },
      ],
    }),
    ...crudEndpoints<WorkflowRun, "WorkflowRun">(build, {
      path: WORKFLOW_RUNS_PATH,
      tag: "WorkflowRun",
    }),
    completeWorkflowRun: transitionEndpoint<WorkflowRun, "WorkflowRun">(
      build,
      WORKFLOW_RUNS_PATH,
      "WorkflowRun",
      "/complete",
    ),
    failWorkflowRun: transitionEndpoint<WorkflowRun, "WorkflowRun">(
      build,
      WORKFLOW_RUNS_PATH,
      "WorkflowRun",
      "/fail",
    ),
    cancelWorkflowRun: transitionEndpoint<WorkflowRun, "WorkflowRun">(
      build,
      WORKFLOW_RUNS_PATH,
      "WorkflowRun",
      "/cancel",
    ),
  }),
});

export const {
  useListWorkflowQuery,
  useGetWorkflowQuery,
  useCreateWorkflowMutation,
  useUpdateWorkflowMutation,
  useDeleteWorkflowMutation,
  usePublishWorkflowMutation,
  useActivateWorkflowMutation,
  useDeactivateWorkflowMutation,
  useRetireWorkflowMutation,
  useListWorkflowVersionsQuery,
  useListWorkflowRunQuery,
  useGetWorkflowRunQuery,
  useCreateWorkflowRunMutation,
  useUpdateWorkflowRunMutation,
  useDeleteWorkflowRunMutation,
  useCompleteWorkflowRunMutation,
  useFailWorkflowRunMutation,
  useCancelWorkflowRunMutation,
} = workflowsApi;

export const automationApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    ...crudEndpoints<AutomationRule, "AutomationRule">(build, {
      path: AUTOMATION_RULES_PATH,
      tag: "AutomationRule",
    }),
    enableAutomationRule: transitionEndpoint<AutomationRule, "AutomationRule">(
      build,
      AUTOMATION_RULES_PATH,
      "AutomationRule",
      "/enable",
    ),
    disableAutomationRule: transitionEndpoint<AutomationRule, "AutomationRule">(
      build,
      AUTOMATION_RULES_PATH,
      "AutomationRule",
      "/disable",
    ),
    runAutomationRule: transitionEndpoint<AutomationRule, "AutomationRule">(
      build,
      AUTOMATION_RULES_PATH,
      "AutomationRule",
      "/run",
    ),
    listAutomationRuleRuns: build.query<
      ListResponse<AutomationRun>,
      { ruleId: string } & ListArgs
    >({
      query: ({ ruleId, ...args }) => ({
        url: `${resourceUrl(AUTOMATION_RULES_PATH, ruleId)}/runs${qs(args)}`,
      }),
      providesTags: (_r, _e, args) => [
        { type: "AutomationRun", id: args.ruleId },
      ],
    }),
    ...crudEndpoints<AutomationRun, "AutomationRun">(build, {
      path: AUTOMATION_RUNS_PATH,
      tag: "AutomationRun",
    }),
    completeAutomationRun: transitionEndpoint<AutomationRun, "AutomationRun">(
      build,
      AUTOMATION_RUNS_PATH,
      "AutomationRun",
      "/complete",
    ),
    failAutomationRun: transitionEndpoint<AutomationRun, "AutomationRun">(
      build,
      AUTOMATION_RUNS_PATH,
      "AutomationRun",
      "/fail",
    ),
    cancelAutomationRun: transitionEndpoint<AutomationRun, "AutomationRun">(
      build,
      AUTOMATION_RUNS_PATH,
      "AutomationRun",
      "/cancel",
    ),
  }),
});

export const {
  useListAutomationRuleQuery,
  useGetAutomationRuleQuery,
  useCreateAutomationRuleMutation,
  useUpdateAutomationRuleMutation,
  useDeleteAutomationRuleMutation,
  useEnableAutomationRuleMutation,
  useDisableAutomationRuleMutation,
  useRunAutomationRuleMutation,
  useListAutomationRuleRunsQuery,
  useListAutomationRunQuery,
  useGetAutomationRunQuery,
  useCreateAutomationRunMutation,
  useDeleteAutomationRunMutation,
  useCompleteAutomationRunMutation,
  useFailAutomationRunMutation,
  useCancelAutomationRunMutation,
} = automationApi;

export const approvalsApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    ...crudEndpoints<ApprovalPolicy, "ApprovalPolicy">(build, {
      path: APPROVAL_POLICIES_PATH,
      tag: "ApprovalPolicy",
    }),
    enableApprovalPolicy: transitionEndpoint<ApprovalPolicy, "ApprovalPolicy">(
      build,
      APPROVAL_POLICIES_PATH,
      "ApprovalPolicy",
      "/enable",
    ),
    disableApprovalPolicy: transitionEndpoint<ApprovalPolicy, "ApprovalPolicy">(
      build,
      APPROVAL_POLICIES_PATH,
      "ApprovalPolicy",
      "/disable",
    ),
    ...crudEndpoints<ApprovalRequest, "ApprovalRequest">(build, {
      path: APPROVAL_REQUESTS_PATH,
      tag: "ApprovalRequest",
    }),
    decideApprovalRequest: transitionEndpoint<
      ApprovalRequest,
      "ApprovalRequest"
    >(build, APPROVAL_REQUESTS_PATH, "ApprovalRequest", "/decide"),
    cancelApprovalRequest: transitionEndpoint<
      ApprovalRequest,
      "ApprovalRequest"
    >(build, APPROVAL_REQUESTS_PATH, "ApprovalRequest", "/cancel"),
    listApprovalRequestDecisions: build.query<
      ListResponse<ApprovalDecision>,
      { requestId: string } & ListArgs
    >({
      query: ({ requestId, ...args }) => ({
        url: `${resourceUrl(APPROVAL_REQUESTS_PATH, requestId)}/decisions${qs(args)}`,
      }),
      providesTags: (_r, _e, args) => [
        { type: "ApprovalRequest", id: args.requestId },
      ],
    }),
  }),
});

export const {
  useListApprovalPolicyQuery,
  useGetApprovalPolicyQuery,
  useCreateApprovalPolicyMutation,
  useUpdateApprovalPolicyMutation,
  useDeleteApprovalPolicyMutation,
  useEnableApprovalPolicyMutation,
  useDisableApprovalPolicyMutation,
  useListApprovalRequestQuery,
  useGetApprovalRequestQuery,
  useCreateApprovalRequestMutation,
  useUpdateApprovalRequestMutation,
  useDeleteApprovalRequestMutation,
  useDecideApprovalRequestMutation,
  useCancelApprovalRequestMutation,
  useListApprovalRequestDecisionsQuery,
} = approvalsApi;
