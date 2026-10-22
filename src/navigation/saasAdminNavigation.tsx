import type { LucideIcon } from "lucide-react";
import { canAny } from "@services/authorization/permissions";
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
  CreditCard,
  Cpu,
  Database,
  Download,
  FileText,
  GitBranch,
  Globe,
  KeyRound,
  Layers,
  LifeBuoy,
  Lock,
  Mail,
  Package,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Siren,
  Sparkles,
  Truck,
  UserRound,
  Users,
  Workflow,
  Wrench,
  DollarSign,
  Target,
  Zap,
  UserPlus,
  UserCheck,
  Settings,
} from "lucide-react";

export interface SaasAdminNavigationItem {
  key: string;
  label: string;
  hint: string;
  path: string;
  icon: LucideIcon;
  screen: string;
  /**
   * When true the item is a routable screen but is omitted from the sidebar
   * (e.g. reached from an action inside another screen rather than the nav).
   */
  hidden?: boolean;
  /**
   * Backend permission "areas" (`accessibleAreas` / `admin.<area>.*` codes)
   * required to view this item. Overrides the section default. An empty value
   * means the item is visible to any signed-in SaaS admin user.
   */
  areas?: string[];
}

export interface SaasAdminNavigationSection {
  key: string;
  label: string;
  description: string;
  icon: LucideIcon;
  items: SaasAdminNavigationItem[];
  /**
   * Default permission areas for every item in the section (overridable per
   * item via `SaasAdminNavigationItem.areas`).
   */
  areas?: string[];
}

