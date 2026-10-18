import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "@services/http";

/**
 * RTK Query API for the tenant (Organization Admin) surface.
 *
 * Everything under `/tenant-admin/*` and the tenant-scoped `/itsm/*` read
 * models is injected here module-by-module.
 */
export const tenantadminApi = createApi({
  reducerPath: "tenantadminApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Customer", "CustomerContact", "CustomerSite", "Incident"],
  endpoints: () => ({}),
});

export type TenantAdminApi = typeof tenantadminApi;
