import { describe, expect, it } from "vitest";
import {
  canAccessOrganizationAdmin,
  firstAccessibleOrganizationAdminPath,
  locateOrganizationAdminScreen,
  ORGANIZATION_ADMIN_NAVIGATION,
  TENANT_READ_PERMISSIONS,
} from "../organizationAdminNavigation";

const customersSection = ORGANIZATION_ADMIN_NAVIGATION.find((section) => section.key === "customers");

describe("organization admin access", () => {
  it("canAccessOrganizationAdmin requires a tenant grant", () => {
    expect(canAccessOrganizationAdmin([])).toBe(false);
    expect(canAccessOrganizationAdmin(["admin.dashboard.read"])).toBe(false);
    expect(canAccessOrganizationAdmin(["itsm.incident.incident.read"])).toBe(false);
    expect(canAccessOrganizationAdmin(["dashboard.read"])).toBe(true);
    expect(canAccessOrganizationAdmin(["customers.read"])).toBe(true);
    expect(canAccessOrganizationAdmin(["*"])).toBe(true);
  });

  it("exposes the customers section only to sessions with customers.read", () => {
    expect(customersSection).toBeDefined();
    expect(customersSection?.permissions).toEqual(["customers.read"]);
    expect(customersSection?.items.map((item) => item.key)).toEqual([
      "customer-directory",
      "create-customer",
      "customer-contacts",
      "customer-portal-access",
      "service-locations",
      "customer-ticket-history",
    ]);
    expect(customersSection?.items.every((item) => item.path?.startsWith("/organization/customers/"))).toBe(true);
  });

  it("firstAccessibleOrganizationAdminPath picks the first permitted destination", () => {
    expect(firstAccessibleOrganizationAdminPath(TENANT_READ_PERMISSIONS)).toBe(
      "/organization/dashboard/organization-overview",
    );
    expect(firstAccessibleOrganizationAdminPath(["customers.read"])).toBe(
      "/organization/customers/customer-directory",
    );
    expect(firstAccessibleOrganizationAdminPath(["admin.staff.read"])).toBeNull();
  });

  it("locates customer record pages under the directory capability", () => {
    const location = locateOrganizationAdminScreen("/organization/customers/cust_123");
    expect(location?.section.key).toBe("customers");
    expect(location?.label).toBe("Customer Directory");
    const directory = locateOrganizationAdminScreen("/organization/customers/customer-directory");
    expect(directory?.item.key).toBe("customer-directory");
  });

  it("includes customers.read in the tenant read catalogue", () => {
    expect(TENANT_READ_PERMISSIONS).toContain("customers.read");
  });
});
