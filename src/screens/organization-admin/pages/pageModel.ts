/**
 * Page model for Organization Admin destinations. Every catalogued sidebar
 * route resolves to a concrete page kind plus realistic content (KPIs, table
 * columns/rows, form fields, settings groups, calendar events …). Curated
 * overrides win; the rest is derived from the title with section-scoped
 * sample pools so neighbouring screens never look identical.
 */

export type OrganizationAdminPageKind =
  | "dashboard"
  | "list"
  | "form"
  | "settings"
  | "report"
  | "calendar"
  | "activity"
  | "matrix"
  | "workflow";

export interface OrganizationAdminStat {
  label: string;
  value: string;
  hint?: string;
}

export interface OrganizationAdminTableRow {
  cells: string[];
}

export interface OrganizationAdminTableModel {
  columns: string[];
  rows: OrganizationAdminTableRow[];
}

export interface OrganizationAdminFieldModel {
  label: string;
  type: "text" | "email" | "password" | "select" | "textarea";
  options?: string[];
  placeholder?: string;
  span?: 1 | 2;
}

export interface OrganizationAdminActivityEntry {
  title: string;
  actor: string;
  time: string;
  status?: string;
}

export interface OrganizationAdminSettingsRow {
  label: string;
  hint?: string;
  control: "toggle" | "text" | "select";
  options?: string[];
  value?: string;
  defaultOn?: boolean;
}

export interface OrganizationAdminSettingsGroup {
  title: string;
  rows: OrganizationAdminSettingsRow[];
}

export interface OrganizationAdminCalendarEvent {
  day: number;
  label: string;
  tone: "blue" | "amber" | "emerald" | "rose";
}

export interface OrganizationAdminPageModel {
  kind: OrganizationAdminPageKind;
  primaryAction?: string;
  secondaryActions?: string[];
  /** Relative route (under /organization) of the section's create form, when one exists. */
  createHref?: string;
  stats?: OrganizationAdminStat[];
  table?: OrganizationAdminTableModel;
  fields?: OrganizationAdminFieldModel[];
  activity?: OrganizationAdminActivityEntry[];
  settingsGroups?: OrganizationAdminSettingsGroup[];
  calendarEvents?: OrganizationAdminCalendarEvent[];
  workflowNodes?: string[];
  reportSeries?: number[];
}

/**
 * Hidden create-form routes per section. These screens are no longer sidebar
 * items — list pages open them via their primary Create button instead.
 * Values are absolute paths (include the /organization prefix).
 */
export const CREATE_ROUTE_BY_SECTION: Record<string, string> = {
  "organization-users": "/organization/organization-users/user-management/create-user",
  "roles-access-control": "/organization/roles-access-control/roles/create-role",
  customers: "/organization/customers/create-customer",
  "service-catalog": "/organization/service-catalog/create-catalog-item",
  "workflow-automation": "/organization/workflow-automation/create-workflow",
  "teams-on-call": "/organization/teams-on-call/create-team",
  "vendor-management": "/organization/vendor-management/create-vendor",
  "help-support": "/organization/help-support/create-support-ticket",
};

interface SectionPool {
  /** Record names that plausibly belong to this module. */
  entities: string[];
  statuses: string[];
}

const OWNERS = [
  "Priya Nair",
  "Marcus Webb",
  "Elena Kovacs",
  "Tom Whitfield",
  "Aisha Rahman",
  "Carlos Mendes",
];

const TIMES = [
  "12 minutes ago",
  "1 hour ago",
  "3 hours ago",
  "Yesterday",
  "2 days ago",
  "Oct 12, 2026",
  "Oct 8, 2026",
];

