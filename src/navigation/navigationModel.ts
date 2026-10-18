import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  BookOpen,
  Boxes,
  Building2,
  CalendarDays,
  ClipboardList,
  ClipboardCheck,
  Cpu,
  Database,
  FileText,
  GitBranch,
  KeyRound,
  Layers,
  LifeBuoy,
  Mail,
  Network,
  Package,
  Rocket,
  ShieldCheck,
  Siren,
  Sparkles,
  Truck,
  UserRound,
  Users,
  Workflow,
} from "lucide-react";
import { moduleLabel, modulePath } from "./screenRegistry.ts";

/** A single navigable destination. */
export interface NavigationItem {
  key: string;
  label: string;
  /** Short secondary line describing the module this opens. */
  hint: string;
  /** Route pattern of the destination, still carrying `:instanceId`. */
  path: string;
  /** Delivery-plan suite number, used to tie a screen back to its capability. */
  phase: number;
  /** Module key inside the suite. */
  module: string;
  /** Holding at least one of these grants makes the item visible. */
  permissions: string[];
}

/** A collapsible group of destinations shown as one row in the sidebar. */
export interface NavigationArea {
  key: string;
  label: string;
  description: string;
  icon: LucideIcon;
  items: NavigationItem[];
}


interface ItemSeed {
  key: string;
  label: string;
  /** Delivery-plan suite number; see each feature's `*Routes` module. */
  phase: number;
  module: string;
  permissions: string[];
}

interface AreaSeed {
  key: string;
  label: string;
  description: string;
  icon: LucideIcon;
  items: ItemSeed[];
}

/**
 * Information architecture of the product.
 *
 * One row per business capability — never one row per spec screen. Each item
 * points at the entry screen of a delivery-plan module, and declares the
 * grants that reveal it, so a session only ever sees what it is entitled to.
 */
