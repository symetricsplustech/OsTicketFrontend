import { saasadminApi } from "./base";
import type { ApiSuccess, ApiRecord, ListQuery } from "./types";

/**
 * Third-party integrations — mounted at `/admin/integrations`.
 */
export const integrationsApi = saasadminApi.injectEndpoints({
  endpoints: (build) => ({
    listIntegrations: build.query<ApiSuccess<ApiRecord[]>, ListQuery | void>({
      query: (params) => ({
        url: "/admin/integrations",
        params: params ?? undefined,
      }),
      providesTags: ["Integration"],
    }),
    createIntegration: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>({
      query: (body) => ({ url: "/admin/integrations", method: "POST", body }),
      invalidatesTags: ["Integration"],
    }),
    getIntegration: build.query<ApiSuccess<ApiRecord>, string>({
      query: (integrationId) => ({
        url: `/admin/integrations/${encodeURIComponent(integrationId)}`,
      }),
      providesTags: (_r, _e, integrationId) => [
        { type: "Integration", id: integrationId },
      ],
    }),
    updateIntegration: build.mutation<
      ApiSuccess<ApiRecord>,
      { integrationId: string; body: ApiRecord }
    >({
      query: ({ integrationId, body }) => ({
        url: `/admin/integrations/${encodeURIComponent(integrationId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { integrationId }) => [
        "Integration",
        { type: "Integration", id: integrationId },
      ],
    }),
    testIntegration: build.mutation<ApiSuccess<ApiRecord>, string>({
      query: (integrationId) => ({
        url: `/admin/integrations/${encodeURIComponent(integrationId)}/test`,
        method: "POST",
      }),
    }),
    enableIntegration: build.mutation<ApiSuccess<ApiRecord>, string>({
      query: (integrationId) => ({
        url: `/admin/integrations/${encodeURIComponent(integrationId)}/enable`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, integrationId) => [
        "Integration",
        { type: "Integration", id: integrationId },
      ],
    }),
    disableIntegration: build.mutation<ApiSuccess<ApiRecord>, string>({
      query: (integrationId) => ({
        url: `/admin/integrations/${encodeURIComponent(integrationId)}/disable`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, integrationId) => [
        "Integration",
        { type: "Integration", id: integrationId },
      ],
    }),
    getIntegrationLogs: build.query<
      ApiSuccess<ApiRecord[]>,
      { integrationId: string } & ListQuery
    >({
      query: ({ integrationId, ...params }) => ({
        url: `/admin/integrations/${encodeURIComponent(integrationId)}/logs`,
        params,
      }),
      providesTags: (_r, _e, { integrationId }) => [
        { type: "Integration", id: integrationId },
      ],
    }),
  }),
});

export const {
  useListIntegrationsQuery,
  useCreateIntegrationMutation,
  useGetIntegrationQuery,
  useUpdateIntegrationMutation,
  useTestIntegrationMutation,
  useEnableIntegrationMutation,
  useDisableIntegrationMutation,
  useGetIntegrationLogsQuery,
} = integrationsApi;
