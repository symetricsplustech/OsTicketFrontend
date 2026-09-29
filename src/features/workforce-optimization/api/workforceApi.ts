import { baseApi } from "@shared/api/base";
import type { ExperienceMutation, ExperienceQuery, ExperienceResponse } from "@features/enterprise-experience/api/experienceTypes";

const domain = "workforce";
const tag = { type: "ItsmWork" as const, id: "workforce" };
export const workforceApi = baseApi.injectEndpoints({ endpoints: (build) => ({
  listWorkforceRecords: build.query<ExperienceResponse, ExperienceQuery>({ query: ({ resource, ...params }) => ({ url: `/core/experience-records/${domain}/${resource}`, params }), providesTags: [tag] }),
  createWorkforceRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, body }) => ({ url: `/core/experience-records/${domain}/${resource}`, method: "POST", body }), invalidatesTags: [tag] }),
  updateWorkforceRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, id, body }) => ({ url: `/core/experience-records/${domain}/${resource}/${id}`, method: "PUT", body }), invalidatesTags: [tag] }),
  transitionWorkforceRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, id, body }) => ({ url: `/core/experience-records/${domain}/${resource}/${id}/transition`, method: "POST", body }), invalidatesTags: [tag] }),
  deleteWorkforceRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, id }) => ({ url: `/core/experience-records/${domain}/${resource}/${id}`, method: "DELETE" }), invalidatesTags: [tag] }),
}) });
export const { useListWorkforceRecordsQuery, useCreateWorkforceRecordMutation, useUpdateWorkforceRecordMutation, useTransitionWorkforceRecordMutation, useDeleteWorkforceRecordMutation } = workforceApi;

export function useWorkforceRepository(resource: string, skip: boolean) {
  const query = useListWorkforceRecordsQuery({ resource }, { skip });
  const [createRecord] = useCreateWorkforceRecordMutation();
  const [updateRecord] = useUpdateWorkforceRecordMutation();
  const [transitionRecord] = useTransitionWorkforceRecordMutation();
  const [deleteRecord] = useDeleteWorkforceRecordMutation();
  return {
    query,
    create: (body: Record<string, unknown>) => createRecord({ resource, body }).unwrap(),
    update: (id: string, body: Record<string, unknown>) => updateRecord({ resource, id, body }).unwrap(),
    transition: (id: string, status: string) => transitionRecord({ resource, id, body: { status } }).unwrap(),
    remove: (id: string) => deleteRecord({ resource, id }).unwrap(),
  };
}
