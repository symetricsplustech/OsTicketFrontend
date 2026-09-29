import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";
export type MajorIncidentRoute = ScreenDefinition & { group: string };
type Module = { key: string; title: string; screens: readonly (readonly [string, ScreenKind])[] };
const modules: readonly Module[] = [
  { key: "home", title: "Major Incident Home", screens: [["Major Incident Home", "dashboard"], ["Major Incident Dashboard", "dashboard"]] },
  { key: "candidates", title: "Candidates & Proposals", screens: [["Major Incident Candidates", "list"], ["Candidate Record", "record"], ["Proposed Major Incidents", "list"], ["Proposal Record", "record"], ["Accept Proposal", "record"], ["Reject Proposal", "record"]] },
  { key: "command", title: "Command Center", screens: [["Major Incident Command Workspace", "workspace"], ["Impact Overview", "record"], ["Affected Services", "list"], ["Affected CIs", "list"], ["Affected Users / Locations", "list"], ["Responder Roster", "list"], ["Responder Tasks", "list"], ["Timeline", "record"], ["Investigation", "record"], ["Resolution", "record"]] },
  { key: "communications", title: "Communications", screens: [["Major Incident Communication Center", "workspace"], ["Communication Plans", "list"], ["Stakeholder Groups", "list"], ["Communication Composer", "record"], ["Communication Preview", "record"], ["Communication History", "record"]] },
  { key: "post-incident", title: "Post Incident", screens: [["Post-Incident Reviews", "list"], ["PIR Record", "record"], ["PIR Findings", "record"], ["PIR Actions", "record"], ["Follow-Up Problems", "record"], ["Follow-Up Changes", "record"], ["Follow-Up Knowledge", "record"], ["Follow-Up Improvements", "record"]] },
  { key: "configuration", title: "Configuration", screens: [["Major Incident Criteria", "record"], ["Candidate Rules", "record"], ["Major Incident Templates", "record"], ["Responder Rules", "record"], ["Communication Templates", "record"], ["PIR Templates", "record"]] },
] as const;
const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/\//g, "-").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const majorIncidentRoutes: MajorIncidentRoute[] = modules.flatMap((module, moduleIndex) => module.screens.map(([title, kind], screenIndex) => ({ id: 30000 + (moduleIndex + 1) * 100 + screenIndex + 1, title, path: `/instances/:instanceId/workspace/major-incidents/${module.key}/${slug(title)}`, group: `Phase 03 · ${module.title}`, phase: 3, kind, area: module.title, module: module.key, screenId: `03.${moduleIndex + 1}.${screenIndex + 1}`, description: `${title} with governed major-incident command, response, communications, post-incident action, and audit evidence.` })));
export const majorIncidentHomePath = majorIncidentRoutes[0].path;
