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

export interface ServiceDeskQueue {
  id: string;
  name: string;
  email: string | null;
  description: string | null;
  operatingHoursId: string | null;
  isDefault: boolean;
  status: string;
  settings: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface OperatingHours {
  id: string;
  name: string;
  timezone: string;
  schedule: Record<string, unknown> | null;
  holidays: unknown[] | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoutingRule {
  id: string;
  name: string;
  queueId: string | null;
  priority: number;
  conditions: Record<string, unknown> | null;
  actions: unknown[] | null;
  isEnabled: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  eventKey: string;
  channel: string;
  subject: string | null;
  body: string;
  format: string;
  locale: string | null;
  isEnabled: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationRule {
  id: string;
  name: string;
  eventKey: string;
  templateId: string | null;
  channel: string;
  recipients: unknown[] | null;
  conditions: Record<string, unknown> | null;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationLog {
  id: string;
  ruleId: string | null;
  templateId: string | null;
  channel: string;
  recipient: string | null;
  status: string;
  error: string | null;
  sentAt: string | null;
  createdAt: string;
}

export interface Integration {
  id: string;
  name: string;
  provider: string;
  category: string | null;
  description: string | null;
  configKeys: string[];
  configured: boolean;
  isEnabled: boolean;
  status: string;
  lastTestedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationLog {
  id: string;
  integrationId: string | null;
  outcome: string;
  message: string | null;
  createdAt: string;
}

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  status: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  description: string | null;
  eventKeys: string[];
  status: string;
  isEnabled: boolean;
  lastDeliveryAt: string | null;
  failureCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string | null;
  eventKey: string | null;
  status: string;
  statusCode: number | null;
  error: string | null;
  attempt: number;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  filename: string;
  mimeType: string;
  size: number;
  storageKey: string;
  resourceType: string | null;
  resourceId: string | null;
  uploadedById: string | null;
  createdAt: string;
}

export const SERVICE_DESK_QUEUES_PATH = "/itsm/service-desk/queues";
export const SERVICE_DESK_HOURS_PATH = "/itsm/service-desk/operating-hours";
export const SERVICE_DESK_ROUTING_PATH = "/itsm/service-desk/routing-rules";
export const NOTIFICATION_TEMPLATES_PATH = "/itsm/notifications/templates";
export const NOTIFICATION_RULES_PATH = "/itsm/notifications/rules";
export const INTEGRATIONS_PATH = "/itsm/integrations";
export const API_KEYS_PATH = "/itsm/api-keys";
export const WEBHOOKS_PATH = "/itsm/webhooks";

export const serviceDeskApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    ...crudEndpoints<ServiceDeskQueue, "ServiceDeskQueue">(build, {
      path: SERVICE_DESK_QUEUES_PATH,
      tag: "ServiceDeskQueue",
    }),
    setDefaultQueue: transitionEndpoint<ServiceDeskQueue, "ServiceDeskQueue">(
      build,
      SERVICE_DESK_QUEUES_PATH,
      "ServiceDeskQueue",
      "/set-default",
    ),
    ...crudEndpoints<OperatingHours, "OperatingHours">(build, {
      path: SERVICE_DESK_HOURS_PATH,
      tag: "OperatingHours",
    }),
    setDefaultOperatingHours: transitionEndpoint<
      OperatingHours,
      "OperatingHours"
    >(build, SERVICE_DESK_HOURS_PATH, "OperatingHours", "/set-default"),
    ...crudEndpoints<RoutingRule, "RoutingRule">(build, {
      path: SERVICE_DESK_ROUTING_PATH,
      tag: "RoutingRule",
    }),
  }),
});

export const {
  useListServiceDeskQueueQuery,
  useGetServiceDeskQueueQuery,
  useCreateServiceDeskQueueMutation,
  useUpdateServiceDeskQueueMutation,
  useDeleteServiceDeskQueueMutation,
  useSetDefaultQueueMutation,
  useListOperatingHoursQuery,
  useGetOperatingHoursQuery,
  useCreateOperatingHoursMutation,
  useUpdateOperatingHoursMutation,
  useDeleteOperatingHoursMutation,
  useSetDefaultOperatingHoursMutation,
  useListRoutingRuleQuery,
  useGetRoutingRuleQuery,
  useCreateRoutingRuleMutation,
  useUpdateRoutingRuleMutation,
  useDeleteRoutingRuleMutation,
} = serviceDeskApi;

