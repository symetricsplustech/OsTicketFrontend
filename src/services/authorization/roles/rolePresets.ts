import type { ItsmPermissionModule } from "@constants/itsmPermissions.generated";

export interface RolePreset {
  id: string;
  name: string;
  description: string;
  category: "platform" | "itsm-admin" | "itsm-fulfiller" | "module-manager" | "module-admin" | "self-service";
  permissions: string[];
  moduleKeys?: string[];
  isSystem?: boolean;
}

export interface RoleCategory {
  id: string;
  label: string;
  order: number;
}

// These are fallback presets used when API is unavailable (development)
export const FALLBACK_ROLE_PRESETS: RolePreset[] = [
  {
    id: "platform_owner",
    name: "Platform Owner",
    description: "Full platform access including SaaS administration, billing, and cross-tenant operations. Does NOT include ITSM module access.",
    category: "platform",
    permissions: [
      "saas.*",
      "tenant.*",
    ],
    moduleKeys: ["settings"],
    isSystem: true,
  },
  {
    id: "platform_admin",
    name: "Platform Administrator",
    description: "Platform-wide administration except break-glass security operations. Does NOT include ITSM module access.",
    category: "platform",
    permissions: [
      "saas.*",
      "tenant.*",
    ],
    moduleKeys: ["settings"],
    isSystem: true,
  },
  {
    id: "instance_admin",
    name: "Instance Administrator",
    description: "Full instance administration including users, groups, roles, and ITSM configuration",
    category: "itsm-admin",
    permissions: [
      "tenant.user.read",
      "tenant.user.update",
      "tenant.user.create",
      "tenant.user.delete",
      "tenant.group.read",
      "tenant.group.create",
      "tenant.group.update",
      "tenant.group.delete",
      "tenant.group.assign",
      "tenant.role.read",
      "tenant.role.create",
      "tenant.role.update",
      "tenant.role.delete",
      "tenant.permission.read",
      "tenant.permission.grant",
      "tenant.permission.revoke",
      "tenant.organization.read",
      "tenant.organization.update",
      "tenant.department.read",
      "tenant.location.read",
      "tenant.settings.read",
      "tenant.settings.update",
      "tenant.security.manage",
      "itsm.core.*",
      "itsm.incident.*",
      "itsm.problem.*",
      "itsm.change.*",
      "itsm.request_catalog.*",
      "itsm.knowledge.*",
      "itsm.sla.*",
      "itsm.service_cmdb.*",
      "itsm.asset.*",
      "itsm.reporting_admin.*",
      "itsm.approval.*",
      "itsm.assignment.*",
      "itsm.on_call.*",
      "itsm.walkup.*",
      "itsm.experience.*",
    ],
    moduleKeys: ["helpdesk", "settings"],
  },
  {
    id: "itil_admin",
    name: "ITSM Administrator",
    description: "Advanced ITSM administration across all ITSM modules",
    category: "itsm-admin",
    permissions: [
      "itsm.incident.*",
      "itsm.problem.*",
      "itsm.change.*",
      "itsm.request_catalog.*",
      "itsm.knowledge.*",
      "itsm.sla.*",
      "itsm.service_cmdb.*",
      "itsm.asset.*",
      "itsm.approval.*",
      "itsm.assignment.*",
      "itsm.on_call.*",
      "itsm.core.task_read",
      "itsm.core.task_create",
      "itsm.core.task_update",
      "itsm.core.task_assign",
      "itsm.core.audit_read",
    ],
    moduleKeys: ["helpdesk"],
  },
  {
    id: "itil",
    name: "IT Support Engineer / Service Desk Agent",
    description: "Standard ITSM fulfiller - works with incidents, problems, changes, requests, tasks",
    category: "itsm-fulfiller",
    permissions: [
      "itsm.incident.incident.read",
      "itsm.incident.incident.create",
      "itsm.incident.incident.update",
      "itsm.incident.assign",
      "itsm.incident.escalate",
      "itsm.incident.resolve",
      "itsm.incident.close",
      "itsm.incident.add_work_note",
      "itsm.incident.add_public_comment",
      "itsm.incident.claim",
      "itsm.problem.problem.read",
      "itsm.problem.problem.create",
      "itsm.problem.problem.update",
      "itsm.problem.work_tasks",
      "itsm.change.change_request.read",
      "itsm.change.change_request.create",
      "itsm.change.change_request.update",
      "itsm.change.schedule",
      "itsm.change.submit",
      "itsm.change.track",
      "itsm.request_catalog.request.read",
      "itsm.request_catalog.request.update",
      "itsm.core.task_read",
      "itsm.core.task_create",
      "itsm.core.task_update",
      "itsm.core.task_assign",
      "itsm.core.task_claim",
      "itsm.assignment.queue.read",
      "itsm.assignment.routing_read",
      "itsm.approval.approval_read",
      "itsm.approval.respond",
      "itsm.knowledge.knowledge_article.read",
      "itsm.knowledge.search",
      "itsm.service_cmdb.ci_read",
      "itsm.service_cmdb.ci_relationship_read",
      "itsm.sla.definition_read",
      "itsm.core.ui.my_work.access",
      "itsm.core.ui.agent_inbox.access",
      "itsm.core.ui.task_record_shell.access",
      "itsm.core.ui.activity_stream.access",
      "itsm.core.ui.sla_panel.access",
      "itsm.core.ui.approval_panel.access",
      "itsm.core.ui.attachment_panel.access",
      "itsm.core.ui.related_records.access",
    ],
    moduleKeys: ["helpdesk"],
  },
  {
    id: "incident_manager",
    name: "Incident Manager",
    description: "Oversees incident process, manages queues, escalations, and major incidents",
    category: "module-manager",
    permissions: [
      "itsm.incident.*",
      "itsm.major_incident.*",
      "itsm.core.task_read",
      "itsm.core.task_create",
      "itsm.core.task_update",
      "itsm.core.task_assign",
      "itsm.core.task_claim",
      "itsm.assignment.queue.read",
      "itsm.assignment.routing_read",
      "itsm.sla.definition_read",
      "itsm.reporting_admin.report_read",
      "itsm.reporting_admin.dashboard_read",
      "itsm.core.audit_read",
    ],
    moduleKeys: ["helpdesk"],
  },
  {
    id: "problem_manager",
    name: "Problem Manager",
    description: "Manages problems, root cause analysis, known errors, and workarounds",
    category: "module-manager",
    permissions: [
      "itsm.problem.*",
      "itsm.knowledge.knowledge_article.read",
      "itsm.knowledge.knowledge_article.create",
      "itsm.knowledge.knowledge_article.update",
      "itsm.core.task_read",
      "itsm.core.task_create",
      "itsm.core.task_update",
      "itsm.core.audit_read",
    ],
    moduleKeys: ["helpdesk"],
  },
  {
    id: "change_manager",
    name: "Change Manager",
    description: "Manages changes, CAB, scheduling, risk assessment, and implementation",
    category: "module-manager",
    permissions: [
      "itsm.change.*",
      "itsm.service_cmdb.ci_read",
      "itsm.service_cmdb.ci_relationship_read",
      "itsm.sla.definition_read",
      "itsm.core.task_read",
      "itsm.core.task_create",
      "itsm.core.task_update",
      "itsm.core.audit_read",
      "itsm.reporting_admin.report_read",
    ],
    moduleKeys: ["helpdesk"],
  },
  {
    id: "knowledge_manager",
    name: "Knowledge Manager",
    description: "Creates, reviews, approves, and publishes knowledge articles",
    category: "module-manager",
    permissions: [
      "itsm.knowledge.*",
      "itsm.core.audit_read",
    ],
    moduleKeys: ["helpdesk"],
  },
  {
    id: "catalog_manager",
    name: "Catalog Manager",
    description: "Designs and manages service catalog items, categories, and workflows",
    category: "module-manager",
    permissions: [
      "itsm.request_catalog.*",
      "itsm.knowledge.knowledge_article.read",
      "itsm.core.audit_read",
    ],
    moduleKeys: ["helpdesk"],
  },
  {
    id: "sla_manager",
    name: "SLA Manager",
    description: "Manages SLA definitions, schedules, escalations, and reporting",
    category: "module-manager",
    permissions: [
      "itsm.sla.*",
      "itsm.core.audit_read",
      "itsm.reporting_admin.report_read",
    ],
    moduleKeys: ["helpdesk"],
  },
  {
    id: "cmdb_manager",
    name: "CMDB Manager",
    description: "Manages CI data quality, reconciliation, lifecycle, and health",
    category: "module-manager",
    permissions: [
      "itsm.service_cmdb.*",
      "itsm.asset.asset.read",
      "itsm.core.audit_read",
    ],
    moduleKeys: ["helpdesk", "itam"],
  },
  {
    id: "asset_manager",
    name: "Asset Manager",
    description: "Manages asset lifecycle, stockrooms, transfers, and costs",
    category: "module-manager",
    permissions: [
      "itsm.asset.*",
      "itsm.service_cmdb.ci_read",
      "itsm.core.audit_read",
      "itsm.reporting_admin.report_read",
    ],
    moduleKeys: ["helpdesk", "itam"],
  },
  {
    id: "report_manager",
    name: "Report Manager",
    description: "Creates and manages reports, dashboards, and scheduled reporting",
    category: "module-manager",
    permissions: [
      "itsm.reporting_admin.*",
      "itsm.core.audit_read",
    ],
    moduleKeys: ["helpdesk", "analytics"],
  },
  {
    id: "user_admin",
    name: "User Administrator",
    description: "Manages users, groups, roles, and role assignments",
    category: "itsm-admin",
    permissions: [
      "tenant.user.read",
      "tenant.user.create",
      "tenant.user.update",
      "tenant.user.delete",
      "tenant.user.activate",
      "tenant.user.deactivate",
      "tenant.group.read",
      "tenant.group.create",
      "tenant.group.update",
      "tenant.group.delete",
      "tenant.role.read",
      "tenant.role.create",
      "tenant.role.update",
      "tenant.role.delete",
      "tenant.permission.read",
      "tenant.permission.grant",
      "tenant.permission.revoke",
      "itsm.core.user.read",
      "itsm.core.group.read",
      "itsm.core.role.read",
      "itsm.core.audit_read",
    ],
    moduleKeys: ["settings"],
  },
  {
    id: "security_admin",
    name: "Security Administrator",
    description: "Manages security policies, ACLs, authentication, and encryption",
    category: "platform",
    permissions: [
      "tenant.security.*",
      "saas.security.*",
      "itsm.core.audit_read",
    ],
    moduleKeys: ["settings"],
    isSystem: true,
  },
  {
    id: "service_desk_agent",
    name: "Service Desk Agent",
    description: "Front-line support - handles interactions, incidents, and basic requests",
    category: "itsm-fulfiller",
    permissions: [
      "itsm.core.task_read",
      "itsm.core.task_create",
      "itsm.core.task_update",
      "itsm.incident.incident.read",
      "itsm.incident.incident.create",
      "itsm.incident.incident.update",
      "itsm.incident.assign",
      "itsm.incident.claim",
      "itsm.incident.add_work_note",
      "itsm.incident.add_public_comment",
      "itsm.incident.escalate",
      "itsm.request_catalog.request.read",
      "itsm.request_catalog.request.update",
      "itsm.knowledge.knowledge_article.read",
      "itsm.knowledge.search",
      "itsm.approval.approval_read",
      "itsm.approval.respond",
      "itsm.assignment.ui.agent_inbox.access",
      "itsm.core.ui.my_work.access",
      "itsm.core.ui.task_record_shell.access",
      "itsm.core.ui.activity_stream.access",
      "itsm.core.ui.attachment_panel.access",
      "itsm.core.ui.approval_panel.access",
    ],
    moduleKeys: ["helpdesk"],
  },
  {
    id: "field_engineer",
    name: "Field Engineer",
    description: "On-site support - handles assigned tasks, incidents, and asset interactions",
    category: "itsm-fulfiller",
    permissions: [
      "itsm.core.task_read",
      "itsm.core.task_update",
      "itsm.incident.incident.read",
      "itsm.incident.incident.update",
      "itsm.asset.asset.read",
      "itsm.asset.asset.update",
      "itsm.asset.checkout",
      "itsm.asset.return",
      "itsm.knowledge.knowledge_article.read",
      "itsm.outage.availability_read",
      "itsm.on_call.current_on_call_read",
    ],
    moduleKeys: ["helpdesk", "itam", "field-service"],
  },
  {
    id: "change_agent",
    name: "Change Agent",
    description: "Implements and tracks changes, manages change tasks",
    category: "itsm-fulfiller",
    permissions: [
      "itsm.change.change_request.read",
      "itsm.change.change_request.update",
      "itsm.change.change_task.read",
      "itsm.change.change_task.update",
      "itsm.change.schedule",
      "itsm.service_cmdb.ci_read",
      "itsm.core.task_read",
      "itsm.core.task_update",
      "itsm.knowledge.knowledge_article.read",
    ],
    moduleKeys: ["helpdesk"],
  },
  {
    id: "requester",
    name: "Requester / Employee",
    description: "Self-service user - browses catalog, submits requests, views knowledge",
    category: "self-service",
    permissions: [
      "itsm.request_catalog.ui.catalog_home.access",
      "itsm.experience.portal_access",
      "itsm.request_catalog.catalog_item.read",
      "itsm.request_catalog.request.read",
      "itsm.request_catalog.request.create",
      "itsm.incident.incident.read",
      "itsm.incident.incident.create",
      "itsm.knowledge.knowledge_article.read",
      "itsm.knowledge.search",
      "itsm.knowledge.feedback",
      "itsm.approval.approval_read",
      "itsm.approval.respond",
    ],
    moduleKeys: ["helpdesk"],
  },
  {
    id: "approver",
    name: "Approver",
    description: "Reviews and responds to approval requests",
    category: "self-service",
    permissions: [
      "itsm.approval.approval_read",
      "itsm.approval.respond",
      "itsm.approval.request_information",
    ],
    moduleKeys: ["helpdesk"],
  },
  {
    id: "guest",
    name: "Guest / Public",
    description: "Unauthenticated or minimal access - knowledge base browsing only",
    category: "self-service",
    permissions: [
      "itsm.knowledge.knowledge_article.read",
      "itsm.knowledge.search",
    ],
    moduleKeys: [],
  },
];

