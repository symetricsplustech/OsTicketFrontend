import { describe, it, expect } from "vitest";
import {
  FALLBACK_ROLE_PRESETS as ROLE_PRESETS,
  FALLBACK_ROLE_CATEGORIES as ROLE_CATEGORIES,
  getRolePreset,
  getRolePresetsByCategory,
  getAllRolePresets,
  getRolePermissions,
  computeEffectiveRoleSync as computeEffectiveRole,
} from "../rolePresets.ts";

describe("Role Presets", () => {
  it("should have all required role presets defined", () => {
    expect(ROLE_PRESETS.length).toBeGreaterThan(15);
  });

  it("should have platform_owner with saas and tenant permissions (no ITSM)", () => {
    const owner = getRolePreset("platform_owner");
    expect(owner).toBeDefined();
    expect(owner?.permissions).toContain("saas.*");
    expect(owner?.permissions).toContain("tenant.*");
    expect(owner?.permissions).not.toContain("*");
    expect(owner?.permissions.some(p => p.startsWith("itsm."))).toBe(false);
    expect(owner?.isSystem).toBe(true);
  });

  it("should have itil role with incident permissions", () => {
    const itil = getRolePreset("itil");
    expect(itil).toBeDefined();
    expect(itil?.permissions).toContain("itsm.incident.incident.read");
    expect(itil?.permissions).toContain("itsm.incident.incident.create");
    expect(itil?.permissions).toContain("itsm.problem.problem.read");
    expect(itil?.permissions).toContain("itsm.change.change_request.read");
  });

  it("should have service_desk_agent role", () => {
    const agent = getRolePreset("service_desk_agent");
    expect(agent).toBeDefined();
    expect(agent?.permissions).toContain("itsm.assignment.ui.agent_inbox.access");
    expect(agent?.category).toBe("itsm-fulfiller");
  });

  it("should have requester role for self-service", () => {
    const requester = getRolePreset("requester");
    expect(requester).toBeDefined();
    expect(requester?.category).toBe("self-service");
    expect(requester?.permissions).toContain("itsm.request_catalog.ui.catalog_home.access");
    expect(requester?.permissions).toContain("itsm.experience.portal_access");
  });

  it("should have incident_manager role", () => {
    const mgr = getRolePreset("incident_manager");
    expect(mgr).toBeDefined();
    expect(mgr?.category).toBe("module-manager");
    expect(mgr?.permissions).toContain("itsm.incident.*");
  });

  it("should have problem_manager role", () => {
    const mgr = getRolePreset("problem_manager");
    expect(mgr).toBeDefined();
    expect(mgr?.category).toBe("module-manager");
    expect(mgr?.permissions).toContain("itsm.problem.*");
  });

  it("should have change_manager role", () => {
    const mgr = getRolePreset("change_manager");
    expect(mgr).toBeDefined();
    expect(mgr?.category).toBe("module-manager");
    expect(mgr?.permissions).toContain("itsm.change.*");
  });

  it("should have knowledge_manager role", () => {
    const mgr = getRolePreset("knowledge_manager");
    expect(mgr).toBeDefined();
    expect(mgr?.category).toBe("module-manager");
    expect(mgr?.permissions).toContain("itsm.knowledge.*");
  });

  it("should have catalog_manager role", () => {
    const mgr = getRolePreset("catalog_manager");
    expect(mgr).toBeDefined();
    expect(mgr?.category).toBe("module-manager");
    expect(mgr?.permissions).toContain("itsm.request_catalog.*");
  });

  it("should have sla_manager role", () => {
    const mgr = getRolePreset("sla_manager");
    expect(mgr).toBeDefined();
    expect(mgr?.category).toBe("module-manager");
    expect(mgr?.permissions).toContain("itsm.sla.*");
  });

  it("should have cmdb_manager role", () => {
    const mgr = getRolePreset("cmdb_manager");
    expect(mgr).toBeDefined();
    expect(mgr?.category).toBe("module-manager");
    expect(mgr?.permissions).toContain("itsm.service_cmdb.*");
  });

  it("should have asset_manager role", () => {
    const mgr = getRolePreset("asset_manager");
    expect(mgr).toBeDefined();
    expect(mgr?.category).toBe("module-manager");
    expect(mgr?.permissions).toContain("itsm.asset.*");
  });

  it("should have report_manager role", () => {
    const mgr = getRolePreset("report_manager");
    expect(mgr).toBeDefined();
    expect(mgr?.category).toBe("module-manager");
    expect(mgr?.permissions).toContain("itsm.reporting_admin.*");
  });

  it("should have user_admin role", () => {
    const admin = getRolePreset("user_admin");
    expect(admin).toBeDefined();
    expect(admin?.category).toBe("itsm-admin");
    expect(admin?.permissions).toContain("tenant.user.read");
    expect(admin?.permissions).toContain("tenant.role.read");
  });

  it("should have security_admin role", () => {
    const admin = getRolePreset("security_admin");
    expect(admin).toBeDefined();
    expect(admin?.category).toBe("platform");
    expect(admin?.isSystem).toBe(true);
    expect(admin?.permissions).toContain("tenant.security.*");
  });

  it("should have field_engineer role", () => {
    const engineer = getRolePreset("field_engineer");
    expect(engineer).toBeDefined();
    expect(engineer?.category).toBe("itsm-fulfiller");
    expect(engineer?.permissions).toContain("itsm.asset.asset.read");
    expect(engineer?.permissions).toContain("itsm.on_call.current_on_call_read");
  });

  it("should have change_agent role", () => {
    const agent = getRolePreset("change_agent");
    expect(agent).toBeDefined();
    expect(agent?.category).toBe("itsm-fulfiller");
    expect(agent?.permissions).toContain("itsm.change.change_request.read");
    expect(agent?.permissions).toContain("itsm.change.change_task.read");
  });

  it("should have approver role", () => {
    const approver = getRolePreset("approver");
    expect(approver).toBeDefined();
    expect(approver?.category).toBe("self-service");
    expect(approver?.permissions).toContain("itsm.approval.approval_read");
    expect(approver?.permissions).toContain("itsm.approval.respond");
  });

  it("should have guest role", () => {
    const guest = getRolePreset("guest");
    expect(guest).toBeDefined();
    expect(guest?.category).toBe("self-service");
    expect(guest?.permissions).toContain("itsm.knowledge.knowledge_article.read");
  });

  it("should have all categories defined", () => {
    expect(ROLE_CATEGORIES.length).toBe(6);
    const categoryIds = ROLE_CATEGORIES.map((c) => c.id);
    expect(categoryIds).toContain("platform");
    expect(categoryIds).toContain("itsm-admin");
    expect(categoryIds).toContain("itsm-fulfiller");
    expect(categoryIds).toContain("module-manager");
    expect(categoryIds).toContain("module-admin");
    expect(categoryIds).toContain("self-service");
  });

  it("should get role presets by category", () => {
    const platformRoles = getRolePresetsByCategory("platform");
    expect(platformRoles.length).toBeGreaterThan(0);
    expect(platformRoles.every((r) => r.category === "platform")).toBe(true);

    const fulfillerRoles = getRolePresetsByCategory("itsm-fulfiller");
    expect(fulfillerRoles.length).toBeGreaterThan(0);
    expect(fulfillerRoles.every((r) => r.category === "itsm-fulfiller")).toBe(true);
  });

  it("should get all role presets", () => {
    const all = getAllRolePresets();
    expect(all.length).toBe(ROLE_PRESETS.length);
  });

  it("should get role permissions", () => {
    const perms = getRolePermissions("itil");
    expect(perms.length).toBeGreaterThan(10);
    expect(perms).toContain("itsm.incident.incident.read");
  });

  it("should return empty array for unknown role", () => {
    const perms = getRolePermissions("unknown_role");
    expect(perms).toEqual([]);
  });

  it("should compute effective role from platform_owner permissions (saas.* + tenant.* without itsm.*)", () => {
    const platformOwnerPerms = [
      "saas.*",
      "tenant.*",
      "tenant.user.read",
      "tenant.settings.read",
    ];
    const role = computeEffectiveRole(platformOwnerPerms);
    expect(role).toBe("platform_owner");
  });

  it("should compute effective role from platform_admin permissions (saas.* + tenant.* + itsm.*)", () => {
    const platformAdminPerms = [
      "saas.*",
      "tenant.*",
      "itsm.core.*",
      "itsm.incident.*",
    ];
    const role = computeEffectiveRole(platformAdminPerms);
    expect(role).toBe("platform_admin");
  });

  it("should compute effective role from wildcard permission (legacy)", () => {
    const role = computeEffectiveRole(["*"]);
    // "*" alone doesn't match any specific role preset now
    // It would match platform_admin if it also had itsm.* permissions
    expect(role).toBeNull();
  });

  it("should compute effective role from itil permissions", () => {
    const itilPerms = [
      "itsm.incident.incident.read",
      "itsm.incident.incident.create",
      "itsm.incident.incident.update",
      "itsm.problem.problem.read",
      "itsm.change.change_request.read",
      "itsm.request_catalog.request.read",
      "itsm.core.task_read",
      "itsm.knowledge.knowledge_article.read",
      "itsm.approval.approval_read",
      "itsm.assignment.ui.agent_inbox.access",
    ];
    const role = computeEffectiveRole(itilPerms);
    expect(role).toBe("itil");
  });

  it("should compute effective role from service_desk_agent permissions", () => {
    const agentPerms = [
      "itsm.core.task_read",
      "itsm.core.task_create",
      "itsm.incident.incident.read",
      "itsm.incident.incident.create",
      "itsm.incident.incident.update",
      "itsm.assignment.ui.agent_inbox.access",
      "itsm.knowledge.knowledge_article.read",
      "itsm.request_catalog.request.read",
    ];
    const role = computeEffectiveRole(agentPerms);
    expect(role).toBe("service_desk_agent");
  });

  it("should compute effective role from requester permissions", () => {
    const requesterPerms = [
      "itsm.request_catalog.ui.catalog_home.access",
      "itsm.experience.portal_access",
      "itsm.request_catalog.catalog_item.read",
      "itsm.request_catalog.request.read",
      "itsm.knowledge.knowledge_article.read",
    ];
    const role = computeEffectiveRole(requesterPerms);
    expect(role).toBe("requester");
  });

  it("should return null for empty permissions", () => {
    const role = computeEffectiveRole([]);
    expect(role).toBeNull();
  });

  it("should have unique role IDs", () => {
    const ids = ROLE_PRESETS.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have all roles with valid category", () => {
    const validCategories = ROLE_CATEGORIES.map((c) => c.id);
    for (const role of ROLE_PRESETS) {
      expect(validCategories).toContain(role.category);
    }
  });

  it("should have moduleKeys for roles that need them", () => {
    const owner = getRolePreset("platform_owner");
    expect(owner?.moduleKeys).toContain("settings");

    const admin = getRolePreset("instance_admin");
    expect(admin?.moduleKeys).toContain("helpdesk");
    expect(admin?.moduleKeys).toContain("settings");

    const itil = getRolePreset("itil");
    expect(itil?.moduleKeys).toContain("helpdesk");

    const requester = getRolePreset("requester");
    expect(requester?.moduleKeys).toContain("helpdesk");
  });
});