import { baseApi } from "@shared/api/base";
import type { ExperienceMutation, ExperienceQuery, ExperienceResponse } from "@features/enterprise-experience/api/experienceTypes";

const domain = "conversational-service";
const tag = { type: "ItsmWork" as const, id: "conversational-service" };
export const conversationalServiceApi = baseApi.injectEndpoints({ endpoints: (build) => ({
  listConversationalServiceRecords: build.query<ExperienceResponse, ExperienceQuery>({ query: ({ resource, ...params }) => ({ url: `/core/experience-records/${domain}/${resource}`, params }), providesTags: [tag] }),
  createConversationalServiceRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, body }) => ({ url: `/core/experience-records/${domain}/${resource}`, method: "POST", body }), invalidatesTags: [tag] }),
  updateConversationalServiceRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, id, body }) => ({ url: `/core/experience-records/${domain}/${resource}/${id}`, method: "PUT", body }), invalidatesTags: [tag] }),
  transitionConversationalServiceRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, id, body }) => ({ url: `/core/experience-records/${domain}/${resource}/${id}/transition`, method: "POST", body }), invalidatesTags: [tag] }),
  deleteConversationalServiceRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, id }) => ({ url: `/core/experience-records/${domain}/${resource}/${id}`, method: "DELETE" }), invalidatesTags: [tag] }),
}) });
export const { useListConversationalServiceRecordsQuery, useCreateConversationalServiceRecordMutation, useUpdateConversationalServiceRecordMutation, useTransitionConversationalServiceRecordMutation, useDeleteConversationalServiceRecordMutation } = conversationalServiceApi;

export function useConversationalServiceRepository(resource: string, skip: boolean) {
  const query = useListConversationalServiceRecordsQuery({ resource }, { skip });
  const [createRecord] = useCreateConversationalServiceRecordMutation();
  const [updateRecord] = useUpdateConversationalServiceRecordMutation();
  const [transitionRecord] = useTransitionConversationalServiceRecordMutation();
  const [deleteRecord] = useDeleteConversationalServiceRecordMutation();
  return {
    query,
    create: (body: Record<string, unknown>) => createRecord({ resource, body }).unwrap(),
    update: (id: string, body: Record<string, unknown>) => updateRecord({ resource, id, body }).unwrap(),
    transition: (id: string, status: string) => transitionRecord({ resource, id, body: { status } }).unwrap(),
    remove: (id: string) => deleteRecord({ resource, id }).unwrap(),
  };
}
