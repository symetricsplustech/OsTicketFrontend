import { SAAS_ADMIN_BASE_PATH } from "./saasAdminNavigation";

/**
 * Typed path builders for every SaaS Admin route. Screens should reference
 * these instead of hardcoding `/saas-admin/...` strings so a route change is a
 * single-file edit.
 */
const build = (...segments: string[]): string =>
  [SAAS_ADMIN_BASE_PATH, ...segments].join("/");

export const SAAS_ADMIN_PATHS = {
  dashboard: {
    overview: build("dashboard", "overview"),
  },
  tenants: {
    all: build("tenants", "all-tenants"),
    create: build("tenants", "create-tenant"),
    details: (tenantId: string) => build("tenants", "details", tenantId),
    configuration: (tenantId: string) =>
      build("tenants", "configuration", tenantId),
    status: build("tenants", "status"),
  },
  staff: {
    accounts: build("staff-management", "staff-accounts"),
    account: (staffId: string) =>
      build("staff-management", "staff-accounts", staffId),
    create: build("staff-management", "create-staff"),
    edit: (staffId: string) => build("staff-management", "edit", staffId),
    roles: build("staff-management", "roles"),
    role: (roleId: string) => build("staff-management", "roles", roleId),
    roleNew: build("staff-management", "roles", "new"),
    roleEdit: (roleId: string) =>
      build("staff-management", "roles", "edit", roleId),
    permissions: build("staff-management", "permissions"),
    roleAssignment: build("staff-management", "role-assignment"),
    auditLogs: build("staff-management", "audit-logs"),
  },
  platformSettings: {
    general: build("platform-settings", "general"),
    branding: build("platform-settings", "branding"),
    domains: build("platform-settings", "domains"),
    localization: build("platform-settings", "localization"),
    maintenance: build("platform-settings", "maintenance"),
  },
  myAccount: {
    profile: build("my-account", "profile"),
    changePassword: build("my-account", "change-password"),
    mfaSecurity: build("my-account", "mfa-security"),
    sessions: build("my-account", "sessions"),
  },
} as const;
