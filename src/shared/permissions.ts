/**
 * Permission Constants - Enums for type-safe permission matching.
 *
 * These are NOT hardcoded role assignments. They are the universe of
 * possible permissions. Admins create roles and assign any combination
 * of these permissions. The sidebar, route guards, and API middleware
 * all check against these strings.
 *
 * Format: module.resource.action
 */

// ─── SaaS Platform Permissions ────────────────────────────────────────
export const SAAS_PERMISSIONS = {
  // Tenants
  TENANT_CREATE: 'saas.tenant.create',
  TENANT_READ: 'saas.tenant.read',
  TENANT_UPDATE: 'saas.tenant.update',
  TENANT_ACTIVATE: 'saas.tenant.activate',
  TENANT_SUSPEND: 'saas.tenant.suspend',
  TENANT_REACTIVATE: 'saas.tenant.reactivate',
  TENANT_ARCHIVE: 'saas.tenant.archive',
  TENANT_RESTORE: 'saas.tenant.restore',
  TENANT_TERMINATE: 'saas.tenant.terminate',
  TENANT_MANAGE_ADMIN: 'saas.tenant.manage_admin',
  TENANT_MANAGE_MODULES: 'saas.tenant.manage_modules',
  TENANT_MANAGE_LIMITS: 'saas.tenant.manage_limits',
  TENANT_VIEW_USAGE: 'saas.tenant.view_usage',
  TENANT_MANAGE_SUPPORT: 'saas.tenant.manage_support_access',
  // Plans
  PLAN_CREATE: 'saas.plan.create',
  PLAN_READ: 'saas.plan.read',
  PLAN_UPDATE: 'saas.plan.update',
  PLAN_DISABLE: 'saas.plan.disable',
  PLAN_ASSIGN: 'saas.plan.assign',
  PLAN_MANAGE_LIMITS: 'saas.plan.manage_limits',
  // Modules
  MODULE_READ: 'saas.module.read',
  MODULE_CONFIGURE: 'saas.module.configure',
  MODULE_ACTIVATE: 'saas.module.activate',
  MODULE_DEACTIVATE: 'saas.module.deactivate',
  MODULE_MANAGE_DEPENDENCY: 'saas.module.manage_dependency',
  MODULE_MANAGE_FEATURE_FLAGS: 'saas.module.manage_feature_flags',
  // Security
  SECURITY_READ: 'saas.security.read',
  SECURITY_CONFIGURE: 'saas.security.configure',
  SESSION_REVOKE: 'saas.session.revoke',
  USER_SUSPEND: 'saas.user.suspend',
  SUPPORT_IMPERSONATE: 'saas.support.impersonate',
  SUPPORT_IMPERSONATE_SENSITIVE: 'saas.support.impersonate_sensitive',
  SECURITY_BREAK_GLASS: 'saas.security.break_glass',
  // Audit
  AUDIT_READ: 'saas.audit.read',
  AUDIT_EXPORT: 'saas.audit.export',
  AUDIT_SECURITY_READ: 'saas.audit.security.read',
  // Operations
  OPERATIONS_HEALTH_READ: 'saas.operations.health.read',
  OPERATIONS_JOB_READ: 'saas.operations.job.read',
  OPERATIONS_JOB_RETRY: 'saas.operations.job.retry',
  OPERATIONS_QUEUE_MANAGE: 'saas.operations.queue.manage',
  OPERATIONS_WORKER_MANAGE: 'saas.operations.worker.manage',
  OPERATIONS_SCHEDULER_MANAGE: 'saas.operations.scheduler.manage',
} as const;