const SECTION_POOLS: Record<string, SectionPool> = {
  dashboard: {
    entities: ["INC-10412", "CHG-2087", "REQ-8841", "INC-10398", "PRB-412", "INC-10387"],
    statuses: ["Open", "In Progress", "Resolved", "Pending approval"],
  },
  "organization-users": {
    entities: [
      "Aarav Sharma",
      "Priya Nair",
      "Daniel Okafor",
      "Sofia Reyes",
      "Liam Chen",
      "Fatima Zahra",
      "Noah Patel",
      "Emma Larsson",
    ],
    statuses: ["Active", "Invited", "Suspended", "Inactive"],
  },
  "roles-access-control": {
    entities: [
      "Incident Manager",
      "Service Desk Agent",
      "Change Approver",
      "Knowledge Author",
      "Readonly Auditor",
      "Problem Coordinator",
    ],
    statuses: ["Active", "Draft", "Archived"],
  },
  "service-desk": {
    entities: [
      "Email not received – SMTP bounce",
      "VPN connect fails after update",
      "Printer offline (3rd floor)",
      "Password reset for portal",
      "Monitor flickers intermittently",
      "Badge access denied at HQ",
      "Slow CRM load times",
      "Meeting room AV not working",
    ],
    statuses: ["Open", "In Progress", "Waiting on requester", "Resolved"],
  },
  "incident-management": {
    entities: [
      "INC-10412 – Email delivery delayed",
      "INC-10409 – VPN gateway down",
      "INC-10401 – CRM timeouts",
      "INC-10398 – Badge reader offline",
      "INC-10387 – Printer queue stuck",
      "INC-10376 – Wi-Fi dead zone, floor 4",
      "INC-10365 – Monitor no signal",
    ],
    statuses: ["Open", "In Progress", "Resolved", "Closed"],
  },
  "problem-management": {
    entities: [
      "PRB-412 – Recurring VPN drops",
      "PRB-408 – Duplicate SMTP bounces",
      "PRB-401 – Intermittent CRM timeouts",
      "PRB-395 – Printer driver conflicts",
      "PRB-388 – DNS resolution latency",
    ],
    statuses: ["Investigating", "Known error", "Resolved", "Closed"],
  },
  "change-management": {
    entities: [
      "CHG-2087 – PostgreSQL 16.3 upgrade",
      "CHG-2081 – Firewall rule update (DMZ)",
      "CHG-2074 – TLS cert renewal (portal)",
      "CHG-2066 – S3 lifecycle policy change",
      "CHG-2059 – Okta group mapping update",
      "CHG-2050 – Load balancer rotation",
    ],
    statuses: ["Assessment", "Awaiting approval", "Scheduled", "Implemented"],
  },
  "request-management": {
    entities: [
      "REQ-8841 – New laptop request",
      "REQ-8836 – Software licence request",
      "REQ-8829 – Finance app access",
      "REQ-8815 – Conference room booking",
      "REQ-8802 – Business card order",
      "REQ-8790 – Mobile device enrolment",
    ],
    statuses: ["Submitted", "Approved", "Fulfilling", "Completed"],
  },
  "service-catalog": {
    entities: [
      "Laptop Provisioning",
      "Software Installation",
      "Access Request",
      "Email Account Setup",
      "Conference Room Setup",
      "Mobile Device Enrolment",
      "Guest Wi-Fi Voucher",
    ],
    statuses: ["Published", "Draft", "Retired"],
  },
  "knowledge-management": {
    entities: [
      "VPN troubleshooting guide",
      "Password reset steps",
      "New starter checklist",
      "Printing issues FAQ",
      "Incident severity matrix",
      "How to request software",
    ],
    statuses: ["Published", "In review", "Draft", "Expired"],
  },
  "sla-service-performance": {
    entities: [
      "P1 – 1h response / 4h resolution",
      "P2 – 4h response / 8h resolution",
      "Critical change – 30m ack",
      "Standard request – 24h",
      "Vendor incident – 8h",
    ],
    statuses: ["Active", "Paused", "Breached", "Met"],
  },
  "workflow-automation": {
    entities: [
      "Auto-assign P1 incidents",
      "Escalate overdue changes",
      "Notify on SLA breach",
      "Weekly digest automation",
      "New-hire onboarding flow",
      "Auto-close stale requests",
    ],
    statuses: ["Published", "Draft", "Failed", "Retired"],
  },
  "cmdb-assets": {
    entities: [
      "SRV-APP-01",
      "LAP-2291",
      "SW-CORE-02",
      "PRD-DB-04",
      "RTR-EDGE-01",
      "LIC-ADOBE-12",
      "SRV-MAIL-02",
      "LAP-0447",
    ],
    statuses: ["In service", "In stock", "In repair", "Retired"],
  },
  "teams-on-call": {
    entities: [
      "Tier 1 Support",
      "Platform SRE",
      "Network Ops",
      "Field Service",
      "Database Admins",
      "Security Ops",
    ],
    statuses: ["Active", "Standby", "Inactive"],
  },
  "release-management": {
    entities: [
      "v2.14 – Workflow Designer",
      "v2.13.2 – Hotfix",
      "v2.13 – CMDB UI",
      "Mobile App 3.8",
      "API Gateway 1.9",
    ],
    statuses: ["Planning", "In deployment", "Deployed", "Rolled back"],
  },
  "notifications-communications": {
    entities: [
      "Incident created (email)",
      "SLA warning (in-app)",
      "Change approved (email)",
      "Weekly digest",
      "Password reset (SMS)",
    ],
    statuses: ["Enabled", "Disabled", "Failed"],
  },
  "vendor-management": {
    entities: [
      "Contoso Facilities Ltd",
      "Fabrikam Hardware",
      "Northwind Logistics",
      "Litware Security",
      "AdventureWorks Tel",
    ],
    statuses: ["Active", "Under review", "Offboarding"],
  },
  "reports-analytics": {
    entities: [
      "Weekly operations pack",
      "Monthly SLA compliance",
      "Quarterly vendor scorecard",
      "Audit extract",
      "Asset depreciation report",
    ],
    statuses: ["Ready", "Generating", "Scheduled", "Failed"],
  },
  "security-audit": {
    entities: [
      "admin@acmetech.io",
      "sre.lead@acmetech.io",
      "auditor@acmetech.io",
      "field.agent@acmetech.io",
      "svc.integration@acmetech.io",
    ],
    statuses: ["Allowed", "Blocked", "Challenged"],
  },
  "organization-settings": {
    entities: ["Default ticket priority", "Default assignment group", "Ticket numbering", "Upload limit"],
    statuses: ["Configured", "Default", "Overridden"],
  },
  "help-support": {
    entities: [
      "Ticket #1042 – SSO setup",
      "Ticket #1038 – Export failing",
      "Ticket #1031 – Add user batch",
      "Ticket #1024 – API rate limits",
    ],
    statuses: ["Open", "Awaiting you", "Resolved"],
  },
  "my-account": {
    entities: ["Sign-in – Chrome, macOS", "Sign-in – iPhone app", "API token – laptop script"],
    statuses: ["Active", "Expired", "Revoked"],
  },
  customers: {
    entities: ["Northwind Traders", "Contoso Ltd", "Fabrikam Inc"],
    statuses: ["Active", "Inactive"],
  },
};

