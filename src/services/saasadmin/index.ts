/**
 * SaaS Admin API — a single RTK Query API split module-by-module.
 *
 * Every module file calls `saasadminApi.injectEndpoints(...)`. Importing this
 * barrel guarantees all of them are registered (the store imports the API from
 * here), and re-exports each module's generated hooks.
 *
 * Surface lives under `/api/v1/admin/*` on the shared backend.
 */
export { saasadminApi, API_URL } from "./base";
export type { SaasAdminBaseQuery, SaasAdminApi } from "./base";
export * from "./types";

export * from "./auth";
export * from "./dashboard";
export * from "./tenants";
export * from "./tenantDomains";
export * from "./staff";
export * from "./roles";
export * from "./permissions";
export * from "./accessPolicies";
export * from "./approvals";
export * from "./serviceManagement";
export * from "./slaManagement";
export * from "./workflowManagement";
export * from "./itsmConfiguration";
export * from "./knowledgeManagement";
export * from "./cmdbAssets";
export * from "./emailNotifications";
export * from "./integrations";
export * from "./apiKeys";
export * from "./webhooks";
export * from "./support";
export * from "./reports";
export * from "./audit";
export * from "./systemAdministration";
export * from "./platformSettings";
export * from "./myAccount";
