import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  BookOpen,
  Building,
  Building2,
  CalendarDays,
  ClipboardList,
  Database,
  Gauge,
  GitBranch,
  HelpCircle,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  Lock,
  Rocket,
  Settings,
  ShieldCheck,
  Truck,
  UserRound,
  Users,
  Workflow,
} from "lucide-react";
import { canAny } from "@services/authorization/permissions";

export const ORGANIZATION_ADMIN_BASE_PATH = "/organization";

/**
 * Tenant-scoped read permissions from the backend tenant permission catalog
 * (`backend/src/shared/permissions/tenant-catalog.ts`). Holding any of these
 * grants marks a session as an organization-workspace user. Platform
 * (`admin.*` / `itsm.*` / `tenant.*`) grants never satisfy these codes.
 */
export const TENANT_READ_PERMISSIONS: string[] = [
  "dashboard.read",
  "organization.read",
  "users.read",
  "customers.read",
  "departments.read",
  "locations.read",
  "cost_centers.read",
  "organization_structure.read",
  "access_reviews.read",
  "roles.read",
  "permissions.read",
  "access_policies.read",
  "delegations.read",
  "teams.read",
  "service_desk.read",
  "incidents.read",
  "incident_configuration.read",
  "major_incidents.read",
  "problems.read",
  "problem_configuration.read",
  "known_errors.read",
  "changes.read",
  "change_configuration.read",
  "change_calendar.read",
  "requests.read",
  "catalog.read",
  "knowledge.read",
  "sla.read",
  "workflows.read",
  "automation.read",
  "cmdb.read",
  "assets.read",
  "asset_configuration.read",
  "discovery.read",
  "on_call.read",
  "releases.read",
  "notifications.read",
  "announcements.read",
  "integrations.read",
  "api_keys.read",
  "webhooks.read",
  "vendors.read",
  "reports.read",
  "audit.read",
  "security.read",
  "imports.read",
  "exports.read",
  "attachments.read",
  "portal.read",
  "support.read",
  "approvals.read",
  "settings.read",
];

const TENANT_READ_SET = new Set(TENANT_READ_PERMISSIONS);

export interface OrganizationAdminNavigationChild {
  key: string;
  label: string;
  hint: string;
  path: string;
  permissions: string[];
  /** Action screens (create/edit/clone …) stay routable but never appear in the sidebar. */
  hidden?: boolean;
}

export interface OrganizationAdminNavigationItem {
  key: string;
  label: string;
  hint: string;
  /** Present only for leaf destinations; groups redirect to their first child. */
  path?: string;
  icon: LucideIcon;
  permissions: string[];
  children?: OrganizationAdminNavigationChild[];
  /** Action screens (create/edit/clone …) stay routable but never appear in the sidebar. */
  hidden?: boolean;
}

export interface OrganizationAdminNavigationSection {
  key: string;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Tenant read grants that reveal the section. Empty = visible to any member. */
  permissions: string[];
  items: OrganizationAdminNavigationItem[];
}

/** A leaf label (or `{ label, hidden }` for action screens kept out of the sidebar). */
type LeafSeed = string | { label: string; hidden?: boolean };

/** A leaf, or a `[group label, child seeds]` subgroup. */
type ItemSeed = LeafSeed | [string, LeafSeed[]];

