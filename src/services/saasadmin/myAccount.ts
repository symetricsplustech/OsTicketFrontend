import { saasadminApi } from "./base";
import type { ApiSuccess, ApiRecord } from "./types";
import type { SessionRecord } from "./types";

/**
 * The signed-in operator's own account — mounted at `/admin/my-account`.
 */
export const myAccountApi = saasadminApi.injectEndpoints({
  endpoints: (build) => ({
    getMyProfile: build.query<ApiSuccess<ApiRecord>, void>({
      query: () => ({ url: "/admin/my-account/profile" }),
      providesTags: ["MyAccount", "AuthUser"],
    }),
    updateMyProfile: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>({
      query: (body) => ({
        url: "/admin/my-account/profile",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["MyAccount", "AuthUser"],
    }),
    getMyPreferences: build.query<ApiSuccess<ApiRecord>, void>({
      query: () => ({ url: "/admin/my-account/preferences" }),
      providesTags: ["MyAccount"],
    }),
    updateMyPreferences: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>({
      query: (body) => ({
        url: "/admin/my-account/preferences",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["MyAccount"],
    }),
    listMySessions: build.query<ApiSuccess<SessionRecord[]>, void>({
      query: () => ({ url: "/admin/my-account/sessions" }),
      providesTags: ["MyAccount", "Session"],
    }),
    revokeMySession: build.mutation<null, string>({
      query: (sessionId) => ({
        url: `/admin/my-account/sessions/${encodeURIComponent(sessionId)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["MyAccount", "Session"],
    }),
    getMySecurity: build.query<ApiSuccess<ApiRecord>, void>({
      query: () => ({ url: "/admin/my-account/security" }),
      providesTags: ["MyAccount"],
    }),
    requestEmailChange: build.mutation<
      ApiSuccess<ApiRecord>,
      { newEmail: string } & ApiRecord
    >({
      query: (body) => ({
        url: "/admin/my-account/email-change",
        method: "POST",
        body,
      }),
    }),
    confirmEmailChange: build.mutation<
      ApiSuccess<ApiRecord>,
      { token: string } & ApiRecord
    >({
      query: (body) => ({
        url: "/admin/my-account/email-change/confirm",
        method: "POST",
        body,
      }),
      invalidatesTags: ["MyAccount", "AuthUser"],
    }),
    regenerateMyRecoveryCodes: build.mutation<
      ApiSuccess<ApiRecord>,
      { password: string }
    >({
      query: (body) => ({
        url: "/admin/my-account/mfa/recovery-codes/regenerate",
        method: "POST",
        body,
      }),
      invalidatesTags: ["MyAccount"],
    }),
  }),
});

export const {
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
  useGetMyPreferencesQuery,
  useUpdateMyPreferencesMutation,
  useListMySessionsQuery,
  useRevokeMySessionMutation,
  useGetMySecurityQuery,
  useRequestEmailChangeMutation,
  useConfirmEmailChangeMutation,
  useRegenerateMyRecoveryCodesMutation,
} = myAccountApi;
