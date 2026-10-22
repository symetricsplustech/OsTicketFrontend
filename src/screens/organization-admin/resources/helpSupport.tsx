import type { ResourceListConfig } from "@/screens/saas-admin/components/resource/types";
import { asQueryHook, asMutationHook } from "@/screens/saas-admin/components/resource/types";
import {
  useListSupportTicketQuery,
  useListKnowledgeArticleQuery,
  useCreateSupportTicketMutation,
} from "@services/tenantadmin";
import { statusColumn } from "./columns";
import type { Column } from "@/screens/saas-admin/components/ui/DataTable";

const HELP_CENTER_PATH = "/organization/help-support/help-center";
const DOCS_PATH = "/organization/help-support/documentation";
const GETTING_STARTED_PATH = "/organization/help-support/getting-started";
const CONTACT_SUPPORT_PATH = "/organization/help-support/contact-platform-support";
const CREATE_TICKET_PATH = "/organization/help-support/create-support-ticket";
const MY_TICKETS_PATH = "/organization/help-support/my-support-tickets";
const TICKET_HISTORY_PATH = "/organization/help-support/support-ticket-history";
const SERVICE_STATUS_PATH = "/organization/help-support/service-status";
const REPORT_PROBLEM_PATH = "/organization/help-support/report-a-problem";
const REQUEST_FEATURE_PATH = "/organization/help-support/request-a-feature";

const articleColumns: Column<any>[] = [
  { key: "title", header: "Article", render: (row: any) => row.title },
  { key: "category", header: "Category", render: (row: any) => row.category?.name || row.category || "-" },
  { key: "views", header: "Views", render: (row: any) => row.viewCount ?? 0 },
  { key: "updatedAt", header: "Updated", render: (row: any) => row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : "-" },
];

const ticketColumns: Column<any>[] = [
  { key: "id", header: "Ticket", render: (row: any) => row.id },
  { key: "subject", header: "Subject", render: (row: any) => row.subject },
  { key: "status", header: "Status", render: (row: any) => row.status },
  { key: "priority", header: "Priority", render: (row: any) => row.priority },
  { key: "createdAt", header: "Created", render: (row: any) => row.createdAt ? new Date(row.createdAt).toLocaleString() : "-" },
];

const statusColumns: Column<any>[] = [
  { key: "service", header: "Service", render: (row: any) => row.service },
  { key: "status", header: "Status", render: (row: any) => row.status },
  { key: "updatedAt", header: "Last Updated", render: (row: any) => row.updatedAt ? new Date(row.updatedAt).toLocaleString() : "-" },
];

