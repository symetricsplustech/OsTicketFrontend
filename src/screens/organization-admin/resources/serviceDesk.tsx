import type { ResourceListConfig } from "@/screens/saas-admin/components/resource/types";
import { asQueryHook, asMutationHook } from "@/screens/saas-admin/components/resource/types";
import {
  useListServiceDeskQueueQuery,
  useListOperatingHoursQuery,
  useListRoutingRuleQuery,
  useListIncidentQuery,
  useListIncidentCategoryQuery,
  useListIncidentPriorityQuery,
  useListEscalationRuleQuery,
  useCreateServiceDeskQueueMutation,
  useCreateOperatingHoursMutation,
  useCreateRoutingRuleMutation,
} from "@services/tenantadmin";
import { statusColumn } from "./columns";
import type { Column } from "@/screens/saas-admin/components/ui/DataTable";

const QUEUES_PATH = "/organization/service-desk/assignment-groups";
const HOURS_PATH = "/organization/service-desk/support-coverage-calendar";
const ROUTING_PATH = "/organization/service-desk/ticket-routing-rules";
const TICKETS_PATH = "/organization/service-desk/all-service-desk-tickets";
const MY_QUEUES_PATH = "/organization/service-desk/my-organization-s-queues";
const TICKET_CATS_PATH = "/organization/service-desk/ticket-categories";
const TICKET_PRI_PATH = "/organization/service-desk/ticket-priority-matrix";
const ESCALATION_PATH = "/organization/service-desk/escalation-rules";
const OP_HOURS_PATH = "/organization/service-desk/service-desk-operating-hours";

const queueColumns: Column<any>[] = [
  { key: "name", header: "Queue", render: (row: any) => row.name },
  { key: "description", header: "Description", render: (row: any) => row.description || "" },
  { key: "isDefault", header: "Default", render: (row: any) => row.isDefault ? "Yes" : "No" },
  statusColumn<any>("status"),
];

const hoursColumns: Column<any>[] = [
  { key: "name", header: "Schedule", render: (row: any) => row.name },
  { key: "timezone", header: "Timezone", render: (row: any) => row.timezone },
  { key: "isDefault", header: "Default", render: (row: any) => row.isDefault ? "Yes" : "No" },
  statusColumn<any>("status"),
];

const routingColumns: Column<any>[] = [
  { key: "name", header: "Rule", render: (row: any) => row.name },
  { key: "condition", header: "Condition", render: (row: any) => row.condition || "-" },
  { key: "targetQueue", header: "Target Queue", render: (row: any) => row.targetQueue?.name || "-" },
  { key: "priority", header: "Priority", render: (row: any) => row.priority ?? 0 },
  statusColumn<any>("status"),
];

const ticketColumns: Column<any>[] = [
  { key: "id", header: "Ticket", render: (row: any) => row.id },
  { key: "title", header: "Title", render: (row: any) => row.title },
  { key: "category", header: "Category", render: (row: any) => row.category?.name || "-" },
  { key: "priority", header: "Priority", render: (row: any) => row.priority?.name || "-" },
  statusColumn<any>("status"),
  { key: "assignee", header: "Assignee", render: (row: any) => row.assignee?.displayName || "Unassigned" },
  { key: "createdAt", header: "Created", render: (row: any) => row.createdAt ? new Date(row.createdAt).toLocaleString() : "-" },
];

const ticketCatColumns: Column<any>[] = [
  { key: "name", header: "Category", render: (row: any) => row.name },
  { key: "description", header: "Description", render: (row: any) => row.description || "" },
  statusColumn<any>("status"),
];

const ticketPriColumns: Column<any>[] = [
  { key: "name", header: "Priority", render: (row: any) => row.name },
  { key: "impact", header: "Impact", render: (row: any) => row.impact },
  { key: "urgency", header: "Urgency", render: (row: any) => row.urgency },
  { key: "responseTime", header: "Response (min)", render: (row: any) => row.responseTime },
  { key: "resolutionTime", header: "Resolution (min)", render: (row: any) => row.resolutionTime },
  statusColumn<any>("status"),
];

const escalationColumns: Column<any>[] = [
  { key: "name", header: "Rule", render: (row: any) => row.name },
  { key: "trigger", header: "Trigger", render: (row: any) => row.trigger },
  { key: "thresholdMinutes", header: "Threshold (min)", render: (row: any) => row.thresholdMinutes },
  { key: "slaPolicy", header: "SLA Policy", render: (row: any) => row.slaPolicyId || "-" },
  { key: "isEnabled", header: "Enabled", render: (row: any) => row.isEnabled ? "Yes" : "No" },
];