// ─── Tenant Admin Permissions ──────────────────────────────────────────
export const TENANT_PERMISSIONS = {
  // Settings
  SETTINGS_READ: 'tenant.settings.read',
  SETTINGS_UPDATE: 'tenant.settings.update',
  // Users
  USER_CREATE: 'tenant.user.create',
  USER_READ: 'tenant.user.read',
  USER_UPDATE: 'tenant.user.update',
  USER_INVITE: 'tenant.user.invite',
  USER_SUSPEND: 'tenant.user.suspend',
  USER_REACTIVATE: 'tenant.user.reactivate',
  USER_DEACTIVATE: 'tenant.user.deactivate',
  USER_ARCHIVE: 'tenant.user.archive',
  USER_RESTORE: 'tenant.user.restore',
  // Groups
  GROUP_CREATE: 'tenant.group.create',
  GROUP_READ: 'tenant.group.read',
  GROUP_UPDATE: 'tenant.group.update',
  GROUP_DELETE: 'tenant.group.delete',
  GROUP_MEMBERS_MANAGE: 'tenant.group.members.manage',
  GROUP_ROLES_MANAGE: 'tenant.group.roles.manage',
  // Roles
  ROLE_CREATE: 'tenant.role.create',
  ROLE_READ: 'tenant.role.read',
  ROLE_UPDATE: 'tenant.role.update',
  ROLE_DELETE: 'tenant.role.delete',
  ROLE_ASSIGN: 'tenant.role.assign',
  ROLE_INHERITANCE_MANAGE: 'tenant.role.inheritance.manage',
  // Permissions
  PERMISSION_READ: 'tenant.permission.read',
  PERMISSION_ASSIGN: 'tenant.permission.assign',
  PERMISSION_REVOKE: 'tenant.permission.revoke',
  // Custom roles & permissions
  CUSTOM_ROLE_CREATE: 'tenant.custom_role.create',
  CUSTOM_ROLE_READ: 'tenant.custom_role.read',
  CUSTOM_ROLE_UPDATE: 'tenant.custom_role.update',
  CUSTOM_ROLE_DISABLE: 'tenant.custom_role.disable',
  CUSTOM_ROLE_DELETE: 'tenant.custom_role.delete',
  CUSTOM_PERMISSION_CREATE: 'tenant.custom_permission.create',
  CUSTOM_PERMISSION_READ: 'tenant.custom_permission.read',
  CUSTOM_PERMISSION_UPDATE: 'tenant.custom_permission.update',
  CUSTOM_PERMISSION_DISABLE: 'tenant.custom_permission.disable',
  CUSTOM_PERMISSION_DELETE: 'tenant.custom_permission.delete',
  // Security / Audit / Integration
  AUDIT_READ: 'tenant.audit.read',
  AUDIT_EXPORT: 'tenant.audit.export',
  INTEGRATION_MANAGE: 'tenant.integration.manage',
  API_KEY_MANAGE: 'tenant.api_key.manage',
  WEBHOOK_MANAGE: 'tenant.webhook.manage',
  SECURITY_MANAGE: 'tenant.security.manage',
  SESSION_REVOKE: 'tenant.session.revoke',
} as const;

