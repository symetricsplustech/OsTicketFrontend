import { ClipboardCheck, ShieldCheck, Workflow, ClipboardList, Check, X, Ban, Power, PowerOff } from "lucide-react";
import { asQueryHook, asMutationHook, VARIANT_FROM_STATUS } from "../components/resource/types";
import type { ResourceListConfig } from "../components/resource/types";
import { textCol, statusCol, dateCol } from "./columns";
import {
  useListApprovalRequestsQuery,
  useMyPendingApprovalsQuery,
  useListApprovalPoliciesQuery,
  useCreateApprovalPolicyMutation,
  useEnableApprovalPolicyMutation,
  useDisableApprovalPolicyMutation,
  useApproveRequestMutation,
  useRejectRequestMutation,
  useCancelRequestMutation,
} from "@services/saasadmin";

const requestId = (row: Record<string, unknown>) => String(row.requestId ?? row.id ?? "");

const SECTION = "Approval Management";

const REQUEST_STATUS = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "EXPIRED", label: "Expired" },
];

const requestColumns: ResourceListConfig["columns"] = [
  { key: "id", header: "Request", render: (r) => <span className="font-mono text-xs">{String((r.id ?? r.requestId ?? "—").toString().slice(0, 8))}</span> },
  { key: "actionKey", header: "Action", render: (r) => <span className="font-mono text-xs">{String(r.actionKey ?? "—")}</span> },
  textCol("resourceType", "Resource"),
  textCol("resourceId", "Resource ID"),
  statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
  textCol("requestedBy.email", "Requested By"),
  dateCol("expiresAt", "Expires"),
];

