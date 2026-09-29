import type { ApiRecord } from "@shared/api/itsmTypes";
import type { WorkRecord } from "./workRecord";

export function textValue(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "name" in value) return String((value as { name?: unknown }).name ?? fallback);
  return fallback;
}

export function workRecordFromApi(item: ApiRecord): WorkRecord {
  const id = String(item._id ?? item.id ?? "");
  const notes = Array.isArray(item.notes) ? item.notes : Array.isArray(item.comments) ? item.comments : [];
  return {
    id,
    number: textValue(item.number, textValue(item.code, id)),
    title: textValue(item.title, textValue(item.shortDescription, textValue(item.name, "Untitled record"))),
    description: textValue(item.description, textValue(item.content)),
    state: textValue(item.status, textValue(item.state, "Draft")),
    priority: textValue(item.priority, "P3").toUpperCase(),
    owner: textValue(item.assignedTo, textValue(item.owner, "Unassigned")),
    group: textValue(item.assignmentGroup, textValue(item.group, "Unassigned")),
    service: textValue(item.service, textValue(item.serviceOffering, "Not specified")),
    risk: textValue(item.risk, "Medium"),
    start: textValue(item.windowStart, textValue(item.startAt, textValue(item.createdAt))),
    end: textValue(item.windowEnd, textValue(item.dueAt, textValue(item.updatedAt))),
    updated: textValue(item.updatedAt, new Date(0).toISOString()),
    links: Array.isArray(item.links) ? item.links.map(String) : [],
    notes: notes.map((value, index) => { const note = value as ApiRecord; return { id: textValue(note._id, `${id}-note-${index}`), author: textValue(note.author, "System"), body: textValue(note.body, textValue(note.comment)), at: textValue(note.createdAt, textValue(note.at, new Date(0).toISOString())), type: "work_note" as const }; }),
    tasks: Array.isArray(item.tasks) ? item.tasks.map((value, index) => { const task = value as ApiRecord; return { id: textValue(task._id, `${id}-task-${index}`), title: textValue(task.title, textValue(task.name, "Task")), owner: textValue(task.assignedTo, "Unassigned"), state: textValue(task.status, "New"), due: textValue(task.dueAt) }; }) : [],
    approvals: Array.isArray(item.approvals) ? item.approvals.map((value, index) => { const approval = value as ApiRecord; return { id: textValue(approval._id, `${id}-approval-${index}`), approver: textValue(approval.approver, "Approver"), state: textValue(approval.status, "Pending"), comment: textValue(approval.comment) }; }) : [],
  };
}

export function workRecordToApi(record: WorkRecord): Record<string, unknown> {
  return { title: record.title, shortDescription: record.title, name: record.title, description: record.description, status: record.state.toLowerCase(), priority: record.priority.toLowerCase(), risk: record.risk.toLowerCase(), windowStart: record.start || undefined, windowEnd: record.end || undefined };
}
