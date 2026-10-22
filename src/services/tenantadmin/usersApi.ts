import { tenantadminApi } from "./base";
import {
  qs,
  resourceUrl,
  type ListArgs,
  type ListResponse,
} from "./crudFactory";
import type { ApiSuccess, PaginationMeta } from "@services/http";

export type TenantUserStatus = "ACTIVE" | "INVITED" | "SUSPENDED" | "INACTIVE";
export type InvitationStatus = "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";

export interface TenantRoleRef {
  id: string;
  key: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  status: string;
}

export interface TenantUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string | null;
  jobTitle: string | null;
  phone: string | null;
  avatarUrl: string | null;
  userType: string;
  status: TenantUserStatus;
  timezone: string | null;
  locale: string | null;
  lastLoginAt: string | null;
  emailVerifiedAt: string | null;
  mfaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  membershipStatus: string | null;
  invitedAt: string | null;
  joinedAt: string | null;
  roles?: TenantRoleRef[];
  roleIds?: string[];
  membershipId?: string;
  _count?: { roleAssignments: number };
}

export interface TenantInvitation {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: InvitationStatus;
  expiresAt: string | null;
  createdAt: string;
  invitedById: string | null;
}

export interface UserActivityEntry {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  outcome: string;
  createdAt: string;
}

export interface UserListArgs extends ListArgs {
  status?: TenantUserStatus | "";
  roleId?: string;
}

export interface UserRolesArgs {
  roleIds: string[];
}

export const usersApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    listUsers: build.query<ListResponse<TenantUser>, UserListArgs | void>({
      query: (args) => ({
        url: `/tenant-admin/users${qs({
          search: args?.search,
          status: args?.status,
          roleId: args?.roleId,
          page: args?.page,
          limit: args?.limit ?? 50,
        })}`,
      }),
      providesTags: ["TenantUser"],
    }),
    inviteUser: build.mutation<ApiSuccess<TenantUser>, Record<string, unknown>>(
      {
        query: (body) => ({
          url: "/tenant-admin/users/invite",
          method: "POST",
          body,
        }),
        invalidatesTags: ["TenantUser", "Invitation"],
      },
    ),
    importUsers: build.mutation<
      ApiSuccess<{ imported: number }>,
      Record<string, unknown>
    >({
      query: (body) => ({
        url: "/tenant-admin/users/import",
        method: "POST",
        body,
      }),
      invalidatesTags: ["TenantUser"],
    }),
    listInvitations: build.query<
      ListResponse<TenantInvitation>,
      ListArgs | void
    >({
      query: (args) => ({ url: `/tenant-admin/users/invitations${qs(args)}` }),
      providesTags: ["Invitation"],
    }),
    revokeInvitation: build.mutation<ApiSuccess<unknown>, string>({
      query: (invitationId) => ({
        url: `/tenant-admin/users/invitations/${encodeURIComponent(invitationId)}/revoke`,
        method: "POST",
      }),
      invalidatesTags: ["Invitation", "TenantUser"],
    }),
    getUser: build.query<ApiSuccess<TenantUser>, string>({
      query: (userId) => ({ url: resourceUrl("/tenant-admin/users", userId) }),
      providesTags: (_r, _e, userId) => [{ type: "TenantUser", id: userId }],
    }),
    updateUser: build.mutation<
      ApiSuccess<TenantUser>,
      { userId: string; body: Record<string, unknown> }
    >({
      query: ({ userId, body }) => ({
        url: resourceUrl("/tenant-admin/users", userId),
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, args) => [
        { type: "TenantUser", id: args.userId },
        "TenantUser",
      ],
    }),
    activateUser: build.mutation<ApiSuccess<TenantUser>, string>({
      query: (userId) => ({
        url: `${resourceUrl("/tenant-admin/users", userId)}/activate`,
        method: "POST",
      }),
      invalidatesTags: ["TenantUser"],
    }),
    suspendUser: build.mutation<
      ApiSuccess<TenantUser>,
      { userId: string; body?: Record<string, unknown> }
    >({
      query: ({ userId, body }) => ({
        url: `${resourceUrl("/tenant-admin/users", userId)}/suspend`,
        method: "POST",
        body: body ?? {},
      }),
      invalidatesTags: ["TenantUser"],
    }),
    deactivateUser: build.mutation<
      ApiSuccess<TenantUser>,
      { userId: string; body?: Record<string, unknown> }
    >({
      query: ({ userId, body }) => ({
        url: `${resourceUrl("/tenant-admin/users", userId)}/deactivate`,
        method: "POST",
        body: body ?? {},
      }),
      invalidatesTags: ["TenantUser"],
    }),
    resetUserPassword: build.mutation<ApiSuccess<unknown>, string>({
      query: (userId) => ({
        url: `${resourceUrl("/tenant-admin/users", userId)}/reset-password`,
        method: "POST",
      }),
      invalidatesTags: ["TenantUser"],
    }),
    revokeUserSessions: build.mutation<ApiSuccess<unknown>, string>({
      query: (userId) => ({
        url: `${resourceUrl("/tenant-admin/users", userId)}/revoke-sessions`,
        method: "POST",
      }),
      invalidatesTags: ["TenantUser"],
    }),
    getUserRoles: build.query<ApiSuccess<TenantRoleRef[]>, string>({
      query: (userId) => ({
        url: `${resourceUrl("/tenant-admin/users", userId)}/roles`,
      }),
      providesTags: (_r, _e, userId) => [{ type: "TenantUser", id: userId }],
    }),
    setUserRoles: build.mutation<
      ApiSuccess<TenantRoleRef[]>,
      { userId: string; body: UserRolesArgs }
    >({
      query: ({ userId, body }) => ({
        url: `${resourceUrl("/tenant-admin/users", userId)}/roles`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["TenantUser"],
    }),
    getUserActivity: build.query<
      ApiSuccess<UserActivityEntry[]> & { meta?: PaginationMeta },
      { userId: string } & ListArgs
    >({
      query: ({ userId, ...args }) => ({
        url: `${resourceUrl("/tenant-admin/users", userId)}/activity${qs(args)}`,
      }),
      providesTags: (_r, _e, args) => [{ type: "TenantUser", id: args.userId }],
    }),
  }),
});

export const {
  useListUsersQuery,
  useInviteUserMutation,
  useImportUsersMutation,
  useListInvitationsQuery,
  useRevokeInvitationMutation,
  useGetUserQuery,
  useUpdateUserMutation,
  useActivateUserMutation,
  useSuspendUserMutation,
  useDeactivateUserMutation,
  useResetUserPasswordMutation,
  useRevokeUserSessionsMutation,
  useGetUserRolesQuery,
  useSetUserRolesMutation,
  useGetUserActivityQuery,
} = usersApi;
