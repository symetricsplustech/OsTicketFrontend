import { saasadminApi } from "./base";
import type { ApiSuccess, ApiRecord, ListQuery } from "./types";

/**
 * Internal platform staff — mounted at `/admin/staff`.
 */
export const staffApi = saasadminApi.injectEndpoints({
  endpoints: (build) => ({
    listStaff: build.query<ApiSuccess<ApiRecord[]>, ListQuery | void>({
      query: (params) => ({ url: "/admin/staff", params: params ?? undefined }),
      providesTags: ["Staff"],
    }),
    createStaff: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>({
      query: (body) => ({ url: "/admin/staff", method: "POST", body }),
      invalidatesTags: ["Staff"],
    }),
    getStaff: build.query<ApiSuccess<ApiRecord>, string>({
      query: (staffId) => ({
        url: `/admin/staff/${encodeURIComponent(staffId)}`,
      }),
      providesTags: (_r, _e, staffId) => [{ type: "Staff", id: staffId }],
    }),
    updateStaff: build.mutation<
      ApiSuccess<ApiRecord>,
      { staffId: string; body: ApiRecord }
    >({
      query: ({ staffId, body }) => ({
        url: `/admin/staff/${encodeURIComponent(staffId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { staffId }) => [
        "Staff",
        { type: "Staff", id: staffId },
      ],
    }),
    inviteStaff: build.mutation<
      ApiSuccess<ApiRecord>,
      { staffId: string; body?: ApiRecord }
    >({
      query: ({ staffId, body }) => ({
        url: `/admin/staff/${encodeURIComponent(staffId)}/invite`,
        method: "POST",
        body: body ?? {},
      }),
      invalidatesTags: (_r, _e, { staffId }) => [
        "Staff",
        { type: "Staff", id: staffId },
      ],
    }),
    activateStaff: build.mutation<ApiSuccess<ApiRecord>, string>({
      query: (staffId) => ({
        url: `/admin/staff/${encodeURIComponent(staffId)}/activate`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, staffId) => [
        "Staff",
        { type: "Staff", id: staffId },
      ],
    }),
    suspendStaff: build.mutation<ApiSuccess<ApiRecord>, string>({
      query: (staffId) => ({
        url: `/admin/staff/${encodeURIComponent(staffId)}/suspend`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, staffId) => [
        "Staff",
        { type: "Staff", id: staffId },
      ],
    }),
    deactivateStaff: build.mutation<ApiSuccess<ApiRecord>, string>({
      query: (staffId) => ({
        url: `/admin/staff/${encodeURIComponent(staffId)}/deactivate`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, staffId) => [
        "Staff",
        { type: "Staff", id: staffId },
      ],
    }),
    resetStaffPassword: build.mutation<ApiSuccess<ApiRecord>, string>({
      query: (staffId) => ({
        url: `/admin/staff/${encodeURIComponent(staffId)}/reset-password`,
        method: "POST",
      }),
    }),
    revokeStaffSessions: build.mutation<ApiSuccess<ApiRecord>, string>({
      query: (staffId) => ({
        url: `/admin/staff/${encodeURIComponent(staffId)}/revoke-sessions`,
        method: "POST",
      }),
      invalidatesTags: ["Session"],
    }),
    setStaffRoles: build.mutation<
      ApiSuccess<ApiRecord>,
      { staffId: string; body: { roleIds: string[] } & ApiRecord }
    >({
      query: ({ staffId, body }) => ({
        url: `/admin/staff/${encodeURIComponent(staffId)}/roles`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { staffId }) => [
        { type: "Staff", id: staffId },
      ],
    }),
    getStaffRoles: build.query<ApiSuccess<ApiRecord>, string>({
      query: (staffId) => ({
        url: `/admin/staff/${encodeURIComponent(staffId)}/roles`,
      }),
      providesTags: (_r, _e, staffId) => [{ type: "Staff", id: staffId }],
    }),
    getStaffActivity: build.query<
      ApiSuccess<ApiRecord[]>,
      { staffId: string } & ListQuery
    >({
      query: ({ staffId, ...params }) => ({
        url: `/admin/staff/${encodeURIComponent(staffId)}/activity`,
        params,
      }),
      providesTags: (_r, _e, { staffId }) => [{ type: "Staff", id: staffId }],
    }),
    listStaffSessions: build.query<ApiSuccess<ApiRecord[]>, string>({
      query: (staffId) => ({
        url: `/admin/staff/${encodeURIComponent(staffId)}/sessions`,
      }),
      providesTags: (_r, _e, staffId) => [{ type: "Staff", id: staffId }],
    }),
    revokeStaffSession: build.mutation<
      ApiSuccess<ApiRecord>,
      { staffId: string; sessionId: string }
    >({
      query: ({ staffId, sessionId }) => ({
        url: `/admin/staff/${encodeURIComponent(staffId)}/sessions/${encodeURIComponent(sessionId)}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { staffId }) => [
        { type: "Staff", id: staffId },
      ],
    }),
    getStaffEffectivePermissions: build.query<ApiSuccess<ApiRecord>, string>({
      query: (staffId) => ({
        url: `/admin/staff/${encodeURIComponent(staffId)}/effective-permissions`,
      }),
      providesTags: (_r, _e, staffId) => [{ type: "Staff", id: staffId }],
    }),
  }),
});

export const {
  useListStaffQuery,
  useCreateStaffMutation,
  useGetStaffQuery,
  useUpdateStaffMutation,
  useInviteStaffMutation,
  useActivateStaffMutation,
  useSuspendStaffMutation,
  useDeactivateStaffMutation,
  useResetStaffPasswordMutation,
  useRevokeStaffSessionsMutation,
  useSetStaffRolesMutation,
  useGetStaffRolesQuery,
  useGetStaffActivityQuery,
  useListStaffSessionsQuery,
  useRevokeStaffSessionMutation,
  useGetStaffEffectivePermissionsQuery,
} = staffApi;
