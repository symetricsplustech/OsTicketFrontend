import { describe, expect, it } from "vitest";
import {
  ORGANIZATION_ADMIN_NAVIGATION,
  ORGANIZATION_ADMIN_BASE_PATH,
} from "@/navigation/organizationAdminNavigation.tsx";
import { TENANT_RESOURCE_LISTS, TENANT_RESOURCE_PANELS } from "../resources";
import { TENANT_SCREEN_ROUTES } from "../pages/tenant";

function relative(path: string): string {
  return path.startsWith(`${ORGANIZATION_ADMIN_BASE_PATH}/`)
    ? path.slice(ORGANIZATION_ADMIN_BASE_PATH.length + 1)
    : path.replace(/^\//, "");
}

/**
 * Nav leaves with no honest backend data behind them. They render the
 * "Not connected yet" fallback page. This list may only shrink: a new
 * nav leaf must either be wired to a real endpoint or consciously
 * added here after review.
 */
const HONEST_LEFTOVERS: ReadonlySet<string> = new Set([
  "change-management/blackout-periods",
  "change-management/cab-members",
  "change-management/change-advisory-board",
  "change-management/conflict-detection",
  "change-management/impact-assessment",
  "change-management/implementation-plans",
  "change-management/post-implementation-reviews",
  "change-management/risk-assessment-rules",
  "change-management/rollback-plans",
  "cmdb-assets/asset-management/asset-assignments",
  "cmdb-assets/asset-management/asset-categories",
  "cmdb-assets/asset-management/asset-disposal",
  "cmdb-assets/asset-management/asset-lifecycle",
  "cmdb-assets/asset-management/asset-locations",
  "cmdb-assets/asset-management/asset-ownership",
  "cmdb-assets/asset-management/procurement-records",
  "cmdb-assets/asset-management/warranty-information",
  "cmdb-assets/cmdb/business-services",
  "cmdb-assets/cmdb/ci-attributes",
  "cmdb-assets/cmdb/ci-classes-and-types",
  "cmdb-assets/cmdb/ci-lifecycle-states",
  "cmdb-assets/cmdb/ci-reconciliation-rules",
  "cmdb-assets/cmdb/data-quality-rules",
  "cmdb-assets/cmdb/duplicate-ci-detection",
  "incident-management/auto-assignment-configuration",
  "incident-management/incident-assignment-rules",
  "incident-management/incident-closure-rules",
  "incident-management/incident-subcategories",
  "incident-management/incident-templates",
  "incident-management/reopen-policies",
  "knowledge-management/article-access-policies",
  "knowledge-management/article-templates",
  "knowledge-management/article-version-history",
  "knowledge-management/draft-articles",
  "knowledge-management/expiry-and-review-schedules",
  "knowledge-management/feedback-and-ratings",
  "knowledge-management/internal-and-employee-facing-content",
  "knowledge-management/search-configuration",
  "notifications-communications/department-notification-preferences",
  "notifications-communications/in-app-notification-templates",
  "notifications-communications/notification-overview",
  "notifications-communications/test-notification",
  "notifications-communications/user-notification-preferences",
  "organization-settings/reset-to-organization-defaults",
  "organization-users/external-users/contractors",
  "organization-users/external-users/guest-users",
  "organization-users/external-users/vendors",
  "organization-users/user-lifecycle/deprovisioning-tasks",
  "organization-users/user-lifecycle/offboarding",
  "organization-users/user-lifecycle/onboarding",
  "problem-management/problem-assignment-rules",
  "problem-management/problem-investigation-rules",
  "problem-management/problem-review-and-closure-rules",
  "problem-management/problem-templates",
  "problem-management/problem-to-incident-relationships",
  "release-management/deployment-readiness",
  "release-management/release-validation",
  "release-management/rollback-plans",
  "request-management/request-assignment-rules",
  "request-management/request-categories",
  "request-management/request-closure-rules",
  "request-management/request-fulfillment-rules",
  "request-management/request-status-configuration",
  "request-management/request-templates",
  "roles-access-control/user-assignments/temporary-access",
  "roles-access-control/user-assignments/user-to-group-assignments",
  "security-audit/ip-allowlist",
  "security-audit/mfa-enforcement",
  "security-audit/password-policies",
  "security-audit/retention-and-privacy-controls",
  "service-catalog/audience-and-department-restrictions",
  "service-catalog/catalog-preview",
  "service-catalog/catalog-publishing",
  "service-catalog/catalog-version-history",
  "service-catalog/conditional-form-rules",
  "service-catalog/item-availability",
  "service-catalog/item-forms-and-fields",
  "service-catalog/required-and-optional-fields",
  "service-desk/overdue-tickets",
  "service-desk/ticket-status-configuration",
  "service-desk/unassigned-tickets",
  "service-desk/create-ticket",
  "teams-on-call/absence-and-coverage",
  "teams-on-call/escalation-contacts",
  "teams-on-call/handover-rules",
  "teams-on-call/team-availability",
  "workflow-automation/workflow-templates",
]);

function navLeafPaths(): string[] {
  const paths: string[] = [];
  for (const section of ORGANIZATION_ADMIN_NAVIGATION) {
    for (const item of section.items) {
      if (item.children && item.children.length > 0) {
        for (const child of item.children) paths.push(relative(child.path));
      } else if (item.path) {
        paths.push(relative(item.path));
      }
    }
  }
  return paths;
}

async function coveredPaths(): Promise<Set<string>> {
  const covered = new Set<string>([
    ...TENANT_RESOURCE_LISTS.map((c) => relative(c.path)),
    ...TENANT_RESOURCE_PANELS.map((c) => relative(c.path)),
    ...TENANT_SCREEN_ROUTES.map((r) => r.path),
    "customers/customer-directory",
    "customers/create-customer",
    "customers/customer-contacts",
    "customers/customer-portal-access",
    "customers/service-locations",
    "customers/customer-ticket-history",
  ]);
  const { LEAF_ALIASES } = await import("../organizationAdminRoutes");
  for (const [from] of LEAF_ALIASES) covered.add(from);
  return covered;
}

describe("org-admin nav coverage", () => {
  it("has no unwired nav leaves outside the reviewed honest list", async () => {
    const covered = await coveredPaths();
    const uncovered = navLeafPaths().filter((path) => !covered.has(path));
    const unexpected = uncovered.filter(
      (path) => !HONEST_LEFTOVERS.has(path),
    );
    expect(
      unexpected,
      `New nav leaves must be wired to a real backend screen or added to ` +
        `HONEST_LEFTOVERS after review:\n  ${unexpected.join("\n  ")}`,
    ).toEqual([]);
  });
});