export const notificationsApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    ...crudEndpoints<NotificationTemplate, "NotificationTemplate">(build, {
      path: NOTIFICATION_TEMPLATES_PATH,
      tag: "NotificationTemplate",
    }),
    enableNotificationTemplate: transitionEndpoint<
      NotificationTemplate,
      "NotificationTemplate"
    >(build, NOTIFICATION_TEMPLATES_PATH, "NotificationTemplate", "/enable"),
    disableNotificationTemplate: transitionEndpoint<
      NotificationTemplate,
      "NotificationTemplate"
    >(build, NOTIFICATION_TEMPLATES_PATH, "NotificationTemplate", "/disable"),
    ...crudEndpoints<NotificationRule, "NotificationRule">(build, {
      path: NOTIFICATION_RULES_PATH,
      tag: "NotificationRule",
    }),
    enableNotificationRule: transitionEndpoint<
      NotificationRule,
      "NotificationRule"
    >(build, NOTIFICATION_RULES_PATH, "NotificationRule", "/enable"),
    disableNotificationRule: transitionEndpoint<
      NotificationRule,
      "NotificationRule"
    >(build, NOTIFICATION_RULES_PATH, "NotificationRule", "/disable"),
    listNotificationLogs: build.query<
      ListResponse<NotificationLog>,
      ListArgs | void
    >({
      query: (args) => ({ url: `/itsm/notifications/logs${qs(args)}` }),
      providesTags: ["NotificationLog"],
    }),
    getNotificationLog: build.query<ApiSuccess<NotificationLog>, string>({
      query: (logId) => ({
        url: resourceUrl("/itsm/notifications/logs", logId),
      }),
      providesTags: ["NotificationLog"],
    }),
  }),
});

export const {
  useListNotificationTemplateQuery,
  useGetNotificationTemplateQuery,
  useCreateNotificationTemplateMutation,
  useUpdateNotificationTemplateMutation,
  useDeleteNotificationTemplateMutation,
  useEnableNotificationTemplateMutation,
  useDisableNotificationTemplateMutation,
  useListNotificationRuleQuery,
  useGetNotificationRuleQuery,
  useCreateNotificationRuleMutation,
  useUpdateNotificationRuleMutation,
  useDeleteNotificationRuleMutation,
  useEnableNotificationRuleMutation,
  useDisableNotificationRuleMutation,
  useListNotificationLogsQuery,
  useGetNotificationLogQuery,
} = notificationsApi;

export const integrationsApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    ...crudEndpoints<Integration, "Integration">(build, {
      path: INTEGRATIONS_PATH,
      tag: "Integration",
    }),
    testIntegration: transitionEndpoint<Integration, "Integration">(
      build,
      INTEGRATIONS_PATH,
      "Integration",
      "/test",
    ),
    enableIntegration: transitionEndpoint<Integration, "Integration">(
      build,
      INTEGRATIONS_PATH,
      "Integration",
      "/enable",
    ),
    disableIntegration: transitionEndpoint<Integration, "Integration">(
      build,
      INTEGRATIONS_PATH,
      "Integration",
      "/disable",
    ),
    listIntegrationLogs: build.query<
      ListResponse<IntegrationLog>,
      { integrationId: string } & ListArgs
    >({
      query: ({ integrationId, ...args }) => ({
        url: `${resourceUrl(INTEGRATIONS_PATH, integrationId)}/logs${qs(args)}`,
      }),
      providesTags: (_r, _e, args) => [
        { type: "Integration", id: args.integrationId },
      ],
    }),
  }),
});

export const {
  useListIntegrationQuery,
  useGetIntegrationQuery,
  useCreateIntegrationMutation,
  useUpdateIntegrationMutation,
  useDeleteIntegrationMutation,
  useTestIntegrationMutation,
  useEnableIntegrationMutation,
  useDisableIntegrationMutation,
  useListIntegrationLogsQuery,
} = integrationsApi;

