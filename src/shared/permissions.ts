import { ITSM_PERMISSION_MODULES, ITSM_PERMISSION_KEYS } from './itsmPermissions.generated';

/**
 * Permission Constants - Enums for type-safe permission matching.
 *
 * Format: module.resource.action
 */

// ─── SaaS Platform Permissions ────────────────────────────────────────
export const SAAS_PERMISSIONS = {
  DASHBOARD_READ: 'saas.dashboard.read',
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
  PLAN_CREATE: 'saas.plan.create',
  PLAN_READ: 'saas.plan.read',
  PLAN_UPDATE: 'saas.plan.update',
  PLAN_DISABLE: 'saas.plan.disable',
  PLAN_ASSIGN: 'saas.plan.assign',
  PLAN_MANAGE_LIMITS: 'saas.plan.manage_limits',
  MODULE_READ: 'saas.module.read',
  MODULE_CONFIGURE: 'saas.module.configure',
  MODULE_ACTIVATE: 'saas.module.activate',
  MODULE_DEACTIVATE: 'saas.module.deactivate',
  MODULE_MANAGE_DEPENDENCY: 'saas.module.manage_dependency',
  MODULE_MANAGE_FEATURE_FLAGS: 'saas.module.manage_feature_flags',
  SECURITY_READ: 'saas.security.read',
  SECURITY_CONFIGURE: 'saas.security.configure',
  SESSION_REVOKE: 'saas.session.revoke',
  USER_SUSPEND: 'saas.user.suspend',
  SUPPORT_IMPERSONATE: 'saas.support.impersonate',
  SUPPORT_IMPERSONATE_SENSITIVE: 'saas.support.impersonate_sensitive',
  SECURITY_BREAK_GLASS: 'saas.security.break_glass',
  AUDIT_READ: 'saas.audit.read',
  AUDIT_EXPORT: 'saas.audit.export',
  AUDIT_SECURITY_READ: 'saas.audit.security.read',
  OPERATIONS_HEALTH_READ: 'saas.operations.health.read',
  OPERATIONS_JOB_READ: 'saas.operations.job.read',
  OPERATIONS_JOB_RETRY: 'saas.operations.job.retry',
  OPERATIONS_QUEUE_MANAGE: 'saas.operations.queue.manage',
  OPERATIONS_WORKER_MANAGE: 'saas.operations.worker.manage',
  OPERATIONS_SCHEDULER_MANAGE: 'saas.operations.scheduler.manage',
  PLATFORM_CONFIGURE: 'saas.platform.configure',
  ADMIN_MANAGE: 'saas.admin.manage',
  BILLING_READ: 'saas.billing.read',
  BILLING_MANAGE: 'saas.billing.manage',
  SLA_READ: 'saas.sla.read',
  SLA_MANAGE: 'saas.sla.manage',
  SLA_MEASURE: 'saas.sla.measure',
} as const;

