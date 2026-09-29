import { baseApi } from "@shared/api/base";
import type { ExperienceMutation, ExperienceQuery, ExperienceResponse } from "@features/enterprise-experience/api/experienceTypes";

const domain = "employee-center";
const tag = { type: "ItsmWork" as const, id: "employee-center" };
export const employeeCenterApi = baseApi.injectEndpoints({ endpoints: (build) => ({
  listEmployeeCenterRecords: build.query<ExperienceResponse, ExperienceQuery>({ query: ({ resource, ...params }) => ({ url: `/core/experience-records/${domain}/${resource}`, params }), providesTags: [tag] }),
  createEmployeeCenterRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, body }) => ({ url: `/core/experience-records/${domain}/${resource}`, method: "POST", body }), invalidatesTags: [tag] }),
  updateEmployeeCenterRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, id, body }) => ({ url: `/core/experience-records/${domain}/${resource}/${id}`, method: "PUT", body }), invalidatesTags: [tag] }),
  transitionEmployeeCenterRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, id, body }) => ({ url: `/core/experience-records/${domain}/${resource}/${id}/transition`, method: "POST", body }), invalidatesTags: [tag] }),
  deleteEmployeeCenterRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, id }) => ({ url: `/core/experience-records/${domain}/${resource}/${id}`, method: "DELETE" }), invalidatesTags: [tag] }),
}) });
export const { useListEmployeeCenterRecordsQuery, useCreateEmployeeCenterRecordMutation, useUpdateEmployeeCenterRecordMutation, useTransitionEmployeeCenterRecordMutation, useDeleteEmployeeCenterRecordMutation } = employeeCenterApi;

export function useEmployeeCenterRepository(resource: string, skip: boolean) {
  const query = useListEmployeeCenterRecordsQuery({ resource }, { skip });
  const [createRecord] = useCreateEmployeeCenterRecordMutation();
  const [updateRecord] = useUpdateEmployeeCenterRecordMutation();
  const [transitionRecord] = useTransitionEmployeeCenterRecordMutation();
  const [deleteRecord] = useDeleteEmployeeCenterRecordMutation();
  return {
    query,
    create: (body: Record<string, unknown>) => createRecord({ resource, body }).unwrap(),
    update: (id: string, body: Record<string, unknown>) => updateRecord({ resource, id, body }).unwrap(),
    transition: (id: string, status: string) => transitionRecord({ resource, id, body: { status } }).unwrap(),
    remove: (id: string) => deleteRecord({ resource, id }).unwrap(),
  };
}
