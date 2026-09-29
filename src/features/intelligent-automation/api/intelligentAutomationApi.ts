import { baseApi } from "@shared/api/base";
import type { ExperienceMutation, ExperienceQuery, ExperienceResponse } from "@features/enterprise-experience/api/experienceTypes";

const domain = "intelligent-automation";
const tag = { type: "ItsmWork" as const, id: "intelligent-automation" };
export const intelligentAutomationApi = baseApi.injectEndpoints({ endpoints: (build) => ({
  listIntelligentAutomationRecords: build.query<ExperienceResponse, ExperienceQuery>({ query: ({ resource, ...params }) => ({ url: `/core/experience-records/${domain}/${resource}`, params }), providesTags: [tag] }),
  createIntelligentAutomationRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, body }) => ({ url: `/core/experience-records/${domain}/${resource}`, method: "POST", body }), invalidatesTags: [tag] }),
  updateIntelligentAutomationRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, id, body }) => ({ url: `/core/experience-records/${domain}/${resource}/${id}`, method: "PUT", body }), invalidatesTags: [tag] }),
  transitionIntelligentAutomationRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, id, body }) => ({ url: `/core/experience-records/${domain}/${resource}/${id}/transition`, method: "POST", body }), invalidatesTags: [tag] }),
  deleteIntelligentAutomationRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, id }) => ({ url: `/core/experience-records/${domain}/${resource}/${id}`, method: "DELETE" }), invalidatesTags: [tag] }),
}) });
export const { useListIntelligentAutomationRecordsQuery, useCreateIntelligentAutomationRecordMutation, useUpdateIntelligentAutomationRecordMutation, useTransitionIntelligentAutomationRecordMutation, useDeleteIntelligentAutomationRecordMutation } = intelligentAutomationApi;

export function useIntelligentAutomationRepository(resource: string, skip: boolean) {
  const query = useListIntelligentAutomationRecordsQuery({ resource }, { skip });
  const [createRecord] = useCreateIntelligentAutomationRecordMutation();
  const [updateRecord] = useUpdateIntelligentAutomationRecordMutation();
  const [transitionRecord] = useTransitionIntelligentAutomationRecordMutation();
  const [deleteRecord] = useDeleteIntelligentAutomationRecordMutation();
  return {
    query,
    create: (body: Record<string, unknown>) => createRecord({ resource, body }).unwrap(),
    update: (id: string, body: Record<string, unknown>) => updateRecord({ resource, id, body }).unwrap(),
    transition: (id: string, status: string) => transitionRecord({ resource, id, body: { status } }).unwrap(),
    remove: (id: string) => deleteRecord({ resource, id }).unwrap(),
  };
}
