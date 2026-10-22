import { saasadminApi } from "./base";
import type { ApiSuccess, ApiRecord, ListQuery } from "./types";

/**
 * Platform API keys — mounted at `/admin/api-keys`.
 */
export const apiKeysApi = saasadminApi.injectEndpoints({
  endpoints: (build) => ({
    listApiKeys: build.query<ApiSuccess<ApiRecord[]>, ListQuery | void>({
      query: (params) => ({
        url: "/admin/api-keys",
        params: params ?? undefined,
      }),
      providesTags: ["ApiKey"],
    }),
    createApiKey: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>({
      query: (body) => ({ url: "/admin/api-keys", method: "POST", body }),
      invalidatesTags: ["ApiKey"],
    }),
    getApiKey: build.query<ApiSuccess<ApiRecord>, string>({
      query: (keyId) => ({
        url: `/admin/api-keys/${encodeURIComponent(keyId)}`,
      }),
      providesTags: (_r, _e, keyId) => [{ type: "ApiKey", id: keyId }],
    }),
    updateApiKey: build.mutation<
      ApiSuccess<ApiRecord>,
      { keyId: string; body: ApiRecord }
    >({
      query: ({ keyId, body }) => ({
        url: `/admin/api-keys/${encodeURIComponent(keyId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { keyId }) => [
        "ApiKey",
        { type: "ApiKey", id: keyId },
      ],
    }),
    rotateApiKey: build.mutation<ApiSuccess<ApiRecord>, string>({
      query: (keyId) => ({
        url: `/admin/api-keys/${encodeURIComponent(keyId)}/rotate`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, keyId) => [
        "ApiKey",
        { type: "ApiKey", id: keyId },
      ],
    }),
    revokeApiKey: build.mutation<ApiSuccess<ApiRecord>, string>({
      query: (keyId) => ({
        url: `/admin/api-keys/${encodeURIComponent(keyId)}/revoke`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, keyId) => [
        "ApiKey",
        { type: "ApiKey", id: keyId },
      ],
    }),
    getApiKeyUsage: build.query<ApiSuccess<ApiRecord>, string>({
      query: (keyId) => ({
        url: `/admin/api-keys/${encodeURIComponent(keyId)}/usage`,
      }),
      providesTags: (_r, _e, keyId) => [{ type: "ApiKey", id: keyId }],
    }),
  }),
});

export const {
  useListApiKeysQuery,
  useCreateApiKeyMutation,
  useGetApiKeyQuery,
  useUpdateApiKeyMutation,
  useRotateApiKeyMutation,
  useRevokeApiKeyMutation,
  useGetApiKeyUsageQuery,
} = apiKeysApi;