export const SAAS_ADMIN_NAVIGATION: SaasAdminNavigationSection[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    description: "Platform overview and key metrics",
    icon: Activity,
    areas: ["dashboard"],
    items: [
      {
        key: "overview",
        label: "Overview",
        hint: "Platform health and metrics at a glance",
        path: "/saas-admin/dashboard/overview",
        icon: Activity,
        screen: "DashboardOverviewScreen",
      },
    ],
  },
  {
    key: "tenants",
    label: "Tenant Management",
    description: "Manage all tenants on the platform",
    icon: Building2,
    areas: ["tenants"],
    items: [
      {
        key: "all-tenants",
        label: "All Tenants",
        hint: "Browse, search and manage every tenant",
        path: "/saas-admin/tenants/all-tenants",
        icon: Building2,
        screen: "AllTenantsScreen",
      },
      {
        key: "create-tenant",
        label: "Create Tenant",
        hint: "Provision a new tenant",
        path: "/saas-admin/tenants/create-tenant",
        icon: Package,
        screen: "CreateTenantScreen",
        hidden: true,
      },
      {
        key: "tenant-details",
        label: "Tenant Details",
        hint: "View and manage tenant profile",
        path: "/saas-admin/tenants/details/:tenantId",
        icon: FileText,
        screen: "TenantDetailsScreen",
        hidden: true,
      },
      {
        key: "tenant-configuration",
        label: "Tenant Configuration",
        hint: "Configure tenant settings",
        path: "/saas-admin/tenants/configuration/:tenantId",
        icon: Settings,
        screen: "TenantConfigurationScreen",
        hidden: true,
      },
      {
        key: "tenant-status",
        label: "Tenant Status & Suspension",
        hint: "Manage tenant status and suspensions",
        path: "/saas-admin/tenants/status",
        icon: AlertTriangle,
        screen: "TenantStatusScreen",
      },
    ],
  },
  {
    key: "staff-management",
    label: "Staff & Access Management",
    description: "Platform staff, roles and permissions",
    icon: Users,
    areas: ["staff", "roles", "permissions"],
    items: [
      {
        key: "staff-account-details",
        label: "Staff Details",
        hint: "View and manage a staff member",
        path: "/saas-admin/staff-management/staff-accounts/:staffId",
        icon: FileText,
        screen: "StaffDetailsScreen",
        hidden: true,
      },
      {
        key: "staff-edit",
        label: "Edit Staff",
        hint: "Edit a staff member's profile, roles and permissions",
        path: "/saas-admin/staff-management/edit/:staffId",
        icon: Settings,
        screen: "StaffEditScreen",
        hidden: true,
      },
      {
        key: "all-staff",
        label: "Staff Accounts",
        hint: "Manage platform staff accounts",
        path: "/saas-admin/staff-management/staff-accounts",
        icon: Users,
        screen: "StaffAccountsScreen",
      },
      {
        key: "create-staff",
        label: "Create Staff Account",
        hint: "Add new staff member",
        path: "/saas-admin/staff-management/create-staff",
        icon: UserPlus,
        screen: "CreateStaffScreen",
        hidden: true,
      },
      {
        key: "roles-management",
        label: "Roles Management",
        hint: "Define roles and permissions",
        path: "/saas-admin/staff-management/roles",
        icon: ShieldCheck,
        screen: "RolesManagementScreen",
      },
      {
        key: "permissions-management",
        label: "Permissions Management",
        hint: "Manage permission grants",
        path: "/saas-admin/staff-management/permissions",
        icon: KeyRound,
        screen: "PermissionsManagementScreen",
      },
      {
        key: "role-assignment",
        label: "Staff Role Assignment",
        hint: "Assign roles to staff",
        path: "/saas-admin/staff-management/role-assignment",
        icon: UserCheck,
        screen: "RoleAssignmentScreen",
        hidden: true,
      },
      {
        key: "access-audit-logs",
        label: "Access Audit Logs",
        hint: "View access change history",
        path: "/saas-admin/staff-management/audit-logs",
        icon: ClipboardList,
        screen: "AccessAuditLogsScreen",
        areas: ["audit"],
      },
    ],
  },
  {
    key: "approval-management",
    label: "Approval Management",
    description: "Platform-level approval workflows",
    icon: ClipboardCheck,
    areas: ["approvals"],
    items: [
      {
        key: "pending-approvals",
        label: "Pending Approvals",
        hint: "Review pending approvals",
        path: "/saas-admin/approval-management/pending",
        icon: ClipboardCheck,
        screen: "PendingApprovalsScreen",
      },
      {
        key: "approval-policies",
        label: "Approval Policies",
        hint: "Define approval policies",
        path: "/saas-admin/approval-management/policies",
        icon: ShieldCheck,
        screen: "ApprovalPoliciesScreen",
      },
      {
        key: "approval-workflows",
        label: "Approval Workflows",
        hint: "Manage approval workflows",
        path: "/saas-admin/approval-management/workflows",
        icon: Workflow,
        screen: "ApprovalWorkflowsScreen",
      },
      {
        key: "approval-history",
        label: "Approval History",
        hint: "View approval history",
        path: "/saas-admin/approval-management/history",
        icon: ClipboardList,
        screen: "ApprovalHistoryScreen",
      },
    ],
  },
  {
    key: "service-management",
    label: "Service Management",
    description: "ITSM configuration across tenants",
    icon: LifeBuoy,
    areas: ["service-management"],
    items: [
      {
        key: "service-catalog",
        label: "Service Catalog",
        hint: "Global service catalog items",
        path: "/saas-admin/service-management/catalog",
        icon: Layers,
        screen: "ServiceCatalogScreen",
      },
      {
        key: "service-categories",
        label: "Service Categories",
        hint: "Manage service categories",
        path: "/saas-admin/service-management/categories",
        icon: Boxes,
        screen: "ServiceCategoriesScreen",
      },
      {
        key: "service-templates",
        label: "Service Templates",
        hint: "Manage service templates",
        path: "/saas-admin/service-management/templates",
        icon: FileText,
        screen: "ServiceTemplatesScreen",
      },
      {
        key: "service-availability",
        label: "Service Availability",
        hint: "Configure service availability",
        path: "/saas-admin/service-management/availability",
        icon: Globe,
        screen: "ServiceAvailabilityScreen",
      },
    ],
  },
  {
    key: "sla-management",
    label: "SLA Management",
    description: "Platform SLA definitions and tracking",
    icon: ShieldCheck,
    areas: ["sla-management"],
    items: [
      {
        key: "sla-policies",
        label: "SLA Policies",
        hint: "Manage SLA policies",
        path: "/saas-admin/sla-management/policies",
        icon: ShieldCheck,
        screen: "SlaPoliciesScreen",
      },
      {
        key: "sla-targets",
        label: "SLA Targets",
        hint: "Define SLA targets",
        path: "/saas-admin/sla-management/targets",
        icon: Target,
        screen: "SlaTargetsScreen",
      },
      {
        key: "escalation-rules",
        label: "Escalation Rules",
        hint: "Configure escalation rules",
        path: "/saas-admin/sla-management/escalation-rules",
        icon: AlertTriangle,
        screen: "EscalationRulesScreen",
      },
      {
        key: "sla-breach-monitoring",
        label: "SLA Breach Monitoring",
        hint: "Monitor SLA breaches",
        path: "/saas-admin/sla-management/breaches",
        icon: AlertTriangle,
        screen: "SlaBreachMonitoringScreen",
      },
    ],
  },
  {
    key: "workflow-management",
    label: "Workflow Management",
    description: "Automation and workflow orchestration",
    icon: Workflow,
    areas: ["workflow-management"],
    items: [
      {
        key: "workflow-builder",
        label: "Workflow Builder",
        hint: "Build automation workflows",
        path: "/saas-admin/workflow-management/builder",
        icon: Workflow,
        screen: "WorkflowBuilderScreen",
      },
      {
        key: "workflow-templates",
        label: "Workflow Templates",
        hint: "Manage workflow templates",
        path: "/saas-admin/workflow-management/templates",
        icon: FileText,
        screen: "WorkflowTemplatesScreen",
      },
      {
        key: "automation-rules",
        label: "Automation Rules",
        hint: "Configure automation rules",
        path: "/saas-admin/workflow-management/automation-rules",
        icon: Zap,
        screen: "AutomationRulesScreen",
      },
      {
        key: "scheduled-jobs",
        label: "Scheduled Jobs",
        hint: "Manage scheduled jobs",
        path: "/saas-admin/workflow-management/scheduled-jobs",
        icon: CalendarDays,
        screen: "ScheduledJobsScreen",
      },
      {
        key: "execution-history",
        label: "Execution History",
        hint: "View workflow execution history",
        path: "/saas-admin/workflow-management/execution-history",
        icon: ClipboardList,
        screen: "ExecutionHistoryScreen",
      },
    ],
  },
  {
    key: "itsm-configuration",
    label: "Global ITSM Configuration",
    description: "Global ITSM settings and templates",
    icon: Database,
    areas: ["itsm-configuration"],
    items: [
      {
        key: "incident-configuration",
        label: "Incident Configuration",
        hint: "Configure incident settings",
        path: "/saas-admin/itsm-configuration/incidents",
        icon: AlertTriangle,
        screen: "IncidentConfigurationScreen",
      },
      {
        key: "problem-configuration",
        label: "Problem Configuration",
        hint: "Configure problem settings",
        path: "/saas-admin/itsm-configuration/problems",
        icon: GitBranch,
        screen: "ProblemConfigurationScreen",
      },
      {
        key: "change-configuration",
        label: "Change Configuration",
        hint: "Configure change settings",
        path: "/saas-admin/itsm-configuration/changes",
        icon: RefreshCw,
        screen: "ChangeConfigurationScreen",
      },
      {
        key: "request-configuration",
        label: "Request Configuration",
        hint: "Configure request settings",
        path: "/saas-admin/itsm-configuration/requests",
        icon: ClipboardList,
        screen: "RequestConfigurationScreen",
      },
      {
        key: "priority-status-rules",
        label: "Priority & Status Rules",
        hint: "Manage priority and status rules",
        path: "/saas-admin/itsm-configuration/priority-status",
        icon: Settings,
        screen: "PriorityStatusRulesScreen",
      },
      {
        key: "custom-fields",
        label: "Custom Fields",
        hint: "Manage custom fields",
        path: "/saas-admin/itsm-configuration/custom-fields",
        icon: FileText,
        screen: "CustomFieldsScreen",
      },
    ],
  },
  {
    key: "knowledge-management",
    label: "Knowledge Management",
    description: "Platform knowledge base and articles",
    icon: BookOpen,
    areas: ["knowledge-management"],
    items: [
      {
        key: "knowledge-base-settings",
        label: "Knowledge Base Settings",
        hint: "Configure knowledge base",
        path: "/saas-admin/knowledge-management/settings",
        icon: Settings,
        screen: "KnowledgeBaseSettingsScreen",
      },
      {
        key: "article-categories",
        label: "Article Categories",
        hint: "Manage article categories",
        path: "/saas-admin/knowledge-management/categories",
        icon: Boxes,
        screen: "ArticleCategoriesScreen",
      },
      {
        key: "publishing-rules",
        label: "Publishing Rules",
        hint: "Configure publishing rules",
        path: "/saas-admin/knowledge-management/publishing-rules",
        icon: ShieldCheck,
        screen: "PublishingRulesScreen",
      },
      {
        key: "content-moderation",
        label: "Content Moderation",
        hint: "Moderate content",
        path: "/saas-admin/knowledge-management/moderation",
        icon: UserRound,
        screen: "ContentModerationScreen",
      },
    ],
  },
  {
    key: "cmdb-asset-management",
    label: "CMDB & Asset Management",
    description: "Configuration items and asset tracking",
    icon: Boxes,
    areas: ["cmdb-assets"],
    items: [
      {
        key: "cmdb-configuration",
        label: "CMDB Configuration",
        hint: "Configure CMDB settings",
        path: "/saas-admin/cmdb-asset-management/cmdb-config",
        icon: Settings,
        screen: "CmdbConfigurationScreen",
      },
      {
        key: "ci-types",
        label: "CI Types",
        hint: "Manage CI types",
        path: "/saas-admin/cmdb-asset-management/ci-types",
        icon: Boxes,
        screen: "CiTypesScreen",
      },
      {
        key: "asset-categories",
        label: "Asset Categories",
        hint: "Manage asset categories",
        path: "/saas-admin/cmdb-asset-management/asset-categories",
        icon: Package,
        screen: "AssetCategoriesScreen",
      },
      {
        key: "asset-lifecycle-rules",
        label: "Asset Lifecycle Rules",
        hint: "Configure asset lifecycle",
        path: "/saas-admin/cmdb-asset-management/lifecycle-rules",
        icon: RefreshCw,
        screen: "AssetLifecycleRulesScreen",
      },
    ],
  },
  {
    key: "email-notifications",
    label: "Email & Notifications",
    description: "Platform email templates and channels",
    icon: Mail,
    areas: ["email-notifications"],
    items: [
      {
        key: "email-server-settings",
        label: "Email Server Settings",
        hint: "Configure email server",
        path: "/saas-admin/email-notifications/server-settings",
        icon: Settings,
        screen: "EmailServerSettingsScreen",
      },
      {
        key: "email-templates",
        label: "Email Templates",
        hint: "Manage email templates",
        path: "/saas-admin/email-notifications/templates",
        icon: Mail,
        screen: "EmailTemplatesScreen",
      },
      {
        key: "notification-rules",
        label: "Notification Rules",
        hint: "Configure notification rules",
        path: "/saas-admin/email-notifications/rules",
        icon: Bell,
        screen: "NotificationRulesScreen",
      },
      {
        key: "inbound-email",
        label: "Inbound Email",
        hint: "Configure inbound email",
        path: "/saas-admin/email-notifications/inbound",
        icon: Mail,
        screen: "InboundEmailScreen",
      },
      {
        key: "delivery-logs",
        label: "Delivery Logs",
        hint: "View email delivery logs",
        path: "/saas-admin/email-notifications/delivery-logs",
        icon: ClipboardList,
        screen: "DeliveryLogsScreen",
      },
    ],
  },
  {
    key: "support-management",
    label: "Support Management",
    description: "Support operations and ticketing",
    icon: LifeBuoy,
    areas: ["support"],
    items: [
      {
        key: "support-tickets",
        label: "Support Tickets",
        hint: "Platform-level support tickets",
        path: "/saas-admin/support-management/tickets",
        icon: LifeBuoy,
        screen: "SupportTicketsScreen",
      },
      {
        key: "customer-support-settings",
        label: "Customer Support Settings",
        hint: "Configure support settings",
        path: "/saas-admin/support-management/settings",
        icon: Settings,
        screen: "CustomerSupportSettingsScreen",
      },
      {
        key: "escalation-policies",
        label: "Escalation Policies",
        hint: "Manage escalation policies",
        path: "/saas-admin/support-management/escalation-policies",
        icon: AlertTriangle,
        screen: "EscalationPoliciesScreen",
      },
    ],
  },
  {
    key: "reports-analytics",
    label: "Reports & Analytics",
    description: "Platform reporting and analytics",
    icon: BarChart3,
    areas: ["reports"],
    items: [
      {
        key: "platform-overview",
        label: "Platform Overview",
        hint: "Platform metrics overview",
        path: "/saas-admin/reports-analytics/platform-overview",
        icon: BarChart3,
        screen: "PlatformOverviewReportScreen",
      },
      {
        key: "tenant-usage-reports",
        label: "Tenant Usage Reports",
        hint: "Tenant usage analytics",
        path: "/saas-admin/reports-analytics/tenant-usage",
        icon: Users,
        screen: "TenantUsageReportsScreen",
      },
      {
        key: "subscription-reports",
        label: "Subscription Reports",
        hint: "Subscription analytics",
        path: "/saas-admin/reports-analytics/subscriptions",
        icon: CreditCard,
        screen: "SubscriptionReportsScreen",
      },
      {
        key: "revenue-reports",
        label: "Revenue Reports",
        hint: "Revenue analytics",
        path: "/saas-admin/reports-analytics/revenue",
        icon: DollarSign,
        screen: "RevenueReportsScreen",
      },
      {
        key: "staff-activity-reports",
        label: "Staff Activity Reports",
        hint: "Staff activity analytics",
        path: "/saas-admin/reports-analytics/staff-activity",
        icon: Activity,
        screen: "StaffActivityReportsScreen",
      },
      {
        key: "audit-reports",
        label: "Audit Reports",
        hint: "Audit analytics",
        path: "/saas-admin/reports-analytics/audit",
        icon: ClipboardList,
        screen: "AuditReportsScreen",
        areas: ["audit"],
      },
      {
        key: "report-exports",
        label: "Report Exports",
        hint: "Export downloads and expiry",
        path: "/saas-admin/reports-analytics/exports",
        icon: Download,
        screen: "ReportExportsScreen",
        areas: ["reports"],
      },
    ],
  },
  {
    key: "security-audit",
    label: "Security & Audit",
    description: "Audit logs and security compliance",
    icon: ShieldCheck,
    areas: ["settings"],
    items: [
      {
        key: "security-policies",
        label: "Security Policies",
        hint: "Configure security policies",
        path: "/saas-admin/security-audit/policies",
        icon: ShieldCheck,
        screen: "SecurityPoliciesScreen",
      },
      {
        key: "login-session-policies",
        label: "Login & Session Policies",
        hint: "Configure login/session policies",
        path: "/saas-admin/security-audit/login-session",
        icon: Lock,
        screen: "LoginSessionPoliciesScreen",
      },
      {
        key: "mfa-configuration",
        label: "MFA Configuration",
        hint: "Configure MFA",
        path: "/saas-admin/security-audit/mfa",
        icon: Lock,
        screen: "MfaConfigurationScreen",
      },
      {
        key: "audit-logs",
        label: "Audit Logs",
        hint: "View audit logs",
        path: "/saas-admin/security-audit/audit-logs",
        icon: ClipboardList,
        screen: "AuditLogsScreen",
        areas: ["audit"],
      },
      {
        key: "suspicious-activity",
        label: "Suspicious Activity",
        hint: "Monitor suspicious activity",
        path: "/saas-admin/security-audit/suspicious-activity",
        icon: AlertTriangle,
        screen: "SuspiciousActivityScreen",
        areas: ["audit"],
      },
      {
        key: "data-retention",
        label: "Data Retention",
        hint: "Configure data retention",
        path: "/saas-admin/security-audit/data-retention",
        icon: Database,
        screen: "DataRetentionScreen",
      },
    ],
  },
  {
    key: "system-administration",
    label: "System Administration",
    description: "Platform settings and maintenance",
    icon: Cpu,
    areas: ["system-administration"],
    items: [
      {
        key: "system-health",
        label: "System Health",
        hint: "Monitor system health",
        path: "/saas-admin/system-administration/health",
        icon: Activity,
        screen: "SystemHealthScreen",
      },
      {
        key: "background-jobs",
        label: "Background Jobs",
        hint: "Manage background jobs",
        path: "/saas-admin/system-administration/background-jobs",
        icon: Cpu,
        screen: "BackgroundJobsScreen",
      },
      {
        key: "queue-monitoring",
        label: "Queue Monitoring",
        hint: "Monitor queues",
        path: "/saas-admin/system-administration/queues",
        icon: ClipboardList,
        screen: "QueueMonitoringScreen",
      },
      {
        key: "database-status",
        label: "Database Status",
        hint: "Monitor database",
        path: "/saas-admin/system-administration/database",
        icon: Database,
        screen: "DatabaseStatusScreen",
      },
    ],
  },
  {
    key: "platform-settings",
    label: "Platform Settings",
    description: "Branding, domains and appearance",
    icon: Sparkles,
    areas: ["settings"],
    items: [
      {
        key: "general-settings",
        label: "General Settings",
        hint: "General platform settings",
        path: "/saas-admin/platform-settings/general",
        icon: Settings,
        screen: "GeneralSettingsScreen",
      },
      {
        key: "branding-white-label",
        label: "Branding & White Label",
        hint: "Configure branding",
        path: "/saas-admin/platform-settings/branding",
        icon: Sparkles,
        screen: "BrandingWhiteLabelScreen",
      },
      {
        key: "custom-domains",
        label: "Custom Domains",
        hint: "Manage custom domains",
        path: "/saas-admin/platform-settings/domains",
        icon: Globe,
        screen: "CustomDomainsScreen",
      },
      {
        key: "localization-timezones",
        label: "Localization & Time Zones",
        hint: "Configure localization",
        path: "/saas-admin/platform-settings/localization",
        icon: Globe,
        screen: "LocalizationTimezonesScreen",
      },
      {
        key: "maintenance-mode",
        label: "Maintenance Mode",
        hint: "Toggle maintenance mode",
        path: "/saas-admin/platform-settings/maintenance",
        icon: Wrench,
        screen: "MaintenanceModeScreen",
      },
    ],
  },
  {
    key: "my-account",
    label: "My Account",
    description: "Personal settings and preferences",
    icon: UserRound,
    items: [
      {
        key: "profile",
        label: "My Profile",
        hint: "Your account details",
        path: "/saas-admin/my-account/profile",
        icon: UserRound,
        screen: "ProfileScreen",
      },
      {
        key: "change-password",
        label: "Change Password",
        hint: "Update your password",
        path: "/saas-admin/my-account/change-password",
        icon: Lock,
        screen: "ChangePasswordScreen",
      },
      {
        key: "mfa-security",
        label: "MFA & Security",
        hint: "Manage MFA and security",
        path: "/saas-admin/my-account/mfa-security",
        icon: ShieldCheck,
        screen: "MfaSecurityScreen",
      },
      {
        key: "active-sessions",
        label: "Active Sessions",
        hint: "View active sessions",
        path: "/saas-admin/my-account/sessions",
        icon: Activity,
        screen: "ActiveSessionsScreen",
      },
    ],
  },
];

