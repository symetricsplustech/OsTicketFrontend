import type { ResourceListConfig } from "@/screens/saas-admin/components/resource/types";
import { asQueryHook, asMutationHook } from "@/screens/saas-admin/components/resource/types";
import {
  useListNotificationTemplateQuery,
  useListNotificationRuleQuery,
  useListNotificationLogsQuery,
  useCreateNotificationTemplateMutation,
  useCreateNotificationRuleMutation,
} from "@services/tenantadmin";
import { statusColumn } from "./columns";
import type { Column } from "@/screens/saas-admin/components/ui/DataTable";

const TEMPLATE_PATH = "/organization/notifications-communications/email-templates";
const RULES_PATH = "/organization/notifications-communications/notification-rules";
const LOGS_PATH = "/organization/notifications-communications/notification-delivery-logs";

const templateColumns: Column<any>[] = [
  { key: "name", header: "Template", render: (row: any) => row.name },
  { key: "eventKey", header: "Event", render: (row: any) => row.eventKey },
  { key: "channel", header: "Channel", render: (row: any) => row.channel },
  statusColumn<any>("status"),
];

const rulesColumns: Column<any>[] = [
  { key: "name", header: "Rule", render: (row: any) => row.name },
  { key: "eventKey", header: "Event", render: (row: any) => row.eventKey },
  { key: "template", header: "Template", render: (row: any) => row.template?.name || "-" },
  { key: "channel", header: "Channel", render: (row: any) => row.channel },
  statusColumn<any>("status"),
];

const logsColumns: Column<any>[] = [
  { key: "id", header: "Log ID", render: (row: any) => row.id },
  { key: "eventKey", header: "Event", render: (row: any) => row.eventKey },
  { key: "channel", header: "Channel", render: (row: any) => row.channel },
  { key: "recipient", header: "Recipient", render: (row: any) => row.recipient },
  { key: "sentAt", header: "Sent", render: (row: any) => row.sentAt ? new Date(row.sentAt).toLocaleString() : "-" },
  statusColumn<any>("status"),
];

export const notificationsConfigs: ResourceListConfig[] = [
  {
    path: TEMPLATE_PATH,
    title: "Email Templates",
    description: "Notification templates for email, in-app and SMS",
    sectionLabel: "Notifications",
    rowId: "id",
    columns: templateColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListNotificationTemplateQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name} ${row.eventKey}`,
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Enabled", value: "ENABLED" },
          { label: "Disabled", value: "DISABLED" },
        ],
      },
      {
        key: "channel",
        label: "Channel",
        type: "select",
        options: [
          { label: "Email", value: "EMAIL" },
          { label: "In-App", value: "IN_APP" },
          { label: "SMS", value: "SMS" },
        ],
      },
    ],
    pageSize: 20,
    detailPath: (row: any) => `${TEMPLATE_PATH}/${row.id}`,
    create: {
      title: "Create Template",
      description: "Create a new notification template.",
      fields: [
        { key: "name", label: "Template name", type: "text", required: true },
        { key: "eventKey", label: "Event key", type: "text", required: true },
        { key: "channel", label: "Channel", type: "text", required: true },
        { key: "subject", label: "Subject", type: "text" },
        { key: "body", label: "Body", type: "textarea" },
      ],
      useCreate: asMutationHook(useCreateNotificationTemplateMutation),
      buildBody: (values: Record<string, unknown>) => ({ name: values.name, eventKey: values.eventKey, channel: values.channel, subject: values.subject, body: values.body }),
      successMessage: "Template created",
    },
  },
  {
    path: RULES_PATH,
    title: "Notification Rules",
    description: "Rules for when and how notifications are sent",
    sectionLabel: "Notifications",
    rowId: "id",
    columns: rulesColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListNotificationRuleQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.name} ${row.eventKey}`,
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Enabled", value: "ENABLED" },
          { label: "Disabled", value: "DISABLED" },
        ],
      },
    ],
    pageSize: 20,
    detailPath: (row: any) => `${RULES_PATH}/${row.id}`,
    create: {
      title: "Create Rule",
      description: "Create a new notification rule.",
      fields: [
        { key: "name", label: "Rule name", type: "text", required: true },
        { key: "eventKey", label: "Event key", type: "text", required: true },
        { key: "templateId", label: "Template ID", type: "text", required: true },
        { key: "channel", label: "Channel", type: "text", required: true },
      ],
      useCreate: asMutationHook(useCreateNotificationRuleMutation),
      buildBody: (values: Record<string, unknown>) => ({ name: values.name, eventKey: values.eventKey, templateId: values.templateId, channel: values.channel }),
      successMessage: "Rule created",
    },
  },
  {
    path: LOGS_PATH,
    title: "Notification Delivery Logs",
    description: "Delivery history and failed notifications",
    sectionLabel: "Notifications",
    rowId: "id",
    columns: logsColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListNotificationLogsQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
    },
    searchable: (row: any) => `${row.id} ${row.eventKey} ${row.recipient}`,
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Sent", value: "SENT" },
          { label: "Failed", value: "FAILED" },
          { label: "Pending", value: "PENDING" },
        ],
      },
    ],
    pageSize: 20,
    detailPath: (row: any) => `${LOGS_PATH}/${row.id}`,
  },
  {
    path: "/organization/notifications-communications/failed-delivery-history",
    title: "Failed Delivery History",
    description: "Notification delivery attempts that failed",
    sectionLabel: "Notifications",
    rowId: "id",
    columns: logsColumns,
    source: {
      kind: "api",
      useList: asQueryHook(useListNotificationLogsQuery),
      serverPagination: true,
      extractRows: (p: any) => p?.data ?? [],
      extractTotal: (p: any) => p?.meta?.total,
      buildParams: (state: any) => ({
        search: state.search.trim() || undefined,
        page: state.page,
        limit: state.pageSize,
        status: "FAILED",
      }),
    },
    searchable: (row: any) => `${row.id} ${row.eventKey} ${row.recipient}`,
    pageSize: 20,
    detailPath: (row: any) => `/organization/notifications-communications/failed-delivery-history/${row.id}`,
  },
];