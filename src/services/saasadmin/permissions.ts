import { saasadminApi } from "./base";
import type { ApiSuccess, ApiRecord, ListQuery } from "./types";

/**
 * Platform permission catalog — mounted at `/admin/permissions`.
 */
export const permissionsApi = saasadminApi.injectEndpoints({
  endpoints: (build) => ({
    listPermissions: build.query<ApiSuccess<ApiRecord[]>, ListQuery | void>({
      query: (params) => ({
        url: "/admin/permissions",
        params: params ?? undefined,
      }),
      providesTags: ["Permission"],
    }),
    permissionGroups: build.query<ApiSuccess<ApiRecord[]>, void>({
      query: () => ({ url: "/admin/permissions/groups" }),
      providesTags: ["Permission"],
    }),
    getPermission: build.query<ApiSuccess<ApiRecord>, string>({
      query: (permissionId) => ({
        url: `/admin/permissions/${encodeURIComponent(permissionId)}`,
      }),
      providesTags: (_r, _e, permissionId) => [
        { type: "Permission", id: permissionId },
      ],
    }),
  }),
});

export const {
  useListPermissionsQuery,
  usePermissionGroupsQuery,
  useGetPermissionQuery,
} = permissionsApi;
