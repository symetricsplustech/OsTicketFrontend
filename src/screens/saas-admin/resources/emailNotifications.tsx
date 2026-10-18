import { Settings, Mail, Bell, ClipboardList, Send, BadgeCheck, Power, PowerOff, Eye } from "lucide-react";
import { asQueryHook, asMutationHook, VARIANT_FROM_STATUS } from "../components/resource/types";
import type { ResourceListConfig } from "../components/resource/types";
import { mutationBody } from "../components/resource/helpers";
import { textCol, statusCol, dateCol } from "./columns";
import {
  useListEmailProvidersQuery,
  useCreateEmailProviderMutation,
  useTestEmailProviderMutation,
  useVerifyEmailProviderMutation,
  useDisableEmailProviderMutation,
  useListEmailTemplatesQuery,
  useCreateEmailTemplateMutation,
  usePreviewEmailTemplateMutation,
  useListNotificationRulesQuery,
  useCreateNotificationRuleMutation,
  useEnableNotificationRuleMutation,
  useDisableNotificationRuleMutation,
  useListDeliveryLogsQuery,
} from "@services/saasadmin";

const SECTION = "Email & Notifications";

const PROVIDER_TYPES = [
  { value: "SMTP", label: "SMTP" },
  { value: "SES", label: "Amazon SES" },
  { value: "MAILGUN", label: "Mailgun" },
  { value: "SENDGRID", label: "SendGrid" },
];

const DELIVERY_STATUS = [
  { value: "SENT", label: "Sent" },
  { value: "QUEUED", label: "Queued" },
  { value: "FAILED", label: "Failed" },
  { value: "BOUNCED", label: "Bounced" },
  { value: "SUPPRESSED", label: "Suppressed" },
];

