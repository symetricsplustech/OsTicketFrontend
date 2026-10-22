import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router-dom";
import {
  ORGANIZATION_ADMIN_BASE_PATH,
  ORGANIZATION_ADMIN_HOME_PATH,
  ORGANIZATION_ADMIN_NAVIGATION,
} from "@/navigation/organizationAdminNavigation.tsx";
import { OrganizationAdminSurface } from "./OrganizationAdminSurface";
// The generic org-admin pages carry the large sample-pool page model — keep
// them out of the initial bundle; they load on first navigation.
const OrganizationAdminPage = lazy(() =>
  import("./pages/OrganizationAdminPage").then((m) => ({
    default: m.OrganizationAdminPage,
  })),
);
const RecordDetailPage = lazy(() =>
  import("./pages/RecordDetailPage").then((m) => ({
    default: m.RecordDetailPage,
  })),
);
import { OrganizationResourceDetailScreen } from "./OrganizationResourceDetailScreen";
import { OrganizationCustomersDirectoryPage } from "./customers/OrganizationCustomersDirectoryPage";
import { OrganizationCustomerCreatePage } from "./customers/OrganizationCustomerCreatePage";
import { OrganizationCustomerDetailPage } from "./customers/OrganizationCustomerDetailPage";
import {
  OrganizationCustomerContactsPage,
  OrganizationCustomerPortalAccessPage,
} from "./customers/OrganizationCustomerContactsPage";
import { OrganizationCustomerSitesPage } from "./customers/OrganizationCustomerSitesPage";
import { OrganizationCustomerTicketsPage } from "./customers/OrganizationCustomerTicketsPage";
import { ResourceListScreen } from "@/screens/saas-admin/components/resource/ResourceListScreen";
import { ConfigPanelScreen } from "@/screens/saas-admin/components/resource/ConfigPanelScreen";
import { TENANT_RESOURCE_LISTS, TENANT_RESOURCE_PANELS } from "./resources";
import { TENANT_SCREEN_ROUTES } from "./pages/tenant";
import { IncidentDetailPage } from "./pages/tenant/IncidentDetailPage";
import { SlaMonitorScreen } from "./pages/tenant/SlaMonitorScreen";

/**
 * Nav leaves whose closest real screen is another wired destination (the
 * target is the same resource, or a superset view of it). They redirect
 * instead of rendering an unwired page.
 */