interface SectionSeed {
  key: string;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Tenant read grants that reveal the section. Empty = visible to any member. */
  permissions: string[];
  items: ItemSeed[];
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const SECTION_SEEDS: SectionSeed[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    description: "Organization overview, operational summaries and approvals",
    icon: LayoutDashboard,
    permissions: ["dashboard.read"],
    items: [
      "Organization Overview",
      "Operational Summary",
      "My Tasks & Approvals",
      "Open Incidents Summary",
      "Open Service Requests",
      "SLA Compliance Summary",
      "Overdue and Breached SLAs",
      "Change Calendar",
      "Pending Approvals",
      "Team Workload",
      "Asset and CMDB Health",
      "Recent Organization Activity",
      "Notifications & Alerts",
      "Service Availability Summary",
    ],
  },
  {
    key: "organization-users",
    label: "Organization & Users",
    description: "Employees and the organization's internal structure",
    icon: Building2,
    permissions: ["organization.read", "users.read", "departments.read", "locations.read", "cost_centers.read", "organization_structure.read", "access_reviews.read"],
    items: [
      [
        "Organization Profile",
        [
          "Organization Details",
          "Logo and Branding",
          "Contact Information",
          "Address and Regional Information",
          "Timezone and Locale",
        ],
      ],
      [
        "User Management",
        [
          "All Users",
          { label: "Invite Users", hidden: true },
          { label: "Create User", hidden: true },
          { label: "User Profile", hidden: true },
          { label: "Edit User", hidden: true },
          { label: "Activate / Suspend User", hidden: true },
          { label: "Deactivate User", hidden: true },
          "User Import History",
          "User Login and Activity History",
          "Last Login and Account Status",
        ],
      ],
      [
        "Organization Structure",
        [
          "Departments",
          "Business Units",
          "Locations",
          "Offices and Sites",
          "Cost Centers",
          "Reporting Structure",
        ],
      ],
      [
        "User Lifecycle",
        ["Onboarding", "Offboarding", "Access Review", "Pending Invitations", "Deprovisioning Tasks"],
      ],
      ["External Users", ["Contractors", "Vendors", "Guest Users"]],
    ],
  },
  {
    key: "roles-access-control",
    label: "Roles & Access Control",
    description: "Tenant-scoped roles, permissions and access governance",
    icon: ShieldCheck,
    permissions: ["roles.read", "permissions.read", "access_policies.read", "delegations.read", "access_reviews.read"],
    items: [
      [
        "Roles",
        [
          "All Roles",
          { label: "Create Role", hidden: true },
          { label: "Edit Role", hidden: true },
          { label: "Clone Role", hidden: true },
          { label: "Assign Role", hidden: true },
          "Role Members",
          "Role Permission Matrix",
        ],
      ],
      [
        "Permissions",
        [
          "Permission Catalog",
          "Module Permissions",
          "Read / Create / Update / Delete Permissions",
          "Export and Import Permissions",
          "Administrative Permissions",
        ],
      ],
      [
        "Access Policies",
        [
          "User Access Policies",
          "Department-Based Access",
          "Group-Based Access",
          "Record-Level Access Rules",
          "Field-Level Restrictions",
        ],
      ],
      [
        "User Assignments",
        [
          "User-to-Role Assignments",
          "User-to-Group Assignments",
          "Temporary Access",
          "Delegated Administration",
        ],
      ],
      [
        "Access Governance",
        ["Access Review Campaigns", "Privileged Access Review", "Permission Change History"],
      ],
    ],
  },
  {
    key: "customers",
    label: "Customers & Customer Contacts",
    description: "Customer directory, contacts, sites, portal access and ticket history",
    icon: Building,
    permissions: ["customers.read"],
    items: [
      "Customer Directory",
      { label: "Create Customer", hidden: true },
      "Customer Contacts",
      "Customer Portal Access",
      "Service Locations",
      "Customer Ticket History",
    ],
  },
  {
    key: "service-desk",
    label: "Service Desk",
    description: "Support operations administration for your organization",
    icon: LifeBuoy,
    permissions: ["service_desk.read"],
    items: [
      "Service Desk Overview",
      "All Service Desk Tickets",
      "My Organization's Queues",
      "Assignment Groups",
      "Ticket Routing Rules",
      "Ticket Categories",
      "Ticket Priority Matrix",
      "Ticket Status Configuration",
      "Escalation Rules",
      "Service Desk Operating Hours",
      "Support Coverage Calendar",
      "Queue Workload",
      "Unassigned Tickets",
      "Overdue Tickets",
      "Service Desk Activity History",
    ],
  },
  {
    key: "incident-management",
    label: "Incident Management",
    description: "Incident configuration and operational oversight",
    icon: AlertTriangle,
    permissions: ["incidents.read", "incident_configuration.read", "major_incidents.read"],
    items: [
      "Incident Overview",
      "All Incidents",
      "Incident Categories",
      "Incident Subcategories",
      "Impact and Urgency Matrix",
      "Priority Mapping",
      "Incident Assignment Rules",
      "Auto-Assignment Configuration",
      "Escalation Configuration",
      "Major Incident Management",
      "Major Incident Communication",
      "Incident Templates",
      "Incident Resolution Codes",
      "Incident Closure Rules",
      "Reopen Policies",
      "Incident Notifications",
      "Incident History and Reports",
    ],
  },
  {
    key: "problem-management",
    label: "Problem Management",
    description: "Root cause analysis, known errors and workarounds",
    icon: GitBranch,
    permissions: ["problems.read", "problem_configuration.read", "known_errors.read"],
    items: [
      "Problem Overview",
      "All Problems",
      "Problem Categories",
      "Root Cause Categories",
      "Known Errors",
      "Workaround Library",
      "Problem Investigation Rules",
      "Problem Assignment Rules",
      "Problem Templates",
      "Problem-to-Incident Relationships",
      "Problem Review and Closure Rules",
      "Problem Reports",
    ],
  },
  {
    key: "change-management",
    label: "Change Management",
    description: "Change models, risk, approvals and the change calendar",
    icon: CalendarDays,
    permissions: ["changes.read", "change_configuration.read", "change_calendar.read"],
    items: [
      "Change Overview",
      "All Change Requests",
      "Change Models and Templates",
      "Standard Changes",
      "Normal Changes",
      "Emergency Changes",
      "Risk Assessment Rules",
      "Impact Assessment",
      "Change Approval Policies",
      "Change Advisory Board",
      "CAB Members",
      "Change Calendar",
      "Maintenance Windows",
      "Blackout Periods",
      "Conflict Detection",
      "Implementation Plans",
      "Rollback Plans",
      "Post-Implementation Reviews",
      "Change Reports",
    ],
  },
  {
    key: "request-management",
    label: "Request Management",
    description: "Service request intake, approvals and fulfillment",
    icon: ClipboardList,
    permissions: ["requests.read"],
    items: [
      "Request Overview",
      "All Service Requests",
      "Request Categories",
      "Request Templates",
      "Request Assignment Rules",
      "Request Approval Policies",
      "Request Fulfillment Rules",
      "Request Status Configuration",
      "Request Notifications",
      "Request Closure Rules",
      "Request Reports",
    ],
  },
  {
    key: "service-catalog",
    label: "Service Catalog & Knowledge",
    description: "Catalog items, forms, publishing and knowledge content",
    icon: Layers,
    permissions: ["catalog.read"],
    items: [
      "Catalog Overview",
      "Catalog Categories",
      "Catalog Items",
      { label: "Create Catalog Item", hidden: true },
      { label: "Edit Catalog Item", hidden: true },
      "Item Forms and Fields",
      "Required and Optional Fields",
      "Conditional Form Rules",
      "Catalog Item Approvals",
      "Fulfillment Workflows",
      "Assignment and Routing Rules",
      "Item Availability",
      "Audience and Department Restrictions",
      "Catalog Preview",
      "Catalog Publishing",
      "Catalog Version History",
    ],
  },
  {
    key: "knowledge-management",
    label: "Knowledge Management",
    description: "Knowledge bases, articles, review and publishing",
    icon: BookOpen,
    permissions: ["knowledge.read"],
    items: [
      "Knowledge Overview",
      "Knowledge Bases",
      "Knowledge Categories",
      "Knowledge Articles",
      "Article Templates",
      "Draft Articles",
      "Review and Approval Queue",
      "Publishing Rules",
      "Article Version History",
      "Expiry and Review Schedules",
      "Article Access Policies",
      "Internal and Employee-Facing Content",
      "Feedback and Ratings",
      "Search Configuration",
      "Knowledge Reports",
    ],
  },
  {
    key: "sla-service-performance",
    label: "SLA & Service Performance",
    description: "Targets, calendars, escalation and compliance",
    icon: Gauge,
    permissions: ["sla.read"],
    items: [
      "SLA Dashboard",
      "SLA Policies",
      "Response Time Targets",
      "Resolution Time Targets",
      "Business Calendars",
      "Business Hours",
      "Holiday Calendars",
      "SLA Pause Conditions",
      "SLA Start and Stop Conditions",
      "Warning Thresholds",
      "Escalation Rules",
      "Breach Notifications",
      "SLA Assignment Rules",
      "SLA Compliance Reports",
      "Breach History",
    ],
  },
  {
    key: "workflow-automation",
    label: "Workflow & Automation",
    description: "Workflow definitions, rules and automation runs",
    icon: Workflow,
    permissions: ["workflows.read", "automation.read"],
    items: [
      "Workflow Dashboard",
      "Workflow Definitions",
      { label: "Create Workflow", hidden: true },
      "Workflow Designer",
      "Workflow Templates",
      "Workflow Version History",
      "Workflow Validation",
      "Publish and Retire Workflows",
      "Workflow Execution History",
      "Failed Workflow Runs",
      "Retry and Cancel Eligible Runs",
      "Business Rules",
      "Automation Rules",
      "Trigger Configuration",
      "Scheduled Automation",
      "Conditional Actions",
      "Approval Workflows",
      "Assignment Automation",
      "Notification Automation",
      "Automation Logs",
    ],
  },
  {
    key: "cmdb-assets",
    label: "CMDB & Assets",
    description: "Configuration items, assets and discovery",
    icon: Database,
    permissions: ["cmdb.read", "assets.read", "asset_configuration.read", "discovery.read"],
    items: [
      [
        "CMDB",
        [
          "CMDB Overview",
          "Configuration Items",
          "CI Classes and Types",
          "CI Attributes",
          "CI Relationships",
          "Dependency Maps",
          "Business Services",
          "CI Lifecycle States",
          "Data Quality Rules",
          "Duplicate CI Detection",
          "CI Reconciliation Rules",
          "CMDB Import Jobs",
        ],
      ],
      [
        "Asset Management",
        [
          "Asset Overview",
          "All Assets",
          "Hardware Assets",
          "Software Assets",
          "Asset Categories",
          "Asset Models",
          "Asset Assignments",
          "Asset Ownership",
          "Asset Locations",
          "Asset Lifecycle",
          "Procurement Records",
          "Warranty Information",
          "Maintenance Schedules",
          "License Records",
          "Asset Disposal",
          "Asset Import",
          "Asset Reports",
        ],
      ],
      [
        "Discovery",
        [
          "Discovery Configuration",
          "Discovery Schedules",
          "Discovery Credentials",
          "Discovery Profiles",
          "Discovery Job History",
          "Discovery Errors",
          "Discovery Reconciliation",
        ],
      ],
    ],
  },
  {
    key: "teams-on-call",
    label: "Teams & On-Call",
    description: "Teams, coverage, rotations and escalations",
    icon: Users,
    permissions: ["teams.read", "on_call.read"],
    items: [
      "All Teams",
      { label: "Create Team", hidden: true },
      { label: "Edit Team", hidden: true },
      "Team Members",
      "Team Leads",
      "Assignment Groups",
      "Team Queues",
      "Workload Distribution",
      "Team Availability",
      "On-Call Schedules",
      "On-Call Rotations",
      "Escalation Contacts",
      "Escalation Schedules",
      "Handover Rules",
      "Absence and Coverage",
      "Team Performance Reports",
    ],
  },
  {
    key: "release-management",
    label: "Release Management",
    description: "Release planning, readiness and deployments",
    icon: Rocket,
    permissions: ["releases.read"],
    items: [
      "Release Overview",
      "All Releases",
      "Release Templates",
      "Release Plans",
      "Release Calendars",
      "Release Approval Rules",
      "Release Dependencies",
      "Release Tasks",
      "Deployment Readiness",
      "Release Validation",
      "Rollback Plans",
      "Release History",
      "Release Reports",
    ],
  },
  {
    key: "notifications-communications",
    label: "Notifications",
    description: "Templates, rules, preferences and announcements",
    icon: Bell,
    permissions: ["notifications.read", "announcements.read"],
    items: [
      "Notification Overview",
      "Email Templates",
      "In-App Notification Templates",
      "Notification Rules",
      "Event Triggers",
      "User Notification Preferences",
      "Department Notification Preferences",
      "Escalation Notifications",
      "SLA Warning Notifications",
      "Incident Notifications",
      "Change Notifications",
      "Announcement Management",
      "Organization Announcements",
      "Notification Delivery Logs",
      "Failed Delivery History",
      { label: "Test Notification", hidden: true },
    ],
  },
  {
    key: "vendor-management",
    label: "Vendor Management",
    description: "Suppliers, contracts, risk and performance",
    icon: Truck,
    permissions: ["vendors.read"],
    items: [
      "Vendor Overview",
      "All Vendors",
      { label: "Create Vendor", hidden: true },
      "Vendor Profiles",
      "Vendor Contacts",
      "Vendor Contracts",
      "Vendor Services",
      "Vendor SLAs",
      "Vendor Risk Records",
      "Vendor-Related Incidents",
      "Vendor Performance",
      "Vendor Reviews",
      "Vendor Documents",
      "Vendor Reports",
    ],
  },
  {
    key: "reports-analytics",
    label: "Reports & Analytics",
    description: "Organization reporting, exports and scheduling",
    icon: BarChart3,
    permissions: ["reports.read"],
    items: [
      "Organization Overview Reports",
      "Incident Reports",
      "Problem Reports",
      "Change Reports",
      "Request Reports",
      "SLA Compliance Reports",
      "SLA Breach Reports",
      "Team Performance",
      "Agent Workload",
      "Service Catalog Usage",
      "Knowledge Article Performance",
      "Asset Reports",
      "CMDB Data Quality",
      "Release Reports",
      "Vendor Performance Reports",
      "Audit Reports",
      "Custom Report Builder",
      "Scheduled Reports",
      "Export History",
      "CSV / Excel Export",
    ],
  },
  {
    key: "security-audit",
    label: "Security & Audit",
    description: "Audit logs, sessions, MFA and security alerts",
    icon: Lock,
    permissions: ["audit.read", "security.read"],
    items: [
      "Security Overview",
      "Organization Audit Logs",
      "User Activity Logs",
      "Login History",
      "Failed Login Attempts",
      "Role and Permission Changes",
      "Privileged Action History",
      "Access Review History",
      "Session Management Policies",
      "Password Policies",
      "MFA Enforcement",
      "IP Allowlist",
      "Security Alerts",
      "Data Access History",
      "Export Activity",
      "Integration Security Events",
      "Retention and Privacy Controls",
    ],
  },
  {
    key: "organization-settings",
    label: "Organization Settings",
    description: "Defaults, branding, portal and form configuration",
    icon: Settings,
    permissions: ["organization.read", "settings.read"],
    items: [
      "Organization Profile",
      "Branding and Logo",
      "Organization Contact Details",
      "Locale and Language",
      "Timezone and Date Format",
      "Working Days and Hours",
      "Holiday Calendars",
      "Default Assignment Group",
      "Default Ticket Priorities",
      "Default Ticket Categories",
      "Default Ticket Numbering Preferences",
      "User Invitation Settings",
      "Employee Center Settings",
      "Organization Portal Configuration",
      "Custom Fields",
      "Form Configuration",
      "Allowed File Types and Upload Limits",
      "Data Retention Settings",
      "Feature Availability",
      "Configuration History",
      "Reset to Organization Defaults",
    ],
  },
  {
    key: "help-support",
    label: "Help & Support",
    description: "Help center, platform support and service status",
    icon: HelpCircle,
    permissions: ["support.read"],
    items: [
      "Help Center",
      "Documentation",
      "Getting Started",
      "Contact Platform Support",
      { label: "Create Support Ticket", hidden: true },
      "My Support Tickets",
      "Support Ticket History",
      "Service Status",
      "Report a Problem",
      "Request a Feature",
    ],
  },
  {
    key: "my-account",
    label: "My Account",
    description: "Your profile, security and preferences",
    icon: UserRound,
    permissions: [],
    items: [
      "My Profile",
      { label: "Edit Profile", hidden: true },
      "Change Password",
      "MFA Settings",
      "Recovery Codes",
      "Active Sessions",
      { label: "Sign Out Other Sessions", hidden: true },
      "Notification Preferences",
      "Personal Timezone",
      "Display Preferences",
      "My Recent Activity",
    ],
  },
];

