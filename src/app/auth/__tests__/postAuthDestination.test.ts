import { describe, it, expect } from "vitest";
import { postAuthDestination } from "@app/auth/postAuthDestination";

describe("postAuthDestination", () => {
  it("sends a platform owner into the SaaS admin dashboard", () => {
    expect(postAuthDestination(["*"], "acme")).toBe(
      "/saas-admin/dashboard/overview",
    );
  });

  it("sends created staff to their first permitted area", () => {
    expect(postAuthDestination(["admin.tenants.read"], "acme")).toBe(
      "/saas-admin/tenants/all-tenants",
    );
    expect(postAuthDestination(["admin.staff.manage"], "acme")).toBe(
      "/saas-admin/staff-management/staff-accounts",
    );
  });

  it("falls back to the tenant workspace for users without control-plane access", () => {
    expect(postAuthDestination(["itsm.incident.read"], "acme")).toBe(
      "/instances/acme/work",
    );
    expect(postAuthDestination([], "acme")).toBe("/instances/acme/work");
    expect(postAuthDestination([])).toBe("/instances/demo/work");
  });
});