const AREA_SEEDS: AreaSeed[] = [
  {
    key: "service-delivery",
    label: "Service Delivery",
    description: "Intake and the core work-item lifecycles",
    icon: LifeBuoy,
    items: [
      {
        key: "service-desk",
        label: "Service Desk",
        phase: 1,
        module: "home",
        permissions: ["itsm.core.task_read", "itsm.core.task_create", "itsm.assignment.ui.agent_inbox.access"],
      },
      {
        key: "interactions",
        label: "Interactions",
        phase: 1,
        module: "interactions",
        permissions: ["itsm.core.task_read", "itsm.core.task_create", "itsm.core.*"],
      },
      {
        key: "incidents",
        label: "Incidents",
        phase: 2,
        module: "queues",
        permissions: ["itsm.incident.incident.read", "itsm.incident.*"],
      },
      {
        key: "major-incidents",
        label: "Major Incidents",
        phase: 3,
        module: "home",
        permissions: ["itsm.major_incident.major_incident.read", "itsm.major_incident.*"],
      },
      {
        key: "problems",
        label: "Problems",
        phase: 4,
        module: "queues",
        permissions: ["itsm.problem.problem.read", "itsm.problem.*"],
      },
      {
        key: "changes",
        label: "Changes",
        phase: 5,
        module: "queues",
        permissions: ["itsm.change.change_request.read", "itsm.change.*"],
      },
      {
        key: "requests",
        label: "Service Requests",
        phase: 6,
        module: "requests",
        permissions: ["itsm.request_catalog.request.read", "itsm.request_catalog.*"],
      },
      {
        key: "universal-requests",
        label: "Universal Requests",
        phase: 8,
        module: "agent",
        permissions: ["itsm.universal_request.request.read", "itsm.universal_request.*"],
      },
      {
        key: "knowledge",
        label: "Knowledge",
        phase: 9,
        module: "home",
        permissions: ["itsm.knowledge.kb_read", "itsm.knowledge.article_read", "itsm.knowledge.*"],
      },
    ],
  },
  {
    key: "service-operations",
    label: "Service Operations",
    description: "Commitments, routing, approvals and staffing",
    icon: Workflow,
    items: [
      {
        key: "service-levels",
        label: "Service Levels",
        phase: 10,
        module: "task-sla",
        permissions: ["itsm.sla.definition_read", "itsm.sla.*"],
      },
      {
        key: "routing-queues",
        label: "Routing & Queues",
        phase: 11,
        module: "queues",
        permissions: ["itsm.assignment.queue.read", "itsm.assignment.routing_read", "itsm.assignment.*"],
      },
      {
        key: "capacity-skills",
        label: "Capacity & Skills",
        phase: 11,
        module: "capacity",
        permissions: ["itsm.assignment.capacity_read_team", "itsm.assignment.skill_read", "itsm.assignment.*"],
      },
      {
        key: "approvals",
        label: "Approvals",
        phase: 12,
        module: "inbox",
        permissions: ["itsm.approval.approval_read", "itsm.approval.*"],
      },
      {
        key: "on-call",
        label: "On-Call",
        phase: 17,
        module: "schedules",
        permissions: ["itsm.on_call.current_on_call_read", "itsm.on_call.*"],
      },
      {
        key: "walk-up",
        label: "Walk-Up",
        phase: 18,
        module: "appointments",
        permissions: ["itsm.walkup.interaction_read", "itsm.walkup.*"],
      },
      {
        key: "employee-center",
        label: "Employee Center",
        phase: 23,
        module: "home",
        permissions: ["itsm.experience.portal_access", "itsm.experience.*"],
      },
    ],
  },
  {
    key: "configuration-assets",
    label: "Configuration & Assets",
    description: "CMDB, service portfolio, assets and cost",
    icon: Database,
    items: [
      {
        key: "cmdb",
        label: "Configuration Items",
        phase: 13,
        module: "home",
        permissions: ["itsm.service_cmdb.ci_read", "itsm.service_cmdb.*"],
      },
      {
        key: "ci-relationships",
        label: "CI Relationships",
        phase: 13,
        module: "relationships",
        permissions: ["itsm.service_cmdb.ci_relationship_read", "itsm.service_cmdb.*"],
      },
      {
        key: "service-portfolio",
        label: "Service Portfolio",
        phase: 14,
        module: "business-services",
        permissions: ["itsm.service_cmdb.portfolio_read", "itsm.service_cmdb.*"],
      },
      {
        key: "catalog-design",
        label: "Catalog Design",
        phase: 7,
        module: "items",
        permissions: ["itsm.request_catalog.catalog_item_read", "itsm.request_catalog.*"],
      },
      {
        key: "assets",
        label: "Assets",
        phase: 15,
        module: "assets",
        permissions: ["itsm.asset.asset.read", "itsm.asset.*"],
      },
      {
        key: "asset-costs",
        label: "Cost Management",
        phase: 15,
        module: "cost",
        permissions: ["itsm.asset.cost.read", "itsm.asset.cost_center.read", "itsm.asset.*"],
      },
    ],
  },
  {
    key: "continuity",
    label: "Service Continuity",
    description: "Availability, releases and portfolio health",
    icon: ShieldCheck,
    items: [
      {
        key: "service-status",
        label: "Service Status",
        phase: 16,
        module: "status",
        permissions: ["itsm.outage.availability_read", "itsm.outage.*"],
      },
      {
        key: "outages",
        label: "Outages",
        phase: 16,
        module: "outages",
        permissions: ["itsm.outage.outage.read", "itsm.outage.*"],
      },
      {
        key: "releases",
        label: "Releases",
        phase: 20,
        module: "releases",
        permissions: ["itsm.release.release.read", "itsm.release.*"],
      },
      {
        key: "digital-portfolio",
        label: "Digital Portfolio",
        phase: 19,
        module: "portfolio",
        permissions: ["itsm.service_cmdb.portfolio_read", "itsm.service_cmdb.*"],
      },
    ],
  },
  {
    key: "insight-improvement",
    label: "Insight & Improvement",
    description: "Analytics, optimisation and feedback",
    icon: BarChart3,
    items: [
      {
        key: "dashboards",
        label: "Dashboards",
        phase: 30,
        module: "dashboards",
        permissions: ["itsm.reporting_admin.dashboard_read", "itsm.reporting_admin.*"],
      },
      {
        key: "process-analytics",
        label: "Process Analytics",
        phase: 31,
        module: "process-map",
        permissions: ["itsm.reporting_admin.report_read", "itsm.reporting_admin.*"],
      },
      {
        key: "improvements",
        label: "Improvements",
        phase: 21,
        module: "opportunities",
        permissions: ["itsm.improvement.opportunity_read", "itsm.improvement.*"],
      },
      {
        key: "experience-feedback",
        label: "Surveys & Feedback",
        phase: 28,
        module: "surveys",
        permissions: ["itsm.improvement.view_dashboard", "itsm.improvement.*"],
      },
      {
        key: "benchmarks",
        label: "Benchmarks",
        phase: 29,
        module: "gap-analysis",
        permissions: ["itsm.reporting_admin.kpi_read", "itsm.reporting_admin.*"],
      },
    ],
  },
  {
    key: "workforce-vendors",
    label: "Workforce & Vendors",
    description: "People operations and supplier management",
    icon: Users,
    items: [
      {
        key: "workforce",
        label: "Workforce Optimization",
        phase: 26,
        module: "workforce-home",
        permissions: ["itsm.assignment.*", "itsm.assignment.capacity_read_team"],
      },
      {
        key: "vendors",
        label: "Vendors",
        phase: 27,
        module: "vendors",
        permissions: ["itsm.asset.*", "itsm.asset.asset.read"],
      },
    ],
  },
  {
    key: "automation",
    label: "Automation & AI",
    description: "Automation engines and assisted work",
    icon: Cpu,
    items: [
      {
        key: "now-assist",
        label: "Now Assist",
        phase: 25,
        module: "now-assist",
        permissions: ["itsm.core.*", "itsm.experience.*"],
      },
      {
        key: "ai-governance",
        label: "AI Governance",
        phase: 25,
        module: "ai-governance",
        permissions: ["itsm.core.*", "itsm.experience.*"],
      },
    ],
  },
  {
    key: "administration",
    label: "Administration",
    description: "Tenant configuration, people, access and audit",
    icon: Building2,
    items: [
      {
        key: "instance",
        label: "Instance",
        phase: 0,
        module: "instance",
        permissions: ["tenant.settings.read", "tenant.settings.update", "itsm.core.tenant.read"],
      },
      {
        key: "authentication",
        label: "Authentication & SSO",
        phase: 0,
        module: "identity",
        permissions: ["tenant.security.manage", "tenant.user.read"],
      },
      {
        key: "organization",
        label: "Organization",
        phase: 0,
        module: "organization",
        permissions: ["tenant.organization.read", "tenant.department.read", "tenant.location.read"],
      },
      {
        key: "users",
        label: "Users",
        phase: 0,
        module: "users",
        permissions: ["tenant.user.read", "itsm.core.user.read"],
      },
      {
        key: "groups",
        label: "Groups",
        phase: 0,
        module: "groups",
        permissions: ["tenant.group.read", "itsm.core.group.read"],
      },
      {
        key: "assignment-groups",
        label: "Assignment Groups",
        phase: 0,
        module: "assignment-groups",
        permissions: ["tenant.group.read", "tenant.group.assign"],
      },
      {
        key: "roles",
        label: "Roles & Access",
        phase: 0,
        module: "roles",
        permissions: ["tenant.role.read", "tenant.permission.read", "itsm.core.role.read"],
      },
      {
        key: "delegation",
        label: "Delegation",
        phase: 0,
        module: "delegation",
        permissions: ["itsm.approval.delegation_read_own", "itsm.approval.*"],
      },
      {
        key: "preferences",
        label: "System Preferences",
        phase: 0,
        module: "preferences",
        permissions: ["tenant.settings.read", "itsm.experience.*"],
      },
      {
        key: "audit",
        label: "Audit",
        phase: 0,
        module: "audit",
        permissions: ["itsm.core.audit_read", "itsm.reporting_admin.audit_read", "tenant.security.audit"],
      },
    ],
  },
];