function poolFor(sectionKey: string): SectionPool {
  return (
    SECTION_POOLS[sectionKey] ?? {
      entities: ["Record A", "Record B", "Record C", "Record D"],
      statuses: ["Active", "Inactive"],
    }
  );
}

/* ------------------------------------------------------------------ */
/* Kind resolution                                                     */
/* ------------------------------------------------------------------ */

function resolveKind(title: string): OrganizationAdminPageKind {
  const t = title.toLowerCase();
  if (t.includes("designer")) return "workflow";
  if (t.includes("matrix")) return "matrix";
  if (
    /^(create|invite|edit|clone|add)\b/.test(t) ||
    /^(request a|report a)\b/.test(t) ||
    t === "contact platform support" ||
    /import$/i.test(title)
  ) {
    return "form";
  }
  if (/calendar$/i.test(title) && !/calendars$/i.test(title)) return "calendar";
  if (/settings|preferences|configuration|policies|enforcement|rules|options|controls/.test(t)) {
    return "settings";
  }
  if (/history|logs|\bactivity\b|deliveries|attempts|runs|timeline/.test(t)) return "activity";
  if (/report|analytics|usage|performance|compliance/.test(t)) return "report";
  if (/overview|dashboard|summary|health|\bhome\b|service status/.test(t)) return "dashboard";
  return "list";
}

/* ------------------------------------------------------------------ */
/* Content builders                                                    */
/* ------------------------------------------------------------------ */

function buildStats(title: string, sectionKey: string): OrganizationAdminStat[] {
  const pool = poolFor(sectionKey);
  const seed = title.length + sectionKey.length;
  const open = 8 + (seed % 23);
  return [
    { label: "Open", value: String(open), hint: "last 7 days" },
    { label: "In progress", value: String(Math.max(2, open - 5 - (seed % 4))) },
    { label: "Resolved (30d)", value: String(40 + (seed % 60)) },
    { label: "SLA met", value: `${90 + (seed % 9)}%` },
    { label: "Awaiting action", value: String(1 + (seed % 7)), hint: "needs you" },
    { label: "Last updated", value: TIMES[seed % TIMES.length] },
  ].slice(0, 4 + (seed % 3));
}

function buildTable(title: string, sectionKey: string): OrganizationAdminTableModel {
  const pool = poolFor(sectionKey);
  const t = title.toLowerCase();
  let columns: string[];
  if (/contacts|members|people|users|staff/.test(t)) {
    columns = ["Name", "Role", "Email", "Status", "Updated"];
  } else if (/logs|history|activity|attempts|deliveries|runs/.test(t)) {
    columns = ["Event", "Actor", "When", "Result"];
  } else if (/schedules|rotations|windows|coverage/.test(t)) {
    columns = ["Schedule", "Primary", "Secondary", "Effective", "Status"];
  } else if (/codes|categories|types|classes/.test(t)) {
    columns = ["Name", "Type", "Items", "Status", "Updated"];
  } else {
    columns = ["Name", "Status", "Owner", "Updated"];
  }

  const rows = pool.entities.slice(0, 6).map((entity, index) => ({
    cells:
      columns.length === 5 && columns[1] === "Role"
        ? [
            entity,
            OWNERS[index % OWNERS.length].split(" ")[0] === entity.split(" ")[0]
              ? "Owner"
              : ["Agent", "Approver", "Author", "Viewer"][index % 4],
            `${entity.toLowerCase().replace(/[^a-z]/g, ".").slice(0, 12)}@acmetech.io`,
            pool.statuses[index % pool.statuses.length],
            TIMES[index % TIMES.length],
          ]
        : columns.length === 5 && columns[1] === "Primary"
          ? [
              entity,
              OWNERS[index % OWNERS.length],
              OWNERS[(index + 2) % OWNERS.length],
              ["Mon–Fri", "Week A", "24×7", "On escalation"][index % 4],
              pool.statuses[index % pool.statuses.length],
            ]
          : columns.length === 4 && columns[1] === "Actor"
            ? [
                `${entity} — ${["updated", "signed in", "exported", "approved", "closed"][index % 5]}`,
                OWNERS[index % OWNERS.length],
                TIMES[index % TIMES.length],
                ["Success", "Success", "Warning", "Success"][index % 4],
              ]
            : columns.length === 5 && columns[1] === "Type"
              ? [
                  entity,
                  ["Category", "Type", "Class"][index % 3],
                  String(2 + ((index * 7) % 40)),
                  pool.statuses[index % pool.statuses.length],
                  TIMES[index % TIMES.length],
                ]
              : [
                  entity,
                  pool.statuses[index % pool.statuses.length],
                  OWNERS[index % OWNERS.length],
                  TIMES[index % TIMES.length],
                ],
  }));

  return { columns, rows };
}

