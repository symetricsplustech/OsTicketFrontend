import type { ReactElement } from "react";
import { TENANT_RESOURCE_LISTS } from "../../resources";
import { ResourceCreateScreen } from "./ResourceCreateScreen";
import { InviteUserScreen } from "./InviteUserScreen";
import { CreateTicketScreen } from "./CreateTicketScreen";
import { RolePermissionMatrixPage } from "./RolePermissionMatrixPage";

export interface TenantScreenRoute {
  /** Path relative to /organization. */
  path: string;
  element: ReactElement;
}

function createRoute(
  path: string,
  title: string,
  sectionLabel: string,
  sourcePath: string,
  backHref: string,
): TenantScreenRoute {
  const config = TENANT_RESOURCE_LISTS.find(
    (entry) => entry.path === sourcePath,
  );
  return {
    path,
    element: (
      <ResourceCreateScreen
        title={title}
        sectionLabel={sectionLabel}
        backHref={backHref}
        create={config?.create}
      />
    ),
  };
}

const ORG_USERS = "/organization/organization-users/user-management/all-users";
const ROLES = "/organization/roles-access-control/roles/all-roles";
const CATALOG_ITEMS = "/organization/service-catalog/catalog-items";
const WORKFLOWS = "/organization/workflow-automation/workflow-definitions";
const TEAMS = "/organization/teams-on-call/all-teams";
const VENDORS = "/organization/vendor-management/all-vendors";

export const TENANT_SCREEN_ROUTES: TenantScreenRoute[] = [
  {
    path: "roles-access-control/roles/role-permission-matrix",
    element: <RolePermissionMatrixPage />,
  },
  createRoute(
    "organization-users/user-management/invite-users",
    "Invite Users",
    "Organization & Users",
    ORG_USERS,
    ORG_USERS,
  ),
  {
    path: "organization-users/user-management/create-user",
    element: <InviteUserScreen />,
  },
  {
    path: "service-desk/create-ticket",
    element: <CreateTicketScreen />,
  },
  createRoute(
    "roles-access-control/roles/create-role",
    "Create Role",
    "Roles & Access Control",
    ROLES,
    ROLES,
  ),
  createRoute(
    "service-catalog/create-catalog-item",
    "Create Catalog Item",
    "Service Catalog & Knowledge",
    CATALOG_ITEMS,
    CATALOG_ITEMS,
  ),
  createRoute(
    "workflow-automation/create-workflow",
    "Create Workflow",
    "Workflow & Automation",
    WORKFLOWS,
    WORKFLOWS,
  ),
  createRoute(
    "teams-on-call/create-team",
    "Create Team",
    "Teams & On-Call",
    TEAMS,
    TEAMS,
  ),
  createRoute(
    "vendor-management/create-vendor",
    "Create Vendor",
    "Vendor Management",
    VENDORS,
    VENDORS,
  ),
];
