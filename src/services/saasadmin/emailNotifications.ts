import { saasadminApi } from "./base";
import type { ApiSuccess, ApiRecord, ListQuery } from "./types";

/**
 * Email notifications (providers, templates, rules, delivery logs) — mounted at
 * `/admin/email-notifications`.
 */
export const emailNotificationsApi = saasadminApi.injectEndpoints({
  endpoints: (build) => ({
    listEmailProviders: build.query<ApiSuccess<ApiRecord[]>, void>({
      query: () => ({ url: "/admin/email-notifications/providers" }),
      providesTags: ["EmailNotification"],
    }),
    createEmailProvider: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>({
      query: (body) => ({ url: "/admin/email-notifications/providers", method: "POST", body }),
      invalidatesTags: ["EmailNotification"],
    }),
    getEmailProvider: build.query<ApiSuccess<ApiRecord>, string>({
      query: (providerId) => ({
        url: `/admin/email-notifications/providers/${encodeURIComponent(providerId)}`,
      }),
      providesTags: (_r, _e, providerId) => [{ type: "EmailNotification", id: providerId }],
    }),
    updateEmailProvider: build.mutation<ApiSuccess<ApiRecord>, { providerId: string; body: ApiRecord }>({
      query: ({ providerId, body }) => ({
        url: `/admin/email-notifications/providers/${encodeURIComponent(providerId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { providerId }) => [
        "EmailNotification",
        { type: "EmailNotification", id: providerId },
      ],
    }),
    testEmailProvider: build.mutation<ApiSuccess<ApiRecord>, { providerId: string; body?: ApiRecord }>({
      query: ({ providerId, body }) => ({
        url: `/admin/email-notifications/providers/${encodeURIComponent(providerId)}/test`,
        method: "POST",
        body: body ?? {},
      }),
    }),
    verifyEmailProvider: build.mutation<ApiSuccess<ApiRecord>, string>({
      query: (providerId) => ({
        url: `/admin/email-notifications/providers/${encodeURIComponent(providerId)}/verify`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, providerId) => [
        "EmailNotification",
        { type: "EmailNotification", id: providerId },
      ],
    }),
    disableEmailProvider: build.mutation<ApiSuccess<ApiRecord>, string>({
      query: (providerId) => ({
        url: `/admin/email-notifications/providers/${encodeURIComponent(providerId)}/disable`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, providerId) => [
        "EmailNotification",
        { type: "EmailNotification", id: providerId },
      ],
    }),
    listEmailTemplates: build.query<ApiSuccess<ApiRecord[]>, ListQuery | void>({
      query: (params) => ({
        url: "/admin/email-notifications/templates",
        params: params ?? undefined,
      }),
      providesTags: ["EmailNotification"],
    }),
    createEmailTemplate: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>({
      query: (body) => ({ url: "/admin/email-notifications/templates", method: "POST", body }),
      invalidatesTags: ["EmailNotification"],
    }),
    getEmailTemplate: build.query<ApiSuccess<ApiRecord>, string>({
      query: (templateId) => ({
        url: `/admin/email-notifications/templates/${encodeURIComponent(templateId)}`,
      }),
      providesTags: (_r, _e, templateId) => [{ type: "EmailNotification", id: templateId }],
    }),
    updateEmailTemplate: build.mutation<ApiSuccess<ApiRecord>, { templateId: string; body: ApiRecord }>({
      query: ({ templateId, body }) => ({
        url: `/admin/email-notifications/templates/${encodeURIComponent(templateId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { templateId }) => [
        "EmailNotification",
        { type: "EmailNotification", id: templateId },
      ],
    }),
    previewEmailTemplate: build.mutation<ApiSuccess<ApiRecord>, { templateId: string; body?: ApiRecord }>({
      query: ({ templateId, body }) => ({
        url: `/admin/email-notifications/templates/${encodeURIComponent(templateId)}/preview`,
        method: "POST",
        body: body ?? {},
      }),
    }),
    listNotificationRules: build.query<ApiSuccess<ApiRecord[]>, void>({
      query: () => ({ url: "/admin/email-notifications/rules" }),
      providesTags: ["EmailNotification"],
    }),
    createNotificationRule: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>({
      query: (body) => ({ url: "/admin/email-notifications/rules", method: "POST", body }),
      invalidatesTags: ["EmailNotification"],
    }),
    updateNotificationRule: build.mutation<ApiSuccess<ApiRecord>, { ruleId: string; body: ApiRecord }>({
      query: ({ ruleId, body }) => ({
        url: `/admin/email-notifications/rules/${encodeURIComponent(ruleId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["EmailNotification"],
    }),
    enableNotificationRule: build.mutation<ApiSuccess<ApiRecord>, string>({
      query: (ruleId) => ({
        url: `/admin/email-notifications/rules/${encodeURIComponent(ruleId)}/enable`,
        method: "POST",
      }),
      invalidatesTags: ["EmailNotification"],
    }),
    disableNotificationRule: build.mutation<ApiSuccess<ApiRecord>, string>({
      query: (ruleId) => ({
        url: `/admin/email-notifications/rules/${encodeURIComponent(ruleId)}/disable`,
        method: "POST",
      }),
      invalidatesTags: ["EmailNotification"],
    }),
    listDeliveryLogs: build.query<ApiSuccess<ApiRecord[]>, ListQuery | void>({
      query: (params) => ({
        url: "/admin/email-notifications/delivery-logs",
        params: params ?? undefined,
      }),
      providesTags: ["EmailNotification"],
    }),
    getDeliveryLog: build.query<ApiSuccess<ApiRecord>, string>({
      query: (deliveryId) => ({
        url: `/admin/email-notifications/delivery-logs/${encodeURIComponent(deliveryId)}`,
      }),
      providesTags: (_r, _e, deliveryId) => [{ type: "EmailNotification", id: deliveryId }],
    }),
  }),
});

export const {
  useListEmailProvidersQuery,
  useCreateEmailProviderMutation,
  useGetEmailProviderQuery,
  useUpdateEmailProviderMutation,
  useTestEmailProviderMutation,
  useVerifyEmailProviderMutation,
  useDisableEmailProviderMutation,
  useListEmailTemplatesQuery,
  useCreateEmailTemplateMutation,
  useGetEmailTemplateQuery,
  useUpdateEmailTemplateMutation,
  usePreviewEmailTemplateMutation,
  useListNotificationRulesQuery,
  useCreateNotificationRuleMutation,
  useUpdateNotificationRuleMutation,
  useEnableNotificationRuleMutation,
  useDisableNotificationRuleMutation,
  useListDeliveryLogsQuery,
  useGetDeliveryLogQuery,
} = emailNotificationsApi;