function buildFields(title: string): OrganizationAdminFieldModel[] {
  const t = title.toLowerCase();
  const DEPARTMENTS = ["IT Operations", "Finance", "Facilities", "Human Resources", "Engineering"];
  const YES_NO = ["Yes", "No"];

  if (/password/.test(t)) {
    return [
      { label: "Current password", type: "password" },
      { label: "New password", type: "password" },
      { label: "Confirm new password", type: "password" },
    ];
  }
  if (/profile|user|invite/.test(t)) {
    return [
      { label: "Full name", type: "text", placeholder: "Jane Cooper" },
      { label: "Email", type: "email", placeholder: "jane.cooper@acmetech.io" },
      { label: "Job title", type: "text", placeholder: "Service Desk Analyst" },
      { label: "Department", type: "select", options: DEPARTMENTS },
      { label: "Role", type: "select", options: ["Service Desk Agent", "Incident Manager", "Change Approver", "Viewer"] },
      { label: "Send invitation email", type: "select", options: YES_NO },
    ];
  }
  if (/vendor/.test(t)) {
    return [
      { label: "Vendor name", type: "text", placeholder: "Contoso Facilities Ltd" },
      { label: "Vendor code", type: "text", placeholder: "VND-0142" },
      { label: "Category", type: "select", options: ["Facilities", "Hardware", "Logistics", "Security", "Telecom"] },
      { label: "Primary contact", type: "text" },
      { label: "Contact email", type: "email" },
      { label: "SLA tier", type: "select", options: ["Tier 1 – Critical", "Tier 2 – Standard", "Tier 3 – Best effort"] },
      { label: "Notes", type: "textarea", span: 2 },
    ];
  }
  if (/api key|credential|token/.test(t)) {
    return [
      { label: "Key name", type: "text", placeholder: "CI pipeline" },
      { label: "Scopes", type: "select", options: ["Read only", "Read + write", "Admin"] },
      { label: "Expiration", type: "select", options: ["30 days", "90 days", "1 year", "No expiration"] },
      { label: "IP allowlist", type: "text", placeholder: "10.0.0.0/8, 203.0.113.4" },
    ];
  }
  if (/team/.test(t)) {
    return [
      { label: "Team name", type: "text", placeholder: "Platform SRE" },
      { label: "Team lead", type: "select", options: OWNERS },
      { label: "Default queue", type: "select", options: ["Tier 1", "Tier 2", "Platform", "Field"] },
      { label: "Description", type: "textarea", span: 2 },
    ];
  }
  if (/role/.test(t)) {
    return [
      { label: "Role name", type: "text", placeholder: "Incident Manager" },
      { label: "Permission template", type: "select", options: ["Service Desk", "Operations", "Read only", "Blank"] },
      { label: "Description", type: "textarea", span: 2 },
    ];
  }
  if (/article|knowledge|announcement/.test(t)) {
    return [
      { label: "Title", type: "text", placeholder: "VPN troubleshooting guide" },
      { label: "Audience / knowledge base", type: "select", options: ["Employees", "Service desk", "Vendors", "Public"] },
      { label: "Category", type: "select", options: ["How-to", "Policy", "Reference", "Troubleshooting"] },
      { label: "Author", type: "select", options: OWNERS },
      { label: "Body", type: "textarea", span: 2 },
    ];
  }
  if (/workflow|automation|rule|trigger/.test(t)) {
    return [
      { label: "Name", type: "text", placeholder: "Auto-assign P1 incidents" },
      { label: "Trigger", type: "select", options: ["Record created", "Record updated", "Schedule", "SLA breach"] },
      { label: "Applies to", type: "select", options: ["Incidents", "Changes", "Requests", "Problems"] },
      { label: "Condition", type: "text", placeholder: 'priority == "Critical"' },
      { label: "Description", type: "textarea", span: 2 },
    ];
  }
  if (/catalog item|service/.test(t)) {
    return [
      { label: "Item name", type: "text", placeholder: "Laptop Provisioning" },
      { label: "Category", type: "select", options: ["Hardware", "Software", "Access", "Facilities"] },
      { label: "Fulfilment group", type: "select", options: ["Tier 1 Support", "Field Service", "Database Admins"] },
      { label: "Estimated time", type: "select", options: ["1 business day", "3 business days", "1 week"] },
      { label: "Description", type: "textarea", span: 2 },
    ];
  }
  if (/calendar|window|blackout|schedule/.test(t)) {
    return [
      { label: "Name", type: "text", placeholder: "Month-end freeze" },
      { label: "Start", type: "text", placeholder: "2026-10-30 18:00" },
      { label: "End", type: "text", placeholder: "2026-11-02 08:00" },
      { label: "Timezone", type: "select", options: ["UTC", "Asia/Kolkata", "Europe/Berlin", "America/New_York"] },
      { label: "Notes", type: "textarea", span: 2 },
    ];
  }
  if (/report|export|builder/.test(t)) {
    return [
      { label: "Report name", type: "text", placeholder: "Weekly operations pack" },
      { label: "Dataset", type: "select", options: ["Incidents", "Changes", "Requests", "SLA", "Assets"] },
      { label: "Grouping", type: "select", options: ["None", "Department", "Priority", "Assignment group"] },
      { label: "Schedule", type: "select", options: ["Once", "Daily", "Weekly", "Monthly"] },
      { label: "Recipients", type: "text", placeholder: "ops-leads@acmetech.io" },
      { label: "Filters", type: "textarea", span: 2, placeholder: "status not in (Closed) AND priority >= High" },
    ];
  }
  return [
    { label: "Name", type: "text", placeholder: title },
    { label: "Code", type: "text", placeholder: "ORG-001" },
    { label: "Owner", type: "select", options: OWNERS },
    { label: "Status", type: "select", options: ["Active", "Inactive", "Draft"] },
    { label: "Description", type: "textarea", span: 2 },
  ];
}

function buildActivity(title: string, sectionKey: string): OrganizationAdminActivityEntry[] {
  const pool = poolFor(sectionKey);
  const verbs = ["updated", "approved", "closed", "reassigned", "commented on", "exported"];
  return pool.entities.slice(0, 6).map((entity, index) => ({
    title: `${entity} — ${verbs[index % verbs.length]}`,
    actor: OWNERS[(index + 1) % OWNERS.length],
    time: TIMES[index % TIMES.length],
    status: ["Success", "Success", "Warning", "Success", "Success", "Failed"][index % 6],
  }));
}

