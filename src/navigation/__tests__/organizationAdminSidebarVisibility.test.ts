import { describe, expect, it } from "vitest";
import {
  firstAccessibleOrganizationAdminPath,
  ORGANIZATION_ADMIN_NAVIGATION,
  TENANT_READ_PERMISSIONS,
} from "@/navigation/organizationAdminNavigation";
import { CREATE_ROUTE_BY_SECTION } from "@/screens/organization-admin/pages/pageModel";

const ACTION_LABEL = /^(create|edit|clone|invite|rotate|revoke|test)\b/i;

function visibleLabels(): string[] {
  const labels: string[] = [];
  for (const section of ORGANIZATION_ADMIN_NAVIGATION) {
    for (const item of section.items) {
      if (item.hidden) continue;
      if (item.children && item.children.length > 0) {
        for (const child of item.children) {
          if (child.hidden) continue;
          labels.push(child.label);
        }
      } else {
        labels.push(item.label);
      }
    }
  }
  return labels;
}

function allLeafPaths(): string[] {
  const paths: string[] = [];
  for (const section of ORGANIZATION_ADMIN_NAVIGATION) {
    for (const item of section.items) {
      if (item.children && item.children.length > 0) {
        for (const child of item.children) paths.push(child.path.replace(/^\/organization\//, ""));
      } else if (item.path) {
        paths.push(item.path.replace(/^\/organization\//, ""));
      }
    }
  }
  return paths;
}

describe("organization admin sidebar visibility", () => {
  it("keeps every action screen (create/edit/clone …) out of the sidebar", () => {
    const offenders = visibleLabels().filter((label) => ACTION_LABEL.test(label));
    expect(offenders).toEqual([]);
  });

  it("keeps every create form routable even though it is hidden from the sidebar", () => {
    const paths = new Set(allLeafPaths());
    for (const route of Object.values(CREATE_ROUTE_BY_SECTION)) {
      expect(paths.has(route.replace(/^\/organization\//, ""))).toBe(true);
      expect(route.startsWith("/organization/")).toBe(true);
    }
  });

  it("never lands a session on a hidden action page after sign-in", () => {
    const home = firstAccessibleOrganizationAdminPath(TENANT_READ_PERMISSIONS);
    expect(home).toBe("/organization/dashboard/organization-overview");
  });
});
