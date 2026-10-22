import { NAVIGATION_AREAS } from "./navigationModel.ts";
import { SCREEN_ROUTES } from "./screenRegistry.ts";

type AccessRule = { prefix: string; permissions: string[] };

const ACCESS_RULES: AccessRule[] = [
  {
    prefix: "/workspace/my-work",
    permissions: [
      "itsm.core.task_read",
      "itsm.assignment.ui.agent_inbox.access",
    ],
  },
  {
    prefix: "/workspace/my-groups",
    permissions: ["itsm.assignment.queue.read", "itsm.assignment.routing_read"],
  },
  {
    prefix: "/workspace/incidents",
    permissions: ["itsm.incident.incident.read", "itsm.incident.*"],
  },
  {
    prefix: "/workspace/problems",
    permissions: ["itsm.problem.problem.read", "itsm.problem.*"],
  },
  {
    prefix: "/workspace/changes",
    permissions: ["itsm.change.change_request.read", "itsm.change.*"],
  },
  {
    prefix: "/workspace/change-calendar",
    permissions: ["itsm.change.change_request.read", "itsm.change.*"],
  },
  {
    prefix: "/workspace/requests",
    permissions: [
      "itsm.request_catalog.request.read",
      "itsm.request_catalog.*",
    ],
  },
  {
    prefix: "/workspace/knowledge",
    permissions: ["itsm.knowledge.knowledge_article.read", "itsm.knowledge.*"],
  },
  {
    prefix: "/workspace/approvals",
    permissions: ["itsm.approval.approval_read", "itsm.approval.*"],
  },
  {
    prefix: "/workspace/cmdb",
    permissions: ["itsm.service_cmdb.ci_read", "itsm.service_cmdb.*"],
  },
  {
    prefix: "/workspace/services",
    permissions: ["itsm.service_cmdb.portfolio_read", "itsm.service_cmdb.*"],
  },
  {
    prefix: "/workspace/releases",
    permissions: ["itsm.release.release.read", "itsm.release.*"],
  },
  {
    prefix: "/workspace/improvements",
    permissions: ["itsm.improvement.opportunity_read", "itsm.improvement.*"],
  },
  {
    prefix: "/workspace/outages",
    permissions: ["itsm.outage.outage.read", "itsm.outage.*"],
  },
  {
    prefix: "/workspace/availability",
    permissions: ["itsm.outage.availability_read", "itsm.outage.*"],
  },
  {
    prefix: "/workspace/sla",
    permissions: ["itsm.sla.definition_read", "itsm.sla.*"],
  },
  {
    prefix: "/workspace/major-incidents",
    permissions: [
      "itsm.major_incident.major_incident.read",
      "itsm.major_incident.*",
    ],
  },
  {
    prefix: "/workspace/walk-up",
    permissions: ["itsm.walkup.interaction_read", "itsm.walkup.*"],
  },
  {
    prefix: "/manager/engineers",
    permissions: ["tenant.user.read", "itsm.core.user.read"],
  },
  {
    prefix: "/manager/approvals",
    permissions: ["itsm.approval.approval_read"],
  },
  {
    prefix: "/manager/reports",
    permissions: ["itsm.reporting_admin.report_read", "itsm.reporting_admin.*"],
  },
  {
    prefix: "/manager/sla-risk",
    permissions: ["itsm.sla.definition_read", "itsm.sla.*"],
  },
  {
    prefix: "/manager/schedule",
    permissions: ["itsm.on_call.current_on_call_read", "itsm.on_call.*"],
  },
  {
    prefix: "/manager/reassignments",
    permissions: ["itsm.assignment.queue.read", "itsm.assignment.*"],
  },
  {
    prefix: "/manager/escalations",
    permissions: ["itsm.incident.incident.read", "itsm.incident.*"],
  },
  {
    prefix: "/manager/queues",
    permissions: ["itsm.assignment.queue.read", "itsm.assignment.*"],
  },
  {
    prefix: "/manager/teams",
    permissions: ["tenant.team.read", "tenant.group.read", "itsm.assignment.*"],
  },
  {
    prefix: "/manager/workload",
    permissions: ["itsm.assignment.capacity_read_team", "itsm.assignment.*"],
  },
  {
    prefix: "/manager/team-work",
    permissions: ["itsm.core.task_read", "itsm.incident.incident.read"],
  },
  {
    prefix: "/manager",
    permissions: [
      "itsm.core.task_read",
      "itsm.incident.incident.read",
      "itsm.assignment.*",
    ],
  },
  {
    prefix: "/dispatch/engineers",
    permissions: ["tenant.user.read", "itsm.core.user.read"],
  },
  {
    prefix: "/dispatch/reports",
    permissions: ["itsm.reporting_admin.report_read", "itsm.reporting_admin.*"],
  },
  {
    prefix: "/dispatch/sla-risk",
    permissions: ["itsm.sla.definition_read", "itsm.sla.*"],
  },
  {
    prefix: "/dispatch/schedule",
    permissions: ["itsm.on_call.current_on_call_read", "itsm.on_call.*"],
  },
  {
    prefix: "/dispatch/escalations",
    permissions: ["itsm.incident.incident.read", "itsm.incident.*"],
  },
  {
    prefix: "/dispatch/reassignments",
    permissions: ["itsm.assignment.queue.read", "itsm.assignment.*"],
  },
  {
    prefix: "/dispatch/dispatch-board",
    permissions: ["itsm.assignment.queue.read", "itsm.assignment.*"],
  },
  {
    prefix: "/dispatch",
    permissions: ["itsm.incident.incident.read", "itsm.incident.*"],
  },
  {
    prefix: "/field/knowledge",
    permissions: ["itsm.knowledge.knowledge_article.read", "itsm.knowledge.*"],
  },
  {
    prefix: "/field/availability",
    permissions: ["itsm.outage.availability_read", "itsm.outage.*"],
  },
  { prefix: "/field/my-day", permissions: ["itsm.core.task_read"] },
  {
    prefix: "/field",
    permissions: ["itsm.incident.incident.read", "itsm.incident.*"],
  },
  {
    prefix: "/portal/catalog",
    permissions: [
      "itsm.request_catalog.catalog_item.read",
      "itsm.request_catalog.*",
    ],
  },
  {
    prefix: "/portal/cart",
    permissions: [
      "itsm.request_catalog.catalog_item.read",
      "itsm.request_catalog.*",
    ],
  },
  {
    prefix: "/portal/checkout",
    permissions: [
      "itsm.request_catalog.catalog_item.read",
      "itsm.request_catalog.*",
    ],
  },
  {
    prefix: "/portal/my-requests",
    permissions: [
      "itsm.request_catalog.request.read",
      "itsm.request_catalog.*",
    ],
  },
  {
    prefix: "/portal/requests",
    permissions: [
      "itsm.request_catalog.request.read",
      "itsm.request_catalog.*",
    ],
  },
  {
    prefix: "/portal/my-incidents",
    permissions: ["itsm.incident.incident.read", "itsm.incident.*"],
  },
  {
    prefix: "/portal/incidents",
    permissions: ["itsm.incident.incident.read", "itsm.incident.*"],
  },
  {
    prefix: "/portal/knowledge",
    permissions: ["itsm.knowledge.knowledge_article.read", "itsm.knowledge.*"],
  },
  {
    prefix: "/portal/approvals",
    permissions: ["itsm.approval.approval_read", "itsm.approval.*"],
  },
  {
    prefix: "/portal",
    permissions: [
      "itsm.request_catalog.ui.catalog_home.access",
      "itsm.experience.portal_access",
    ],
  },
  {
    prefix: "/admin/organization",
    permissions: ["tenant.organization.read", "tenant.organization.update"],
  },
  {
    prefix: "/admin/overview",
    permissions: ["itsm.core.task_read", "tenant.settings.read"],
  },
  {
    prefix: "/people",
    permissions: ["tenant.user.read", "itsm.core.user.read"],
  },
  {
    prefix: "/access",
    permissions: ["tenant.permission.read", "tenant.permission.grant"],
  },
  {
    prefix: "/itsm-admin/overview",
    permissions: ["itsm.core.task_read", "tenant.settings.read"],
  },
  {
    prefix: "/itsm-admin/incident",
    permissions: ["itsm.incident.incident.read", "itsm.incident.*"],
  },
  {
    prefix: "/itsm-admin/problem",
    permissions: ["itsm.problem.problem.read", "itsm.problem.*"],
  },
  {
    prefix: "/itsm-admin/change",
    permissions: ["itsm.change.change_request.read", "itsm.change.*"],
  },
  {
    prefix: "/itsm-admin/catalog",
    permissions: [
      "itsm.request_catalog.catalog_item.read",
      "itsm.request_catalog.*",
    ],
  },
  {
    prefix: "/itsm-admin/knowledge",
    permissions: ["itsm.knowledge.knowledge_article.read", "itsm.knowledge.*"],
  },
  {
    prefix: "/itsm-admin/sla",
    permissions: ["itsm.sla.definition_read", "itsm.sla.*"],
  },
  {
    prefix: "/itsm-admin/routing",
    permissions: ["itsm.assignment.routing_read", "itsm.assignment.*"],
  },
  {
    prefix: "/itsm-admin/approvals",
    permissions: ["itsm.approval.approval_read", "itsm.approval.*"],
  },
  {
    prefix: "/itsm-admin/on-call",
    permissions: ["itsm.on_call.current_on_call_read", "itsm.on_call.*"],
  },
  {
    prefix: "/itsm-admin/cmdb",
    permissions: ["itsm.service_cmdb.ci_read", "itsm.service_cmdb.*"],
  },
  {
    prefix: "/itsm-admin/release",
    permissions: ["itsm.release.release.read", "itsm.release.*"],
  },
  {
    prefix: "/itsm-admin/improvement",
    permissions: ["itsm.improvement.opportunity_read", "itsm.improvement.*"],
  },
  {
    prefix: "/itsm-admin/outage",
    permissions: ["itsm.outage.outage.read", "itsm.outage.*"],
  },
  {
    prefix: "/workspace",
    permissions: [
      "itsm.core.task_read",
      "itsm.assignment.ui.agent_inbox.access",
      "itsm.incident.incident.read",
      "itsm.request_catalog.request.read",
    ],
  },
];

