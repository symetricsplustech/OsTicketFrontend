import { baseApi } from "@shared/api/base";
import type { ExperienceMutation, ExperienceQuery, ExperienceResponse } from "@features/enterprise-experience/api/experienceTypes";

const domain = "benchmarks";
const tag = { type: "ItsmWork" as const, id: "benchmarks" };
export const benchmarkApi = baseApi.injectEndpoints({ endpoints: (build) => ({
  listBenchmarkRecords: build.query<ExperienceResponse, ExperienceQuery>({ query: ({ resource, ...params }) => ({ url: `/core/experience-records/${domain}/${resource}`, params }), providesTags: [tag] }),
  createBenchmarkRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, body }) => ({ url: `/core/experience-records/${domain}/${resource}`, method: "POST", body }), invalidatesTags: [tag] }),
  updateBenchmarkRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, id, body }) => ({ url: `/core/experience-records/${domain}/${resource}/${id}`, method: "PUT", body }), invalidatesTags: [tag] }),
  transitionBenchmarkRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, id, body }) => ({ url: `/core/experience-records/${domain}/${resource}/${id}/transition`, method: "POST", body }), invalidatesTags: [tag] }),
  deleteBenchmarkRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, id }) => ({ url: `/core/experience-records/${domain}/${resource}/${id}`, method: "DELETE" }), invalidatesTags: [tag] }),
}) });
export const { useListBenchmarkRecordsQuery, useCreateBenchmarkRecordMutation, useUpdateBenchmarkRecordMutation, useTransitionBenchmarkRecordMutation, useDeleteBenchmarkRecordMutation } = benchmarkApi;

export function useBenchmarkRepository(resource: string, skip: boolean) {
  const query = useListBenchmarkRecordsQuery({ resource }, { skip });
  const [createRecord] = useCreateBenchmarkRecordMutation();
  const [updateRecord] = useUpdateBenchmarkRecordMutation();
  const [transitionRecord] = useTransitionBenchmarkRecordMutation();
  const [deleteRecord] = useDeleteBenchmarkRecordMutation();
  return {
    query,
    create: (body: Record<string, unknown>) => createRecord({ resource, body }).unwrap(),
    update: (id: string, body: Record<string, unknown>) => updateRecord({ resource, id, body }).unwrap(),
    transition: (id: string, status: string) => transitionRecord({ resource, id, body: { status } }).unwrap(),
    remove: (id: string) => deleteRecord({ resource, id }).unwrap(),
  };
}
