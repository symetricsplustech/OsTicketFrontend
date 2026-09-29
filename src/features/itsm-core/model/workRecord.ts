export type WorkDomain = "interaction" | "incident" | "major" | "problem" | "change" | "request" | "universal-request" | "catalog" | "knowledge" | "sla";

export type WorkNote = {
  id: string;
  author: string;
  body: string;
  at: string;
  type: "work_note" | "communication" | "audit";
};

export type WorkTask = { id: string; title: string; owner: string; state: string; due: string };
export type WorkApproval = { id: string; approver: string; state: string; comment: string };

export type WorkRecord = {
  id: string;
  number: string;
  title: string;
  description: string;
  state: string;
  priority: string;
  owner: string;
  group: string;
  service: string;
  risk: string;
  start: string;
  end: string;
  updated: string;
  notes: WorkNote[];
  tasks: WorkTask[];
  links: string[];
  approvals: WorkApproval[];
};