export const LEAF_ALIASES: ReadonlyArray<readonly [string, string]> = [
  // Organization & Users
  ["organization-users/organization-profile/organization-details", "organization-settings/organization-profile"],
  ["organization-users/organization-profile/logo-and-branding", "organization-settings/branding-and-logo"],
  ["organization-users/organization-profile/contact-information", "organization-settings/organization-contact-details"],
  ["organization-users/organization-profile/address-and-regional-information", "organization-settings/organization-profile"],
  ["organization-users/organization-profile/timezone-and-locale", "organization-settings/timezone-and-date-format"],
  ["organization-users/organization-structure/business-units", "organization-users/organization-structure/departments"],
  ["organization-users/organization-structure/offices-and-sites", "organization-users/organization-structure/locations"],
  ["organization-users/user-management/user-profile", "organization-users/user-management/all-users"],
  ["organization-users/user-management/edit-user", "organization-users/user-management/all-users"],
  ["organization-users/user-management/activate-suspend-user", "organization-users/user-management/all-users"],
  ["organization-users/user-management/deactivate-user", "organization-users/user-management/all-users"],
  ["organization-users/user-management/last-login-and-account-status", "organization-users/user-management/user-login-and-activity-history"],
  ["organization-users/user-lifecycle/access-review", "roles-access-control/access-governance/access-review-campaigns"],
  // Roles & Access Control
  ["roles-access-control/roles/edit-role", "roles-access-control/roles/all-roles"],
  ["roles-access-control/roles/clone-role", "roles-access-control/roles/all-roles"],
  ["roles-access-control/roles/assign-role", "roles-access-control/roles/all-roles"],
  ["roles-access-control/roles/role-members", "roles-access-control/roles/all-roles"],
  ["roles-access-control/access-policies/department-based-access", "roles-access-control/access-policies/user-access-policies"],
  ["roles-access-control/access-policies/group-based-access", "roles-access-control/access-policies/user-access-policies"],
  ["roles-access-control/access-policies/record-level-access-rules", "roles-access-control/access-policies/user-access-policies"],
  ["roles-access-control/access-policies/field-level-restrictions", "roles-access-control/access-policies/user-access-policies"],
  ["roles-access-control/user-assignments/user-to-role-assignments", "roles-access-control/roles/all-roles"],
  ["roles-access-control/access-governance/privileged-access-review", "roles-access-control/access-governance/access-review-campaigns"],
  ["roles-access-control/access-governance/permission-change-history", "security-audit/organization-audit-logs"],
  // Service Desk
  ["service-desk/service-desk-overview", "dashboard/operational-summary"],
  ["service-desk/queue-workload", "dashboard/team-workload"],
  ["service-desk/service-desk-activity-history", "dashboard/recent-organization-activity"],
  // Incident Management
  ["incident-management/incident-overview", "dashboard/open-incidents-summary"],
  ["incident-management/major-incident-communication", "incident-management/major-incident-management"],
  ["incident-management/escalation-configuration", "sla-service-performance/escalation-rules"],
  ["incident-management/incident-notifications", "notifications-communications/notification-rules"],
  // Problem Management
  ["problem-management/problem-overview", "problem-management/all-problems"],
  ["problem-management/workaround-library", "problem-management/known-errors"],
  // Change Management
  ["change-management/change-overview", "change-management/all-change-requests"],
  ["change-management/standard-changes", "change-management/all-change-requests"],
  ["change-management/normal-changes", "change-management/all-change-requests"],
  ["change-management/emergency-changes", "change-management/all-change-requests"],
  ["change-management/change-approval-policies", "workflow-automation/approval-workflows"],
  ["change-management/maintenance-windows", "change-management/change-calendar"],
  // Request Management
  ["request-management/request-overview", "request-management/all-service-requests"],
  ["request-management/request-approval-policies", "workflow-automation/approval-workflows"],
  ["request-management/request-notifications", "notifications-communications/notification-rules"],
  // Service Catalog
  ["service-catalog/catalog-overview", "service-catalog/catalog-items"],
  ["service-catalog/edit-catalog-item", "service-catalog/catalog-items"],
  ["service-catalog/catalog-item-approvals", "workflow-automation/approval-workflows"],
  ["service-catalog/fulfillment-workflows", "workflow-automation/workflow-definitions"],
  ["service-catalog/assignment-and-routing-rules", "service-desk/ticket-routing-rules"],
  // Knowledge Management
  ["knowledge-management/knowledge-overview", "knowledge-management/knowledge-articles"],
  ["knowledge-management/knowledge-bases", "knowledge-management/knowledge-articles"],
  // SLA & Service Performance
  ["sla-service-performance/sla-dashboard", "sla-service-performance/sla-policies"],
  ["sla-service-performance/response-time-targets", "sla-service-performance/sla-policies"],
  ["sla-service-performance/resolution-time-targets", "sla-service-performance/sla-policies"],
  ["sla-service-performance/business-hours", "service-desk/service-desk-operating-hours"],
  ["sla-service-performance/holiday-calendars", "organization-settings/holiday-calendars"],
  ["sla-service-performance/sla-pause-conditions", "sla-service-performance/sla-policies"],
  ["sla-service-performance/sla-start-and-stop-conditions", "sla-service-performance/sla-policies"],
  ["sla-service-performance/warning-thresholds", "sla-service-performance/sla-policies"],
  ["sla-service-performance/breach-notifications", "notifications-communications/notification-rules"],
  ["sla-service-performance/sla-assignment-rules", "sla-service-performance/sla-policies"],
  ["sla-service-performance/breach-history", "reports-analytics/sla-breach-reports"],
  // Workflow & Automation
  ["workflow-automation/workflow-dashboard", "workflow-automation/workflow-execution-history"],
  ["workflow-automation/workflow-designer", "workflow-automation/workflow-definitions"],
  ["workflow-automation/workflow-version-history", "workflow-automation/workflow-definitions"],
  ["workflow-automation/workflow-validation", "workflow-automation/workflow-definitions"],
  ["workflow-automation/publish-and-retire-workflows", "workflow-automation/workflow-definitions"],
  ["workflow-automation/failed-workflow-runs", "workflow-automation/workflow-execution-history"],
  ["workflow-automation/retry-and-cancel-eligible-runs", "workflow-automation/workflow-execution-history"],
  ["workflow-automation/business-rules", "workflow-automation/automation-rules"],
  ["workflow-automation/trigger-configuration", "workflow-automation/automation-rules"],
  ["workflow-automation/scheduled-automation", "workflow-automation/automation-rules"],
  ["workflow-automation/conditional-actions", "workflow-automation/automation-rules"],
  ["workflow-automation/assignment-automation", "workflow-automation/automation-rules"],
  ["workflow-automation/notification-automation", "workflow-automation/automation-rules"],
  // CMDB & Assets
  ["cmdb-assets/cmdb/cmdb-overview", "cmdb-assets/cmdb/configuration-items"],
  ["cmdb-assets/cmdb/dependency-maps", "cmdb-assets/cmdb/ci-relationships"],
  ["cmdb-assets/cmdb/cmdb-import-jobs", "organization-users/user-management/user-import-history"],
  ["cmdb-assets/asset-management/asset-overview", "cmdb-assets/asset-management/all-assets"],
  ["cmdb-assets/asset-management/hardware-assets", "cmdb-assets/asset-management/all-assets"],
  ["cmdb-assets/asset-management/software-assets", "cmdb-assets/asset-management/all-assets"],
  ["cmdb-assets/asset-management/asset-import", "organization-users/user-management/user-import-history"],
  ["cmdb-assets/discovery/discovery-schedules", "cmdb-assets/discovery/discovery-configuration"],
  ["cmdb-assets/discovery/discovery-job-history", "cmdb-assets/discovery/discovery-configuration"],
  ["cmdb-assets/discovery/discovery-credentials", "cmdb-assets/discovery/discovery-configuration"],
  ["cmdb-assets/discovery/discovery-profiles", "cmdb-assets/discovery/discovery-configuration"],
  ["cmdb-assets/discovery/discovery-errors", "cmdb-assets/discovery/discovery-configuration"],
  ["cmdb-assets/discovery/discovery-reconciliation", "cmdb-assets/discovery/discovery-configuration"],
  // Teams & On-Call
  ["teams-on-call/edit-team", "teams-on-call/all-teams"],
  ["teams-on-call/team-members", "teams-on-call/all-teams"],
  ["teams-on-call/team-leads", "teams-on-call/all-teams"],
  ["teams-on-call/assignment-groups", "service-desk/assignment-groups"],
  ["teams-on-call/team-queues", "service-desk/my-organization-s-queues"],
  ["teams-on-call/workload-distribution", "dashboard/team-workload"],
  ["teams-on-call/escalation-schedules", "sla-service-performance/escalation-rules"],
  // Release Management
  ["release-management/release-overview", "release-management/all-releases"],
  ["release-management/release-templates", "release-management/all-releases"],
  ["release-management/release-plans", "release-management/all-releases"],
  ["release-management/release-calendars", "release-management/all-releases"],
  ["release-management/release-approval-rules", "workflow-automation/approval-workflows"],
  ["release-management/release-dependencies", "release-management/all-releases"],
  ["release-management/release-tasks", "release-management/all-releases"],
  ["release-management/release-history", "release-management/all-releases"],
  // Notifications & Communications
  ["notifications-communications/event-triggers", "notifications-communications/notification-rules"],
  ["notifications-communications/announcement-management", "notifications-communications/organization-announcements"],
  ["notifications-communications/escalation-notifications", "notifications-communications/notification-rules"],
  ["notifications-communications/sla-warning-notifications", "notifications-communications/notification-rules"],
  ["notifications-communications/incident-notifications", "notifications-communications/notification-rules"],
  ["notifications-communications/change-notifications", "notifications-communications/notification-rules"],
  // Vendor Management
  ["vendor-management/vendor-overview", "vendor-management/all-vendors"],
  ["vendor-management/vendor-profiles", "vendor-management/all-vendors"],
  ["vendor-management/vendor-contacts", "vendor-management/all-vendors"],
  ["vendor-management/vendor-contracts", "vendor-management/all-vendors"],
  ["vendor-management/vendor-services", "vendor-management/all-vendors"],
  ["vendor-management/vendor-slas", "vendor-management/all-vendors"],
  ["vendor-management/vendor-risk-records", "vendor-management/all-vendors"],
  ["vendor-management/vendor-related-incidents", "vendor-management/all-vendors"],
  ["vendor-management/vendor-reviews", "vendor-management/all-vendors"],
  ["vendor-management/vendor-documents", "vendor-management/all-vendors"],
  // Reports & Analytics
  ["reports-analytics/agent-workload", "dashboard/team-workload"],
  ["reports-analytics/csv-excel-export", "reports-analytics/export-history"],
  // Security & Audit
  ["security-audit/role-and-permission-changes", "security-audit/organization-audit-logs"],
  ["security-audit/privileged-action-history", "security-audit/organization-audit-logs"],
  ["security-audit/data-access-history", "security-audit/organization-audit-logs"],
  ["security-audit/access-review-history", "roles-access-control/access-governance/access-review-campaigns"],
  ["security-audit/export-activity", "reports-analytics/export-history"],
  ["security-audit/integration-security-events", "security-audit/security-alerts"],
  // Organization Settings (no backend reset/history endpoints)
  ["organization-settings/configuration-history", "security-audit/organization-audit-logs"],
];

