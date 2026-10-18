import { tenantadminApi } from "./base";
import type { ApiSuccess, PaginationMeta } from "@services/http";

export type CustomerStatus = "ACTIVE" | "INACTIVE" | "PROSPECT";
export type CustomerType = "COMPANY" | "INDIVIDUAL";
export type CustomerContactRole = "PRIMARY" | "TECHNICAL" | "BILLING" | "AUTHORIZED";
export type CustomerPortalStatus = "NONE" | "INVITED" | "ACTIVE" | "REVOKED";

export interface CustomerContact {
  id: string;
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  jobTitle: string | null;
  role: CustomerContactRole;
  portalStatus: CustomerPortalStatus;
  invitedAt: string | null;
  portalActivatedAt: string | null;
  isPrimary: boolean;
  notes: string | null;
  createdAt: string;
  customer?: { id: string; name: string; code: string | null };
}

export interface CustomerSite {
  id: string;
  customerId: string;
  name: string;
  code: string | null;
  siteType: string;
  isDataCenter: boolean;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  timezone: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  customer?: { id: string; name: string; code: string | null };
}

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  code: string | null;
  type: CustomerType;
  status: CustomerStatus;
  industry: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  description: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  timezone: string | null;
  slaPolicyId: string | null;
  isDataCenter: boolean;
  createdAt: string;
  updatedAt: string;
  contacts?: CustomerContact[];
  sites?: CustomerSite[];
  _count?: { contacts: number; sites: number; incidents: number };
}

export interface IncidentSummary {
  id: string;
  number: string;
  title: string;
  statusKey: string;
  priorityKey: string;
  impact: string;
  urgency: string;
  customerId: string | null;
  dueAt: string | null;
  slaBreached: boolean;
  createdAt: string;
}

export interface CustomerListArgs {
  search?: string;
  status?: CustomerStatus | "";
  page?: number;
  limit?: number;
}

export interface ContactListArgs {
  search?: string;
  customerId?: string;
  portalStatus?: CustomerPortalStatus | "";
  page?: number;
  limit?: number;
}

export interface SiteListArgs {
  search?: string;
  customerId?: string;
  isDataCenter?: boolean;
  page?: number;
  limit?: number;
}

export interface IncidentListArgs {
  search?: string;
  customerId?: string;
  statusKey?: string;
  page?: number;
  limit?: number;
}

export interface CustomerWriteBody {
  name: string;
  code?: string;
  type?: CustomerType;
  status?: CustomerStatus;
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
  description?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  timezone?: string;
  isDataCenter?: boolean;
}

export interface ContactWriteBody {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  role?: CustomerContactRole;
  isPrimary?: boolean;
  notes?: string;
}

export interface SiteWriteBody {
  name: string;
  code?: string;
  siteType?: string;
  isDataCenter?: boolean;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  timezone?: string;
  status?: string;
  notes?: string;
}

function queryString(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const serialized = search.toString();
  return serialized ? `?${serialized}` : "";
}