function matchesPath(pattern: string, pathname: string): boolean {
  const expression = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/:[a-zA-Z]+/g, "[^/]+");
  return new RegExp(`^${expression}/?$`).test(pathname);
}

/**
 * Returns null for non-instance routes, an empty list for an unmapped
 * instance route (deny by default), or the grants required for the route.
 */
export function requiredPermissionsForPath(pathname: string): string[] | null {
  const instancePath = pathname.replace(/^\/instances\/[^/]+/, "");
  if (instancePath === pathname) return null;

  const catalogScreen = instancePath.match(
    /^\/itsm-admin\/catalog\/(\d+)\/([^/]+)\/[^/]+$/,
  );
  if (catalogScreen) {
    const [, phase, module] = catalogScreen;
    const item = NAVIGATION_AREAS.flatMap((area) => area.items).find(
      (candidate) =>
        candidate.phase === Number(phase) && candidate.module === module,
    );
    return item?.permissions ?? [];
  }

  const alias = ACCESS_RULES.find(
    ({ prefix }) =>
      instancePath === prefix || instancePath.startsWith(`${prefix}/`),
  );
  if (alias) return alias.permissions;

  const screen = SCREEN_ROUTES.find(
    (route) => route.path !== undefined && matchesPath(route.path, pathname),
  );
  if (screen) {
    const item = NAVIGATION_AREAS.flatMap((area) => area.items).find(
      (candidate) =>
        candidate.phase === (screen.phase ?? 0) &&
        candidate.module === (screen.module ?? ""),
    );
    return item?.permissions ?? [];
  }
  return [];
}
