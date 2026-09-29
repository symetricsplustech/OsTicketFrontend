import { describe, expect, it } from "vitest";
import { operationalDomain, operationalTarget } from "@features/enterprise-operations/model/operationalDomain";
import { operationalCapabilities } from "@features/enterprise-operations/model/operationalCapabilities";
import { enterpriseOperationsRoutes } from "@features/enterprise-operations/model/enterpriseOperationsRoutes";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";

const phase16 = enterpriseOperationsRoutes.filter((route) => route.phase === 16);
const screen = (title: string): ScreenDefinition =>
  phase16.find((candidate) => candidate.title === title) as ScreenDefinition;

describe("Phase 16 screen to collection mapping", () => {
  it("covers every registered Phase 16 screen", () => {
    expect(phase16.length).toBeGreaterThan(0);
    expect(phase16.every((item) => operationalDomain(item) === "outage")).toBe(true);
  });

  it("does not send every module to the outage list", () => {
    // Service Status is a separate backend mount and must not be read through
    // the outage collection.
    const byModule = new Map<string, string>();
    for (const item of phase16) byModule.set(item.module ?? "", operationalTarget(item).resource);
    expect(byModule.get("status")).toBe("status-pages");
    expect(byModule.get("outages")).toBe("outages");
    expect(byModule.get("configuration")).toBe("outages");
  });

  it("maps the outage state screens to real statuses", () => {
    // The dashboard already treats these three as the active set.
    expect(operationalTarget(screen("Active Outages")).status).toBe("investigating,identified,monitoring");
    expect(operationalTarget(screen("Resolved Outages")).status).toBe("resolved");
    expect(operationalTarget(screen("Closed Outages")).status).toBe("closed");
  });

  it("reads child collections read-only instead of offering a flat edit", () => {
    for (const title of ["Affected Service", "Affected CI", "Impact Timeline", "Related Incidents", "Major Incident", "Related Change"]) {
      const target = operationalTarget(screen(title));
      expect(target.resource).toBe("outages");
      expect(target.readOnly).toBe(true);
      expect(operationalCapabilities("outage", target.resource, target.readOnly).create).toBe(false);
    }
  });

  it("marks screens with no backend surface instead of borrowing another module's rows", () => {
    // Each of these previously fell through to the outage list, which showed
    // outage records under a screen title they have nothing to do with.
    for (const title of [
      "Planned Outages",
      "Affected Users / Locations",
      "Communication History",
      "Outage Types",
      "Outage States",
      "Outage Notifications",
    ]) {
      const target = operationalTarget(screen(title));
      expect(target.unavailable, `${title} should be marked unavailable`).toBeTruthy();
    }
  });

  it("keeps the CRUD outage screens writable", () => {
    for (const title of ["Outage Home", "Create Outage", "Outage Record"]) {
      const target = operationalTarget(screen(title));
      expect(target.unavailable).toBeUndefined();
      expect(operationalCapabilities("outage", target.resource, target.readOnly).create).toBe(true);
    }
  });

  it("reads service status from the status pages mount", () => {
    for (const title of ["Service Status Home", "Requester Status Page"]) {
      expect(operationalTarget(screen(title)).resource).toBe("status-pages");
    }
  });
});
