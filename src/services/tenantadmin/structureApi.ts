import { tenantadminApi } from "./base";
import {
  crudEndpoints,
  qs,
  resourceUrl,
  type ListArgs,
  type ListResponse,
} from "./crudFactory";
import type { ApiSuccess } from "@services/http";

export interface Department {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  parentId: string | null;
  managerId: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { children: number; teams: number };
}

export interface Location {
  id: string;
  name: string;
  code: string | null;
  type: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  timezone: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CostCenter {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  departmentId: string | null;
  leadId: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { members: number; queues: number };
}

export interface TeamMember {
  id: string;
  userId: string;
  role: string | null;
  isLead: boolean;
  email: string;
  firstName: string;
  lastName: string;
}

export const structureApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    ...crudEndpoints<Department, "Department">(build, {
      path: "/tenant-admin/departments",
      tag: "Department",
    }),
    ...crudEndpoints<Location, "Location">(build, {
      path: "/tenant-admin/locations",
      tag: "Location",
    }),
    ...crudEndpoints<CostCenter, "CostCenter">(build, {
      path: "/tenant-admin/cost-centers",
      tag: "CostCenter",
    }),
    ...crudEndpoints<Team, "Team">(build, {
      path: "/tenant-admin/teams",
      tag: "Team",
    }),
    listTeamMembers: build.query<
      ListResponse<TeamMember>,
      { teamId: string } & ListArgs
    >({
      query: ({ teamId, ...args }) => ({
        url: `${resourceUrl("/tenant-admin/teams", teamId)}/members${qs(args)}`,
      }),
      providesTags: (_r, _e, args) => [{ type: "Team", id: args.teamId }],
    }),
    addTeamMember: build.mutation<
      ApiSuccess<TeamMember>,
      {
        teamId: string;
        body: { userId: string; role?: string; isLead?: boolean };
      }
    >({
      query: ({ teamId, body }) => ({
        url: `${resourceUrl("/tenant-admin/teams", teamId)}/members`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Team"],
    }),
    removeTeamMember: build.mutation<
      ApiSuccess<unknown>,
      { teamId: string; userId: string }
    >({
      query: ({ teamId, userId }) => ({
        url: `${resourceUrl("/tenant-admin/teams", teamId)}/members/${encodeURIComponent(userId)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Team"],
    }),
    listTeamQueues: build.query<
      ListResponse<{ id: string; name: string }>,
      { teamId: string } & ListArgs
    >({
      query: ({ teamId, ...args }) => ({
        url: `${resourceUrl("/tenant-admin/teams", teamId)}/queues${qs(args)}`,
      }),
      providesTags: (_r, _e, args) => [{ type: "Team", id: args.teamId }],
    }),
    assignTeamQueue: build.mutation<
      ApiSuccess<unknown>,
      { teamId: string; body: { queueId: string } }
    >({
      query: ({ teamId, body }) => ({
        url: `${resourceUrl("/tenant-admin/teams", teamId)}/queues`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Team"],
    }),
    unassignTeamQueue: build.mutation<
      ApiSuccess<unknown>,
      { teamId: string; queueId: string }
    >({
      query: ({ teamId, queueId }) => ({
        url: `${resourceUrl("/tenant-admin/teams", teamId)}/queues/${encodeURIComponent(queueId)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Team"],
    }),
  }),
});

export const {
  useListDepartmentQuery,
  useGetDepartmentQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  useListLocationQuery,
  useGetLocationQuery,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useDeleteLocationMutation,
  useListCostCenterQuery,
  useGetCostCenterQuery,
  useCreateCostCenterMutation,
  useUpdateCostCenterMutation,
  useDeleteCostCenterMutation,
  useListTeamQuery,
  useGetTeamQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
  useListTeamMembersQuery,
  useAddTeamMemberMutation,
  useRemoveTeamMemberMutation,
  useListTeamQueuesQuery,
  useAssignTeamQueueMutation,
  useUnassignTeamQueueMutation,
} = structureApi;