export const serviceDeskConfigs: ResourceListConfig[] = [
  {
    path: QUEUES_PATH,
    title: "Assignment Groups",
    description: "Service desk queues and assignment groups",
    sectionLabel: "Service Desk",
    rowId: "id",
    columns: queueColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListServiceDeskQueueQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name} ${row.description || ""}`,
    pageSize: 20,
    detailPath: (row: any) => `${QUEUES_PATH}/${row.id}`,
    create: {
      title: "Create Queue",
      description: "Create a new service desk queue.",
      fields: [
        { key: "name", label: "Queue name", type: "text", required: true },
        { key: "description", label: "Description", type: "textarea" },
        { key: "isDefault", label: "Default queue", type: "boolean" },
      ],
      useCreate: asMutationHook(useCreateServiceDeskQueueMutation),
      buildBody: (values: Record<string, unknown>) => ({ name: values.name, description: values.description, isDefault: values.isDefault === true }),
      successMessage: "Queue created",
    },
  },
  {
    path: HOURS_PATH,
    title: "Support Coverage Calendar",
    description: "Operating hours and support coverage schedules",
    sectionLabel: "Service Desk",
    rowId: "id",
    columns: hoursColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListOperatingHoursQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name} ${row.timezone}`,
    pageSize: 20,
    detailPath: (row: any) => `${HOURS_PATH}/${row.id}`,
    create: {
      title: "Create Schedule",
      description: "Create a new operating hours schedule.",
      fields: [
        { key: "name", label: "Schedule name", type: "text", required: true },
        { key: "timezone", label: "Timezone", type: "text", required: true },
        { key: "isDefault", label: "Default schedule", type: "boolean" },
      ],
      useCreate: asMutationHook(useCreateOperatingHoursMutation),
      buildBody: (values: Record<string, unknown>) => ({ name: values.name, timezone: values.timezone, isDefault: values.isDefault === true }),
      successMessage: "Schedule created",
    },
  },
  {
    path: ROUTING_PATH,
    title: "Ticket Routing Rules",
    description: "Automatic ticket routing and assignment rules",
    sectionLabel: "Service Desk",
    rowId: "id",
    columns: routingColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListRoutingRuleQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name} ${row.condition || ""}`,
    pageSize: 20,
    detailPath: (row: any) => `${ROUTING_PATH}/${row.id}`,
    create: {
      title: "Create Routing Rule",
      description: "Create a new ticket routing rule.",
      fields: [
        { key: "name", label: "Rule name", type: "text", required: true },
        { key: "condition", label: "Condition", type: "textarea", required: true },
        { key: "targetQueueId", label: "Target queue ID", type: "text", required: true },
        { key: "priority", label: "Priority", type: "number" },
      ],
      useCreate: asMutationHook(useCreateRoutingRuleMutation),
      buildBody: (values: Record<string, unknown>) => ({ name: values.name, condition: values.condition, targetQueueId: values.targetQueueId, priority: Number(values.priority) || 0 }),
      successMessage: "Routing rule created",
    },
  },
  {
    path: TICKETS_PATH,
    title: "All Service Desk Tickets",
    description: "Tickets routed through the service desk",
    sectionLabel: "Service Desk",
    rowId: "id",
    columns: ticketColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListIncidentQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.id} ${row.title} ${row.category?.name || ""}`,
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Open", value: "OPEN" },
          { label: "In Progress", value: "IN_PROGRESS" },
          { label: "Resolved", value: "RESOLVED" },
          { label: "Closed", value: "CLOSED" },
        ],
      },
    ],
    pageSize: 20,
    detailPath: (row: any) => `${TICKETS_PATH}/${row.id}`,
  },
  {
    path: MY_QUEUES_PATH,
    title: "My Organization's Queues",
    description: "Queues serving this organization",
    sectionLabel: "Service Desk",
    rowId: "id",
    columns: queueColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListServiceDeskQueueQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name} ${row.description || ""}`,
    pageSize: 20,
    detailPath: (row: any) => `${MY_QUEUES_PATH}/${row.id}`,
  },
  {
    path: TICKET_CATS_PATH,
    title: "Ticket Categories",
    description: "Categories used to classify service desk tickets",
    sectionLabel: "Service Desk",
    rowId: "id",
    columns: ticketCatColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListIncidentCategoryQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name} ${row.description || ""}`,
    pageSize: 20,
    detailPath: (row: any) => `${TICKET_CATS_PATH}/${row.id}`,
  },
  {
    path: TICKET_PRI_PATH,
    title: "Ticket Priority Matrix",
    description: "Priority levels mapped from impact and urgency",
    sectionLabel: "Service Desk",
    rowId: "id",
    columns: ticketPriColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListIncidentPriorityQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name}`,
    pageSize: 20,
    detailPath: (row: any) => `${TICKET_PRI_PATH}/${row.id}`,
  },
  {
    path: ESCALATION_PATH,
    title: "Escalation Rules",
    description: "Rules that escalate overdue service desk tickets",
    sectionLabel: "Service Desk",
    rowId: "id",
    columns: escalationColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListEscalationRuleQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name} ${row.trigger}`,
    pageSize: 20,
    detailPath: (row: any) => `${ESCALATION_PATH}/${row.id}`,
  },
  {
    path: OP_HOURS_PATH,
    title: "Service Desk Operating Hours",
    description: "Hours during which the service desk is staffed",
    sectionLabel: "Service Desk",
    rowId: "id",
    columns: hoursColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListOperatingHoursQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name} ${row.timezone}`,
    pageSize: 20,
    detailPath: (row: any) => `${OP_HOURS_PATH}/${row.id}`,
  },
];
