import { baseApi } from "@shared/api/base";
import type { ApiRecord } from "@shared/api/itsmTypes";

export type AdministrationResource = "companies" | "departments" | "teams" | "roles" | "organization-units";
export type AdministrationResponse = { success?: boolean; data?: ApiRecord[] | ApiRecord; item?: ApiRecord; instance?: ApiRecord; items?: ApiRecord[]; records?: ApiRecord[]; roles?: ApiRecord[]; teams?: ApiRecord[]; modules?: ApiRecord[] };

const resourceTag = (instanceId: string, resource: string) => ({ type: "ItsmWork" as const, id: `admin/${instanceId}/${resource}` });

export function administrationRows(payload?: AdministrationResponse): ApiRecord[] {
  if (Array.isArray(payload?.data)) return payload.data;
  if (payload?.data && !Array.isArray(payload.data)) return [payload.data];
  if (payload?.item) return [payload.item];
  if (payload?.instance) return [payload.instance];
  return payload?.items ?? payload?.records ?? payload?.roles ?? payload?.teams ?? payload?.modules ?? [];
}

export const platformAdministrationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getInstanceProfile: build.query<AdministrationResponse, string>({
      query: (instanceId) => `/instances/${instanceId}`,
      providesTags: (_result, _error, instanceId) => [resourceTag(instanceId, "instance")],
    }),
    listAdministrationRecords: build.query<AdministrationResponse, { instanceId: string; resource: AdministrationResource; search?: string }>({
      query: ({ instanceId, resource, search }) => ({ url: `/instances/${instanceId}/${resource}`, params: { search } }),
      providesTags: (_result, _error, { instanceId, resource }) => [resourceTag(instanceId, resource)],
    }),
    createAdministrationRecord: build.mutation<AdministrationResponse, { instanceId: string; resource: AdministrationResource; body: ApiRecord }>({
      query: ({ instanceId, resource, body }) => ({ url: `/instances/${instanceId}/${resource}`, method: "POST", body }),
      invalidatesTags: (_result, _error, { instanceId, resource }) => [resourceTag(instanceId, resource)],
    }),
    updateAdministrationRecord: build.mutation<AdministrationResponse, { instanceId: string; resource: AdministrationResource; id: string; body: ApiRecord }>({
      query: ({ instanceId, resource, id, body }) => ({ url: `/instances/${instanceId}/${resource}/${id}`, method: "PUT", body }),
      invalidatesTags: (_result, _error, { instanceId, resource }) => [resourceTag(instanceId, resource)],
    }),
    deleteAdministrationRecord: build.mutation<AdministrationResponse, { instanceId: string; resource: AdministrationResource; id: string }>({
      query: ({ instanceId, resource, id }) => ({ url: `/instances/${instanceId}/${resource}/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, { instanceId, resource }) => [resourceTag(instanceId, resource)],
    }),
    listInstanceModules: build.query<AdministrationResponse, string>({
      query: (instanceId) => `/instances/${instanceId}/modules`,
      providesTags: (_result, _error, instanceId) => [resourceTag(instanceId, "modules")],
    }),
    getInstancePreferences: build.query<AdministrationResponse, string>({
      query: (instanceId) => `/instances/${instanceId}/preferences`,
      providesTags: (_result, _error, instanceId) => [resourceTag(instanceId, "preferences")],
    }),
    updateInstancePreferences: build.mutation<AdministrationResponse, { instanceId: string; body: { locale?: string; timezone?: string } }>({
      query: ({ instanceId, body }) => ({ url: `/instances/${instanceId}/preferences`, method: "PUT", body }),
      invalidatesTags: (_result, _error, { instanceId }) => [resourceTag(instanceId, "preferences")],
    }),
    activateInstanceModules: build.mutation<AdministrationResponse, { instanceId: string; moduleKeys: string[] }>({
      query: ({ instanceId, moduleKeys }) => ({ url: `/instances/${instanceId}/modules`, method: "POST", body: { moduleKeys } }),
      invalidatesTags: (_result, _error, { instanceId }) => [resourceTag(instanceId, "modules")],
    }),
    deactivateInstanceModule: build.mutation<AdministrationResponse, { instanceId: string; moduleKey: string }>({
      query: ({ instanceId, moduleKey }) => ({ url: `/instances/${instanceId}/modules/${moduleKey}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, { instanceId }) => [resourceTag(instanceId, "modules")],
    }),
  }),
});

export const { useGetInstanceProfileQuery, useListAdministrationRecordsQuery, useCreateAdministrationRecordMutation, useUpdateAdministrationRecordMutation, useDeleteAdministrationRecordMutation, useListInstanceModulesQuery, useActivateInstanceModulesMutation, useDeactivateInstanceModuleMutation, useGetInstancePreferencesQuery, useUpdateInstancePreferencesMutation } = platformAdministrationApi;
