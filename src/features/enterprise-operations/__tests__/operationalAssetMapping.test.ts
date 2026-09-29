import { describe, expect, it } from "vitest";
import { isCrudResource } from "@features/asset-management/api/assetPaths";
import { operationalDomain, operationalResource, operationalTarget } from "@features/enterprise-operations/model/operationalDomain";
import { operationalCapabilities } from "@features/enterprise-operations/model/operationalCapabilities";
import { enterpriseOperationsRoutes } from "@features/enterprise-operations/model/enterpriseOperationsRoutes";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";

const phase15 = enterpriseOperationsRoutes.filter((route) => route.phase === 15);
const register = "assets";

describe("Phase 15 screen to collection mapping", () => {
  it("covers every registered Phase 15 screen", () => {
    expect(phase15.length).toBeGreaterThan(0);
    expect(phase15.every((screen) => operationalDomain(screen) === "asset")).toBe(true);
  });

  it("does not send every module to the asset register", () => {
    // Only 15.1 and the 15.7 lifecycle state views legitimately read the
    // register; the other eight modules must each reach their own collection.
    const byModule = new Map<string, string>();
    for (const screen of phase15) byModule.set(screen.module ?? "", operationalTarget(screen).resource);
    expect([...byModule.entries()].filter(([, r]) => r === register).map(([m]) => m).sort()).toEqual([
      "assets",
      "lifecycle",
    ]);
    expect([...byModule.values()].filter((r) => r === register)).toHaveLength(2);
    expect(new Set([...byModule.values()]).size).toBeGreaterThanOrEqual(9);
  });

  it("maps each module to a collection the backend serves", () => {
    const byModule = new Map<string, Set<string>>();
    for (const screen of phase15) {
      const list = byModule.get(screen.module ?? "") ?? new Set<string>();
      list.add(operationalTarget(screen).resource);
      byModule.set(screen.module ?? "", list);
    }
    for (const [module, resources] of byModule) {
      for (const resource of resources) {
        expect(resource === register || isCrudResource(resource), `${module} -> ${resource}`).toBe(true);
      }
    }
  });

  it("resolves the expected collection per module", () => {
    const resourceFor = (module: string, title?: string) =>
      operationalTarget(phase15.find((s) => s.module === module && (!title || s.title === title)) as ScreenDefinition).resource;

    expect(resourceFor("assets")).toBe(register);
    expect(resourceFor("models")).toBe("models");
    expect(resourceFor("stockrooms")).toBe("stockrooms");
    expect(resourceFor("inventory")).toBe("inventory");
    expect(resourceFor("transfers")).toBe("transfers");
    expect(resourceFor("assignment")).toBe("assignments");
    expect(resourceFor("lifecycle")).toBe(register);
    expect(resourceFor("audit")).toBe("audits");
    expect(resourceFor("cost")).toBe("costs");
    expect(resourceFor("configuration")).toBe("config/states");
  });

  it("redirects a screen whose collection differs from its module", () => {
    const target = (title: string) => operationalTarget(phase15.find((s) => s.title === title) as ScreenDefinition);
    expect(target("Model Categories").resource).toBe("model-categories");
    expect(target("Inventory Exceptions").resource).toBe("inventory/exceptions");
    expect(target("Asset Exceptions").resource).toBe("audit-exceptions");
    expect(target("Cost Centers").resource).toBe("cost-centers");
    expect(target("Asset Substates").resource).toBe("config/substates");
    expect(target("Asset Properties").resource).toBe("config/properties");
  });

  it("filters the register by the lifecycle state each 15.7 screen names", () => {
    const statusFor = (title: string) => operationalTarget(phase15.find((s) => s.title === title) as ScreenDefinition).status;
    expect(statusFor("On Order Assets")).toBe("on_order");
    expect(statusFor("In Stock Assets")).toBe("in_stock");
    expect(statusFor("In Use Assets")).toBe("in_use");
    expect(statusFor("In Maintenance Assets")).toBe("in_maintenance");
    expect(statusFor("Retired Assets")).toBe("retired");
    expect(statusFor("Disposed Assets")).toBe("disposed");
  });

  it("matches the six states the backend allows", () => {
    // Mirrors LIFECYCLE_TRANSITIONS in assetLifecycle.service.js.
    const allowed = new Set(["on_order", "in_stock", "in_use", "in_maintenance", "retired", "disposed"]);
    for (const screen of phase15.filter((s) => s.module === "lifecycle")) {
      const { status } = operationalTarget(screen);
      if (status) expect(allowed.has(status), `${screen.title} -> ${status}`).toBe(true);
    }
  });

  it("offers no write actions on parent-scoped or action screens", () => {
    for (const screen of phase15) {
      const { resource, readOnly } = operationalTarget(screen);
      if (!readOnly) continue;
      const capabilities = operationalCapabilities("asset", resource, readOnly);
      expect(capabilities, screen.title).toEqual({ create: false, update: false, remove: false, transition: false });
    }
  });

  it("keeps write actions where the API has the endpoints", () => {
    for (const title of ["All Assets", "Asset Models", "Stockrooms", "Inventory Home", "Asset Transfers", "Asset Audits", "Cost Records"]) {
      const screen = phase15.find((s) => s.title === title) as ScreenDefinition;
      const { resource, readOnly } = operationalTarget(screen);
      expect(readOnly, title).toBeFalsy();
      expect(operationalCapabilities("asset", resource, readOnly), title).toEqual({
        create: true,
        update: true,
        remove: true,
        transition: true,
      });
    }
  });

  it("leaves the other phases mapped as before", () => {
    const assignment = enterpriseOperationsRoutes.find((r) => r.phase === 11 && r.module === "skills");
    expect(operationalResource(assignment as ScreenDefinition)).toBe("skills");
    const outage = enterpriseOperationsRoutes.find((r) => r.phase === 16);
    expect(operationalResource(outage as ScreenDefinition)).toBe("outages");
  });
});