// ─── Tenant Admin Permissions ──────────────────────────────────────────
export const TENANT_PERMISSIONS = {
  SETTINGS_READ: 'tenant.settings.read',
  SETTINGS_UPDATE: 'tenant.settings.update',
  USER_CREATE: 'tenant.user.create',
  USER_READ: 'tenant.user.read',
  USER_UPDATE: 'tenant.user.update',
  USER_INVITE: 'tenant.user.invite',
  USER_SUSPEND: 'tenant.user.suspend',
  USER_REACTIVATE: 'tenant.user.reactivate',
  USER_DEACTIVATE: 'tenant.user.deactivate',
  USER_ARCHIVE: 'tenant.user.archive',
  USER_RESTORE: 'tenant.user.restore',
  GROUP_CREATE: 'tenant.group.create',
  GROUP_READ: 'tenant.group.read',
  GROUP_UPDATE: 'tenant.group.update',
  GROUP_DELETE: 'tenant.group.delete',
  GROUP_MEMBERS_MANAGE: 'tenant.group.members.manage',
  GROUP_ROLES_MANAGE: 'tenant.group.roles.manage',
  ROLE_CREATE: 'tenant.role.create',
  ROLE_READ: 'tenant.role.read',
  ROLE_UPDATE: 'tenant.role.update',
  ROLE_DELETE: 'tenant.role.delete',
  ROLE_ASSIGN: 'tenant.role.assign',
  ROLE_INHERITANCE_MANAGE: 'tenant.role.inheritance.manage',
  PERMISSION_READ: 'tenant.permission.read',
  PERMISSION_ASSIGN: 'tenant.permission.assign',
  PERMISSION_REVOKE: 'tenant.permission.revoke',
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
  AUDIT_READ: 'tenant.audit.read',
  AUDIT_EXPORT: 'tenant.audit.export',
  INTEGRATION_MANAGE: 'tenant.integration.manage',
  API_KEY_MANAGE: 'tenant.api_key.manage',
  WEBHOOK_MANAGE: 'tenant.webhook.manage',
  SECURITY_MANAGE: 'tenant.security.manage',
  SESSION_REVOKE: 'tenant.session.revoke',
} as const;

// ─── ITSM / Helpdesk Permissions ───────────────────────────────────────
export const ITSM_PERMISSIONS = {
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
  PROBLEM_VIEW: 'itsm.problem.view',
  PROBLEM_CREATE: 'itsm.problem.create',
  PROBLEM_UPDATE: 'itsm.problem.update',
  PROBLEM_ASSIGN: 'itsm.problem.assign',
  PROBLEM_INVESTIGATE: 'itsm.problem.investigate',
  PROBLEM_PERFORM_RCA: 'itsm.problem.perform_rca',
  PROBLEM_RESOLVE: 'itsm.problem.resolve',
  PROBLEM_CLOSE: 'itsm.problem.close',
  CHANGE_VIEW: 'itsm.change.view',
  CHANGE_CREATE: 'itsm.change.create',
  CHANGE_UPDATE: 'itsm.change.update',
  CHANGE_APPROVE: 'itsm.change.approve',
  CHANGE_REJECT: 'itsm.change.reject',
  CHANGE_SCHEDULE: 'itsm.change.schedule',
  CHANGE_IMPLEMENT: 'itsm.change.implement',
  CHANGE_ROLLBACK: 'itsm.change.rollback',
  CHANGE_CLOSE: 'itsm.change.close',
  KNOWLEDGE_VIEW: 'itsm.knowledge.view',
  KNOWLEDGE_CREATE: 'itsm.knowledge.create',
  KNOWLEDGE_UPDATE: 'itsm.knowledge.update',
  KNOWLEDGE_DELETE: 'itsm.knowledge.delete',
  KNOWLEDGE_PUBLISH: 'itsm.knowledge.publish',
  KNOWLEDGE_APPROVE: 'itsm.knowledge.approve',
  CATALOG_VIEW: 'itsm.catalog.view',
  CATALOG_REQUEST: 'itsm.catalog.request',
  CATALOG_CREATE: 'itsm.catalog.create',
  CATALOG_UPDATE: 'itsm.catalog.update',
  CATALOG_MANAGE: 'itsm.catalog.manage',
  SLA_VIEW: 'itsm.sla.view',
  SLA_CREATE: 'itsm.sla.create',
  SLA_UPDATE: 'itsm.sla.update',
  SLA_OVERRIDE: 'itsm.sla.override',
  APPROVAL_VIEW: 'itsm.approval.view',
  APPROVAL_DECIDE: 'itsm.approval.decide',
  APPROVAL_CONFIGURE: 'itsm.approval.configure',
  REPORT_VIEW: 'itsm.report.view',
  REPORT_CREATE: 'itsm.report.create',
  REPORT_EXPORT: 'itsm.report.export',
  REPORT_SCHEDULE: 'itsm.report.schedule',
  SETTINGS_VIEW: 'itsm.settings.view',
  SETTINGS_UPDATE: 'itsm.settings.update',
} as const;