function relative(path: string): string {
  return path.startsWith(`${ORGANIZATION_ADMIN_BASE_PATH}/`)
    ? path.slice(ORGANIZATION_ADMIN_BASE_PATH.length + 1)
    : path.replace(/^\//, "");
}

interface LeafRoute {
  /** Relative path under /organization (also the routeKey for the page model). */
  path: string;
  sectionKey: string;
  section: string;
  title: string;
  description: string;
}

const leafRoutes: LeafRoute[] = [];
const groupRedirects: { path: string; to: string }[] = [];

for (const section of ORGANIZATION_ADMIN_NAVIGATION) {
  if (section.key === "customers") continue;
  for (const item of section.items) {
    if (item.children && item.children.length > 0) {
      const first = item.children[0];
      groupRedirects.push({
        path: relative(
          `${ORGANIZATION_ADMIN_BASE_PATH}/${section.key}/${item.key}`,
        ),
        to: first.path,
      });
      for (const child of item.children) {
        leafRoutes.push({
          path: relative(child.path),
          sectionKey: section.key,
          section: section.label,
          title: child.label,
          description: `${child.label} — ${section.label} for your organization.`,
        });
      }
      continue;
    }
    if (item.path) {
      leafRoutes.push({
        path: relative(item.path),
        sectionKey: section.key,
        section: section.label,
        title: item.label,
        description: `${item.label} — ${section.label} for your organization.`,
      });
    }
  }
}

/** Routable screens for the Organization Admin (Tenant Admin) workspace. */
export const ORGANIZATION_ADMIN_ROUTES: RouteObject[] = [
  {
    path: ORGANIZATION_ADMIN_BASE_PATH,
    element: <OrganizationAdminSurface />,
    children: [
      {
        index: true,
        element: <Navigate to={ORGANIZATION_ADMIN_HOME_PATH} replace />,
      },
      ...groupRedirects.map((redirect) => ({
        path: redirect.path,
        element: <Navigate to={redirect.to} replace />,
      })),
      // Customers & Customer Contacts — real, API-connected workspace.
      {
        path: "customers/customer-directory",
        element: <OrganizationCustomersDirectoryPage />,
      },
      {
        path: "customers/create-customer",
        element: <OrganizationCustomerCreatePage />,
      },
      {
        path: "customers/customer-contacts",
        element: <OrganizationCustomerContactsPage />,
      },
      {
        path: "customers/customer-portal-access",
        element: <OrganizationCustomerPortalAccessPage />,
      },
      {
        path: "customers/service-locations",
        element: <OrganizationCustomerSitesPage />,
      },
      {
        path: "customers/customer-ticket-history",
        element: <OrganizationCustomerTicketsPage />,
      },
      {
        path: "customers/:customerId",
        element: <OrganizationCustomerDetailPage />,
      },
            ...TENANT_RESOURCE_LISTS.map((config) => ({
        path: config.path.replace(/^\/organization\//, ""),
        element: <ResourceListScreen config={config} />,
      })),
      // Incident detail with full lifecycle actions (assign, resolve, comment, reopen).
      {
        path: "service-desk/all-service-desk-tickets/:incidentId",
        element: <IncidentDetailPage />,
      },
      // SLA monitor — per-ticket SLA clocks, deadlines, and breaches.
      {
        path: "sla-service-performance/sla-monitor",
        element: <SlaMonitorScreen />,
      },
      ...TENANT_RESOURCE_LISTS.map((config) => ({
        path: config.path.replace(/^\/organization\//, "") + "/:recordId",
        element: <OrganizationResourceDetailScreen />,
      })),
      // Connected settings panels (GET/PUT forms over real endpoints).
      ...TENANT_RESOURCE_PANELS.map((config) => ({
        path: config.path.replace(/^\/organization\//, ""),
        element: <ConfigPanelScreen config={config} />,
      })),
      // Standalone screens (create forms, permission matrix).
      ...TENANT_SCREEN_ROUTES.map((route) => ({
        path: route.path,
        element: route.element,
      })),
      // Nav leaves that mirror another wired screen — redirect there.
      ...LEAF_ALIASES.map(([from, to]) => ({
        path: from,
        element: <Navigate to={`${ORGANIZATION_ADMIN_BASE_PATH}/${to}`} replace />,
      })),
      // Every other catalogued destination renders its full module page.
      ...leafRoutes.map((leaf) => ({
        path: leaf.path,
        element: (
          <OrganizationAdminPage
            sectionKey={leaf.sectionKey}
            section={leaf.section}
            title={leaf.title}
            description={leaf.description}
            routeKey={leaf.path}
          />
        ),
      })),
      // Nested record pages — list rows open into a full record workspace.
      ...leafRoutes.map((leaf) => ({
        path: `${leaf.path}/:recordId`,
        element: (
          <RecordDetailPage
            section={leaf.section}
            collectionTitle={leaf.title}
            routeKey={leaf.path}
          />
        ),
      })),
    ],
  },
];