export const apiKeysApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    ...crudEndpoints<ApiKey, "ApiKey">(build, {
      path: API_KEYS_PATH,
      tag: "ApiKey",
    }),
    revokeApiKey: transitionEndpoint<ApiKey, "ApiKey">(
      build,
      API_KEYS_PATH,
      "ApiKey",
      "/revoke",
    ),
    rotateApiKey: transitionEndpoint<ApiKey, "ApiKey">(
      build,
      API_KEYS_PATH,
      "ApiKey",
      "/rotate",
    ),
    getApiKeyUsage: build.query<ApiSuccess<Record<string, unknown>>, string>({
      query: (apiKeyId) => ({
        url: `${resourceUrl(API_KEYS_PATH, apiKeyId)}/usage`,
      }),
      providesTags: (_r, _e, apiKeyId) => [{ type: "ApiKey", id: apiKeyId }],
    }),
  }),
});

export const {
  useListApiKeyQuery,
  useGetApiKeyQuery,
  useCreateApiKeyMutation,
  useUpdateApiKeyMutation,
  useDeleteApiKeyMutation,
  useRevokeApiKeyMutation,
  useRotateApiKeyMutation,
  useGetApiKeyUsageQuery,
} = apiKeysApi;

export const webhooksApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    ...crudEndpoints<Webhook, "Webhook">(build, {
      path: WEBHOOKS_PATH,
      tag: "Webhook",
    }),
    enableWebhook: transitionEndpoint<Webhook, "Webhook">(
      build,
      WEBHOOKS_PATH,
      "Webhook",
      "/enable",
    ),
    disableWebhook: transitionEndpoint<Webhook, "Webhook">(
      build,
      WEBHOOKS_PATH,
      "Webhook",
      "/disable",
    ),
    rotateWebhookSecret: transitionEndpoint<Webhook, "Webhook">(
      build,
      WEBHOOKS_PATH,
      "Webhook",
      "/rotate-secret",
    ),
    testWebhook: transitionEndpoint<Webhook, "Webhook">(
      build,
      WEBHOOKS_PATH,
      "Webhook",
      "/test",
    ),
    listWebhookDeliveries: build.query<
      ListResponse<WebhookDelivery>,
      { webhookId: string } & ListArgs
    >({
      query: ({ webhookId, ...args }) => ({
        url: `${resourceUrl(WEBHOOKS_PATH, webhookId)}/deliveries${qs(args)}`,
      }),
      providesTags: (_r, _e, args) => [
        { type: "WebhookDelivery", id: args.webhookId },
      ],
    }),
  }),
});

export const {
  useListWebhookQuery,
  useGetWebhookQuery,
  useCreateWebhookMutation,
  useUpdateWebhookMutation,
  useDeleteWebhookMutation,
  useEnableWebhookMutation,
  useDisableWebhookMutation,
  useRotateWebhookSecretMutation,
  useTestWebhookMutation,
  useListWebhookDeliveriesQuery,
} = webhooksApi;

export const attachmentsApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    listAttachments: build.query<ListResponse<Attachment>, ListArgs | void>({
      query: (args) => ({ url: `/itsm/attachments${qs(args)}` }),
      providesTags: ["Attachment"],
    }),
    getAttachment: build.query<ApiSuccess<Attachment>, string>({
      query: (attachmentId) => ({
        url: resourceUrl("/itsm/attachments", attachmentId),
      }),
      providesTags: ["Attachment"],
    }),
    createAttachment: build.mutation<
      ApiSuccess<Attachment>,
      Record<string, unknown>
    >({
      query: (body) => ({ url: "/itsm/attachments", method: "POST", body }),
      invalidatesTags: ["Attachment"],
    }),
    deleteAttachment: build.mutation<ApiSuccess<unknown>, string>({
      query: (attachmentId) => ({
        url: resourceUrl("/itsm/attachments", attachmentId),
        method: "DELETE",
      }),
      invalidatesTags: ["Attachment"],
    }),
  }),
});

export const {
  useListAttachmentsQuery,
  useGetAttachmentQuery,
  useCreateAttachmentMutation,
  useDeleteAttachmentMutation,
} = attachmentsApi;