// ─── All Permissions Combined ──────────────────────────────────────────
export const ALL_PERMISSIONS = {
  ...SAAS_PERMISSIONS,
  ...TENANT_PERMISSIONS,
  ...ITSM_PERMISSIONS,
} as const;

export type Permission = (typeof ALL_PERMISSIONS)[keyof typeof ALL_PERMISSIONS];

// ─── ITSM Modules 1–10 (generated from the technical master) ───────────
export const ITSM_MODULES = ITSM_PERMISSION_MODULES;
export { ITSM_PERMISSION_KEYS };

export type ITSMModule = (typeof ITSM_MODULES)[number];

// Quick detection of canonical ITSM keys
export const ITSM_KEY_PREFIXES = (
  ITSM_MODULES.map((m) => m.namespace.replace('*', ''))
);

// Helper: test whether a permission key is a canonical ITSM key
export const isItsmKey = (key: string): key is `${string}.${string}.${string}` => {
  return ITSM_KEY_PREFIXES.some((prefix) => key.startsWith(prefix));
};

// Parse a canonical ITSM key into [module, resource, ...actionParts]
export const extractModule = (key: string): string | null => {
  const match = key.match(/^itsm\.([a-z_]+)\./);
  return match ? match[1] : null;
};

export const extractResource = (key: string): string | null => {
  const module = extractModule(key);
  if (!module) return null;
  const after = key.slice(`itsm.${module}.`.length);
  // If the key has the form itsm.<module>.<resource>.<action>...
  const parts = after.split('.');
  return parts[0] || null;
};

export const extractAction = (key: string): string | null => {
  const module = extractModule(key);
  if (!module) return null;
  const after = key.slice(`itsm.${module}.`.length);
  const parts = after.split('.');
  return parts[parts.length - 1] || null;
};

// Legacy alias map (subset of backend ALIAS entries) – used by can()
// to recognise legacy keys that map to the given canonical key.
const LEGACY_ALIAS_MAP: Record<string, string[]> = {
  'itsm.incident.incident.read': ['tickets.view', 'incident.view'],
  'itsm.incident.incident.create': ['tickets.create', 'incident.create'],
  'itsm.incident.incident.update': ['tickets.edit', 'incident.update'],
  'itsm.incident.incident.assign': ['tickets.assign', 'incident.assign'],
  'itsm.incident.resolve': ['incident.resolve'],
  'itsm.incident.close': ['incident.close'],
  'itsm.incident.reopen': ['incident.reopen'],
  'itsm.incident.cancel': ['incident.cancel'],
  'itsm.problem.problem.read': ['problem.view'],
  'itsm.problem.problem.create': ['problem.create'],
  'itsm.problem.problem.update': ['problem.update'],
  'itsm.problem.assign': ['problem.assign'],
  'itsm.change.change_request.read': ['change.view'],
  'itsm.change.change_request.create': ['change.create'],
  'itsm.change.change_request.update': ['change.update'],
  'itsm.change.approve': ['change.approve'],
  'itsm.core.task.read': ['task.view'],
  'itsm.core.task.create': ['task.create'],
  'itsm.core.task.update': ['task.update'],
  'itsm.core.task_assign': ['task.assign'],
  'itsm.request_catalog.request.read': ['request.view'],
  'itsm.request_catalog.request.create': ['request.create'],
  'itsm.request_catalog.request.update': ['request.update'],
  'itsm.knowledge.knowledge_article.read': ['knowledge.view', 'kb.read'],
  'itsm.knowledge.article_manage_access': ['kb.manage'],
  'itsm.sla.definition_read': ['sla.view'],
  'itsm.sla.definition_update': ['sla.manage'],
  'itsm.assignment.routing_rule.read': ['assignment.view'],
  'itsm.assignment.routing_rule.create': ['assignment.manage'],
  'tenant.user.read': ['users.view'],
};