function leafLabel(seed: LeafSeed): string {
  return typeof seed === "string" ? seed : seed.label;
}

function leafHidden(seed: LeafSeed): boolean {
  return typeof seed !== "string" && seed.hidden === true;
}

function buildItem(
  sectionKey: string,
  sectionLabel: string,
  sectionPermissions: string[],
  seed: ItemSeed,
  icon: LucideIcon,
): OrganizationAdminNavigationItem {
  if (typeof seed === "string" || typeof seed === "object" && !Array.isArray(seed)) {
    const label = leafLabel(seed);
    const itemSlug = slug(label);
    return {
      key: itemSlug,
      label,
      hint: `${label} · ${sectionLabel}`,
      path: `${ORGANIZATION_ADMIN_BASE_PATH}/${sectionKey}/${itemSlug}`,
      icon,
      permissions: sectionPermissions,
      ...(leafHidden(seed) ? { hidden: true } : {}),
    };
  }

  const [groupLabel, childSeeds] = seed;
  const groupSlug = slug(groupLabel);
  return {
    key: groupSlug,
    label: groupLabel,
    hint: `${groupLabel} · ${sectionLabel}`,
    icon,
    permissions: sectionPermissions,
    children: childSeeds.map((childSeed) => {
      const childLabel = leafLabel(childSeed);
      const childSlug = slug(childLabel);
      return {
        key: `${groupSlug}-${childSlug}`,
        label: childLabel,
        hint: `${childLabel} · ${groupLabel}`,
        path: `${ORGANIZATION_ADMIN_BASE_PATH}/${sectionKey}/${groupSlug}/${childSlug}`,
        permissions: sectionPermissions,
        ...(leafHidden(childSeed) ? { hidden: true } : {}),
      };
    }),
  };
}

