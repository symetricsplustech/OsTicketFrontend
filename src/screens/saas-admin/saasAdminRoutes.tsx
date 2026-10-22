import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { SAAS_ADMIN_BASE_PATH } from "@/navigation/saasAdminNavigation";
import { SaasAdminSurface } from "./SaasAdminSurface";
// Dashboard is lazy: it is the only screen importing recharts (~1 MB) and
// must not ship in the initial (e.g. /login) bundle.
const DashboardOverviewScreen = lazy(() =>
  import("./dashboard/OverviewScreen").then((m) => ({
    default: m.DashboardOverviewScreen,
  })),
);
import { AllTenantsScreen } from "./tenants/all-tenants/AllTenantsScreen";
import { CreateTenantScreen } from "./tenants/create-tenant/CreateTenantScreen";
import { TenantDetailsScreen } from "./tenants/tenant-details/TenantDetailsScreen";
import { TenantConfigurationScreen } from "./tenants/tenant-configuration/TenantConfigurationScreen";
import { TenantStatusScreen } from "./tenants/tenant-status/TenantStatusScreen";
import { StaffAccountsScreen } from "./staff-management/staff-accounts/StaffAccountsScreen";
import { StaffDetailsScreen } from "./staff-management/staff-accounts/StaffDetailsScreen";
import { StaffEditScreen } from "./staff-management/edit/StaffEditScreen";
import { CreateStaffScreen } from "./staff-management/create-staff/CreateStaffScreen";
import { RolesManagementScreen } from "./staff-management/roles-management/RolesManagementScreen";
import { RoleDetailsScreen } from "./staff-management/roles-management/RoleDetailsScreen";
import { RoleFormScreen } from "./staff-management/roles-management/RoleFormScreen";
import { PermissionsManagementScreen } from "./staff-management/permissions-management/PermissionsManagementScreen";
import { RoleAssignmentScreen } from "./staff-management/role-assignment/RoleAssignmentScreen";
import { AccessAuditLogsScreen } from "./staff-management/access-audit-logs/AccessAuditLogsScreen";
import { ResourceListScreen } from "./components/resource/ResourceListScreen";
import { ConfigPanelScreen } from "./components/resource/ConfigPanelScreen";
import { ChangePasswordScreen } from "./resources/ChangePasswordScreen";
import { RESOURCE_LISTS, RESOURCE_PANELS, relativePath } from "./resources";

export const SAAS_ADMIN_ROUTES: RouteObject[] = [
  {
    path: SAAS_ADMIN_BASE_PATH,
    element: <SaasAdminSurface />,
    children: [
      // Dashboard
      { path: "dashboard/overview", element: <DashboardOverviewScreen /> },

      // Tenant Management
      { path: "tenants/all-tenants", element: <AllTenantsScreen /> },
      { path: "tenants/create-tenant", element: <CreateTenantScreen /> },
      { path: "tenants/details/:tenantId", element: <TenantDetailsScreen /> },
      {
        path: "tenants/configuration/:tenantId",
        element: <TenantConfigurationScreen />,
      },
      { path: "tenants/status", element: <TenantStatusScreen /> },

      // Staff & Access Management
      {
        path: "staff-management/staff-accounts",
        element: <StaffAccountsScreen />,
      },
      {
        path: "staff-management/staff-accounts/:staffId",
        element: <StaffDetailsScreen />,
      },
      { path: "staff-management/edit/:staffId", element: <StaffEditScreen /> },
      { path: "staff-management/create-staff", element: <CreateStaffScreen /> },
      { path: "staff-management/roles", element: <RolesManagementScreen /> },
      { path: "staff-management/roles/new", element: <RoleFormScreen /> },
      {
        path: "staff-management/roles/edit/:roleId",
        element: <RoleFormScreen />,
      },
      {
        path: "staff-management/roles/:roleId",
        element: <RoleDetailsScreen />,
      },
      {
        path: "staff-management/permissions",
        element: <PermissionsManagementScreen />,
      },
      {
        path: "staff-management/role-assignment",
        element: <RoleAssignmentScreen />,
      },
      {
        path: "staff-management/audit-logs",
        element: <AccessAuditLogsScreen />,
      },

      // My Account
      { path: "my-account/change-password", element: <ChangePasswordScreen /> },

      // Config-driven screens (lists and setting panels) for the remaining
      // sidebar sections.
      ...RESOURCE_LISTS.map((config) => ({
        path: relativePath(config.path),
        element: <ResourceListScreen config={config} />,
      })),
      ...RESOURCE_PANELS.map((config) => ({
        path: relativePath(config.path),
        element: <ConfigPanelScreen config={config} />,
      })),
    ],
  },
];