export const FALLBACK_ROLE_CATEGORIES: RoleCategory[] = [
  { id: "platform", label: "Platform", order: 1 },
  { id: "itsm-admin", label: "ITSM Administration", order: 2 },
  { id: "itsm-fulfiller", label: "ITSM Fulfiller", order: 3 },
  { id: "module-manager", label: "Module Manager", order: 4 },
  { id: "module-admin", label: "Module Admin", order: 5 },
  { id: "self-service", label: "Self-Service", order: 6 },
] as const;

// Utility functions for working with fallback presets (used by tests)
export function getRolePreset(id: string): RolePreset | undefined {
  return FALLBACK_ROLE_PRESETS.find((r) => r.id === id);
}

export function getRolePresetsByCategory(category: RolePreset["category"]): RolePreset[] {
  return FALLBACK_ROLE_PRESETS.filter((r) => r.category === category);
}

export function getAllRolePresets(): RolePreset[] {
  return [...FALLBACK_ROLE_PRESETS];
}

export function getRolePermissions(roleId: string): string[] {
  const role = getRolePreset(roleId);
  return role?.permissions ?? [];
}

export function computeEffectiveRoleSync(permissions: string[]): string | null {
  if (!permissions) return null;

  // Check for platform_owner (has saas.* and tenant.* but NOT itsm.*)
  const hasSaas = permissions.some(p => p === "saas.*" || p.startsWith("saas."));
  const hasTenant = permissions.some(p => p === "tenant.*" || p.startsWith("tenant."));
  const hasItsm = permissions.some(p => p === "itsm.*" || p.startsWith("itsm."));
  
  if (hasSaas && hasTenant && !hasItsm) return "platform_owner";
  if (hasSaas && hasTenant && hasItsm) return "platform_admin"; // legacy/platform_admin with ITSM

  const roleScores = FALLBACK_ROLE_PRESETS
    .filter((role) => !role.isSystem)
    .map((role) => {
      let matches = 0;
      for (const perm of role.permissions) {
        if (permissions.some((p) => p === perm || (perm.endsWith(".*") && p.startsWith(perm.slice(0, -1))))) {
          matches++;
        }
      }
      return { role: role.id, score: matches };
    });

  roleScores.sort((a, b) => b.score - a.score);
  return roleScores[0]?.score > 0 ? roleScores[0].role : null;
}