export const helpSupportConfigs: ResourceListConfig[] = [
  {
    path: HELP_CENTER_PATH,
    title: "Help Center",
    description: "Browse help articles and guides",
    sectionLabel: "Help & Support",
    rowId: "id",
    columns: articleColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListKnowledgeArticleQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.title} ${row.category?.name || row.category || ""}`,
    pageSize: 20,
    detailPath: (row: any) => `${HELP_CENTER_PATH}/${row.id}`,
  },
  {
    path: DOCS_PATH,
    title: "Documentation",
    description: "Complete product documentation",
    sectionLabel: "Help & Support",
    rowId: "id",
    columns: articleColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListKnowledgeArticleQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.title} ${row.category?.name || row.category || ""}`,
    pageSize: 20,
    detailPath: (row: any) => `${DOCS_PATH}/${row.id}`,
  },
  {
    path: GETTING_STARTED_PATH,
    title: "Getting Started",
    description: "Quick start guides for new users",
    sectionLabel: "Help & Support",
    rowId: "id",
    columns: articleColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListKnowledgeArticleQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.title}`,
    pageSize: 20,
    detailPath: (row: any) => `${GETTING_STARTED_PATH}/${row.id}`,
  },
  {
    path: CONTACT_SUPPORT_PATH,
    title: "Contact Platform Support",
    description: "Contact the platform support team",
    sectionLabel: "Help & Support",
    rowId: "field",
    columns: [
      { key: "field", header: "Field", render: (row: any) => row.field },
      { key: "value", header: "Value", render: (row: any) => row.value },
    ],
    source: {
      kind: "static",
      rows: [],
    },
    emptyTitle: "No support contact details configured",
    emptyDescription:
      "Support contact information hasn't been configured for this deployment.",
    pageSize: 20,
  },
  {
    path: CREATE_TICKET_PATH,
    title: "Create Support Ticket",
    description: "Submit a ticket to platform support",
    sectionLabel: "Help & Support",
    rowId: "field",
    columns: [
      { key: "field", header: "Field", render: (row: any) => row.field },
    ],
    source: {
      kind: "static",
      rows: [],
    },
    pageSize: 20,
    create: {
      title: "Create Support Ticket",
      description: "Submit a support request to the platform team",
      fields: [
        { key: "subject", label: "Subject", type: "text", required: true },
        { key: "category", label: "Category", type: "select", required: true, options: [
          { label: "Technical Issue", value: "technical" },
          { label: "Billing Question", value: "billing" },
          { label: "Feature Request", value: "feature" },
          { label: "General Question", value: "general" },
        ]},
        { key: "priority", label: "Priority", type: "select", required: true, options: [
          { label: "Low", value: "LOW" },
          { label: "Normal", value: "NORMAL" },
          { label: "High", value: "HIGH" },
          { label: "Critical", value: "URGENT" },
        ]},
        { key: "body", label: "Description", type: "textarea", required: true },
        { key: "attachments", label: "Attachments", type: "text", placeholder: "File URLs (comma-separated)" },
      ],
      useCreate: asMutationHook(useCreateSupportTicketMutation),
      buildBody: (values: Record<string, unknown>) => ({
        subject: values.subject,
        category: values.category,
        priority: values.priority,
        body: values.body,
        attachments: String(values.attachments).split(",").map(s => s.trim()).filter(Boolean),
      }),
      successMessage: "Support ticket submitted",
    },
  },
  {
    path: MY_TICKETS_PATH,
    title: "My Support Tickets",
    description: "Your support tickets with platform team",
    sectionLabel: "Help & Support",
    rowId: "id",
    columns: ticketColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListSupportTicketQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.id} ${row.subject}`,
    filters: [
      { key: "status", label: "Status", type: "select", options: [
        { label: "Open", value: "OPEN" },
        { label: "In Progress", value: "IN_PROGRESS" },
        { label: "Resolved", value: "RESOLVED" },
        { label: "Closed", value: "CLOSED" },
      ]},
    ],
    pageSize: 20,
    detailPath: (row: any) => `${MY_TICKETS_PATH}/${row.id}`,
  },
  {
    path: TICKET_HISTORY_PATH,
    title: "Support Ticket History",
    description: "All your past support tickets",
    sectionLabel: "Help & Support",
    rowId: "id",
    columns: ticketColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListSupportTicketQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.id} ${row.subject}`,
    pageSize: 20,
    detailPath: (row: any) => `${MY_TICKETS_PATH}/${row.id}`,
  },
  {
    path: SERVICE_STATUS_PATH,
    title: "Service Status",
    description: "Platform service status and incidents",
    sectionLabel: "Help & Support",
    rowId: "service",
    columns: statusColumns,
    source: {
      kind: "static",
      rows: [],
    },
    emptyTitle: "No status feed connected",
    emptyDescription:
      "Platform status data isn't connected for this deployment.",
    pageSize: 20,
  },
  {
    path: REPORT_PROBLEM_PATH,
    title: "Report a Problem",
    description: "Report a platform issue",
    sectionLabel: "Help & Support",
    rowId: "field",
    columns: [
      { key: "field", header: "Field", render: (row: any) => row.field },
    ],
    source: {
      kind: "static",
      rows: [],
    },
    pageSize: 20,
    create: {
      title: "Report a Problem",
      description: "Report a bug or issue with the platform",
      fields: [
        { key: "title", label: "Title", type: "text", required: true },
        { key: "description", label: "Description", type: "textarea", required: true },
        { key: "steps", label: "Steps to Reproduce", type: "textarea" },
        { key: "expected", label: "Expected Behavior", type: "textarea" },
        { key: "actual", label: "Actual Behavior", type: "textarea" },
        { key: "browser", label: "Browser/OS", type: "text" },
        { key: "severity", label: "Severity", type: "select", required: true, options: [
          { label: "Minor", value: "NORMAL" },
          { label: "Major", value: "HIGH" },
          { label: "Critical", value: "URGENT" },
        ]},
      ],
      useCreate: asMutationHook(useCreateSupportTicketMutation),
      buildBody: (values: Record<string, unknown>) => ({
        subject: `[BUG] ${values.title}`,
        category: "technical",
        priority: values.severity || "NORMAL",
        body: `${values.description}\n\nSteps: ${values.steps}\n\nExpected: ${values.expected}\n\nActual: ${values.actual}\n\nBrowser: ${values.browser}`,
      }),
      successMessage: "Problem reported",
    },
  },
  {
    path: REQUEST_FEATURE_PATH,
    title: "Request a Feature",
    description: "Suggest a new feature or improvement",
    sectionLabel: "Help & Support",
    rowId: "field",
    columns: [
      { key: "field", header: "Field", render: (row: any) => row.field },
    ],
    source: {
      kind: "static",
      rows: [],
    },
    pageSize: 20,
    create: {
      title: "Request a Feature",
      description: "Submit a feature request",
      fields: [
        { key: "title", label: "Feature Title", type: "text", required: true },
        { key: "description", label: "Description", type: "textarea", required: true },
        { key: "useCase", label: "Use Case", type: "textarea", required: true },
        { key: "priority", label: "Priority", type: "select", options: [
          { label: "Nice to have", value: "LOW" },
          { label: "Important", value: "NORMAL" },
          { label: "Critical", value: "HIGH" },
        ]},
      ],
      useCreate: asMutationHook(useCreateSupportTicketMutation),
      buildBody: (values: Record<string, unknown>) => ({
        subject: `[FEATURE] ${values.title}`,
        category: "feature",
        priority: values.priority || "NORMAL",
        body: `${values.description}\n\nUse Case: ${values.useCase}`,
      }),
      successMessage: "Feature request submitted",
    },
  },
];

