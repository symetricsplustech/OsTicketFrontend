import { beforeEach, describe, expect, it } from "vitest";
import { store } from "@store";
import { logout, runLogin } from "@services/auth";
import { postAuthDestination } from "@app/auth/postAuthDestination";
import { postLoginPath } from "@/screens/auth/LoginPage";
import { canAccessSaasAdmin } from "@/navigation/saasAdminNavigation";
import {
  canAccessOrganizationAdmin,
  firstAccessibleOrganizationAdminPath,
} from "@/navigation/organizationAdminNavigation";

describe("organization admin demo login flow", () => {
  beforeEach(() => {
    store.dispatch(logout());
  });

  it("signs in offline and resolves the organization workspace (never Access Denied)", async () => {
    const response = await runLogin(store.dispatch, {
      email: "admin@acmetech.io",
      password: "OrgAdmin@123",
    });

    expect(response.mfaRequired).toBe(false);

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

  it("ignores a stale SaaS admin return path for organization sessions", async () => {
    await runLogin(store.dispatch, { email: "admin@acmetech.io", password: "OrgAdmin@123" });
    const { permissions } = store.getState().auth;

    expect(
      postLoginPath({ returnTo: "/saas-admin/dashboard/overview" }, permissions, "demo"),
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
