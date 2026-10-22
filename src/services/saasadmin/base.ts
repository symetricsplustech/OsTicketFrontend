import { createApi } from "@reduxjs/toolkit/query/react";
import { API_URL, baseQueryWithAuth, type AuthBaseQuery } from "@services/http";

export { API_URL } from "@services/http";

/**
 * The single RTK Query API for the SaaS Admin control plane.
 *
 * Authentication endpoints live in the common `@services/auth` API; everything
 * under `/admin/*` is injected here module-by-module.
 */
export type SaasAdminBaseQuery = AuthBaseQuery;

export const saasadminApi = createApi({
  reducerPath: "saasadminApi",
  baseQuery: baseQueryWithAuth,
  keepUnusedDataFor: 300,
  refetchOnMountOrArgChange: false,
  refetchOnFocus: false,
  refetchOnReconnect: false,
  tagTypes: [
    "AuthUser",
    "Session",
    "Dashboard",
    "Tenant",
    "TenantDomain",
    "Staff",
    "Role",
    "Permission",
    "AccessPolicy",
    "Approval",
    "Service",
    "SlaPolicy",
    "Workflow",
    "ItsmConfiguration",
    "Knowledge",
    "Cmdb",
    "EmailNotification",
    "Integration",
    "ApiKey",
    "Webhook",
    "Support",
    "Report",
    "AuditEvent",
    "SystemAdministration",
    "PlatformSettings",
    "MyAccount",
  ],
  endpoints: () => ({}),
});

export type SaasAdminApi = typeof saasadminApi;
