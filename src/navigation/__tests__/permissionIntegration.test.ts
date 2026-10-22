import { describe, it, expect } from "vitest";
import {
  canAccessOrganizationAdmin,
  canViewOrganizationAdminItem,
  firstAccessibleOrganizationAdminPath,
  ORGANIZATION_ADMIN_NAVIGATION,
  TENANT_READ_PERMISSIONS,
} from "@/navigation/organizationAdminNavigation";
import {
  canAccessSaasAdmin,
  canViewSaasAdminItem,
  firstAccessibleSaasAdminPath,
  SAAS_ADMIN_NAVIGATION,
} from "@/navigation/saasAdminNavigation";
import { canAny, matchesGrant } from "@services/authorization/permissions";

describe("Permission integration - org admin + saas admin", () => {
  // Simulate a tenant admin with limited permissions (e.g., only incidents and problems)
  const LIMITED_TENANT_ADMIN = [
    "dashboard.read",
    "organization.read",
    "users.read",
    "incidents.read",
    "incident_configuration.read",
    "problems.read",
    "problem_configuration.read",
    "known_errors.read",
  ];

  // Simulate a tenant admin with full permissions
  const FULL_TENANT_ADMIN = [...TENANT_READ_PERMISSIONS];

  // Simulate a SaaS admin with only tenant management
  const SAAS_TENANT_MANAGER = [
    "admin.dashboard.read",
    "admin.tenants.read",
    "admin.tenants.manage",
  ];

  // Simulate a SaaS admin with staff management
  const SAAS_STAFF_MANAGER = [
    "admin.dashboard.read",
    "admin.staff.read",
    "admin.staff.manage",
    "admin.roles.read",
    "admin.permissions.read",
  ];

  // Platform owner
  const PLATFORM_OWNER = ["*"];

  // Remote Engineer - can only work on assigned incidents/requests
  const REMOTE_ENGINEER = [
    "incidents.read_assigned",
    "incidents.update_assigned",
    "requests.read_assigned",
    "requests.update_assigned",
    "attachments.upload",
    "escalations.create",
    "field_service.request",
    "knowledge.read",
    "dashboard.read",
  ];

  // Field Engineer - can only work on assigned field jobs
  const FIELD_ENGINEER = [
    "field_jobs.read_assigned",
    "field_jobs.update_assigned",
    "field_jobs.check_in",
    "field_jobs.check_out",
    "field_jobs.complete",
    "field_jobs.reschedule_request",
    "attachments.upload",
    "evidence.create",
    "knowledge.read",
    "escalations.create",
    "dashboard.read",
  ];

  // Customer Contact - can only create own tickets and view own requests
  const CUSTOMER_CONTACT = [
    "portal.read",
    "portal.tickets.create",
    "requests.read",
    "requests.create",
  ];

  describe("Tenant (Organization Admin) permissions", () => {
    it("limited tenant admin can access org admin surface", () => {
      expect(canAccessOrganizationAdmin(LIMITED_TENANT_ADMIN)).toBe(true);
    });

    it("limited tenant admin sees dashboard", () => {
      const dashboardSection = ORGANIZATION_ADMIN_NAVIGATION.find(
        (s) => s.key === "dashboard",
      );
      expect(dashboardSection).toBeDefined();
      expect(canViewOrganizationAdminItem(LIMITED_TENANT_ADMIN, dashboardSection!.items[0])).toBe(
        true,
      );
    });

    it("limited tenant admin sees incidents section", () => {
      const incidentSection = ORGANIZATION_ADMIN_NAVIGATION.find(
        (s) => s.key === "incident-management",
      );
      expect(incidentSection).toBeDefined();
      expect(canViewOrganizationAdminItem(LIMITED_TENANT_ADMIN, incidentSection!.items[0])).toBe(
        true,
      );
    });

    it("limited tenant admin sees problems section", () => {
      const problemSection = ORGANIZATION_ADMIN_NAVIGATION.find(
        (s) => s.key === "problem-management",
      );
      expect(problemSection).toBeDefined();
      expect(canViewOrganizationAdminItem(LIMITED_TENANT_ADMIN, problemSection!.items[0])).toBe(
        true,
      );
    });

    it("limited tenant admin does NOT see change management (missing changes.read)", () => {
      const changeSection = ORGANIZATION_ADMIN_NAVIGATION.find(
        (s) => s.key === "change-management",
      );
      expect(changeSection).toBeDefined();
      expect(
        canViewOrganizationAdminItem(LIMITED_TENANT_ADMIN, changeSection!.items[0]),
      ).toBe(false);
    });

    it("limited tenant admin does NOT see customers section (missing customers.read)", () => {
      const customersSection = ORGANIZATION_ADMIN_NAVIGATION.find(
        (s) => s.key === "customers",
      );
      expect(customersSection).toBeDefined();
      expect(
        canViewOrganizationAdminItem(LIMITED_TENANT_ADMIN, customersSection!.items[0]),
      ).toBe(false);
    });

    it("limited tenant admin does NOT see CMDB (missing cmdb.read)", () => {
      const cmdbSection = ORGANIZATION_ADMIN_NAVIGATION.find(
        (s) => s.key === "cmdb-assets",
      );
      expect(cmdbSection).toBeDefined();
      expect(
        canViewOrganizationAdminItem(LIMITED_TENANT_ADMIN, cmdbSection!.items[0]),
      ).toBe(false);
    });

    it("full tenant admin sees all sections", () => {
      const visibleSections = ORGANIZATION_ADMIN_NAVIGATION.filter((section) =>
        canViewOrganizationAdminItem(FULL_TENANT_ADMIN, section.items[0]),
      );
      expect(visibleSections.length).toBe(ORGANIZATION_ADMIN_NAVIGATION.length);
    });

    it("firstAccessibleOrganizationAdminPath returns dashboard for limited admin", () => {
      const path = firstAccessibleOrganizationAdminPath(LIMITED_TENANT_ADMIN);
      expect(path).toBe("/organization/dashboard/organization-overview");
    });

    it("firstAccessibleOrganizationAdminPath returns customers for customers-only admin", () => {
      const path = firstAccessibleOrganizationAdminPath(["customers.read"]);
      expect(path).toBe("/organization/customers/customer-directory");
    });
  });

  describe("SaaS Admin permissions", () => {
    it("SaaS tenant manager can access saas admin surface", () => {
      expect(canAccessSaasAdmin(SAAS_TENANT_MANAGER)).toBe(true);
    });

    it("SaaS tenant manager sees dashboard and tenants", () => {
      const visible: string[] = [];
      for (const section of SAAS_ADMIN_NAVIGATION) {
        for (const item of section.items) {
          if (item.hidden) continue;
          if (canViewSaasAdminItem(SAAS_TENANT_MANAGER, section, item))
            visible.push(`${section.key}/${item.key}`);
        }
      }
      expect(visible).toContain("dashboard/overview");
      expect(visible).toContain("tenants/all-tenants");
      expect(visible).toContain("tenants/tenant-status");
      expect(visible).not.toContain("staff-management/all-staff");
    });

    it("SaaS staff manager sees staff management", () => {
      const visible: string[] = [];
      for (const section of SAAS_ADMIN_NAVIGATION) {
        for (const item of section.items) {
          if (item.hidden) continue;
          if (canViewSaasAdminItem(SAAS_STAFF_MANAGER, section, item))
            visible.push(`${section.key}/${item.key}`);
        }
      }
      // Staff management items use keys: all-staff, roles-management, permissions-management
      expect(visible).toContain("staff-management/all-staff");
      expect(visible).toContain("staff-management/roles-management");
      expect(visible).not.toContain("tenants/all-tenants");
    });

    it("Platform owner sees everything", () => {
      const visible: string[] = [];
      for (const section of SAAS_ADMIN_NAVIGATION) {
        for (const item of section.items) {
          if (item.hidden) continue;
          if (canViewSaasAdminItem(PLATFORM_OWNER, section, item))
            visible.push(`${section.key}/${item.key}`);
        }
      }
      expect(visible.length).toBeGreaterThan(20);
    });

    it("firstAccessibleSaasAdminPath picks correct first item", () => {
      expect(firstAccessibleSaasAdminPath(SAAS_TENANT_MANAGER)).toBe(
        "/saas-admin/dashboard/overview",
      );
      // Staff manager has dashboard.read, so dashboard/overview comes first in nav order
      expect(firstAccessibleSaasAdminPath(SAAS_STAFF_MANAGER)).toBe(
        "/saas-admin/dashboard/overview",
      );
      // Only staff permissions (no dashboard) would go to staff
      expect(firstAccessibleSaasAdminPath(["admin.staff.manage"])).toBe(
        "/saas-admin/staff-management/staff-accounts",
      );
    });
  });

  describe("Cross-surface isolation", () => {
    it("SaaS admin permissions do not grant org admin access", () => {
      expect(canAccessOrganizationAdmin(SAAS_TENANT_MANAGER)).toBe(false);
      expect(canAccessOrganizationAdmin(SAAS_STAFF_MANAGER)).toBe(false);
      expect(canAccessOrganizationAdmin(PLATFORM_OWNER)).toBe(true);
    });

    it("Tenant admin permissions do not grant SaaS admin access", () => {
      expect(canAccessSaasAdmin(LIMITED_TENANT_ADMIN)).toBe(false);
      expect(canAccessSaasAdmin(FULL_TENANT_ADMIN)).toBe(false);
    });
  });

  describe("Role-based permission boundaries", () => {
    it("Remote Engineer cannot create incidents", () => {
      expect(
        canAny(REMOTE_ENGINEER, ["incidents.create"]),
      ).toBe(false);
      expect(
        canAny(REMOTE_ENGINEER, ["incidents.update_assigned"]),
      ).toBe(true);
      expect(
        canAny(REMOTE_ENGINEER, ["incidents.read_assigned"]),
      ).toBe(true);
      expect(
        canAny(REMOTE_ENGINEER, ["field_jobs.*"]),
      ).toBe(false);
    });

    it("Field Engineer cannot create incidents or update tickets", () => {
      expect(
        canAny(FIELD_ENGINEER, ["incidents.create"]),
      ).toBe(false);
      expect(
        canAny(FIELD_ENGINEER, ["incidents.update_assigned"]),
      ).toBe(false);
      expect(
        canAny(FIELD_ENGINEER, ["field_jobs.complete"]),
      ).toBe(true);
      expect(
        canAny(FIELD_ENGINEER, ["field_jobs.check_in"]),
      ).toBe(true);
      expect(
        canAny(FIELD_ENGINEER, ["evidence.create"]),
      ).toBe(true);
    });

    it("Customer Contact can create own requests but not incidents", () => {
      expect(
        canAny(CUSTOMER_CONTACT, ["requests.create"]),
      ).toBe(true);
      expect(
        canAny(CUSTOMER_CONTACT, ["portal.tickets.create"]),
      ).toBe(true);
      expect(
        canAny(CUSTOMER_CONTACT, ["incidents.create"]),
      ).toBe(false);
      expect(
        canAny(CUSTOMER_CONTACT, ["dashboard.read"]),
      ).toBe(false);
      expect(
        canAny(CUSTOMER_CONTACT, ["service_desk.*"]),
      ).toBe(false);
    });

    it("Operations Employee can triage and assign incidents", () => {
      expect(
        canAny(LIMITED_TENANT_ADMIN, ["incidents.read"]),
      ).toBe(true);
      expect(
        canAny(LIMITED_TENANT_ADMIN, ["incident_configuration.read"]),
      ).toBe(true);
      expect(
        canAny(LIMITED_TENANT_ADMIN, ["service_desk.*"]),
      ).toBe(false);
      expect(
        canAny(LIMITED_TENANT_ADMIN, ["field_jobs.complete"]),
      ).toBe(false);
    });

    it("Org Admin (*) has full access", () => {
      expect(
        canAny(PLATFORM_OWNER, ["incidents.create"]),
      ).toBe(true);
      expect(
        canAny(PLATFORM_OWNER, ["field_jobs.complete"]),
      ).toBe(true);
      expect(
        canAny(PLATFORM_OWNER, ["system.*"]),
      ).toBe(true);
      expect(canAccessOrganizationAdmin(FULL_TENANT_ADMIN)).toBe(true);
    });
  });

  describe("Permission matching (canAny/matchesGrant)", () => {
    it("matchesGrant handles exact match", () => {
      expect(matchesGrant(["dashboard.read"], "dashboard.read")).toBe(true);
      expect(matchesGrant(["dashboard.read"], "customers.read")).toBe(false);
    });

    it("matchesGrant handles wildcard grants", () => {
      expect(matchesGrant(["itsm.incident.*"], "itsm.incident.read")).toBe(true);
      expect(matchesGrant(["itsm.incident.*"], "itsm.incident.manage")).toBe(true);
      expect(matchesGrant(["itsm.incident.*"], "itsm.problem.read")).toBe(false);
    });

    it("matchesGrant handles platform wildcard", () => {
      expect(matchesGrant(["*"], "any.permission")).toBe(true);
    });

    it("canAny handles multiple requirements (OR logic)", () => {
      expect(canAny(["dashboard.read"], ["customers.read", "dashboard.read"])).toBe(true);
      expect(canAny(["dashboard.read"], ["customers.read", "users.read"])).toBe(false);
    });

    it("canAny handles requirement wildcards", () => {
      expect(canAny(["itsm.incident.read"], ["itsm.incident.*"])).toBe(true);
      expect(canAny(["itsm.problem.read"], ["itsm.incident.*"])).toBe(false);
    });

    it("canAny returns true for empty requirements", () => {
      expect(canAny(["anything"], [])).toBe(true);
    });
  });
});