function buildSettingsGroups(title: string): OrganizationAdminSettingsGroup[] {
  const t = title.toLowerCase();
  if (/password/.test(t)) {
    return [
      {
        title: "Length & complexity",
        rows: [
          { label: "Minimum 12 characters", control: "toggle", defaultOn: true },
          { label: "Require mixed case and digits", control: "toggle", defaultOn: true },
          { label: "Allow common-password blocklist", control: "toggle", defaultOn: true },
        ],
      },
      {
        title: "Expiry & history",
        rows: [
          { label: "Expire after", control: "select", options: ["30 days", "90 days", "180 days", "Never"], value: "90 days" },
          { label: "Remember last 5 passwords", control: "toggle", defaultOn: true },
        ],
      },
      {
        title: "Lockout",
        rows: [
          { label: "Lock after failed attempts", control: "text", value: "5" },
          { label: "Lock duration", control: "select", options: ["15 minutes", "1 hour", "Until unlock"], value: "1 hour" },
        ],
      },
    ];
  }
  if (/mfa|multi-factor/.test(t)) {
    return [
      {
        title: "Enforcement",
        rows: [
          { label: "Require MFA for all users", control: "toggle", defaultOn: true },
          { label: "Require MFA for administrators", control: "toggle", defaultOn: true },
          { label: "Allow remember-device (14 days)", control: "toggle", defaultOn: false },
        ],
      },
      {
        title: "Methods",
        rows: [
          { label: "Authenticator app (TOTP)", control: "toggle", defaultOn: true },
          { label: "SMS", control: "toggle", defaultOn: false },
          { label: "Security key (WebAuthn)", control: "toggle", defaultOn: true },
        ],
      },
    ];
  }
  if (/notification|preference/.test(t)) {
    return [
      {
        title: "Channels",
        rows: [
          { label: "Email", control: "toggle", defaultOn: true },
          { label: "In-app", control: "toggle", defaultOn: true },
          { label: "SMS", control: "toggle", defaultOn: false },
          { label: "Mobile push", control: "toggle", defaultOn: true },
        ],
      },
      {
        title: "Digest",
        rows: [
          { label: "Weekly summary", control: "toggle", defaultOn: true },
          { label: "Quiet hours", control: "select", options: ["None", "20:00–07:00", "Weekends"], value: "20:00–07:00" },
        ],
      },
    ];
  }
  return [
    {
      title: "General",
      rows: [
        { label: "Enabled", control: "toggle", defaultOn: true },
        { label: "Apply to new records automatically", control: "toggle", defaultOn: false },
        { label: "Display name", control: "text", value: title },
      ],
    },
    {
      title: "Notifications",
      rows: [
        { label: "Notify owner on change", control: "toggle", defaultOn: true },
        { label: "Escalate on inactivity", control: "select", options: ["Never", "24 hours", "48 hours", "72 hours"], value: "48 hours" },
      ],
    },
    {
      title: "Advanced",
      rows: [
        { label: "Mode", control: "select", options: ["Enforced", "Advisory", "Disabled"], value: "Enforced" },
        { label: "Retention", control: "select", options: ["30 days", "90 days", "1 year", "Indefinite"], value: "1 year" },
      ],
    },
  ];
}

function buildCalendarEvents(title: string, sectionKey: string): OrganizationAdminCalendarEvent[] {
  const pool = poolFor(sectionKey);
  const tones: Array<OrganizationAdminCalendarEvent["tone"]> = ["blue", "amber", "emerald", "rose"];
  return [3, 9, 15, 21, 27].map((day, index) => ({
    day,
    label: pool.entities[index % pool.entities.length],
    tone: tones[index % tones.length],
  }));
}

/* ------------------------------------------------------------------ */
/* Curated overrides (route key → hand-tuned model fragments)          */
/* ------------------------------------------------------------------ */

interface CuratedOverride {
  kind?: OrganizationAdminPageKind;
  primaryAction?: string;
  secondaryActions?: string[];
  stats?: OrganizationAdminStat[];
  table?: OrganizationAdminTableModel;
  fields?: OrganizationAdminFieldModel[];
  calendarEvents?: OrganizationAdminCalendarEvent[];
  workflowNodes?: string[];
}

