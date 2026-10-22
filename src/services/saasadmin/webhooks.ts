import { saasadminApi } from "./base";
import type { ApiSuccess, ApiRecord, ListQuery } from "./types";

/**
 * Outbound webhooks and their deliveries — mounted at `/admin/webhooks`.
 */
export const webhooksApi = saasadminApi.injectEndpoints({
  endpoints: (build) => ({
    listWebhooks: build.query<ApiSuccess<ApiRecord[]>, ListQuery | void>({
      query: (params) => ({
        url: "/admin/webhooks",
        params: params ?? undefined,
      }),
      providesTags: ["Webhook"],
    }),
    createWebhook: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>({
      query: (body) => ({ url: "/admin/webhooks", method: "POST", body }),
      invalidatesTags: ["Webhook"],
    }),
    getWebhook: build.query<ApiSuccess<ApiRecord>, string>({
      query: (webhookId) => ({
        url: `/admin/webhooks/${encodeURIComponent(webhookId)}`,
      }),
      providesTags: (_r, _e, webhookId) => [{ type: "Webhook", id: webhookId }],
    }),
    updateWebhook: build.mutation<
      ApiSuccess<ApiRecord>,
      { webhookId: string; body: ApiRecord }
    >({
      query: ({ webhookId, body }) => ({
        url: `/admin/webhooks/${encodeURIComponent(webhookId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { webhookId }) => [
        "Webhook",
        { type: "Webhook", id: webhookId },
      ],
    }),
    testWebhook: build.mutation<ApiSuccess<ApiRecord>, string>({
      query: (webhookId) => ({
        url: `/admin/webhooks/${encodeURIComponent(webhookId)}/test`,
        method: "POST",
      }),
    }),
    enableWebhook: build.mutation<ApiSuccess<ApiRecord>, string>({
      query: (webhookId) => ({
        url: `/admin/webhooks/${encodeURIComponent(webhookId)}/enable`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, webhookId) => [
        "Webhook",
        { type: "Webhook", id: webhookId },
      ],
    }),
    disableWebhook: build.mutation<ApiSuccess<ApiRecord>, string>({
      query: (webhookId) => ({
        url: `/admin/webhooks/${encodeURIComponent(webhookId)}/disable`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, webhookId) => [
        "Webhook",
        { type: "Webhook", id: webhookId },
      ],
    }),
    rotateWebhookSecret: build.mutation<ApiSuccess<ApiRecord>, string>({
      query: (webhookId) => ({
        url: `/admin/webhooks/${encodeURIComponent(webhookId)}/rotate-secret`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, webhookId) => [
        { type: "Webhook", id: webhookId },
      ],
    }),
    listWebhookDeliveries: build.query<
      ApiSuccess<ApiRecord[]>,
      { webhookId: string } & ListQuery
    >({
      query: ({ webhookId, ...params }) => ({
        url: `/admin/webhooks/${encodeURIComponent(webhookId)}/deliveries`,
        params,
      }),
      providesTags: (_r, _e, { webhookId }) => [
        { type: "Webhook", id: webhookId },
      ],
    }),
    getWebhookDelivery: build.query<
      ApiSuccess<ApiRecord>,
      { webhookId: string; deliveryId: string }
    >({
      query: ({ webhookId, deliveryId }) => ({
        url: `/admin/webhooks/${encodeURIComponent(webhookId)}/deliveries/${encodeURIComponent(deliveryId)}`,
      }),
      providesTags: ["Webhook"],
    }),
    retryWebhookDelivery: build.mutation<
      ApiSuccess<ApiRecord>,
      { webhookId: string; deliveryId: string }
    >({
      query: ({ webhookId, deliveryId }) => ({
        url: `/admin/webhooks/${encodeURIComponent(webhookId)}/deliveries/${encodeURIComponent(deliveryId)}/retry`,
        method: "POST",
      }),
      invalidatesTags: ["Webhook"],
    }),
  }),
});

export const {
  useListWebhooksQuery,
  useCreateWebhookMutation,
  useGetWebhookQuery,
  useUpdateWebhookMutation,
  useTestWebhookMutation,
  useEnableWebhookMutation,
  useDisableWebhookMutation,
  useRotateWebhookSecretMutation,
  useListWebhookDeliveriesQuery,
  useGetWebhookDeliveryQuery,
  useRetryWebhookDeliveryMutation,
} = webhooksApi;
