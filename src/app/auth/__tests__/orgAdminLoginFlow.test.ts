import { beforeEach, describe, expect, it } from "vitest";
import { store } from "@store";
import { logout, sessionSet } from "@services/auth";
import { postAuthDestination } from "@app/auth/postAuthDestination";
import { postLoginPath } from "@/screens/auth/LoginPage";
import { canAccessSaasAdmin } from "@/navigation/saasAdminNavigation";
import {
  canAccessOrganizationAdmin,
  firstAccessibleOrganizationAdminPath,
  TENANT_READ_PERMISSIONS,
} from "@/navigation/organizationAdminNavigation";

function signInAsOrgAdmin() {
  store.dispatch(
    sessionSet({
      token: "test-access-token",
      user: {
        _id: "test-org-admin",
        id: "test-org-admin",
        name: "Ava Mehta",
        email: "admin@acmetech.io",
        role: "org-admin",
        roles: ["org-admin"],
        userType: "TENANT_USER",
        status: "ACTIVE",
      },
      role: "org-admin",
      roles: ["org-admin"],
      permissions: TENANT_READ_PERMISSIONS,
      moduleKeys: [],
    }),
  );
}

describe("organization admin login routing", () => {
  beforeEach(() => {
    store.dispatch(logout());
  });

  it("resolves the organization workspace for an org-admin session (never Access Denied)", () => {
    signInAsOrgAdmin();

    const { permissions } = store.getState().auth;
    expect(permissions.length).toBeGreaterThan(10);
    expect(canAccessOrganizationAdmin(permissions)).toBe(true);
    expect(canAccessSaasAdmin(permissions)).toBe(false);
    expect(postAuthDestination(permissions, "demo")).toBe(
      "/organization/dashboard/organization-overview",
    );
    expect(postAuthDestination(permissions, "demo")).toBe(
      firstAccessibleOrganizationAdminPath(permissions),
    );
  });

  it("ignores a stale SaaS admin return path for organization sessions", () => {
    signInAsOrgAdmin();
    const { permissions } = store.getState().auth;

    expect(
      postLoginPath(
        { returnTo: "/saas-admin/dashboard/overview" },
        permissions,
        "demo",
      ),
    ).toBe("/organization/dashboard/organization-overview");

    expect(
      postLoginPath(
        { returnTo: "/organization/customers/customer-directory" },
        permissions,
        "demo",
      ),
    ).toBe("/organization/customers/customer-directory");
  });
});