const CURATED: Record<string, CuratedOverride> = {
  "dashboard/organization-overview": {
    kind: "dashboard",
    primaryAction: "Create ticket",
    secondaryActions: ["New request", "Raise change"],
    stats: [
      { label: "Open incidents", value: "23", hint: "4 critical" },
      { label: "Open requests", value: "17" },
      { label: "SLA compliance (30d)", value: "96.4%", hint: "+1.2% vs last month" },
      { label: "Pending approvals", value: "5", hint: "2 overdue" },
      { label: "Active users", value: "148" },
      { label: "Assets in service", value: "312" },
    ],
  },
  "dashboard/operational-summary": {
    stats: [
      { label: "Tickets today", value: "31" },
      { label: "Closed today", value: "24" },
      { label: "First-contact resolution", value: "68%" },
      { label: "Backlog trend", value: "▼ 6%" },
    ],
  },
  "dashboard/my-tasks-approvals": {
    kind: "list",
    primaryAction: "Bulk approve",
    table: {
      columns: ["Type", "Record", "Requested by", "Waiting since", "Status"],
      rows: [
        { cells: ["Change", "CHG-2087 – PostgreSQL 16.3 upgrade", "Elena Kovacs", "2 days ago", "Pending approval"] },
        { cells: ["Access", "Finance app elevation – Liam Chen", "Tom Whitfield", "1 day ago", "Pending approval"] },
        { cells: ["Purchase", "10× USB-C docks – Field Service", "Aisha Rahman", "4 hours ago", "Pending approval"] },
        { cells: ["Change", "CHG-2074 – TLS cert renewal", "Marcus Webb", "6 hours ago", "Pending approval"] },
        { cells: ["Request", "REQ-8829 – Finance app access", "Sofia Reyes", "3 days ago", "Escalated"] },
      ],
    },
  },
  "dashboard/change-calendar": { kind: "calendar" },
  "dashboard/overdue-and-breached-slas": {
    kind: "list",
    table: {
      columns: ["Ticket", "SLA", "Target", "Breached by", "Owner"],
      rows: [
        { cells: ["INC-10409", "P1 – 4h resolution", "Oct 17, 14:00", "19 hours", "Marcus Webb"] },
        { cells: ["REQ-8829", "Standard request – 24h", "Oct 18, 09:00", "5 hours", "Priya Nair"] },
        { cells: ["INC-10398", "P2 – 8h resolution", "Oct 18, 11:30", "2 hours", "Elena Kovacs"] },
        { cells: ["CHG-2066", "Critical change – 30m ack", "Oct 16, 18:00", "2 days", "Tom Whitfield"] },
      ],
    },
  },
  "dashboard/team-workload": {
    kind: "list",
    table: {
      columns: ["Team", "Open", "In progress", "Oldest waiting", "Capacity"],
      rows: [
        { cells: ["Tier 1 Support", "41", "12", "3 days", "82%"] },
        { cells: ["Platform SRE", "18", "9", "1 day", "64%"] },
        { cells: ["Network Ops", "9", "4", "6 hours", "47%"] },
        { cells: ["Field Service", "22", "7", "2 days", "91%"] },
        { cells: ["Database Admins", "6", "3", "4 hours", "38%"] },
      ],
    },
  },
  "service-desk/service-desk-overview": {
    stats: [
      { label: "Open tickets", value: "64" },
      { label: "Unassigned", value: "9", hint: "triage now" },
      { label: "Avg first response", value: "18m" },
      { label: "Reopen rate", value: "3.1%" },
    ],
  },
  "incident-management/incident-overview": {
    stats: [
      { label: "Open incidents", value: "23" },
      { label: "Major incidents", value: "1", hint: "INC-10409" },
      { label: "MTTR (30d)", value: "3h 12m" },
      { label: "Auto-resolved", value: "27%" },
    ],
  },
  "problem-management/problem-overview": {
    stats: [
      { label: "Open problems", value: "9" },
      { label: "Known errors", value: "4" },
      { label: "Avg age", value: "11 days" },
      { label: "Linked incidents", value: "58" },
    ],
  },
  "change-management/change-overview": {
    stats: [
      { label: "Open changes", value: "14" },
      { label: "Awaiting CAB", value: "3" },
      { label: "Emergency (30d)", value: "2" },
      { label: "Success rate", value: "94%" },
    ],
  },
  "change-management/change-calendar": { kind: "calendar" },
  "request-management/request-overview": {
    stats: [
      { label: "Open requests", value: "17" },
      { label: "Fulfilment SLA", value: "97%" },
      { label: "Auto-approved", value: "41%" },
      { label: "Avg cycle time", value: "6h 40m" },
    ],
  },
  "service-catalog/catalog-overview": {
    stats: [
      { label: "Published items", value: "26" },
      { label: "Drafts", value: "5" },
      { label: "Requests (30d)", value: "214" },
      { label: "Top item", value: "Laptop Provisioning" },
    ],
  },
  "knowledge-management/knowledge-overview": {
    stats: [
      { label: "Published articles", value: "87" },
      { label: "In review", value: "6" },
      { label: "Deflection rate", value: "38%" },
      { label: "Avg rating", value: "4.3 / 5" },
    ],
  },
  "sla-service-performance/sla-dashboard": {
    stats: [
      { label: "Overall compliance", value: "96.4%" },
      { label: "Breaches (30d)", value: "12" },
      { label: "At risk", value: "7", hint: "breach < 2h" },
      { label: "Paused clocks", value: "19" },
    ],
  },
  "sla-service-performance/business-calendars": {
    kind: "list",
    table: {
      columns: ["Calendar", "Timezone", "Hours", "Holidays", "Status"],
      rows: [
        { cells: ["Corporate – HQ", "Asia/Kolkata", "Mon–Fri 09:00–18:00", "14 days", "Active"] },
        { cells: ["Follow-the-sun", "UTC", "24×7", "None", "Active"] },
        { cells: ["Field service", "Europe/Berlin", "Mon–Sat 07:00–19:00", "9 days", "Active"] },
        { cells: ["Finance close", "America/New_York", "Mon–Fri 08:00–20:00", "11 days", "Seasonal"] },
      ],
    },
  },
  "workflow-automation/workflow-dashboard": {
    stats: [
      { label: "Published workflows", value: "18" },
      { label: "Runs (7d)", value: "1,204" },
      { label: "Failed runs", value: "6", hint: "3 retryable" },
      { label: "Avg duration", value: "1.8s" },
    ],
  },
  "workflow-automation/workflow-designer": {
    kind: "workflow",
    workflowNodes: ["Trigger: Incident created", "Condition: priority = Critical", "Action: Assign Tier 1", "Approval: Team lead (optional)", "Notify: Slack #sev1", "End"],
  },
  "cmdb-assets/cmdb/cmdb-overview": {
    stats: [
      { label: "Configuration items", value: "1,486" },
      { label: "Relationships", value: "4,213" },
      { label: "Data quality score", value: "91%" },
      { label: "Orphan CIs", value: "12" },
    ],
  },
  "cmdb-assets/asset-management/asset-overview": {
    stats: [
      { label: "Assets tracked", value: "642" },
      { label: "Assigned", value: "511" },
      { label: "In stock", value: "83" },
      { label: "Warranty expiring (60d)", value: "17" },
    ],
  },
  "cmdb-assets/discovery/discovery-configuration": { kind: "settings" },
  "teams-on-call/on-call-schedules": {
    kind: "list",
    table: {
      columns: ["Schedule", "Rotation", "Primary", "Secondary", "Effective"],
      rows: [
        { cells: ["Platform SRE – Primary", "1 week", "Marcus Webb", "Elena Kovacs", "Mon 09:00"] },
        { cells: ["Platform SRE – Secondary", "1 week", "Aisha Rahman", "Tom Whitfield", "Mon 09:00"] },
        { cells: ["Network Ops", "2 weeks", "Carlos Mendes", "Priya Nair", "Oct 14"] },
        { cells: ["Database Admins", "On escalation", "Priya Nair", "Marcus Webb", "Always"] },
      ],
    },
  },
  "notifications-communications/notification-overview": {
    stats: [
      { label: "Active rules", value: "34" },
      { label: "Sent (7d)", value: "8,912" },
      { label: "Delivery failures", value: "23", hint: "0.3%" },
      { label: "Templates", value: "51" },
    ],
  },
  "vendor-management/vendor-overview": {
    stats: [
      { label: "Active vendors", value: "12" },
      { label: "Contracts renewing (90d)", value: "3" },
      { label: "Open risk items", value: "2" },
      { label: "Avg performance score", value: "4.1 / 5" },
    ],
  },
  "security-audit/security-overview": {
    stats: [
      { label: "Audit events (24h)", value: "2,318" },
      { label: "Failed logins (24h)", value: "14" },
      { label: "MFA coverage", value: "97%" },
      { label: "Active sessions", value: "86" },
    ],
  },
  "help-support/help-center": {
    kind: "dashboard",
    primaryAction: "Create support ticket",
    secondaryActions: ["Documentation", "Getting started"],
    stats: [
      { label: "Your open tickets", value: "2" },
      { label: "Platform status", value: "All systems operational" },
      { label: "Avg response time", value: "4h" },
      { label: "Knowledge articles", value: "87" },
    ],
  },
  "help-support/create-support-ticket": {
    kind: "form",
    primaryAction: "Submit ticket",
    fields: [
      { label: "Subject", type: "text", placeholder: "Short summary of the problem" },
      { label: "Category", type: "select", options: ["Access", "Billing", "Integration", "Bug", "How-to"] },
      { label: "Severity", type: "select", options: ["Low", "Medium", "High", "Blocking"] },
      { label: "Description", type: "textarea", span: 2 },
    ],
  },
  "organization-users/user-management/all-users": {
    kind: "list",
    primaryAction: "Invite user",
    table: {
      columns: ["Name", "Email", "Department", "Role", "Status", "Last login"],
      rows: [
        { cells: ["Priya Nair", "priya.nair@acmetech.io", "IT Operations", "Incident Manager", "Active", "12 minutes ago"] },
        { cells: ["Marcus Webb", "marcus.webb@acmetech.io", "Platform", "Service Desk Agent", "Active", "1 hour ago"] },
        { cells: ["Sofia Reyes", "sofia.reyes@acmetech.io", "Finance", "Viewer", "Active", "Yesterday"] },
        { cells: ["Liam Chen", "liam.chen@acmetech.io", "Engineering", "Change Approver", "Invited", "Never"] },
        { cells: ["Fatima Zahra", "fatima.zahra@acmetech.io", "Facilities", "Service Desk Agent", "Suspended", "Oct 2, 2026"] },
        { cells: ["Noah Patel", "noah.patel@acmetech.io", "HR", "Knowledge Author", "Active", "3 hours ago"] },
      ],
    },
  },
  "roles-access-control/roles/permission-catalog": {
    kind: "matrix",
  },
  "my-account/my-profile": {
    kind: "form",
    primaryAction: "Save profile",
    fields: [
      { label: "Full name", type: "text", placeholder: "Organization Admin" },
      { label: "Email", type: "email", placeholder: "admin@acmetech.io" },
      { label: "Phone", type: "text", placeholder: "+91 98765 43210" },
      { label: "Job title", type: "text", placeholder: "Organization Administrator" },
      { label: "Department", type: "select", options: ["IT Operations", "Finance", "Facilities", "Human Resources", "Engineering"] },
      { label: "Timezone", type: "select", options: ["Asia/Kolkata", "UTC", "Europe/Berlin", "America/New_York"] },
    ],
  },
  "my-account/change-password": { primaryAction: "Update password" },
  "my-account/mfa-settings": { kind: "settings" },
  "my-account/active-sessions": {
    kind: "list",
    primaryAction: "Sign out all other sessions",
    table: {
      columns: ["Device", "Location", "IP", "Last active", "Status"],
      rows: [
        { cells: ["Chrome on macOS", "Bengaluru, IN", "10.24.8.11", "Active now", "Active"] },
        { cells: ["iPhone app", "Bengaluru, IN", "10.24.9.87", "2 hours ago", "Active"] },
        { cells: ["Firefox on Windows", "Pune, IN", "10.30.2.44", "Oct 11, 2026", "Expired"] },
      ],
    },
  },
  "organization-settings/organization-profile": {
    kind: "form",
    primaryAction: "Save profile",
    fields: [
      { label: "Organization name", type: "text", placeholder: "Acme Technologies" },
      { label: "Short code", type: "text", placeholder: "acmetech" },
      { label: "Primary contact email", type: "email", placeholder: "it-help@acmetech.io" },
      { label: "Support phone", type: "text" },
      { label: "Default timezone", type: "select", options: ["Asia/Kolkata", "UTC", "Europe/Berlin", "America/New_York"] },
      { label: "Default language", type: "select", options: ["English (UK)", "English (US)", "Hindi", "German"] },
      { label: "Address", type: "textarea", span: 2 },
    ],
  },
  "reports-analytics/custom-report-builder": {
    kind: "form",
    primaryAction: "Run report",
    secondaryActions: ["Save as template"],
  },
};