export const APPROVAL_MANAGEMENT_LISTS: ResourceListConfig[] = [
  {
    path: "/saas-admin/approval-management/pending",
    title: "Pending Approvals",
    description: "Approval requests awaiting your decision.",
    sectionLabel: SECTION,
    rowId: "requestId",
    source: { kind: "api", useList: asQueryHook(useMyPendingApprovalsQuery) },
    columns: requestColumns,
    searchable: (r) => `${r.actionKey} ${r.resourceType} ${(r.requestedBy as { email?: string } | undefined)?.email ?? ""}`,
    filters: [{ key: "status", label: "Status", type: "select", options: REQUEST_STATUS, placeholder: "All statuses" }],
    actions: [
      {
        label: "Approve",
        icon: <Check className="h-3.5 w-3.5" />,
        useAction: asMutationHook(useApproveRequestMutation),
        buildArg: (row) => ({ requestId: String(row.requestId ?? row.id) }),
        confirm: (row) => `Approve the request for "${row.actionKey ?? row.resourceType}"?`,
        successMessage: "Request approved.",
        show: (row) => String(row.status ?? "").toUpperCase() === "PENDING",
      },
      {
        label: "Reject",
        icon: <Ban className="h-3.5 w-3.5" />,
        variant: "danger",
        useAction: asMutationHook(useRejectRequestMutation),
        promptFor: { label: "Reason for rejection (required)", required: true },
        buildArg: (row, input) => ({ requestId: String(row.requestId ?? row.id), body: { reason: input ?? "" } }),
        confirm: (row) => `Reject the request for "${row.actionKey ?? row.resourceType}"?`,
        successMessage: "Request rejected.",
        show: (row) => String(row.status ?? "").toUpperCase() === "PENDING",
      },
    ],
    stats: [
      { key: "total", label: "Pending", compute: (rows) => rows.length, icon: <ClipboardCheck className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/approval-management/policies",
    title: "Approval Policies",
    description: "Policies that control which actions require approval.",
    sectionLabel: SECTION,
    rowId: "policyId",
    source: { kind: "api", useList: asQueryHook(useListApprovalPoliciesQuery) },
    columns: [
      textCol("name", "Policy"),
      { key: "actionScope", header: "Action Scope", render: (r) => <span className="font-mono text-xs">{String(r.actionScope ?? "—")}</span> },
      textCol("description", "Description"),
      textCol("conditions", "Conditions"),
      textCol("minApprovals", "Min Approvals"),
      textCol("isEnabled", "Enabled"),
    ],
    searchable: (r) => `${r.name} ${r.description} ${r.actionScope}`,
    create: {
      title: "Create Approval Policy",
      fields: [
        { key: "name", label: "Name", type: "text", required: true },
        { key: "actionScope", label: "Action Scope", type: "text" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "minApprovals", label: "Min Approvals", type: "number" },
      ],
      useCreate: asMutationHook(useCreateApprovalPolicyMutation),
    },
    actions: [
      {
        label: "Enable",
        icon: <ShieldCheck className="h-3.5 w-3.5" />,
        useAction: asMutationHook(useEnableApprovalPolicyMutation),
        buildArg: (row) => String(row.policyId ?? row.id),
        successMessage: "Policy enabled.",
        show: (row) => !row.isEnabled,
      },
      {
        label: "Disable",
        icon: <Ban className="h-3.5 w-3.5" />,
        variant: "danger",
        useAction: asMutationHook(useDisableApprovalPolicyMutation),
        buildArg: (row) => String(row.policyId ?? row.id),
        confirm: (row) => `Disable the policy "${row.name}"? Actions it governs will no longer require approval.`,
        successMessage: "Policy disabled.",
        show: (row) => Boolean(row.isEnabled),
      },
    ],
    stats: [
      { key: "total", label: "Policies", compute: (rows) => rows.length, icon: <ShieldCheck className="h-5 w-5" /> },
      { key: "enabled", label: "Enabled", compute: (rows) => rows.filter((r) => r.isEnabled).length, color: "success", icon: <ShieldCheck className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/approval-management/workflows",
    title: "Approval Workflows",
    description: "Policy-driven approval workflows (policies define routing and thresholds).",
    sectionLabel: SECTION,
    rowId: "policyId",
    source: { kind: "api", useList: asQueryHook(useListApprovalPoliciesQuery) },
    columns: [
      textCol("name", "Workflow"),
      textCol("actionScope", "Scope"),
      textCol("minApprovals", "Min Approvals"),
      textCol("approverRoleIds", "Approver Roles"),
      textCol("isEnabled", "Enabled"),
    ],
    searchable: (r) => `${r.name} ${r.actionScope}`,
    stats: [
      { key: "total", label: "Workflows", compute: (rows) => rows.length, icon: <Workflow className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/approval-management/history",
    title: "Approval History",
    description: "All approval requests and their outcomes.",
    sectionLabel: SECTION,
    rowId: "requestId",
    source: { kind: "api", useList: asQueryHook(useListApprovalRequestsQuery) },
    columns: requestColumns,
    searchable: (r) => `${r.actionKey} ${r.resourceType} ${(r.requestedBy as { email?: string } | undefined)?.email ?? ""}`,
    filters: [{ key: "status", label: "Status", type: "select", options: REQUEST_STATUS, placeholder: "All statuses" }],
    actions: [
      {
        label: "Cancel",
        icon: <Ban className="h-3.5 w-3.5" />,
        variant: "danger",
        useAction: asMutationHook(useCancelRequestMutation),
        buildArg: (row) => ({ requestId: String(row.requestId ?? row.id) }),
        confirm: (row) => `Cancel the approval request for "${row.actionKey ?? row.resourceType}"?`,
        successMessage: "Request cancelled.",
        show: (row) => String(row.status ?? "").toUpperCase() === "PENDING",
      },
    ],
    stats: [
      { key: "total", label: "Requests", compute: (rows) => rows.length, icon: <ClipboardList className="h-5 w-5" /> },
      { key: "approved", label: "Approved", compute: (rows) => rows.filter((r) => r.status === "APPROVED").length, color: "success", icon: <ClipboardList className="h-5 w-5" /> },
      { key: "rejected", label: "Rejected", compute: (rows) => rows.filter((r) => r.status === "REJECTED").length, color: "danger", icon: <ClipboardList className="h-5 w-5" /> },
    ],
  },
];