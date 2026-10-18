import { describe, expect, it } from "vitest";
import { ORGANIZATION_ADMIN_NAVIGATION } from "@/navigation/organizationAdminNavigation";
import { resolveOrganizationAdminPageModel } from "../pageModel";

describe("organization admin page models", () => {
  it("resolves a concrete page kind for every catalogued destination", () => {
    let checked = 0;
    for (const section of ORGANIZATION_ADMIN_NAVIGATION) {
      if (section.key === "customers") continue;
      for (const item of section.items) {
        const leaves = item.children && item.children.length > 0 ? item.children : [item];
        for (const leaf of leaves) {
          if (!leaf.path) continue;
          const routeKey = leaf.path.replace(/^\/organization\//, "");
          const model = resolveOrganizationAdminPageModel({
            sectionKey: section.key,
            title: leaf.label,
            description: leaf.hint,
            routeKey,
          });
          expect(model.kind).toBeTruthy();
          checked += 1;
        }
      }
    }
    expect(checked).toBeGreaterThan(250);
  });

  it("gives curated dashboards hand-tuned stats", () => {
    const model = resolveOrganizationAdminPageModel({
      sectionKey: "dashboard",
      title: "Organization Overview",
      description: "",
      routeKey: "dashboard/organization-overview",
    });
    expect(model.kind).toBe("dashboard");
    expect(model.stats?.length).toBe(6);
  });

  it("resolves form pages for create screens", () => {
    const model = resolveOrganizationAdminPageModel({
      sectionKey: "vendor-management",
      title: "Create Vendor",
      description: "",
      routeKey: "vendor-management/create-vendor",
    });
    expect(model.kind).toBe("form");
    expect(model.fields?.length).toBeGreaterThan(3);
  });
});
