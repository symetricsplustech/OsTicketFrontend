import type { WorkApproval, WorkDomain, WorkNote, WorkRecord, WorkTask } from "./workRecord";

export const lifecycleTransitions: Record<WorkDomain, Record<string, string[]>> = {
  interaction: { New: ["Active", "Abandoned"], Active: ["Waiting", "Completed", "Abandoned"], Waiting: ["Active", "Completed", "Abandoned"], Completed: [], Abandoned: [] },
  incident: { New: ["In progress", "Canceled"], "In progress": ["On hold", "Resolved", "Canceled"], "On hold": ["In progress", "Resolved", "Canceled"], Resolved: ["Closed", "In progress"], Closed: ["In progress"], Canceled: [] },
  major: { Candidate: ["Proposed", "Rejected"], Proposed: ["Accepted", "Rejected"], Accepted: ["Active"], Active: ["Mitigated", "Resolved"], Mitigated: ["Resolved"], Resolved: ["PIR", "Closed"], PIR: ["Closed"], Closed: [] },
  problem: { New: ["Assess", "Canceled"], Assess: ["RCA", "Fix in progress", "Canceled"], RCA: ["Known error", "Fix in progress"], "Known error": ["Fix in progress", "Resolved"], "Fix in progress": ["Resolved"], Resolved: ["Closed", "RCA"], Closed: [] },
  change: { New: ["Assess", "Canceled"], Assess: ["Authorize", "Canceled"], Authorize: ["Scheduled", "Assess"], Scheduled: ["Implement", "Canceled"], Implement: ["Review", "Backed out", "Failed"], Review: ["Closed", "Implement"], "Backed out": ["Review"], Failed: ["Review"], Closed: [] },
  request: { New: ["Approval", "Fulfillment", "Canceled"], Approval: ["Fulfillment", "Rejected", "Canceled"], Fulfillment: ["Pending", "Complete", "Canceled"], Pending: ["Fulfillment", "Complete", "Canceled"], Complete: ["Closed"], Rejected: ["Closed"], Canceled: ["Closed"], Closed: [] },
  "universal-request": { New: ["Open", "Cancelled"], Open: ["Pending", "Resolved", "Cancelled"], Pending: ["Open", "Resolved", "Cancelled"], Resolved: ["Closed", "Open"], Closed: [], Cancelled: [] },
  catalog: { Draft: ["Review", "Published", "Retired"], Review: ["Draft", "Published"], Published: ["Draft", "Retired"], Retired: ["Draft"] },
  knowledge: { Draft: ["Review", "Retired"], Review: ["Approved", "Draft"], Approved: ["Published", "Draft"], Published: ["Review", "Retired"], Retired: ["Archived", "Draft"], Archived: [] },
  sla: { Draft: ["Active", "Canceled"], Active: ["Paused", "At Risk", "Complete", "Canceled"], Paused: ["Active", "Canceled"], "At Risk": ["Active", "Breached", "Complete"], Breached: ["Complete"], Complete: ["Closed"], Canceled: ["Closed"], Closed: [] },
};

const now = () => new Date().toISOString();

function seedTask(record: WorkRecord): WorkTask {
  return {
    id: `${record.id}-task-1`,
    title: `Deliver ${record.number}`,
    owner: record.owner,
    state: "Open",
    due: record.end,
  };
}

function seedApproval(record: WorkRecord): WorkApproval {
  return {
    id: `${record.id}-approval-1`,
    approver: `${record.group} manager`,
    state: "Pending",
    comment: "",
  };
}

function auditNote(record: WorkRecord, body: string): WorkNote {
  return {
    id: `${record.id}-audit-${record.notes.length + 1}`,
    author: "System",
    body,
    at: now(),
    type: "audit",
  };
}

export function createLifecycleRecord(number: string, title: string, state: string, priority: string, owner: string, group: string, service: string, risk: string): WorkRecord {
  const record: WorkRecord = {
    id: number.toLowerCase(),
    number,
    title,
    description: "",
    state,
    priority,
    owner,
    group,
    service,
    risk,
    start: "",
    end: "",
    updated: now(),
    links: [],
    notes: [],
    tasks: [],
    approvals: [],
  };
  return {
    ...record,
    notes: [auditNote(record, `${number} created in ${state}`)],
    tasks: [seedTask(record)],
    approvals: [seedApproval(record)],
  };
}

export function allowedTransitions(domain: WorkDomain, state: string): string[] {
  return lifecycleTransitions[domain][state] ?? [];
}

export function applyLifecycleTransition(domain: WorkDomain, record: WorkRecord, state: string): WorkRecord {
  if (!allowedTransitions(domain, record.state).includes(state)) {
    throw new Error(`Transition from ${record.state} to ${state} is not allowed`);
  }
  return {
    ...record,
    state,
    updated: now(),
    notes: [auditNote(record, `${record.number} state ${record.state} to ${state}`), ...record.notes],
    tasks: record.tasks.map((task) => (task.state === "Open" && state === "Complete" ? { ...task, state: "Complete" } : task)),
  };
}
