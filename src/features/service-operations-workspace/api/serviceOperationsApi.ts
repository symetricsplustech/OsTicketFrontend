import { baseApi } from "@shared/api/base";
import type { ExperienceMutation, ExperienceQuery, ExperienceResponse } from "@features/enterprise-experience/api/experienceTypes";

const domain = "service-operations";
const tag = { type: "ItsmWork" as const, id: "service-operations" };
export const serviceOperationsApi = baseApi.injectEndpoints({ endpoints: (build) => ({
  listServiceOperationsRecords: build.query<ExperienceResponse, ExperienceQuery>({ query: ({ resource, ...params }) => ({ url: `/core/experience-records/${domain}/${resource}`, params }), providesTags: [tag] }),
  createServiceOperationsRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, body }) => ({ url: `/core/experience-records/${domain}/${resource}`, method: "POST", body }), invalidatesTags: [tag] }),
  updateServiceOperationsRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, id, body }) => ({ url: `/core/experience-records/${domain}/${resource}/${id}`, method: "PUT", body }), invalidatesTags: [tag] }),
  transitionServiceOperationsRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, id, body }) => ({ url: `/core/experience-records/${domain}/${resource}/${id}/transition`, method: "POST", body }), invalidatesTags: [tag] }),
  deleteServiceOperationsRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, id }) => ({ url: `/core/experience-records/${domain}/${resource}/${id}`, method: "DELETE" }), invalidatesTags: [tag] }),
}) });
export const { useListServiceOperationsRecordsQuery, useCreateServiceOperationsRecordMutation, useUpdateServiceOperationsRecordMutation, useTransitionServiceOperationsRecordMutation, useDeleteServiceOperationsRecordMutation } = serviceOperationsApi;

export function useServiceOperationsRepository(resource: string, skip: boolean) {
  const query = useListServiceOperationsRecordsQuery({ resource }, { skip });
  const [createRecord] = useCreateServiceOperationsRecordMutation();
  const [updateRecord] = useUpdateServiceOperationsRecordMutation();
  const [transitionRecord] = useTransitionServiceOperationsRecordMutation();
  const [deleteRecord] = useDeleteServiceOperationsRecordMutation();
  return {
    query,
    create: (body: Record<string, unknown>) => createRecord({ resource, body }).unwrap(),
    update: (id: string, body: Record<string, unknown>) => updateRecord({ resource, id, body }).unwrap(),
    transition: (id: string, status: string) => transitionRecord({ resource, id, body: { status } }).unwrap(),
    remove: (id: string) => deleteRecord({ resource, id }).unwrap(),
  };
}
