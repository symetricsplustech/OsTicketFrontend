interface ScreenDefinition {
  title: string;
  description?: string;
  phase?: number;
  module?: string;
  area?: string;
  path?: string;
}

export type ScreenRoute = ScreenDefinition & { group: string };

export const SCREEN_ROUTES: ScreenRoute[] = [
  // Service Delivery (Phase 1-9)
  {
    phase: 1,
    module: "home",
    area: "Service Delivery",
    title: "Service Desk",
    description: "Intake and the core work-item lifecycles",
    path: "/instances/:instanceId/work/1/home",
    group: "service-delivery",
  },
  {
    phase: 1,
    module: "interactions",
    area: "Service Delivery",
    title: "Interactions",
    description: "Manage interactions",
    path: "/instances/:instanceId/work/1/interactions",
    group: "service-delivery",
  },
  {
    phase: 2,
    module: "queues",
    area: "Service Delivery",
    title: "Incidents",
    description: "Incident queues and management",
    path: "/instances/:instanceId/work/2/queues",
    group: "service-delivery",
  },
  {
    phase: 3,
    module: "home",
    area: "Service Delivery",
    title: "Major Incidents",
    description: "Major incident management",
    path: "/instances/:instanceId/work/3/home",
    group: "service-delivery",
  },
  {
    phase: 4,
    module: "queues",
    area: "Service Delivery",
    title: "Problems",
    description: "Problem queues and management",
    path: "/instances/:instanceId/work/4/queues",
    group: "service-delivery",
  },
  {
    phase: 5,
    module: "queues",
    area: "Service Delivery",
    title: "Changes",
    description: "Change queues and management",
    path: "/instances/:instanceId/work/5/queues",
    group: "service-delivery",
  },
  {
    phase: 6,
    module: "requests",
    area: "Service Delivery",
    title: "Service Requests",
    description: "Service request management",
    path: "/instances/:instanceId/work/6/requests",
    group: "service-delivery",
  },
  {
    phase: 8,
    module: "agent",
    area: "Service Delivery",
    title: "Universal Requests",
    description: "Universal request handling",
    path: "/instances/:instanceId/work/8/agent",
    group: "service-delivery",
  },
  {
    phase: 9,
    module: "home",
    area: "Service Delivery",
    title: "Knowledge",
    description: "Knowledge base",
    path: "/instances/:instanceId/work/9/home",
    group: "service-delivery",
  },

  // Service Operations (Phase 10-23)
  {
    phase: 10,
    module: "task-sla",
    area: "Service Operations",
    title: "Service Levels",
    description: "SLA definitions and tracking",
    path: "/instances/:instanceId/work/10/task-sla",
    group: "service-operations",
  },
  {
    phase: 11,
    module: "queues",
    area: "Service Operations",
    title: "Routing & Queues",
    description: "Routing and queue management",
    path: "/instances/:instanceId/work/11/queues",
    group: "service-operations",
  },
  {
    phase: 11,
    module: "capacity",
    area: "Service Operations",
    title: "Capacity & Skills",
    description: "Capacity planning and skills management",
    path: "/instances/:instanceId/work/11/capacity",
    group: "service-operations",
  },
  {
    phase: 12,
    module: "inbox",
    area: "Service Operations",
    title: "Approvals",
    description: "Approval workflows",
    path: "/instances/:instanceId/work/12/inbox",
    group: "service-operations",
  },
  {
    phase: 17,
    module: "schedules",
    area: "Service Operations",
    title: "On-Call",
    description: "On-call scheduling",
    path: "/instances/:instanceId/work/17/schedules",
    group: "service-operations",
  },
  {
    phase: 18,
    module: "appointments",
    area: "Service Operations",
    title: "Walk-Up",
    description: "Walk-up appointments",
    path: "/instances/:instanceId/work/18/appointments",
    group: "service-operations",
  },
  {
    phase: 23,
    module: "home",
    area: "Service Operations",
    title: "Employee Center",
    description: "Employee self-service center",
    path: "/instances/:instanceId/work/23/home",
    group: "service-operations",
  },

  // Configuration & Assets (Phase 7, 13-15)
  {
    phase: 13,
    module: "home",
    area: "Configuration & Assets",
    title: "Configuration Items",
    description: "CMDB configuration items",
    path: "/instances/:instanceId/work/13/home",
    group: "configuration-assets",
  },
  {
    phase: 13,
    module: "relationships",
    area: "Configuration & Assets",
    title: "CI Relationships",
    description: "CI relationship mapping",
    path: "/instances/:instanceId/work/13/relationships",
    group: "configuration-assets",
  },
  {
    phase: 14,
    module: "business-services",
    area: "Configuration & Assets",
    title: "Service Portfolio",
    description: "Business service portfolio",
    path: "/instances/:instanceId/work/14/business-services",
    group: "configuration-assets",
  },
  {
    phase: 7,
    module: "items",
    area: "Configuration & Assets",
    title: "Catalog Design",
    description: "Service catalog design",
    path: "/instances/:instanceId/work/7/items",
    group: "configuration-assets",
  },
  {
    phase: 15,
    module: "assets",
    area: "Configuration & Assets",
    title: "Assets",
    description: "Asset management",
    path: "/instances/:instanceId/work/15/assets",
    group: "configuration-assets",
  },
  {
    phase: 15,
    module: "cost",
    area: "Configuration & Assets",
    title: "Cost Management",
    description: "Asset cost management",
    path: "/instances/:instanceId/work/15/cost",
    group: "configuration-assets",
  },

  // Service Continuity (Phase 16, 19-20)
  {
    phase: 16,
    module: "status",
    area: "Service Continuity",
    title: "Service Status",
    description: "Service availability status",
    path: "/instances/:instanceId/work/16/status",
    group: "continuity",
  },
  {
    phase: 16,
    module: "outages",
    area: "Service Continuity",
    title: "Outages",
    description: "Outage management",
    path: "/instances/:instanceId/work/16/outages",
    group: "continuity",
  },
  {
    phase: 20,
    module: "releases",
    area: "Service Continuity",
    title: "Releases",
    description: "Release management",
    path: "/instances/:instanceId/work/20/releases",
    group: "continuity",
  },
  {
    phase: 19,
    module: "portfolio",
    area: "Service Continuity",
    title: "Digital Portfolio",
    description: "Digital portfolio management",
    path: "/instances/:instanceId/work/19/portfolio",
    group: "continuity",
  },

  // Insight & Improvement (Phase 21, 28-31)
  {
    phase: 30,
    module: "dashboards",
    area: "Insight & Improvement",
    title: "Dashboards",
    description: "Analytics dashboards",
    path: "/instances/:instanceId/work/30/dashboards",
    group: "insight-improvement",
  },
  {
    phase: 31,
    module: "process-map",
    area: "Insight & Improvement",
    title: "Process Analytics",
    description: "Process analytics and mapping",
    path: "/instances/:instanceId/work/31/process-map",
    group: "insight-improvement",
  },
  {
    phase: 21,
    module: "opportunities",
    area: "Insight & Improvement",
    title: "Improvements",
    description: "Improvement opportunities",
    path: "/instances/:instanceId/work/21/opportunities",
    group: "insight-improvement",
  },
  {
    phase: 28,
    module: "surveys",
    area: "Insight & Improvement",
    title: "Surveys & Feedback",
    description: "Experience surveys and feedback",
    path: "/instances/:instanceId/work/28/surveys",
    group: "insight-improvement",
  },
  {
    phase: 29,
    module: "gap-analysis",
    area: "Insight & Improvement",
    title: "Benchmarks",
    description: "Benchmarks and gap analysis",
    path: "/instances/:instanceId/work/29/gap-analysis",
    group: "insight-improvement",
  },

  // Workforce & Vendors (Phase 26-27)
  {
    phase: 26,
    module: "workforce-home",
    area: "Workforce & Vendors",
    title: "Workforce Optimization",
    description: "Workforce optimization",
    path: "/instances/:instanceId/work/26/workforce-home",
    group: "workforce-vendors",
  },
  {
    phase: 27,
    module: "vendors",
    area: "Workforce & Vendors",
    title: "Vendors",
    description: "Vendor management",
    path: "/instances/:instanceId/work/27/vendors",
    group: "workforce-vendors",
  },

  // Automation & AI (Phase 25)
  {
    phase: 25,
    module: "now-assist",
    area: "Automation & AI",
    title: "Now Assist",
    description: "AI-powered assistance",
    path: "/instances/:instanceId/work/25/now-assist",
    group: "automation",
  },
  {
    phase: 25,
    module: "ai-governance",
    area: "Automation & AI",
    title: "AI Governance",
    description: "AI governance and compliance",
    path: "/instances/:instanceId/work/25/ai-governance",
    group: "automation",
  },

  // Administration (Phase 0)
  {
    phase: 0,
    module: "instance",
    area: "Administration",
    title: "Instance",
    description: "Instance configuration",
    path: "/instances/:instanceId/admin/instance",
    group: "administration",
  },
  {
    phase: 0,
    module: "identity",
    area: "Administration",
    title: "Authentication & SSO",
    description: "Authentication and SSO settings",
    path: "/instances/:instanceId/admin/identity",
    group: "administration",
  },
  {
    phase: 0,
    module: "organization",
    area: "Administration",
    title: "Organization",
    description: "Organization structure",
    path: "/instances/:instanceId/admin/organization",
    group: "administration",
  },
  {
    phase: 0,
    module: "users",
    area: "Administration",
    title: "Users",
    description: "User management",
    path: "/instances/:instanceId/admin/users",
    group: "administration",
  },
  {
    phase: 0,
    module: "groups",
    area: "Administration",
    title: "Groups",
    description: "Group management",
    path: "/instances/:instanceId/admin/groups",
    group: "administration",
  },
  {
    phase: 0,
    module: "assignment-groups",
    area: "Administration",
    title: "Assignment Groups",
    description: "Assignment group management",
    path: "/instances/:instanceId/admin/assignment-groups",
    group: "administration",
  },
  {
    phase: 0,
    module: "roles",
    area: "Administration",
    title: "Roles & Access",
    description: "Role and access management",
    path: "/instances/:instanceId/admin/roles",
    group: "administration",
  },
  {
    phase: 0,
    module: "delegation",
    area: "Administration",
    title: "Delegation",
    description: "Delegation rules",
    path: "/instances/:instanceId/admin/delegation",
    group: "administration",
  },
  {
    phase: 0,
    module: "preferences",
    area: "Administration",
    title: "System Preferences",
    description: "System preferences",
    path: "/instances/:instanceId/admin/preferences",
    group: "administration",
  },
  {
    phase: 0,
    module: "audit",
    area: "Administration",
    title: "Audit",
    description: "Audit logs",
    path: "/instances/:instanceId/admin/audit",
    group: "administration",
  },
];

function moduleKey(phase: number, module: string): string {
  return `${phase}:${module}`;
}

const moduleEntries = new Map<string, ScreenRoute>();
for (const route of SCREEN_ROUTES) {
  const key = moduleKey(route.phase ?? 0, route.module ?? "");
  if (!moduleEntries.has(key)) moduleEntries.set(key, route);
}

export function moduleEntry(
  phase: number,
  module: string,
): ScreenRoute | undefined {
  return moduleEntries.get(moduleKey(phase, module));
}

export function modulePath(phase: number, module: string): string | null {
  return moduleEntry(phase, module)?.path ?? null;
}

export function moduleLabel(phase: number, module: string): string | null {
  return moduleEntry(phase, module)?.area ?? null;
}

export function resolveInstanceId(pattern: string, instanceId: string): string {
  return pattern.replace(":instanceId", instanceId);
}
