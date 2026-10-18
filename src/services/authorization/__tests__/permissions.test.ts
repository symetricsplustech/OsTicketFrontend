import { describe, expect, it } from "vitest";
import { can, canAny, matchesGrant } from "../permissions.ts";

describe("grant matching", () => {
  it("accepts the platform wildcard", () => {
    expect(matchesGrant(["*"], "itsm.incident.incident.read")).toBe(true);
  });

  it("accepts an exact leaf key", () => {
    expect(matchesGrant(["itsm.incident.incident.read"], "itsm.incident.incident.read")).toBe(true);
    expect(matchesGrant(["itsm.incident.incident.read"], "itsm.incident.incident.create")).toBe(false);
  });

  it("accepts a namespace wildcard the way the backend does", () => {
    expect(matchesGrant(["itsm.incident.*"], "itsm.incident.incident.read")).toBe(true);
    expect(matchesGrant(["itsm.incident.*"], "itsm.problem.problem.read")).toBe(false);
    expect(matchesGrant(["itsm.*"], "itsm.reporting_admin.audit_read")).toBe(true);
  });

  it("does not let a sibling namespace leak", () => {
    expect(matchesGrant(["itsm.incident.*"], "itsm.incidentX.read")).toBe(false);
  });

  it("keeps the single-permission helper consistent", () => {
    expect(can(["itsm.knowledge.*"], "itsm.knowledge.article_read")).toBe(true);
  });
});

describe("any-of matching", () => {
  it("is satisfied by one grant out of many", () => {
    expect(canAny(["itsm.sla.definition_read"], ["itsm.change.*", "itsm.sla.definition_read"])).toBe(true);
  });

  it("treats a wildcard requirement as a namespace", () => {
    expect(canAny(["itsm.sla.task_sla_read"], ["itsm.sla.*"])).toBe(true);
    expect(canAny(["itsm.sla.*"], ["itsm.sla.*"])).toBe(true);
    expect(canAny(["itsm.change.*"], ["itsm.sla.*"])).toBe(false);
  });

  it("is false when nothing matches", () => {
    expect(canAny(["itsm.sla.definition_read"], ["itsm.change.*", "itsm.asset.*"])).toBe(false);
  });

  it("treats an empty requirement as open", () => {
    expect(canAny([], [])).toBe(true);
  });
});
