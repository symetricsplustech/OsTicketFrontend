import type { WorkDomain } from "./workRecord";

export function workRecordLabel(domain: WorkDomain): string {
  if (domain === "interaction") return "Interaction";
  if (domain === "incident") return "Incident";
  if (domain === "major") return "Major incident";
  if (domain === "problem") return "Problem";
  if (domain === "change") return "Change";
  if (domain === "request") return "Request";
  if (domain === "universal-request") return "Universal request";
  if (domain === "catalog") return "Catalog item";
  if (domain === "knowledge") return "Knowledge article";
  return "SLA";
}

export function workRecordPrefix(domain: WorkDomain): string {
  if (domain === "interaction") return "INT";
  if (domain === "incident") return "INC";
  if (domain === "major") return "MI";
  if (domain === "problem") return "PRB";
  if (domain === "change") return "CHG";
  if (domain === "request") return "REQ";
  if (domain === "universal-request") return "UREQ";
  if (domain === "catalog") return "CAT";
  if (domain === "knowledge") return "KB";
  return "SLA";
}
