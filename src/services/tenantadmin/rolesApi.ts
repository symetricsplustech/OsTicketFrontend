import { tenantadminApi } from "./base";
import {
  qs,
  resourceUrl,
  type ListArgs,
  type ListResponse,
} from "./crudFactory";
import type { ApiSuccess, PaginationMeta } from "@services/http";

export interface TenantRole {
  id: string;
  key: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count?: { roleAssignments: number };
}

export interface TenantPermission {
  id: string;
  code: string;
  name: string;
  description: string | null;
  group: string | null;
  scope: string;
}

export interface RoleMember {
  membershipId: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  joinedAt: string | null;
}

export const rolesApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    listRoles: build.query<ListResponse<TenantRole>, ListArgs | void>({
      query: (args) => ({ url: `/tenant-admin/roles${qs(args)}` }),
      providesTags: ["TenantRole"],
    }),
    createRole: build.mutation<ApiSuccess<TenantRole>, Record<string, unknown>>(
      {
        query: (body) => ({ url: "/tenant-admin/roles", method: "POST", body }),
        invalidatesTags: ["TenantRole"],
      },
    ),
    getPermissionCatalog: build.query<
      ListResponse<TenantPermission> & { meta?: PaginationMeta },
      ListArgs | void
    >({
      query: (args) => ({
        url: `/tenant-admin/roles/permission-catalog${qs(args)}`,
      }),
      providesTags: ["TenantPermission"],
    }),
    getRole: build.query<ApiSuccess<TenantRole>, string>({
      query: (roleId) => ({ url: resourceUrl("/tenant-admin/roles", roleId) }),
      providesTags: (_r, _e, roleId) => [{ type: "TenantRole", id: roleId }],
    }),
    updateRole: build.mutation<
      ApiSuccess<TenantRole>,
      { roleId: string; body: Record<string, unknown> }
    >({
      query: ({ roleId, body }) => ({
        url: resourceUrl("/tenant-admin/roles", roleId),
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, args) => [
        { type: "TenantRole", id: args.roleId },
        "TenantRole",
      ],
    }),
    deleteRole: build.mutation<ApiSuccess<unknown>, string>({
      query: (roleId) => ({
        url: resourceUrl("/tenant-admin/roles", roleId),
        method: "DELETE",
      }),
      invalidatesTags: ["TenantRole"],
    }),
    getRolePermissions: build.query<ApiSuccess<string[]>, string>({
      query: (roleId) => ({
        url: `${resourceUrl("/tenant-admin/roles", roleId)}/permissions`,
      }),
      providesTags: (_r, _e, roleId) => [{ type: "TenantRole", id: roleId }],
    }),
    setRolePermissions: build.mutation<
      ApiSuccess<string[]>,
      { roleId: string; body: { permissionCodes: string[] } }
    >({
      query: ({ roleId, body }) => ({
        url: `${resourceUrl("/tenant-admin/roles", roleId)}/permissions`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["TenantRole"],
    }),
    getRoleMembers: build.query<
      ListResponse<RoleMember>,
      { roleId: string } & ListArgs
    >({
      query: ({ roleId, ...args }) => ({
        url: `${resourceUrl("/tenant-admin/roles", roleId)}/members${qs(args)}`,
      }),
      providesTags: (_r, _e, args) => [{ type: "TenantRole", id: args.roleId }],
    }),
    addRoleMembers: build.mutation<
      ApiSuccess<unknown>,
      { roleId: string; body: { userIds?: string[]; membershipIds?: string[] } }
    >({
      query: ({ roleId, body }) => ({
        url: `${resourceUrl("/tenant-admin/roles", roleId)}/members`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["TenantRole", "TenantUser"],
    }),
    removeRoleMember: build.mutation<
      ApiSuccess<unknown>,
      { roleId: string; membershipId: string }
    >({
      query: ({ roleId, membershipId }) => ({
        url: `${resourceUrl("/tenant-admin/roles", roleId)}/members/${encodeURIComponent(membershipId)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["TenantRole", "TenantUser"],
    }),
  }),
});

export const {
  useListRolesQuery,
  useCreateRoleMutation,
  useGetPermissionCatalogQuery,
  useGetRoleQuery,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetRolePermissionsQuery,
  useSetRolePermissionsMutation,
  useGetRoleMembersQuery,
  useAddRoleMembersMutation,
  useRemoveRoleMemberMutation,
} = rolesApi;

export const permissionsApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    listTenantPermissions: build.query<
      ListResponse<TenantPermission>,
      ListArgs | void
    >({
      query: (args) => ({ url: `/tenant-admin/permissions${qs(args)}` }),
      providesTags: ["TenantPermission"],
    }),
    listTenantPermissionGroups: build.query<
      ApiSuccess<Record<string, TenantPermission[]>>,
      void
    >({
      query: () => ({ url: "/tenant-admin/permissions/groups" }),
      providesTags: ["TenantPermission"],
    }),
    getTenantPermission: build.query<ApiSuccess<TenantPermission>, string>({
      query: (permissionId) => ({
        url: resourceUrl("/tenant-admin/permissions", permissionId),
      }),
      providesTags: ["TenantPermission"],
    }),
  }),
});

export const {
  useListTenantPermissionsQuery,
  useListTenantPermissionGroupsQuery,
  useGetTenantPermissionQuery,
} = permissionsApi;