// ─── ITSM Module Permissions ───────────────────────────────────────────
export const ITSM_PERMISSIONS = {
  // Tickets
  TICKET_VIEW: 'itsm.ticket.view',
  TICKET_CREATE: 'itsm.ticket.create',
  TICKET_UPDATE: 'itsm.ticket.update',
  TICKET_DELETE: 'itsm.ticket.delete',
  TICKET_ASSIGN: 'itsm.ticket.assign',
  TICKET_CLOSE: 'itsm.ticket.close',
  TICKET_REPLY: 'itsm.ticket.reply',
  TICKET_NOTE: 'itsm.ticket.note',
  TICKET_TRANSFER: 'itsm.ticket.transfer',
  TICKET_MERGE: 'itsm.ticket.merge',
  TICKET_ESCALATE: 'itsm.ticket.escalate',
  // Incidents
  INCIDENT_VIEW: 'itsm.incident.view',
  INCIDENT_CREATE: 'itsm.incident.create',
  INCIDENT_UPDATE: 'itsm.incident.update',
  INCIDENT_DELETE: 'itsm.incident.delete',
  INCIDENT_ASSIGN: 'itsm.incident.assign',
  INCIDENT_RESOLVE: 'itsm.incident.resolve',
  INCIDENT_CLOSE: 'itsm.incident.close',
  INCIDENT_REOPEN: 'itsm.incident.reopen',
  INCIDENT_ESCALATE: 'itsm.incident.escalate',
  INCIDENT_PRIORITY_OVERRIDE: 'itsm.incident.priority.override',
  // Problems
  PROBLEM_VIEW: 'itsm.problem.view',
  PROBLEM_CREATE: 'itsm.problem.create',
  PROBLEM_UPDATE: 'itsm.problem.update',
  PROBLEM_ASSIGN: 'itsm.problem.assign',
  PROBLEM_INVESTIGATE: 'itsm.problem.investigate',
  PROBLEM_PERFORM_RCA: 'itsm.problem.perform_rca',
  PROBLEM_RESOLVE: 'itsm.problem.resolve',
  PROBLEM_CLOSE: 'itsm.problem.close',
  // Changes
  CHANGE_VIEW: 'itsm.change.view',
  CHANGE_CREATE: 'itsm.change.create',
  CHANGE_UPDATE: 'itsm.change.update',
  CHANGE_APPROVE: 'itsm.change.approve',
  CHANGE_REJECT: 'itsm.change.reject',
  CHANGE_SCHEDULE: 'itsm.change.schedule',
  CHANGE_IMPLEMENT: 'itsm.change.implement',
  CHANGE_ROLLBACK: 'itsm.change.rollback',
  CHANGE_CLOSE: 'itsm.change.close',
  // Knowledge
  KNOWLEDGE_VIEW: 'itsm.knowledge.view',
  KNOWLEDGE_CREATE: 'itsm.knowledge.create',
  KNOWLEDGE_UPDATE: 'itsm.knowledge.update',
  KNOWLEDGE_DELETE: 'itsm.knowledge.delete',
  KNOWLEDGE_PUBLISH: 'itsm.knowledge.publish',
  KNOWLEDGE_APPROVE: 'itsm.knowledge.approve',
  // Service Catalog
  CATALOG_VIEW: 'itsm.catalog.view',
  CATALOG_REQUEST: 'itsm.catalog.request',
  CATALOG_CREATE: 'itsm.catalog.create',
  CATALOG_UPDATE: 'itsm.catalog.update',
  CATALOG_MANAGE: 'itsm.catalog.manage',
  // SLA
  SLA_VIEW: 'itsm.sla.view',
  SLA_CREATE: 'itsm.sla.create',
  SLA_UPDATE: 'itsm.sla.update',
  SLA_OVERRIDE: 'itsm.sla.override',
  // Approvals
  APPROVAL_VIEW: 'itsm.approval.view',
  APPROVAL_DECIDE: 'itsm.approval.decide',
  APPROVAL_CONFIGURE: 'itsm.approval.configure',
  // Reports
  REPORT_VIEW: 'itsm.report.view',
  REPORT_CREATE: 'itsm.report.create',
  REPORT_EXPORT: 'itsm.report.export',
  REPORT_SCHEDULE: 'itsm.report.schedule',
  // Settings
  SETTINGS_VIEW: 'itsm.settings.view',
  SETTINGS_UPDATE: 'itsm.settings.update',
} as const;

