import { baseApi } from "@shared/api/base";
import type { ExperienceMutation, ExperienceQuery, ExperienceResponse } from "@features/enterprise-experience/api/experienceTypes";

const domain = "performance-analytics";
const tag = { type: "ItsmWork" as const, id: "performance-analytics" };
export const performanceAnalyticsApi = baseApi.injectEndpoints({ endpoints: (build) => ({
  listPerformanceAnalyticsRecords: build.query<ExperienceResponse, ExperienceQuery>({ query: ({ resource, ...params }) => ({ url: `/core/experience-records/${domain}/${resource}`, params }), providesTags: [tag] }),
  createPerformanceAnalyticsRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, body }) => ({ url: `/core/experience-records/${domain}/${resource}`, method: "POST", body }), invalidatesTags: [tag] }),
  updatePerformanceAnalyticsRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, id, body }) => ({ url: `/core/experience-records/${domain}/${resource}/${id}`, method: "PUT", body }), invalidatesTags: [tag] }),
  transitionPerformanceAnalyticsRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, id, body }) => ({ url: `/core/experience-records/${domain}/${resource}/${id}/transition`, method: "POST", body }), invalidatesTags: [tag] }),
  deletePerformanceAnalyticsRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, id }) => ({ url: `/core/experience-records/${domain}/${resource}/${id}`, method: "DELETE" }), invalidatesTags: [tag] }),
}) });
export const { useListPerformanceAnalyticsRecordsQuery, useCreatePerformanceAnalyticsRecordMutation, useUpdatePerformanceAnalyticsRecordMutation, useTransitionPerformanceAnalyticsRecordMutation, useDeletePerformanceAnalyticsRecordMutation } = performanceAnalyticsApi;

export function usePerformanceAnalyticsRepository(resource: string, skip: boolean) {
  const query = useListPerformanceAnalyticsRecordsQuery({ resource }, { skip });
  const [createRecord] = useCreatePerformanceAnalyticsRecordMutation();
  const [updateRecord] = useUpdatePerformanceAnalyticsRecordMutation();
  const [transitionRecord] = useTransitionPerformanceAnalyticsRecordMutation();
  const [deleteRecord] = useDeletePerformanceAnalyticsRecordMutation();
  return {
    query,
    create: (body: Record<string, unknown>) => createRecord({ resource, body }).unwrap(),
    update: (id: string, body: Record<string, unknown>) => updateRecord({ resource, id, body }).unwrap(),
    transition: (id: string, status: string) => transitionRecord({ resource, id, body: { status } }).unwrap(),
    remove: (id: string) => deleteRecord({ resource, id }).unwrap(),
  };
}
