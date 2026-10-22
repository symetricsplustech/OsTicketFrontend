import { describe, it, expect } from "vitest";
import {
  SAAS_ADMIN_NAVIGATION,
  canAccessSaasAdmin,
  canViewSaasAdminItem,
  firstAccessibleSaasAdminPath,
  itemPermissionGrants,
} from "@/navigation/saasAdminNavigation.tsx";

const OWNER = Array.from(
  new Set([
    "*",
    "admin.access-policies.manage",
    "admin.tenants.read",
    "admin.staff.manage",
    "admin.roles.manage",
    "admin.permissions.read",
    "admin.dashboard.read",
    "admin.audit.read",
    "admin.audit.export",
    "admin.settings.manage",
    "admin.settings.read",
    "admin.reports.read",
  ]),
);

const TENANT_VIEWER = ["admin.dashboard.read", "admin.tenants.read"];

function grantsFor(permission: string): boolean {
  // resolves the section/item for a fixed path so assertions read clearly
  const entry = SAAS_ADMIN_NAVIGATION.flatMap((section) =>
    section.items
      .filter(
        (i) =>
          i.path.split("/").length === 4 && i.path.startsWith("/saas-admin/"),
      )
      .map((item) => ({ section, item })),
  ).find(({ item }) => item.path === permission);
  if (!entry) return false;
  return canViewSaasAdminItem(OWNER, entry.section, entry.item);
}

describe("saas admin access", () => {
  it("platform owner (wildcard) can view every item", () => {
    for (const section of SAAS_ADMIN_NAVIGATION) {
      for (const item of section.items) {
        expect(
          canViewSaasAdminItem(OWNER, section, item),
          `${section.key}:${item.key}`,
        ).toBe(true);
      }
    }
  });

  it("tenant-read-only staff sees only dashboard, tenants and my-account", () => {
    const visible: string[] = [];
    for (const section of SAAS_ADMIN_NAVIGATION) {
      for (const item of section.items) {
        if (item.hidden) continue;
        if (canViewSaasAdminItem(TENANT_VIEWER, section, item))
          visible.push(`${section.key}/${item.key}`);
      }
    }
    expect(visible.sort()).toEqual([
      "dashboard/overview",
      "my-account/active-sessions",
      "my-account/change-password",
      "my-account/mfa-security",
      "my-account/profile",
      "tenants/all-tenants",
      "tenants/tenant-status",
    ]);
  });

  it("tenant routes share the tenants area (create page included)", () => {
    const byPath = (path: string) => {
      const entry = SAAS_ADMIN_NAVIGATION.flatMap((section) =>
        section.items.map((item) => ({ section, item })),
      ).find(({ item }) => item.path === path);
      if (!entry) throw new Error(`path not found: ${path}`);
      return canViewSaasAdminItem(TENANT_VIEWER, entry.section, entry.item);
    };
    expect(byPath("/saas-admin/tenants/details/:tenantId")).toBe(true);
    expect(byPath("/saas-admin/tenants/configuration/:tenantId")).toBe(true);
    expect(byPath("/saas-admin/tenants/create-tenant")).toBe(true);
    expect(byPath("/saas-admin/tenants/all-tenants")).toBe(true);
    expect(byPath("/saas-admin/staff-management/staff-accounts")).toBe(false);
  });

  it("itemPermissionGrants resolves backend-style namespace grants", () => {
    const entry = SAAS_ADMIN_NAVIGATION.flatMap((section) =>
      section.items.map((item) => ({ section, item })),
    ).find(({ item }) => item.key === "all-tenants")!;
    expect(itemPermissionGrants(entry.section, entry.item)).toEqual([
      "admin.tenants.*",
    ]);
  });

  it("my-account is always available to any signed-in admin", () => {
    const entry = SAAS_ADMIN_NAVIGATION.flatMap((section) =>
      section.items.map((item) => ({ section, item })),
    ).find(({ item }) => item.key === "profile")!;
    expect(canViewSaasAdminItem(TENANT_VIEWER, entry.section, entry.item)).toBe(
      true,
    );
  });

  it("canAccessSaasAdmin is false for ITSM-only or empty sessions", () => {
    expect(canAccessSaasAdmin(["itsm.incident.read"])).toBe(false);
    expect(canAccessSaasAdmin([])).toBe(false);
    expect(canAccessSaasAdmin(["admin.dashboard.read"])).toBe(true);
    expect(canAccessSaasAdmin(["*"])).toBe(true);
  });

  it("firstAccessibleSaasAdminPath picks the first permitted item", () => {
    expect(firstAccessibleSaasAdminPath(TENANT_VIEWER)).toBe(
      "/saas-admin/dashboard/overview",
    );
    expect(firstAccessibleSaasAdminPath(["admin.staff.manage"])).toBe(
      "/saas-admin/staff-management/staff-accounts",
    );
    expect(firstAccessibleSaasAdminPath(["itsm.incident.read"])).toBeNull();
  });

  it("audit items require the audit area, not settings", () => {
    const entry = SAAS_ADMIN_NAVIGATION.flatMap((section) =>
      section.items.map((item) => ({ section, item })),
    ).find(({ item }) => item.key === "audit-logs")!;
    expect(
      canViewSaasAdminItem(
        ["admin.settings.manage"],
        entry.section,
        entry.item,
      ),
    ).toBe(false);
    expect(
      canViewSaasAdminItem(["admin.audit.read"], entry.section, entry.item),
    ).toBe(true);
  });

  it("grantsFor sanity (owner full access)", () => {
    expect(grantsFor("/saas-admin/tenants/all-tenants")).toBe(true);
  });
});