export const customersApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    listCustomers: build.query<ApiSuccess<Customer[]> & { meta?: PaginationMeta }, CustomerListArgs | void>({
      query: (args) => ({
        url: `/tenant-admin/customers${queryString({
          search: args?.search,
          status: args?.status,
          page: args?.page,
          limit: args?.limit ?? 50,
        })}`,
      }),
      providesTags: ["Customer"],
    }),
    getCustomer: build.query<ApiSuccess<Customer>, string>({
      query: (customerId) => ({ url: `/tenant-admin/customers/${encodeURIComponent(customerId)}` }),
      providesTags: (_result, _error, customerId) => [{ type: "Customer", id: customerId }],
    }),
    createCustomer: build.mutation<ApiSuccess<Customer>, CustomerWriteBody>({
      query: (body) => ({ url: "/tenant-admin/customers", method: "POST", body }),
      invalidatesTags: ["Customer"],
    }),
    updateCustomer: build.mutation<ApiSuccess<Customer>, { customerId: string; body: Partial<CustomerWriteBody> & { status?: CustomerStatus } }>({
      query: ({ customerId, body }) => ({
        url: `/tenant-admin/customers/${encodeURIComponent(customerId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, args) => [
        { type: "Customer", id: args.customerId },
        "Customer",
      ],
    }),
    listCustomerContacts: build.query<
      ApiSuccess<CustomerContact[]> & { meta?: PaginationMeta },
      ContactListArgs | void
    >({
      query: (args) => ({
        url: `/tenant-admin/customers/contacts${queryString({
          search: args?.search,
          customerId: args?.customerId,
          portalStatus: args?.portalStatus,
          page: args?.page,
          limit: args?.limit ?? 100,
        })}`,
      }),
      providesTags: ["CustomerContact"],
    }),
    createCustomerContact: build.mutation<
      ApiSuccess<CustomerContact>,
      { customerId: string; body: ContactWriteBody }
    >({
      query: ({ customerId, body }) => ({
        url: `/tenant-admin/customers/${encodeURIComponent(customerId)}/contacts`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["CustomerContact", "Customer"],
    }),
    updateCustomerContact: build.mutation<
      ApiSuccess<CustomerContact>,
      { customerId: string; contactId: string; body: Partial<ContactWriteBody> }
    >({
      query: ({ customerId, contactId, body }) => ({
        url: `/tenant-admin/customers/${encodeURIComponent(customerId)}/contacts/${encodeURIComponent(contactId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["CustomerContact", "Customer"],
    }),
    inviteCustomerContactPortal: build.mutation<
      ApiSuccess<CustomerContact>,
      { customerId: string; contactId: string }
    >({
      query: ({ customerId, contactId }) => ({
        url: `/tenant-admin/customers/${encodeURIComponent(customerId)}/contacts/${encodeURIComponent(contactId)}/portal/invite`,
        method: "POST",
      }),
      invalidatesTags: ["CustomerContact"],
    }),
    revokeCustomerContactPortal: build.mutation<
      ApiSuccess<CustomerContact>,
      { customerId: string; contactId: string }
    >({
      query: ({ customerId, contactId }) => ({
        url: `/tenant-admin/customers/${encodeURIComponent(customerId)}/contacts/${encodeURIComponent(contactId)}/portal/revoke`,
        method: "POST",
      }),
      invalidatesTags: ["CustomerContact"],
    }),
    listCustomerSites: build.query<
      ApiSuccess<CustomerSite[]> & { meta?: PaginationMeta },
      SiteListArgs | void
    >({
      query: (args) => ({
        url: `/tenant-admin/customers/sites${queryString({
          search: args?.search,
          customerId: args?.customerId,
          isDataCenter: args?.isDataCenter,
          page: args?.page,
          limit: args?.limit ?? 100,
        })}`,
      }),
      providesTags: ["CustomerSite"],
    }),
    createCustomerSite: build.mutation<
      ApiSuccess<CustomerSite>,
      { customerId: string; body: SiteWriteBody }
    >({
      query: ({ customerId, body }) => ({
        url: `/tenant-admin/customers/${encodeURIComponent(customerId)}/sites`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["CustomerSite", "Customer"],
    }),
    updateCustomerSite: build.mutation<
      ApiSuccess<CustomerSite>,
      { customerId: string; siteId: string; body: Partial<SiteWriteBody> }
    >({
      query: ({ customerId, siteId, body }) => ({
        url: `/tenant-admin/customers/${encodeURIComponent(customerId)}/sites/${encodeURIComponent(siteId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["CustomerSite", "Customer"],
    }),
    listIncidents: build.query<
      ApiSuccess<IncidentSummary[]> & { meta?: PaginationMeta },
      IncidentListArgs | void
    >({
      query: (args) => ({
        url: `/itsm/incidents${queryString({
          search: args?.search,
          customerId: args?.customerId,
          status: args?.statusKey,
          page: args?.page,
          limit: args?.limit ?? 100,
        })}`,
      }),
      providesTags: ["Incident"],
    }),
  }),
});

export const {
  useListCustomersQuery,
  useGetCustomerQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useListCustomerContactsQuery,
  useCreateCustomerContactMutation,
  useUpdateCustomerContactMutation,
  useInviteCustomerContactPortalMutation,
  useRevokeCustomerContactPortalMutation,
  useListCustomerSitesQuery,
  useCreateCustomerSiteMutation,
  useUpdateCustomerSiteMutation,
  useListIncidentsQuery,
} = customersApi;