/** The complete Organization Admin navigation catalogue. */
export const ORGANIZATION_ADMIN_NAVIGATION: OrganizationAdminNavigationSection[] =
  SECTION_SEEDS.map((seed) => ({
    key: seed.key,
    label: seed.label,
    description: seed.description,
    icon: seed.icon,
    permissions: seed.permissions,
    items: seed.items.map((item) =>
      buildItem(seed.key, seed.label, seed.permissions, item, seed.icon),
    ),
  }));

/** First routable destination of any item (groups resolve to their first visible child). */
export function organizationItemEntryPath(
  item: OrganizationAdminNavigationItem,
): string | null {
  if (item.hidden) return null;
  if (item.path) return item.path;
  return item.children?.find((child) => !child.hidden)?.path ?? null;
}

export function canViewOrganizationAdminItem(
  permissions: readonly string[],
  item: Pick<OrganizationAdminNavigationItem, "permissions">,
): boolean {
  return canAny(permissions, item.permissions);
}

/**
 * True when the session holds any organization-workspace capability. Driven by
 * the backend tenant permission catalog; `*` (platform owner) and the legacy
 * `org.*` demo scope also qualify.
 */
export function canAccessOrganizationAdmin(permissions: readonly string[]): boolean {
  return permissions.some(
    (permission) =>
      permission === "*" || permission.startsWith("org.") || TENANT_READ_SET.has(permission),
  );
}

