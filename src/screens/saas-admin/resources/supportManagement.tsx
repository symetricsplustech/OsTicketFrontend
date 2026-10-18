import { LifeBuoy, Settings, AlertTriangle, MessageSquare, CheckCircle, RotateCcw } from "lucide-react";
import { asQueryHook, asMutationHook, VARIANT_FROM_STATUS } from "../components/resource/types";
import type { ResourceListConfig } from "../components/resource/types";
import { textCol, statusCol } from "./columns";
import {
  useListSupportTicketsQuery,
  useCreateSupportTicketMutation,
  useReplySupportTicketMutation,
  useResolveSupportTicketMutation,
  useReopenSupportTicketMutation,
  useListSupportQueuesQuery,
  useCreateSupportQueueMutation,
} from "@services/saasadmin";
import { useListEscalationRulesQuery, useCreateEscalationRuleMutation } from "@services/saasadmin";

const SECTION = "Support Management";

const TICKET_STATUS = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "PENDING", label: "Pending" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
  { value: "REOPENED", label: "Reopened" },
];

export const SUPPORT_MANAGEMENT_LISTS: ResourceListConfig[] = [
  {
    path: "/saas-admin/support-management/tickets",
    title: "Support Tickets",
    description: "Platform-level support tickets raised across tenants.",
    sectionLabel: SECTION,
    rowId: "ticketId",
    source: { kind: "api", useList: asQueryHook(useListSupportTicketsQuery) },
    columns: [
      { key: "ticketNumber", header: "Ticket", render: (r) => <span className="font-mono text-xs">{String(r.ticketNumber ?? "—")}</span> },
      textCol("subject", "Subject"),
      statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
      textCol("priority", "Priority"),
      textCol("requesterName", "Requester"),
      textCol("queue.name", "Queue"),
      textCol("_count.replies", "Replies"),
    ],
    searchable: (r) => `${r.subject} ${r.ticketNumber} ${r.requesterName}`,
    filters: [
      { key: "status", label: "Status", type: "select", options: TICKET_STATUS, placeholder: "All statuses" },
      {
        key: "priority",
        label: "Priority",
        type: "select",
        options: [
          { value: "LOW", label: "Low" },
          { value: "NORMAL", label: "Normal" },
          { value: "HIGH", label: "High" },
          { value: "URGENT", label: "Urgent" },
        ],
        placeholder: "All priorities",
      },
    ],
    create: {
      title: "Create Support Ticket",
      fields: [
        { key: "subject", label: "Subject", type: "text", required: true },
        { key: "requesterName", label: "Requester Name", type: "text" },
        { key: "requesterEmail", label: "Requester Email", type: "text" },
        { key: "priority", label: "Priority", type: "select", options: [{ value: "LOW", label: "Low" }, { value: "NORMAL", label: "Normal" }, { value: "HIGH", label: "High" }, { value: "URGENT", label: "Urgent" }] },
      ],
      useCreate: asMutationHook(useCreateSupportTicketMutation),
    },
    actions: [
      {
        label: "Reply",
        icon: <MessageSquare className="h-3.5 w-3.5" />,
        useAction: asMutationHook(useReplySupportTicketMutation),
        promptFor: { label: "Reply message (required)", required: true },
        buildArg: (row, input) => ({ ticketId: String(row.ticketId ?? row.id), body: { body: input ?? "" } }),
        successMessage: "Reply added.",
        show: (row) => !["CLOSED"].includes(String(row.status ?? "").toUpperCase()),
      },
      {
        label: "Resolve",
        icon: <CheckCircle className="h-3.5 w-3.5" />,
        useAction: asMutationHook(useResolveSupportTicketMutation),
        promptFor: { label: "Resolution note (optional)" },
        buildArg: (row, input) => ({ ticketId: String(row.ticketId ?? row.id), body: input ? { resolutionNote: input } : {} }),
        confirm: (row) => `Mark ticket "${row.ticketNumber ?? row.subject}" as resolved?`,
        successMessage: "Ticket resolved.",
        show: (row) => !["RESOLVED", "CLOSED"].includes(String(row.status ?? "").toUpperCase()),
      },
      {
        label: "Reopen",
        icon: <RotateCcw className="h-3.5 w-3.5" />,
        useAction: asMutationHook(useReopenSupportTicketMutation),
        buildArg: (row) => ({ ticketId: String(row.ticketId ?? row.id) }),
        confirm: (row) => `Reopen ticket "${row.ticketNumber ?? row.subject}"?`,
        successMessage: "Ticket reopened.",
        show: (row) => ["RESOLVED", "CLOSED"].includes(String(row.status ?? "").toUpperCase()),
      },
    ],
    stats: [
      { key: "total", label: "Tickets", compute: (rows) => rows.length, icon: <LifeBuoy className="h-5 w-5" /> },
      { key: "open", label: "Open", compute: (rows) => rows.filter((r) => r.status === "OPEN" || r.status === "IN_PROGRESS" || r.status === "REOPENED").length, color: "info", icon: <LifeBuoy className="h-5 w-5" /> },
      { key: "resolved", label: "Resolved", compute: (rows) => rows.filter((r) => r.status === "RESOLVED" || r.status === "CLOSED").length, color: "success", icon: <LifeBuoy className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/support-management/settings",
    title: "Customer Support Settings",
    description: "Support queues that route and triage incoming tickets.",
    sectionLabel: SECTION,
    rowId: "queueId",
    source: { kind: "api", useList: asQueryHook(useListSupportQueuesQuery) },
    columns: [
      textCol("name", "Queue"),
      textCol("email", "Email"),
      textCol("description", "Description"),
      textCol("isDefault", "Default"),
      textCol("ticketCounts.open", "Open"),
      textCol("ticketCounts.total", "Total"),
    ],
    searchable: (r) => `${r.name} ${r.email}`,
    create: {
      title: "Create Support Queue",
      fields: [
        { key: "name", label: "Name", type: "text", required: true },
        { key: "email", label: "Email", type: "text" },
        { key: "description", label: "Description", type: "textarea" },
      ],
      useCreate: asMutationHook(useCreateSupportQueueMutation),
    },
    stats: [
      { key: "total", label: "Queues", compute: (rows) => rows.length, icon: <Settings className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/support-management/escalation-policies",
    title: "Escalation Policies",
    description: "Rules that escalate support work when thresholds are exceeded.",
    sectionLabel: SECTION,
    rowId: "ruleId",
    source: { kind: "api", useList: asQueryHook(useListEscalationRulesQuery) },
    columns: [
      textCol("name", "Policy"),
      textCol("slaPolicy.name", "SLA Policy"),
      textCol("trigger", "Trigger"),
      textCol("thresholdMinutes", "Threshold (min)"),
      textCol("isEnabled", "Enabled"),
    ],
    searchable: (r) => `${r.name} ${r.trigger}`,
    create: {
      title: "Create Escalation Policy",
      fields: [
        { key: "name", label: "Name", type: "text", required: true },
        { key: "trigger", label: "Trigger", type: "text" },
        { key: "thresholdMinutes", label: "Threshold (minutes)", type: "number" },
      ],
      useCreate: asMutationHook(useCreateEscalationRuleMutation),
    },
    stats: [
      { key: "total", label: "Policies", compute: (rows) => rows.length, icon: <AlertTriangle className="h-5 w-5" /> },
      { key: "enabled", label: "Enabled", compute: (rows) => rows.filter((r) => r.isEnabled).length, color: "success", icon: <AlertTriangle className="h-5 w-5" /> },
    ],
  },
];