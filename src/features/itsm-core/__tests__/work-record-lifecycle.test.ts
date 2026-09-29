import { describe, expect, it } from "vitest";
import { applyLifecycleTransition, createLifecycleRecord, lifecycleTransitions } from "../components/WorkRecordWorkspace";

describe("code-backed service-management lifecycle", () => {
  it("creates a complete change record with nested work and approval state", () => {
    const record = createLifecycleRecord("CHG009999", "Upgrade gateway", "New", "P2", "Owner", "Platform", "Identity", "Medium");
    expect(record).toMatchObject({ number: "CHG009999", state: "New", owner: "Owner", risk: "Medium" });
    expect(record.tasks).toHaveLength(1);
    expect(record.approvals).toHaveLength(1);
    expect(record.notes[0].type).toBe("audit");
  });

  it("allows only configured change transitions and records an audit event", () => {
    const record = createLifecycleRecord("CHG009999", "Upgrade gateway", "New", "P2", "Owner", "Platform", "Identity", "Medium");
    expect(lifecycleTransitions.change.New).toEqual(["Assess", "Canceled"]);
    const transitioned = applyLifecycleTransition("change", record, "Assess");
    expect(transitioned.state).toBe("Assess");
    expect(transitioned.notes[0].body).toContain("New to Assess");
    expect(() => applyLifecycleTransition("change", record, "Closed")).toThrow(/not allowed/);
  });

  it("enforces distinct major-incident and problem lifecycles", () => {
    const major = createLifecycleRecord("MI009999", "Outage", "Candidate", "P1", "Commander", "MIM", "Payments", "Critical");
    const problem = createLifecycleRecord("PRB009999", "Latency", "RCA", "P2", "Owner", "Engineering", "Identity", "High");
    expect(applyLifecycleTransition("major", major, "Proposed").state).toBe("Proposed");
    expect(applyLifecycleTransition("problem", problem, "Known error").state).toBe("Known error");
    expect(() => applyLifecycleTransition("major", major, "Closed")).toThrow();
  });
});