export const EMAIL_NOTIFICATION_LISTS: ResourceListConfig[] = [
  {
    path: "/saas-admin/email-notifications/server-settings",
    title: "Email Server Settings",
    description: "Email providers configured for platform outbound mail.",
    sectionLabel: SECTION,
    rowId: "providerId",
    source: { kind: "api", useList: asQueryHook(useListEmailProvidersQuery) },
    columns: [
      textCol("name", "Provider"),
      textCol("providerType", "Type"),
      textCol("fromEmail", "From"),
      statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
      textCol("isDefault", "Default"),
    ],
    searchable: (r) => `${r.name} ${r.fromEmail} ${r.providerType}`,
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "ACTIVE", label: "Active" },
          { value: "UNVERIFIED", label: "Unverified" },
          { value: "DISABLED", label: "Disabled" },
          { value: "ERROR", label: "Error" },
        ],
        placeholder: "All statuses",
      },
    ],
    create: {
      title: "Add Email Provider",
      fields: [
        { key: "name", label: "Name", type: "text", required: true },
        { key: "providerType", label: "Provider Type", type: "select", options: PROVIDER_TYPES, required: true },
        { key: "fromEmail", label: "From Email", type: "text", required: true },
        { key: "fromName", label: "From Name", type: "text" },
        { key: "replyTo", label: "Reply To", type: "text" },
      ],
      useCreate: asMutationHook(useCreateEmailProviderMutation),
      successMessage: "Email provider added.",
    },
    actions: [
      {
        label: "Verify",
        icon: <BadgeCheck className="h-3.5 w-3.5" />,
        useAction: asMutationHook(useVerifyEmailProviderMutation),
        buildArg: (row) => String(row.providerId ?? row.id),
        confirm: (row) => `Verify provider "${row.name}"? Credentials will be checked against the provider.`,
        successMessage: "Provider verified.",
        show: (row) => String(row.status ?? "").toUpperCase() !== "ACTIVE",
      },
      {
        label: "Send Test",
        icon: <Send className="h-3.5 w-3.5" />,
        useAction: asMutationHook(useTestEmailProviderMutation),
        buildArg: (row) => ({ providerId: String(row.providerId ?? row.id) }),
        successMessage: "Test email dispatched.",
        show: (row) => String(row.status ?? "").toUpperCase() === "ACTIVE",
      },
      {
        label: "Disable",
        icon: <PowerOff className="h-3.5 w-3.5" />,
        variant: "danger",
        useAction: asMutationHook(useDisableEmailProviderMutation),
        buildArg: (row) => String(row.providerId ?? row.id),
        confirm: (row) => `Disable provider "${row.name}"? Outbound mail will stop until another provider is active.`,
        successMessage: "Provider disabled.",
        show: (row) => String(row.status ?? "").toUpperCase() === "ACTIVE",
      },
    ],
    stats: [
      { key: "total", label: "Providers", compute: (rows) => rows.length, icon: <Settings className="h-5 w-5" /> },
      { key: "active", label: "Active", compute: (rows) => rows.filter((r) => r.status === "ACTIVE").length, color: "success", icon: <Settings className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/email-notifications/templates",
    title: "Email Templates",
    description: "Reusable email templates keyed by event channel.",
    sectionLabel: SECTION,
    rowId: "templateId",
    source: { kind: "api", useList: asQueryHook(useListEmailTemplatesQuery) },
    columns: [
      { key: "key", header: "Key", render: (r) => <span className="font-mono text-xs">{String(r.key ?? "—")}</span> },
      textCol("name", "Template"),
      textCol("channel", "Channel"),
      textCol("subject", "Subject"),
      statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
    ],
    searchable: (r) => `${r.name} ${r.key} ${r.subject}`,
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "ENABLED", label: "Enabled" },
          { value: "DRAFT", label: "Draft" },
          { value: "DISABLED", label: "Disabled" },
        ],
        placeholder: "All statuses",
      },
    ],
    create: {
      title: "Create Email Template",
      fields: [
        { key: "key", label: "Key", type: "text", required: true },
        { key: "name", label: "Name", type: "text", required: true },
        { key: "channel", label: "Channel", type: "text" },
        { key: "subject", label: "Subject", type: "text" },
      ],
      useCreate: asMutationHook(useCreateEmailTemplateMutation),
    },
    actions: [
      {
        label: "Preview",
        icon: <Eye className="h-3.5 w-3.5" />,
        useAction: asMutationHook(usePreviewEmailTemplateMutation),
        buildArg: (row) => ({ templateId: String(row.templateId ?? row.id) }),
        successMessage: "Template preview rendered.",
        reveal: (result) => {
          const body = mutationBody(result);
          const missing = Array.isArray(body.missingVariables) ? (body.missingVariables as string[]) : [];
          return {
            title: "Template Preview",
            description: missing.length > 0 ? `Missing variables: ${missing.join(", ")}` : undefined,
            fields: [
              { label: "Subject", value: String(body.subject ?? "(none)") },
              { label: "Body", value: String(body.body ?? "") },
            ],
          };
        },
      },
    ],
    stats: [
      { key: "total", label: "Templates", compute: (rows) => rows.length, icon: <Mail className="h-5 w-5" /> },
      { key: "enabled", label: "Enabled", compute: (rows) => rows.filter((r) => r.status === "ENABLED").length, color: "success", icon: <Mail className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/email-notifications/rules",
    title: "Notification Rules",
    description: "Event-driven rules that dispatch notification deliveries.",
    sectionLabel: SECTION,
    rowId: "ruleId",
    source: { kind: "api", useList: asQueryHook(useListNotificationRulesQuery) },
    columns: [
      textCol("name", "Rule"),
      { key: "eventKey", header: "Event", render: (r) => <span className="font-mono text-xs">{String(r.eventKey ?? "—")}</span> },
      textCol("channel", "Channel"),
      textCol("template.name", "Template"),
      textCol("priority", "Priority"),
      textCol("isEnabled", "Enabled"),
    ],
    searchable: (r) => `${r.name} ${r.eventKey}`,
    create: {
      title: "Create Notification Rule",
      fields: [
        { key: "name", label: "Name", type: "text", required: true },
        { key: "eventKey", label: "Event Key", type: "text" },
        { key: "channel", label: "Channel", type: "text" },
        { key: "priority", label: "Priority", type: "number" },
      ],
      useCreate: asMutationHook(useCreateNotificationRuleMutation),
    },
    actions: [
      {
        label: "Enable",
        icon: <Power className="h-3.5 w-3.5" />,
        useAction: asMutationHook(useEnableNotificationRuleMutation),
        buildArg: (row) => String(row.ruleId ?? row.id),
        successMessage: "Rule enabled.",
        show: (row) => !row.isEnabled,
      },
      {
        label: "Disable",
        icon: <PowerOff className="h-3.5 w-3.5" />,
        variant: "danger",
        useAction: asMutationHook(useDisableNotificationRuleMutation),
        buildArg: (row) => String(row.ruleId ?? row.id),
        confirm: (row) => `Disable rule "${row.name}"? Matching events will no longer dispatch notifications.`,
        successMessage: "Rule disabled.",
        show: (row) => Boolean(row.isEnabled),
      },
    ],
    stats: [
      { key: "total", label: "Rules", compute: (rows) => rows.length, icon: <Bell className="h-5 w-5" /> },
      { key: "enabled", label: "Enabled", compute: (rows) => rows.filter((r) => r.isEnabled).length, color: "success", icon: <Bell className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/email-notifications/inbound",
    title: "Inbound Email",
    description: "Providers servicing inbound email routing (from/reply-to addresses).",
    sectionLabel: SECTION,
    rowId: "providerId",
    source: { kind: "api", useList: asQueryHook(useListEmailProvidersQuery) },
    columns: [
      textCol("name", "Provider"),
      textCol("providerType", "Type"),
      textCol("fromEmail", "From"),
      textCol("replyTo", "Reply To"),
      statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
    ],
    searchable: (r) => `${r.name} ${r.fromEmail} ${r.replyTo}`,
    stats: [
      { key: "total", label: "Providers", compute: (rows) => rows.length, icon: <Mail className="h-5 w-5" /> },
    ],
  },
  {
    path: "/saas-admin/email-notifications/delivery-logs",
    title: "Delivery Logs",
    description: "Delivery history for emails and notifications across the platform.",
    sectionLabel: SECTION,
    rowId: "deliveryId",
    source: { kind: "api", useList: asQueryHook(useListDeliveryLogsQuery) },
    columns: [
      { key: "id", header: "Delivery", render: (r) => <span className="font-mono text-xs">{String((r.id ?? r.deliveryId ?? "—").toString().slice(0, 8))}</span> },
      textCol("channel", "Channel"),
      textCol("recipient", "Recipient"),
      textCol("subject", "Subject"),
      statusCol("status", "Status", (r) => VARIANT_FROM_STATUS(String(r.status))),
      dateCol("sentAt", "Sent"),
    ],
    searchable: (r) => `${r.recipient} ${r.subject} ${r.channel}`,
    filters: [
      { key: "status", label: "Status", type: "select", options: DELIVERY_STATUS, placeholder: "All statuses" },
    ],
    stats: [
      { key: "total", label: "Deliveries", compute: (rows) => rows.length, icon: <ClipboardList className="h-5 w-5" /> },
      { key: "sent", label: "Sent", compute: (rows) => rows.filter((r) => r.status === "SENT").length, color: "success", icon: <ClipboardList className="h-5 w-5" /> },
      { key: "failed", label: "Failed", compute: (rows) => rows.filter((r) => r.status === "FAILED" || r.status === "BOUNCED").length, color: "danger", icon: <ClipboardList className="h-5 w-5" /> },
    ],
  },
];