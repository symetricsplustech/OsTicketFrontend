import { baseApi } from "@shared/api/base";
import type { ExperienceMutation, ExperienceQuery, ExperienceResponse } from "@features/enterprise-experience/api/experienceTypes";

const domain = "experience-feedback";
const tag = { type: "ItsmWork" as const, id: "experience-feedback" };
export const experienceFeedbackApi = baseApi.injectEndpoints({ endpoints: (build) => ({
  listExperienceFeedbackRecords: build.query<ExperienceResponse, ExperienceQuery>({ query: ({ resource, ...params }) => ({ url: `/core/experience-records/${domain}/${resource}`, params }), providesTags: [tag] }),
  createExperienceFeedbackRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, body }) => ({ url: `/core/experience-records/${domain}/${resource}`, method: "POST", body }), invalidatesTags: [tag] }),
  updateExperienceFeedbackRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, id, body }) => ({ url: `/core/experience-records/${domain}/${resource}/${id}`, method: "PUT", body }), invalidatesTags: [tag] }),
  transitionExperienceFeedbackRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, id, body }) => ({ url: `/core/experience-records/${domain}/${resource}/${id}/transition`, method: "POST", body }), invalidatesTags: [tag] }),
  deleteExperienceFeedbackRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, id }) => ({ url: `/core/experience-records/${domain}/${resource}/${id}`, method: "DELETE" }), invalidatesTags: [tag] }),
}) });
export const { useListExperienceFeedbackRecordsQuery, useCreateExperienceFeedbackRecordMutation, useUpdateExperienceFeedbackRecordMutation, useTransitionExperienceFeedbackRecordMutation, useDeleteExperienceFeedbackRecordMutation } = experienceFeedbackApi;

export function useExperienceFeedbackRepository(resource: string, skip: boolean) {
  const query = useListExperienceFeedbackRecordsQuery({ resource }, { skip });
  const [createRecord] = useCreateExperienceFeedbackRecordMutation();
  const [updateRecord] = useUpdateExperienceFeedbackRecordMutation();
  const [transitionRecord] = useTransitionExperienceFeedbackRecordMutation();
  const [deleteRecord] = useDeleteExperienceFeedbackRecordMutation();
  return {
    query,
    create: (body: Record<string, unknown>) => createRecord({ resource, body }).unwrap(),
    update: (id: string, body: Record<string, unknown>) => updateRecord({ resource, id, body }).unwrap(),
    transition: (id: string, status: string) => transitionRecord({ resource, id, body: { status } }).unwrap(),
    remove: (id: string) => deleteRecord({ resource, id }).unwrap(),
  };
}