/* ------------------------------------------------------------------ */
/* Public resolver                                                     */
/* ------------------------------------------------------------------ */

export interface OrganizationAdminPageInput {
  sectionKey: string;
  title: string;
  description: string;
  /** Path relative to /organization, e.g. "incident-management/all-incidents". */
  routeKey: string;
}

export function resolveOrganizationAdminPageModel(
  input: OrganizationAdminPageInput,
): Required<Pick<OrganizationAdminPageModel, "kind">> & OrganizationAdminPageModel {
  const curated = CURATED[input.routeKey];
  const kind = curated?.kind ?? resolveKind(input.title);

  const model: OrganizationAdminPageModel = { kind };

  model.primaryAction = curated?.primaryAction ?? derivePrimaryAction(kind, input.title);
  model.secondaryActions = curated?.secondaryActions;

  const createRoute = CREATE_ROUTE_BY_SECTION[input.sectionKey];
  if (createRoute && kind !== "form") {
    model.createHref = createRoute;
  }
  if (input.routeKey === "dashboard/organization-overview") {
    model.createHref = "/organization/help-support/create-support-ticket";
  }

  if (kind === "dashboard") {
    model.stats = curated?.stats ?? buildStats(input.title, input.sectionKey);
    model.activity = buildActivity(input.title, input.sectionKey);
  } else if (kind === "list") {
    model.table = curated?.table ?? buildTable(input.title, input.sectionKey);
  } else if (kind === "form") {
    model.fields = curated?.fields ?? buildFields(input.title);
  } else if (kind === "settings") {
    model.settingsGroups = buildSettingsGroups(input.title);
  } else if (kind === "report") {
    model.stats = curated?.stats ?? buildStats(input.title, input.sectionKey).slice(0, 4);
    model.table = buildTable(input.title, input.sectionKey);
    model.reportSeries = [64, 82, 48, 91, 73, 58, 86, 77, 69, 94, 61, 88];
  } else if (kind === "calendar") {
    model.calendarEvents = curated?.calendarEvents ?? buildCalendarEvents(input.title, input.sectionKey);
  } else if (kind === "activity") {
    model.activity = buildActivity(input.title, input.sectionKey);
    model.table = buildTable(input.title, input.sectionKey);
  } else if (kind === "matrix") {
    model.table = buildMatrix(input.title, input.sectionKey);
  } else if (kind === "workflow") {
    model.workflowNodes = curated?.workflowNodes ?? [
      "Trigger: record created",
      "Condition: matches rules",
      "Action: assign group",
      "Approval: optional",
      "Notify: owner",
      "End",
    ];
  }

  if (curated) {
    model.stats = curated.stats ?? model.stats;
    model.table = curated.table ?? model.table;
    model.fields = curated.fields ?? model.fields;
    model.calendarEvents = curated.calendarEvents ?? model.calendarEvents;
    model.workflowNodes = curated.workflowNodes ?? model.workflowNodes;
    if (curated.primaryAction) model.primaryAction = curated.primaryAction;
    if (curated.secondaryActions) model.secondaryActions = curated.secondaryActions;
  }

  return { ...model, kind };
}

function derivePrimaryAction(kind: OrganizationAdminPageKind, title: string): string | undefined {
  const t = title.toLowerCase();
  if (kind === "form") return /save|update|change/.test(t) ? "Save changes" : "Submit";
  if (kind === "list") return `New ${t.replace(/^all\s+/, "").replace(/s$/, "")}`;
  if (kind === "settings") return "Save settings";
  if (kind === "report") return "Export CSV";
  if (kind === "calendar") return "New window";
  if (kind === "matrix") return "Edit matrix";
  if (kind === "workflow") return "Save draft";
  return undefined;
}

function buildMatrix(title: string, sectionKey: string): OrganizationAdminTableModel {
  const pool = poolFor(sectionKey);
  const columns = ["Create", "Read", "Update", "Delete", "Export"];
  const rows = pool.entities.slice(0, 6).map((entity, rowIndex) => ({
    cells: [entity, ...columns.map((_, colIndex) => ((rowIndex + colIndex) % 4 === 3 ? "—" : "✓"))],
  }));
  return { columns, rows };
}

/** Section + item labels for the first table column header of matrix pages. */
export function matrixRowHeader(sectionKey: string): string {
  return sectionKey === "roles-access-control" ? "Module" : "Record";
}
