import { describe, expect, it } from "vitest";
import { platformAdministrationHomePath, platformAdministrationRoutes } from "../model/platformAdministrationRoutes";

describe("Phase 00 administration route contract", () => {
  it("implements every Phase 00 screen as a unique deep-linkable route", () => {
    expect(platformAdministrationRoutes).toHaveLength(88);
    expect(new Set(platformAdministrationRoutes.map((route) => route.path)).size).toBe(88);
    expect(new Set(platformAdministrationRoutes.map((route) => route.screenId)).size).toBe(88);
    expect(platformAdministrationRoutes.every((route) => route.path.startsWith("/instances/:instanceId/admin/"))).toBe(true);
  });

  it("keeps all ten administration modules represented", () => {
    expect(new Set(platformAdministrationRoutes.map((route) => route.module))).toEqual(new Set([
      "instance", "identity", "organization", "users", "groups", "assignment-groups", "roles", "delegation", "preferences", "audit",
    ]));
  });

  it("uses Instance Home as the administration entry route", () => {
    expect(platformAdministrationHomePath).toBe("/instances/:instanceId/admin/instance/instance-home");
  });
});