export const SAAS_ADMIN_BASE_PATH = "/saas-admin";

export function getAllSaasAdminItems(): SaasAdminNavigationItem[] {
  return SAAS_ADMIN_NAVIGATION.flatMap((section) =>
    section.items.map((item) => ({
      ...item,
      section: section.key,
      sectionLabel: section.label,
      areas: item.areas ?? section.areas,
    })),
  );
}

export function getSaasAdminSidebarSections(): SaasAdminNavigationSection[] {
  return SAAS_ADMIN_NAVIGATION;
}

/**
 * Resolves the permission "grants" required to view an item as backend-style
 * `admin.<area>.*` namespace requirements (e.g. area `tenants` -> `admin.tenants.*`).
 * An item without any areas resolves to an empty list (always visible).
 */
export function itemPermissionGrants(
  section: SaasAdminNavigationSection,
  item: SaasAdminNavigationItem,
): string[] {
  const areas = item.areas ?? section.areas ?? [];
  return areas.map((area) => `admin.${area}.*`);
}

/**
 * True when the current session's permissions satisfy the item's area grants.
 * The wildcard `*` (platform owner) satisfies every requirement.
 */
export function canViewSaasAdminItem(
  permissions: readonly string[],
  section: SaasAdminNavigationSection,
  item: SaasAdminNavigationItem,
): boolean {
  return canAny(permissions, itemPermissionGrants(section, item));
}

/**
 * True when the session holds any SaaS admin (`admin.*`) capability. Users with
 * only tenant/ITSM permissions are not part of the control plane.
 */
export function canAccessSaasAdmin(permissions: readonly string[]): boolean {
  return permissions.some(
    (permission) => permission === "*" || permission.startsWith("admin."),
  );
}

/**
 * First non-hidden SaaS admin item the session may view, or null when the user
 * has no control-plane access. Used for post-login / redirect targets.
 */
export function firstAccessibleSaasAdminPath(
  permissions: readonly string[],
): string | null {
  if (!canAccessSaasAdmin(permissions)) return null;
  for (const section of SAAS_ADMIN_NAVIGATION) {
    for (const item of section.items) {
      if (item.hidden) continue;
      if (canViewSaasAdminItem(permissions, section, item)) return item.path;
    }
  }
  return null;
}
