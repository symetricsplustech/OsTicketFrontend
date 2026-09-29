import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";

export type ApprovalManagementRoute = ScreenDefinition & { group: string };

type Module = { key: string; title: string; screens: readonly (readonly [string, ScreenKind])[] };

const modules: readonly Module[] = [
  { key: "home", title: "Approval Inbox", screens: [["Approval Inbox", "dashboard"], ["My Approvals", "list"], ["My Group Approvals", "list"], ["Pending Approvals", "list"], ["Approved Records", "list"], ["Rejected Records", "list"], ["Approval History", "record"]] },
  { key: "approval-record", title: "Approval Record", screens: [["Approval Record", "record"], ["Approval Details", "record"], ["Approval Comments", "record"], ["Approval Audit", "record"]] },
  { key: "approval-policies", title: "Approval Policies", screens: [["Approval Policies", "list"], ["Create Approval Policy", "settings"], ["Approval Policy Record", "record"], ["Approval Conditions", "record"], ["Approval Actions", "record"]] },
  { key: "delegation", title: "Delegation", screens: [["Delegations", "list"], ["Create Delegation", "settings"], ["Delegation Record", "record"], ["Active Delegations", "list"], ["Delegation History", "list"]] },
  { key: "escalation", title: "Escalation", screens: [["Escalation Rules", "list"], ["Create Escalation Rule", "settings"], ["Escalation Rule Record", "record"], ["Active Escalations", "list"], ["Escalation History", "list"]] },
] as const;

const slug = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const approvalManagementRoutes: ApprovalManagementRoute[] = modules.flatMap((module, moduleIndex) =>
  module.screens.map(([title, kind], screenIndex) => ({
    id: 120000 + (moduleIndex + 1) * 100 + screenIndex + 1,
    title,
    path: `/instances/:instanceId/workspace/approvals/${module.key}/${slug(title)}`,
    group: `Phase 12 · ${module.title}`,
    phase: 12,
    kind,
    area: module.title,
    module: module.key,
    screenId: `12.${moduleIndex + 1}.${screenIndex + 1}`,
    description: `${title} with governed approval inbox, record, policies, delegation, escalation, and audit operations.`,
  })),
);

export const approvalManagementHomePath = approvalManagementRoutes[0].path;