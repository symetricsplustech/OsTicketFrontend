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
        permissions: ["service_desk.read", "incidents.create", "service_desk.manage"],
      },
      {
        key: "interactions",
        label: "Interactions",
        phase: 1,
        module: "interactions",
        permissions: ["incidents.read", "incidents.create", "incidents.*"],
      },
      {
        key: "incidents",
        label: "Incidents",
        phase: 2,
        module: "queues",
        permissions: ["incidents.read", "incidents.*"],
      },
      {
        key: "major-incidents",
        label: "Major Incidents",
        phase: 3,
        module: "home",
        permissions: ["major_incidents.read", "major_incidents.*"],
      },
      {
        key: "problems",
        label: "Problems",
        phase: 4,
        module: "queues",
        permissions: ["problems.read", "problems.*"],
      },
      {
        key: "changes",
        label: "Changes",
        phase: 5,
        module: "queues",
        permissions: ["changes.read", "changes.*"],
      },
      {
        key: "requests",
        label: "Service Requests",
        phase: 6,
        module: "requests",
        permissions: [
          "requests.read",
          "requests.read_assigned",
          "requests.*",
        ],
      },
      {
        key: "universal-requests",
        label: "Universal Requests",
        phase: 8,
        module: "agent",
        permissions: [
          "requests.read",
          "requests.read_assigned",
          "requests.*",
        ],
      },
      {
        key: "knowledge",
        label: "Knowledge",
        phase: 9,
        module: "home",
        permissions: ["knowledge.read", "knowledge.*"],
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
        permissions: ["sla.read", "sla.*"],
      },
      {
        key: "routing-queues",
        label: "Routing & Queues",
        phase: 11,
        module: "queues",
        permissions: ["service_desk.read", "service_desk.routing.manage", "service_desk.*"],
      },
      {
        key: "capacity-skills",
        label: "Capacity & Skills",
        phase: 11,
        module: "capacity",
        permissions: ["service_desk.read", "teams.read", "teams.manage"],
      },
      {
        key: "approvals",
        label: "Approvals",
        phase: 12,
        module: "inbox",
        permissions: ["approvals.read", "approvals.*"],
      },
      {
        key: "on-call",
        label: "On-Call",
        phase: 17,
        module: "schedules",
        permissions: ["on_call.read", "on_call.*"],
      },
      {
        key: "walk-up",
        label: "Walk-Up",
        phase: 18,
        module: "appointments",
        permissions: ["service_desk.read"],
      },
      {
        key: "employee-center",
        label: "Employee Center",
        phase: 23,
        module: "home",
        permissions: ["dashboard.read"],
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
        permissions: ["cmdb.read", "cmdb.*"],
      },
      {
        key: "ci-relationships",
        label: "CI Relationships",
        phase: 13,
        module: "relationships",
        permissions: ["cmdb.read", "cmdb.*"],
      },
      {
        key: "service-portfolio",
        label: "Service Portfolio",
        phase: 14,
        module: "business-services",
        permissions: ["cmdb.read", "cmdb.*"],
      },
      {
        key: "catalog-design",
        label: "Catalog Design",
        phase: 7,
        module: "items",
        permissions: ["catalog.read", "catalog.*"],
      },
      {
        key: "assets",
        label: "Assets",
        phase: 15,
        module: "assets",
        permissions: ["assets.read", "assets.*"],
      },
      {
        key: "asset-costs",
        label: "Cost Management",
        phase: 15,
        module: "cost",
        permissions: ["assets.read", "assets.*"],
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
        permissions: ["sla.read", "sla.*"],
      },
      {
        key: "outages",
        label: "Outages",
        phase: 16,
        module: "outages",
        permissions: ["incidents.read", "incidents.*"],
      },
      {
        key: "releases",
        label: "Releases",
        phase: 20,
        module: "releases",
        permissions: ["releases.read", "releases.*"],
      },
      {
        key: "digital-portfolio",
        label: "Digital Portfolio",
        phase: 19,
        module: "portfolio",
        permissions: ["cmdb.read", "cmdb.*"],
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
        permissions: ["dashboard.read", "dashboard.*"],
      },
      {
        key: "process-analytics",
        label: "Process Analytics",
        phase: 31,
        module: "process-map",
        permissions: ["reports.read", "reports.*"],
      },
      {
        key: "improvements",
        label: "Improvements",
        phase: 21,
        module: "opportunities",
        permissions: ["problems.read", "problems.*"],
      },
      {
        key: "experience-feedback",
        label: "Surveys & Feedback",
        phase: 28,
        module: "surveys",
        permissions: ["knowledge.read", "knowledge.*"],
      },
      {
        key: "benchmarks",
        label: "Benchmarks",
        phase: 29,
        module: "gap-analysis",
        permissions: ["reports.read", "reports.*"],
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
        permissions: ["teams.read", "teams.manage"],
      },
      {
        key: "vendors",
        label: "Vendors",
        phase: 27,
        module: "vendors",
        permissions: ["vendors.read", "vendors.*"],
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
        permissions: ["automation.read", "automation.*"],
      },
      {
        key: "ai-governance",
        label: "AI Governance",
        phase: 25,
        module: "ai-governance",
        permissions: ["automation.read", "automation.*"],
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
        permissions: ["tenant.settings.read", "tenant.settings.update"],
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
        permissions: [
          "tenant.organization.read",
          "tenant.department.read",
          "tenant.location.read",
        ],
      },
      {
        key: "users",
        label: "Users",
        phase: 0,
        module: "users",
        permissions: ["tenant.user.read", "users.read"],
      },
      {
        key: "groups",
        label: "Groups",
        phase: 0,
        module: "groups",
        permissions: ["tenant.group.read", "teams.read"],
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
        permissions: ["tenant.role.read", "tenant.permission.read"],
      },
      {
        key: "delegation",
        label: "Delegation",
        phase: 0,
        module: "delegation",
        permissions: ["approvals.read", "approvals.*"],
      },
      {
        key: "preferences",
        label: "System Preferences",
        phase: 0,
        module: "preferences",
        permissions: ["tenant.settings.read"],
      },
      {
        key: "audit",
        label: "Audit",
        phase: 0,
        module: "audit",
        permissions: ["audit.read", "audit.*", "tenant.security.audit"],
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