// --- Permission Evaluation ---

/**
 * Check whether a user (identified by their raw permission array) can perform
 * the given key.  The function:
 *   1. Returns true if the key appears literally in userPermissions.
 *   2. If the key is a canonical itsm.* key, also returns true when the user
 *    holds any legacy key that the backend transcoder maps to it (via the
 *    LEGACY_ALIAS_MAP).
 *   3. Performs a simple prefix match for `itsm.*` keys that are not in the
 *    alias map – this provides basic coverage without a backend call.
 *
 * @param key          The permission key to check (e.g. 'itsm.incident.incident.read')
 * @param userPermissions The raw permission array from the user/agent doc
 * @returns true when the user is authorised for this action
 */
export const can = (
  key: string,
  userPermissions: string[] = [],
): boolean => {
  if (userPermissions.includes('*') || userPermissions.includes(key)) return true;

  // Explicit namespace grants are supported at any segment boundary.
  if (userPermissions.some((grant) => {
    if (!grant.endsWith('.*')) return false;
    return key.startsWith(grant.slice(0, -1));
  })) return true;

  // 2. canonical itsm.* key – try legacy alias map
  if (isItsmKey(key)) {
    const aliases = LEGACY_ALIAS_MAP[key];
    if (aliases && aliases.some((leg) => userPermissions.includes(leg))) return true;

    return false;
  }

  return false;
};

// ─── Platform Permission Aliases ──────────────────────────────────────
export const PLATFORM_PERMISSION_ALIASES: Record<string, string> = {
  'platform.view_dashboard': SAAS_PERMISSIONS.DASHBOARD_READ,
  'platform.manage_dashboard': SAAS_PERMISSIONS.DASHBOARD_READ,
  'platform.view_tenants': SAAS_PERMISSIONS.TENANT_READ,
  'platform.manage_tenants': SAAS_PERMISSIONS.TENANT_CREATE,
  'platform.view_plans': SAAS_PERMISSIONS.PLAN_READ,
  'platform.manage_plans': SAAS_PERMISSIONS.PLAN_CREATE,
  'platform.view_audit': SAAS_PERMISSIONS.AUDIT_READ,
  'platform.manage_audit': SAAS_PERMISSIONS.AUDIT_EXPORT,
  'platform.view_superadmins': SAAS_PERMISSIONS.ADMIN_MANAGE,
  'platform.manage_superadmins': SAAS_PERMISSIONS.ADMIN_MANAGE,
  'platform.view_invoices': SAAS_PERMISSIONS.BILLING_READ,
  'platform.manage_invoices': SAAS_PERMISSIONS.BILLING_MANAGE,
  'platform.manage_payments': SAAS_PERMISSIONS.BILLING_MANAGE,
  'platform.impersonate': SAAS_PERMISSIONS.SUPPORT_IMPERSONATE,
  'platform.view_platform': SAAS_PERMISSIONS.PLATFORM_CONFIGURE,
  'platform.manage_platform': SAAS_PERMISSIONS.PLATFORM_CONFIGURE,
  'platform.view_operations': SAAS_PERMISSIONS.OPERATIONS_HEALTH_READ,
  'platform.manage_operations': SAAS_PERMISSIONS.OPERATIONS_QUEUE_MANAGE,
  'platform.view_modules': SAAS_PERMISSIONS.MODULE_READ,
  'platform.manage_modules': SAAS_PERMISSIONS.MODULE_CONFIGURE,
  'platform.view_security': SAAS_PERMISSIONS.SECURITY_READ,
  'platform.manage_security': SAAS_PERMISSIONS.SECURITY_CONFIGURE,
};

// ─── Module Keys ───────────────────────────────────────────────────────
export const MODULE_KEYS = [
  'helpdesk', 'settings', 'ai',
] as const;

export type ModuleKey = (typeof MODULE_KEYS)[number];

// ─── Super Admin Role Presets ──────────────────────────────────────────
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
