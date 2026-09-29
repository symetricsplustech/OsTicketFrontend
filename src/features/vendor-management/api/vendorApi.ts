import { baseApi } from "@shared/api/base";
import type { ExperienceMutation, ExperienceQuery, ExperienceResponse } from "@features/enterprise-experience/api/experienceTypes";

const domain = "vendor";
const tag = { type: "ItsmWork" as const, id: "vendor" };
export const vendorApi = baseApi.injectEndpoints({ endpoints: (build) => ({
  listVendorRecords: build.query<ExperienceResponse, ExperienceQuery>({ query: ({ resource, ...params }) => ({ url: `/core/experience-records/${domain}/${resource}`, params }), providesTags: [tag] }),
  createVendorRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, body }) => ({ url: `/core/experience-records/${domain}/${resource}`, method: "POST", body }), invalidatesTags: [tag] }),
  updateVendorRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, id, body }) => ({ url: `/core/experience-records/${domain}/${resource}/${id}`, method: "PUT", body }), invalidatesTags: [tag] }),
  transitionVendorRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, id, body }) => ({ url: `/core/experience-records/${domain}/${resource}/${id}/transition`, method: "POST", body }), invalidatesTags: [tag] }),
  deleteVendorRecord: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, id }) => ({ url: `/core/experience-records/${domain}/${resource}/${id}`, method: "DELETE" }), invalidatesTags: [tag] }),
}) });
export const { useListVendorRecordsQuery, useCreateVendorRecordMutation, useUpdateVendorRecordMutation, useTransitionVendorRecordMutation, useDeleteVendorRecordMutation } = vendorApi;

export function useVendorRepository(resource: string, skip: boolean) {
  const query = useListVendorRecordsQuery({ resource }, { skip });
  const [createRecord] = useCreateVendorRecordMutation();
  const [updateRecord] = useUpdateVendorRecordMutation();
  const [transitionRecord] = useTransitionVendorRecordMutation();
  const [deleteRecord] = useDeleteVendorRecordMutation();
  return {
    query,
    create: (body: Record<string, unknown>) => createRecord({ resource, body }).unwrap(),
    update: (id: string, body: Record<string, unknown>) => updateRecord({ resource, id, body }).unwrap(),
    transition: (id: string, status: string) => transitionRecord({ resource, id, body: { status } }).unwrap(),
    remove: (id: string) => deleteRecord({ resource, id }).unwrap(),
  };
}