// ─── CRM Permissions ──────────────────────────────────────────────────
export const CRM_PERMISSIONS = {
  LEAD_VIEW: 'crm.lead.view',
  LEAD_CREATE: 'crm.lead.create',
  LEAD_UPDATE: 'crm.lead.update',
  LEAD_DELETE: 'crm.lead.delete',
  ACCOUNT_VIEW: 'crm.account.view',
  ACCOUNT_CREATE: 'crm.account.create',
  ACCOUNT_UPDATE: 'crm.account.update',
  CONTACT_VIEW: 'crm.contact.view',
  CONTACT_CREATE: 'crm.contact.create',
  CONTACT_UPDATE: 'crm.contact.update',
  OPPORTUNITY_VIEW: 'crm.opportunity.view',
  OPPORTUNITY_CREATE: 'crm.opportunity.create',
  OPPORTUNITY_UPDATE: 'crm.opportunity.update',
  PIPELINE_VIEW: 'crm.pipeline.view',
  PIPELINE_MANAGE: 'crm.pipeline.manage',
  QUOTE_VIEW: 'crm.quote.view',
  QUOTE_CREATE: 'crm.quote.create',
  REPORT_VIEW: 'crm.report.view',
} as const;

// ─── Other Module Permissions ──────────────────────────────────────────
export const ITAM_PERMISSIONS = {
  ASSET_VIEW: 'itam.asset.view',
  ASSET_CREATE: 'itam.asset.create',
  ASSET_UPDATE: 'itam.asset.update',
  ASSET_DELETE: 'itam.asset.delete',
  LICENSE_VIEW: 'itam.license.view',
  LICENSE_MANAGE: 'itam.license.manage',
  INVENTORY_VIEW: 'itam.inventory.view',
  INVENTORY_MANAGE: 'itam.inventory.manage',
} as const;

export const PROJECT_PERMISSIONS = {
  VIEW: 'projects.view',
  CREATE: 'projects.create',
  UPDATE: 'projects.update',
  DELETE: 'projects.delete',
  MANAGE: 'projects.manage',
} as const;

export const HR_PERMISSIONS = {
  CASE_VIEW: 'hr.case.view',
  CASE_CREATE: 'hr.case.create',
  CASE_UPDATE: 'hr.case.update',
  MANAGE: 'hr.manage',
} as const;

export const WORKFLOW_PERMISSIONS = {
  VIEW: 'workflow.view',
  CREATE: 'workflow.create',
  UPDATE: 'workflow.update',
  DELETE: 'workflow.delete',
  MANAGE: 'workflow.manage',
} as const;

export const ANALYTICS_PERMISSIONS = {
  VIEW: 'analytics.view',
  CREATE: 'analytics.create',
  EXPORT: 'analytics.export',
  MANAGE: 'analytics.manage',
} as const;

// ─── All Permissions Combined ──────────────────────────────────────────
export const ALL_PERMISSIONS = {
  ...SAAS_PERMISSIONS,
  ...TENANT_PERMISSIONS,
  ...ITSM_PERMISSIONS,
  ...CRM_PERMISSIONS,
  ...ITAM_PERMISSIONS,
  ...PROJECT_PERMISSIONS,
  ...HR_PERMISSIONS,
  ...WORKFLOW_PERMISSIONS,
  ...ANALYTICS_PERMISSIONS,
} as const;

export type Permission = (typeof ALL_PERMISSIONS)[keyof typeof ALL_PERMISSIONS];

