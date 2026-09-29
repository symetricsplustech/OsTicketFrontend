import { baseApi } from "@shared/api/base";
import type { ExperienceMutation, ExperienceQuery, ExperienceResponse } from "@features/enterprise-experience/api/experienceTypes";

const domain = "improvement";
const tag = { type: "ItsmWork" as const, id: "improvement" };
export const improvementApi = baseApi.injectEndpoints({ endpoints: (build) => ({
  listImprovementRecords: build.query<ExperienceResponse, ExperienceQuery>({ query: ({ resource, ...params }) => ({ url: `/core/experience-records/${domain}/${resource}`, params }), providesTags: [tag] }),
  createImprovementRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, body }) => ({ url: `/core/experience-records/${domain}/${resource}`, method: "POST", body }), invalidatesTags: [tag] }),
  updateImprovementRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, id, body }) => ({ url: `/core/experience-records/${domain}/${resource}/${id}`, method: "PUT", body }), invalidatesTags: [tag] }),
  transitionImprovementRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, id, body }) => ({ url: `/core/experience-records/${domain}/${resource}/${id}/transition`, method: "POST", body }), invalidatesTags: [tag] }),
  deleteImprovementRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, id }) => ({ url: `/core/experience-records/${domain}/${resource}/${id}`, method: "DELETE" }), invalidatesTags: [tag] }),
}) });
export const { useListImprovementRecordsQuery, useCreateImprovementRecordMutation, useUpdateImprovementRecordMutation, useTransitionImprovementRecordMutation, useDeleteImprovementRecordMutation } = improvementApi;

export function useImprovementRepository(resource: string, skip: boolean) {
  const query = useListImprovementRecordsQuery({ resource }, { skip });
  const [createRecord] = useCreateImprovementRecordMutation();
  const [updateRecord] = useUpdateImprovementRecordMutation();
  const [transitionRecord] = useTransitionImprovementRecordMutation();
  const [deleteRecord] = useDeleteImprovementRecordMutation();
  return {
    query,
    create: (body: Record<string, unknown>) => createRecord({ resource, body }).unwrap(),
    update: (id: string, body: Record<string, unknown>) => updateRecord({ resource, id, body }).unwrap(),
    transition: (id: string, status: string) => transitionRecord({ resource, id, body: { status } }).unwrap(),
    remove: (id: string) => deleteRecord({ resource, id }).unwrap(),
  };
}