function buildItems(seeds: ItemSeed[]): NavigationItem[] {
  const items: NavigationItem[] = [];
  for (const seed of seeds) {
    const path = modulePath(seed.phase, seed.module);
    if (!path) continue;
    items.push({
      key: seed.key,
      label: seed.label,
      hint: moduleLabel(seed.phase, seed.module) ?? seed.label,
      path,
      phase: seed.phase,
      module: seed.module,
      permissions: seed.permissions,
    });
  }
  return items;
}

/** Areas with at least one registered destination. */
export const NAVIGATION_AREAS: NavigationArea[] = AREA_SEEDS.map((seed) => ({
  key: seed.key,
  label: seed.label,
  description: seed.description,
  icon: seed.icon,
  items: buildItems(seed.items),
})).filter((area) => area.items.length > 0);

/** Icons reused by the breadcrumb and the page header. */
export const NAV_ICONS = {
  work: Activity,
  delivery: LifeBuoy,
  operations: Workflow,
  configuration: Database,
  continuity: ShieldCheck,
  insight: BarChart3,
  people: Users,
  automation: Cpu,
  administration: Building2,
  incident: AlertTriangle,
  problem: GitBranch,
  change: CalendarDays,
  majorIncident: Siren,
  knowledge: BookOpen,
  sla: ShieldCheck,
  approval: ClipboardCheck,
  cmdb: Network,
  asset: Package,
  outage: Rocket,
  audit: ClipboardList,
  report: FileText,
  catalog: Layers,
  request: ClipboardList,
  mailbox: Mail,
  notification: Bell,
  peopleDirectory: UserRound,
  vendor: Truck,
  sparkles: Sparkles,
  boxes: Boxes,
  key: KeyRound,
} as const;