export function firstAccessibleOrganizationAdminPath(
  permissions: readonly string[],
): string | null {
  if (!canAccessOrganizationAdmin(permissions)) return null;
  for (const section of ORGANIZATION_ADMIN_NAVIGATION) {
    for (const item of section.items) {
      if (item.hidden) continue;
      if (!canViewOrganizationAdminItem(permissions, item)) continue;
      const path = organizationItemEntryPath(item);
      if (path) return path;
    }
  }
  return null;
}

export interface OrganizationAdminLocation {
  section: OrganizationAdminNavigationSection;
  item: OrganizationAdminNavigationItem;
  child?: OrganizationAdminNavigationChild;
  label: string;
  entryPath: string | null;
}

/** Maps a pathname to the catalogue node that owns it. */
export function locateOrganizationAdminScreen(
  pathname: string,
): OrganizationAdminLocation | null {
  for (const section of ORGANIZATION_ADMIN_NAVIGATION) {
    for (const item of section.items) {
      if (item.path && (pathname === item.path || pathname.startsWith(`${item.path}/`))) {
        return { section, item, label: item.label, entryPath: organizationItemEntryPath(item) };
      }
      for (const child of item.children ?? []) {
        if (pathname === child.path || pathname.startsWith(`${child.path}/`)) {
          return { section, item, child, label: child.label, entryPath: organizationItemEntryPath(item) };
        }
      }
    }
  }

  // Customer record pages (`/organization/customers/:customerId`) are reached
  // from the directory rather than the sidebar; tie them to the directory item
  // so breadcrumbs and the permission gate keep working.
  const customerPrefix = `${ORGANIZATION_ADMIN_BASE_PATH}/customers/`;
  if (pathname.startsWith(customerPrefix)) {
    const section = ORGANIZATION_ADMIN_NAVIGATION.find((entry) => entry.key === "customers");
    const item = section?.items.find((entry) => entry.key === "customer-directory") ?? section?.items[0];
    if (section && item) {
      return { section, item, label: item.label, entryPath: organizationItemEntryPath(item) };
    }
  }

  return null;
}

export const ORGANIZATION_ADMIN_HOME_PATH = (() => {
  const first = ORGANIZATION_ADMIN_NAVIGATION[0]?.items[0];
  return (first && organizationItemEntryPath(first)) ?? `${ORGANIZATION_ADMIN_BASE_PATH}/dashboard/organization-overview`;
})();
