import { baseApi } from "./base";

export interface InstanceCompany {
  _id: string;
  name: string;
  domain?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: "active" | "inactive";
  isPrimary?: boolean;
}

export type CompanyInput = Pick<InstanceCompany, "name" | "domain" | "email" | "phone" | "address">;

export const companyApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    companies: build.query<{ success: boolean; items: InstanceCompany[] }, string>({
      query: (instanceId) => `/instances/${encodeURIComponent(instanceId)}/companies`,
      providesTags: ["OrgUnits"],
    }),
    company: build.query<{ success: boolean; item: InstanceCompany }, { instanceId: string; companyId: string }>({
      query: ({ instanceId, companyId }) => `/instances/${encodeURIComponent(instanceId)}/companies/${encodeURIComponent(companyId)}`,
      providesTags: ["OrgUnits"],
    }),
    createCompany: build.mutation<{ success: boolean; item: InstanceCompany }, { instanceId: string; body: CompanyInput }>({
      query: ({ instanceId, body }) => ({ url: `/instances/${encodeURIComponent(instanceId)}/companies`, method: "POST", body }),
      invalidatesTags: ["OrgUnits"],
    }),
    updateCompany: build.mutation<{ success: boolean; item: InstanceCompany }, { instanceId: string; companyId: string; body: Partial<CompanyInput> & { status?: "active" | "inactive" } }>({
      query: ({ instanceId, companyId, body }) => ({ url: `/instances/${encodeURIComponent(instanceId)}/companies/${encodeURIComponent(companyId)}`, method: "PUT", body }),
      invalidatesTags: ["OrgUnits"],
    }),
  }),
});

export const { useCompaniesQuery, useCompanyQuery, useCreateCompanyMutation, useUpdateCompanyMutation } = companyApi;
