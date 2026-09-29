import type { ScreenDefinition } from "../models/screen";

const phasePermissionPrefixes: Record<number, string[]> = {
  1: ["itsm.walkup."],
  3: ["itsm.incident."],
  4: ["itsm.problem."],
  5: ["itsm.change."],
  6: ["itsm.request_catalog."],
  7: ["itsm.request_catalog."],
  8: ["itsm.universal_request."],
  9: ["itsm.knowledge."],
  10: ["itsm.sla."],
};

const writeMarkers = [
  ".create",
  ".update",
  ".delete",
  "_create",
  "_update",
  "_delete",
  "_manage",
  ".assign",
  ".resolve",
  ".close",
  ".reopen",
  ".cancel",
  ".approve",
  ".publish",
  ".checkout",
];

export function canWriteWorkRecord(
  permissions: string[],
  screen: ScreenDefinition,
): boolean {
  if (permissions.includes("*")) return true;
  const prefixes = phasePermissionPrefixes[screen.phase ?? -1] ?? [];
  return permissions.some(
    (permission) =>
      prefixes.some((prefix) => permission.startsWith(prefix)) &&
      writeMarkers.some((marker) => permission.includes(marker)),
  );
}