// ─── Platform Permission Aliases (backend uses platform.* prefix) ─────
// Maps saas.* permissions to platform.* for backend compatibility
export const PLATFORM_PERMISSION_ALIASES: Record<string, string> = {
  'platform.view_dashboard': SAAS_PERMISSIONS.AUDIT_READ,
  'platform.manage_dashboard': SAAS_PERMISSIONS.AUDIT_READ,
  'platform.view_tenants': SAAS_PERMISSIONS.TENANT_READ,
  'platform.manage_tenants': SAAS_PERMISSIONS.TENANT_CREATE,
  'platform.view_plans': SAAS_PERMISSIONS.PLAN_READ,
  'platform.manage_plans': SAAS_PERMISSIONS.PLAN_CREATE,
  'platform.view_audit': SAAS_PERMISSIONS.AUDIT_READ,
  'platform.manage_audit': SAAS_PERMISSIONS.AUDIT_EXPORT,
  'platform.view_superadmins': SAAS_PERMISSIONS.SECURITY_READ,
  'platform.manage_superadmins': SAAS_PERMISSIONS.SECURITY_CONFIGURE,
  'platform.view_invoices': SAAS_PERMISSIONS.PLAN_READ,
  'platform.manage_invoices': SAAS_PERMISSIONS.PLAN_UPDATE,
  'platform.manage_payments': SAAS_PERMISSIONS.PLAN_UPDATE,
  'platform.impersonate': SAAS_PERMISSIONS.SUPPORT_IMPERSONATE,
  'platform.view_platform': SAAS_PERMISSIONS.OPERATIONS_HEALTH_READ,
  'platform.manage_platform': SAAS_PERMISSIONS.SECURITY_CONFIGURE,
  'platform.view_operations': SAAS_PERMISSIONS.OPERATIONS_HEALTH_READ,
  'platform.manage_operations': SAAS_PERMISSIONS.OPERATIONS_QUEUE_MANAGE,
  'platform.view_modules': SAAS_PERMISSIONS.MODULE_READ,
  'platform.manage_modules': SAAS_PERMISSIONS.MODULE_CONFIGURE,
  'platform.view_security': SAAS_PERMISSIONS.SECURITY_READ,
  'platform.manage_security': SAAS_PERMISSIONS.SECURITY_CONFIGURE,
};

// ─── Module Keys ───────────────────────────────────────────────────────
export const MODULE_KEYS = [
  'helpdesk', 'crm', 'itam', 'itom', 'cmdb', 'projects', 'hr',
  'field-service', 'workflow', 'analytics', 'ai', 'secops', 'grc',
  'workplace', 'legal', 'procurement', 'finance', 'esg', 'csm', 'settings',
] as const;

export type ModuleKey = (typeof MODULE_KEYS)[number];

// ─── Super Admin Permission Sets (presets, not enforced) ────────────────
export const SAAS_ROLE_PRESETS: Record<string, Permission[]> = {
  super_admin: Object.values(SAAS_PERMISSIONS) as Permission[],
  platform_administrator: [
    SAAS_PERMISSIONS.TENANT_READ,
    SAAS_PERMISSIONS.TENANT_UPDATE,
    SAAS_PERMISSIONS.PLAN_READ,
    SAAS_PERMISSIONS.MODULE_READ,
    SAAS_PERMISSIONS.MODULE_CONFIGURE,
    SAAS_PERMISSIONS.SECURITY_READ,
    SAAS_PERMISSIONS.AUDIT_READ,
    SAAS_PERMISSIONS.OPERATIONS_HEALTH_READ,
  ] as Permission[],
  platform_support: [
    SAAS_PERMISSIONS.TENANT_READ,
    SAAS_PERMISSIONS.TENANT_UPDATE,
    SAAS_PERMISSIONS.SUPPORT_IMPERSONATE,
    SAAS_PERMISSIONS.AUDIT_READ,
  ] as Permission[],
  platform_billing: [
    SAAS_PERMISSIONS.PLAN_CREATE,
    SAAS_PERMISSIONS.PLAN_READ,
    SAAS_PERMISSIONS.PLAN_UPDATE,
    SAAS_PERMISSIONS.PLAN_DISABLE,
    SAAS_PERMISSIONS.PLAN_ASSIGN,
    SAAS_PERMISSIONS.TENANT_VIEW_USAGE,
  ] as Permission[],
  platform_auditor: [
    SAAS_PERMISSIONS.AUDIT_READ,
    SAAS_PERMISSIONS.AUDIT_EXPORT,
    SAAS_PERMISSIONS.AUDIT_SECURITY_READ,
    SAAS_PERMISSIONS.TENANT_READ,
    SAAS_PERMISSIONS.OPERATIONS_HEALTH_READ,
  ] as Permission[],
};
