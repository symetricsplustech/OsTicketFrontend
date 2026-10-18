import { saasadminApi } from "./base";
import type { ApiSuccess, ApiRecord, ListQuery } from "./types";

/**
 * Platform roles — mounted at `/admin/roles`.
 */
export const rolesApi = saasadminApi.injectEndpoints({
  endpoints: (build) => ({
    listRoles: build.query<ApiSuccess<ApiRecord[]>, ListQuery | void>({
      query: (params) => ({ url: "/admin/roles", params: params ?? undefined }),
      providesTags: ["Role"],
    }),
    createRole: build.mutation<ApiSuccess<ApiRecord>, ApiRecord>({
      query: (body) => ({ url: "/admin/roles", method: "POST", body }),
      invalidatesTags: ["Role"],
    }),
    rolePermissionCatalog: build.query<ApiSuccess<ApiRecord[]>, void>({
      query: () => ({ url: "/admin/roles/permission-catalog" }),
      providesTags: ["Permission"],
    }),
    getRole: build.query<ApiSuccess<ApiRecord>, string>({
      query: (roleId) => ({ url: `/admin/roles/${encodeURIComponent(roleId)}` }),
      providesTags: (_r, _e, roleId) => [{ type: "Role", id: roleId }],
    }),
    updateRole: build.mutation<ApiSuccess<ApiRecord>, { roleId: string; body: ApiRecord }>({
      query: ({ roleId, body }) => ({
        url: `/admin/roles/${encodeURIComponent(roleId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { roleId }) => ["Role", { type: "Role", id: roleId }],
    }),
    deleteRole: build.mutation<null, string>({
      query: (roleId) => ({ url: `/admin/roles/${encodeURIComponent(roleId)}`, method: "DELETE" }),
      invalidatesTags: ["Role"],
    }),
    getRolePermissions: build.query<ApiSuccess<ApiRecord>, string>({
      query: (roleId) => ({ url: `/admin/roles/${encodeURIComponent(roleId)}/permissions` }),
      providesTags: (_r, _e, roleId) => [{ type: "Role", id: roleId }],
    }),
    setRolePermissions: build.mutation<
      ApiSuccess<ApiRecord>,
      { roleId: string; body: { permissionCodes: string[] } & ApiRecord }
    >({
      query: ({ roleId, body }) => ({
        url: `/admin/roles/${encodeURIComponent(roleId)}/permissions`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { roleId }) => [{ type: "Role", id: roleId }, "Permission"],
    }),
    getRoleMembers: build.query<ApiSuccess<ApiRecord[]>, { roleId: string } & ListQuery>({
      query: ({ roleId, ...params }) => ({
        url: `/admin/roles/${encodeURIComponent(roleId)}/members`,
        params,
      }),
      providesTags: (_r, _e, { roleId }) => [{ type: "Role", id: roleId }],
    }),
  }),
});

export const {
  useListRolesQuery,
  useCreateRoleMutation,
  useRolePermissionCatalogQuery,
  useGetRoleQuery,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetRolePermissionsQuery,
  useSetRolePermissionsMutation,
  useGetRoleMembersQuery,
} = rolesApi;
