import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";

export type EnterpriseOperationRoute = ScreenDefinition & { group: string };
type OperationModule = { key: string; title: string; screens: readonly string[] };
type OperationSuite = { phase: number; slug: string; title: string; modules: readonly OperationModule[] };

const operationSuites: readonly OperationSuite[] = [
  { phase: 11, slug: "assignment", title: "Assignment, Routing, Skills & Queues", modules: [
    { key: "assignment", title: "Assignment", screens: ["Assignment Home", "Assignment History", "Reassignment", "Assignment Suggestions"] },
    { key: "routing-rules", title: "Routing Rules", screens: ["Routing Rules", "Create Routing Rule", "Routing Rule Record", "Rule Conditions", "Rule Priority", "Target Group", "Target Agent", "Fallback", "Routing Test"] },
    { key: "queues", title: "Queues", screens: ["Queue Home", "Unassigned Queue", "Group Queue", "Personal Queue", "SLA-Risk Queue", "Escalated Queue", "Queue Record"] },
    { key: "skills", title: "Skills", screens: ["Skills", "Create Skill", "Skill Record", "User Skills", "Group Skills", "Skill Matching"] },
    { key: "capacity", title: "Capacity", screens: ["Capacity Dashboard", "Agent Capacity", "Group Capacity", "Capacity Rules"] },
    { key: "availability", title: "Availability", screens: ["Agent Availability", "Group Availability", "Availability Overrides"] },
  ] },
  { phase: 12, slug: "approvals", title: "Approval Management", modules: [
    { key: "inbox", title: "Approval Inbox", screens: ["Approval Inbox", "My Pending Approvals", "Group Approvals", "Completed Approvals", "Rejected Approvals", "Cancelled Approvals"] },
    { key: "record", title: "Approval Record", screens: ["Approval Record", "Source Context", "Approval History", "Comments", "Approve", "Reject", "Request More Information"] },
    { key: "policies", title: "Approval Policies", screens: ["Approval Policies", "Create Approval Policy", "Policy Builder", "Any-of", "All-of", "Sequential", "Group", "Conditional", "Policy Test"] },
    { key: "delegation", title: "Delegation", screens: ["Approval Delegations", "Create Delegation", "Delegation Record"] },
    { key: "escalation", title: "Escalation", screens: ["Approval Timeouts", "Approval Escalations", "Escalation History"] },
  ] },
  { phase: 13, slug: "cmdb", title: "Configuration Management Database", modules: [
    { key: "home", title: "CMDB Home", screens: ["CMDB Home", "CMDB Dashboard", "CI Search"] },
    { key: "cis", title: "Configuration Items", screens: ["All CIs", "Create CI", "CI Record", "CI Overview", "CI Identification", "CI Classification", "CI Ownership", "CI Support", "CI Location", "CI Lifecycle", "CI History"] },
    { key: "classes", title: "Class Management", screens: ["CI Classes", "Class Hierarchy", "Create CI Class", "CI Class Record", "Class Attributes", "Class Rules"] },
    { key: "relationships", title: "Relationships", screens: ["CI Relationships", "Relationship Editor", "Upstream", "Downstream", "Dependency View", "Relationship Types"] },
    { key: "health", title: "Health", screens: ["CMDB Health", "Completeness", "Correctness", "Compliance", "Health Details"] },
    { key: "duplicates", title: "Duplicates", screens: ["Duplicate CIs", "Duplicate Cluster", "Duplicate Resolution", "Merge Review"] },
    { key: "identification", title: "Identification", screens: ["Identification Rules", "Create Identification Rule", "Identification Rule Record", "Identification Simulation"] },
    { key: "reconciliation", title: "Reconciliation", screens: ["Reconciliation Rules", "Create Reconciliation Rule", "Reconciliation Rule Record", "Reconciliation Results"] },
    { key: "data-sources", title: "Data Sources", screens: ["CMDB Data Sources", "Data Source Record", "Import Results", "Source History"] },
    { key: "certification", title: "Certification", screens: ["CI Certification", "Certification Campaign", "Certification Task", "Certification Results"] },
    { key: "lifecycle", title: "Lifecycle", screens: ["Planned CIs", "Operational CIs", "Maintenance CIs", "Retired CIs", "Archived CIs"] },
    { key: "configuration", title: "Configuration", screens: ["CI Statuses", "Relationship Types", "CMDB Properties", "CMDB Audit"] },
  ] },
  { phase: 14, slug: "services", title: "CSDM & Service Portfolio", modules: [
    { key: "foundation", title: "CSDM Foundation", screens: ["CSDM Home", "CSDM Domain View", "CSDM Relationship View", "CSDM Validation"] },
    { key: "business-services", title: "Business Services", screens: ["Business Services", "Create Business Service", "Business Service Record"] },
    { key: "technical-services", title: "Technical Services", screens: ["Technical Services", "Create Technical Service", "Technical Service Record"] },
    { key: "service-offerings", title: "Service Offerings", screens: ["Service Offerings", "Create Service Offering", "Service Offering Record"] },
    { key: "application-services", title: "Application Services", screens: ["Application Services", "Application Service Record"] },
    { key: "relationships", title: "Service Relationships", screens: ["Supporting CIs", "Dependent Services", "Service Relationship Editor"] },
    { key: "ownership", title: "Ownership", screens: ["Service Owners", "Service Support Groups", "Service Stakeholders"] },
    { key: "health", title: "Service Health", screens: ["Service Status", "Service KPI", "Service Incidents", "Service Problems", "Service Changes", "Service Outages", "Service SLA"] },
    { key: "owner-workspace", title: "Service Owner Workspace", screens: ["Service Owner Home", "My Services", "Service Workspace", "Service Performance", "Service Risks", "Service Improvements"] },
  ] },
  { phase: 15, slug: "assets", title: "Asset & Cost Management", modules: [
    { key: "assets", title: "Assets", screens: ["Asset Home", "All Assets", "My Assets", "Unassigned Assets", "Assets by User", "Assets by Location", "Create Asset", "Asset Record"] },
    { key: "models", title: "Asset Models", screens: ["Asset Models", "Create Model", "Model Record", "Model Categories"] },
    { key: "stockrooms", title: "Stockrooms", screens: ["Stockrooms", "Create Stockroom", "Stockroom Record", "Stockroom Inventory"] },
    { key: "inventory", title: "Inventory", screens: ["Inventory Home", "Inventory by Location", "Inventory by Model", "Inventory Exceptions"] },
    { key: "transfers", title: "Transfers", screens: ["Asset Transfers", "Create Transfer", "Transfer Order", "Transfer Lines", "Ship Transfer", "Receive Transfer"] },
    { key: "assignment", title: "Asset Assignment", screens: ["Assign Asset", "Return Asset", "Swap Asset", "Asset Assignment History"] },
    { key: "lifecycle", title: "Asset Lifecycle", screens: ["On Order Assets", "In Stock Assets", "In Use Assets", "In Maintenance Assets", "Retired Assets", "Disposed Assets", "Asset Disposal"] },
    { key: "audit", title: "Asset Audit", screens: ["Asset Audits", "Create Audit", "Audit Tasks", "Scan / Verify Asset", "Audit Results", "Asset Exceptions"] },
    { key: "cost", title: "Cost Management", screens: ["Cost Home", "Cost Centers", "Cost Center Record", "Cost Records", "Asset Costs", "Service Costs", "Cost Allocation", "Cost Reports"] },
    { key: "configuration", title: "Configuration", screens: ["Asset States", "Asset Substates", "Model Categories", "Stockroom Configuration", "Asset Properties"] },
  ] },
  { phase: 16, slug: "outages", title: "Outage & Service Status", modules: [
    { key: "outages", title: "Outages", screens: ["Outage Home", "Active Outages", "Planned Outages", "Resolved Outages", "Closed Outages", "Create Outage", "Outage Record"] },
    { key: "impact", title: "Outage Impact", screens: ["Affected Service", "Affected CI", "Affected Users / Locations", "Impact Timeline"] },
    { key: "relationships", title: "Outage Relationships", screens: ["Related Incidents", "Major Incident", "Related Change"] },
    { key: "communications", title: "Communications", screens: ["Outage Communication", "Stakeholder Update", "Communication History"] },
    { key: "status", title: "Service Status", screens: ["Service Status Home", "Current Status", "Planned Maintenance", "Service Status Detail", "Requester Status Page"] },
    { key: "configuration", title: "Configuration", screens: ["Outage Types", "Outage States", "Outage Notifications", "Service Status Configuration"] },
  ] },
  { phase: 17, slug: "on-call", title: "On-Call Management", modules: [
    { key: "schedules", title: "Schedules", screens: ["On-Call Home", "On-Call Schedules", "Create Schedule", "Schedule Builder", "Schedule Record"] },
    { key: "rotations", title: "Rotations", screens: ["Rotations", "Create Rotation", "Rotation Record", "Rotation Members"] },
    { key: "rosters", title: "Rosters", screens: ["Rosters", "Roster Record", "Roster Calendar"] },
    { key: "overrides", title: "Overrides", screens: ["Overrides", "Create Override", "Override Record"] },
    { key: "coverage", title: "Coverage", screens: ["Who Is On Call", "My On-Call", "Coverage Gaps", "Coverage Calendar"] },
    { key: "escalation", title: "Escalation Policies", screens: ["Escalation Policies", "Create Policy", "Policy Builder", "Escalation Levels", "Acknowledgements", "Fallback"] },
    { key: "configuration", title: "Configuration", screens: ["Contact Methods", "Handoff Rules", "On-Call Notifications", "On-Call Properties"] },
  ] },
  { phase: 18, slug: "walk-up", title: "Walk-Up Experience", modules: [
    { key: "queue", title: "Queue", screens: ["Walk-Up Home", "Open Queue", "My Assigned Walk-Ups", "Unassigned Walk-Ups", "Closed Walk-Ups", "Walk-Up Interaction"] },
    { key: "appointments", title: "Appointments", screens: ["Appointments", "Book Appointment", "Appointment Record", "Reschedule", "Cancel Appointment", "Check-In", "No-Show"] },
    { key: "locations", title: "Locations", screens: ["Walk-Up Locations", "Create Location", "Location Record", "Hours", "Services Offered"] },
    { key: "kiosks", title: "Kiosks", screens: ["Kiosks", "Kiosk Record", "Kiosk Check-In", "Kiosk Configuration"] },
    { key: "stock", title: "Stock", screens: ["Walk-Up Stock", "Available Items", "Fulfill from Stock", "Stock Transaction"] },
    { key: "configuration", title: "Configuration", screens: ["Queue Rules", "Appointment Slots", "Walk-Up Notifications", "Walk-Up Properties"] },
  ] },
  { phase: 19, slug: "portfolio", title: "Digital Portfolio Management", modules: [
    { key: "portfolio", title: "Portfolio", screens: ["Digital Portfolio Home", "Portfolio Hierarchy", "Portfolio List", "Portfolio Record"] },
    { key: "items", title: "Portfolio Items", screens: ["Portfolio Items", "Portfolio Item Record", "Application / Service View", "Lifecycle View"] },
    { key: "investment", title: "Investment", screens: ["Investment Overview", "Cost View", "Value View", "Investment Comparison"] },
    { key: "health", title: "Health", screens: ["Portfolio Health", "Risk View", "Performance View", "Technology Health"] },
    { key: "roadmap", title: "Roadmap View", screens: ["Portfolio Roadmap", "Lifecycle Timeline"] },
    { key: "owner", title: "Service Owner", screens: ["Service Owner Workspace", "My Services / Applications", "Owner Actions", "Owner Insights"] },
    { key: "configuration", title: "Configuration", screens: ["Portfolio Types", "Lifecycle States", "Portfolio Metrics"] },
  ] },
  { phase: 20, slug: "releases", title: "Release Management", modules: [
    { key: "releases", title: "Release Management", screens: ["Release Home", "Planned Releases", "Active Releases", "Completed Releases", "Failed Releases", "Rolled-Back Releases", "Create Release", "Release Record"] },
    { key: "planning", title: "Release Planning", screens: ["Scope", "Release Items", "Dependencies", "Schedule", "Readiness", "Risks"] },
    { key: "tasks", title: "Release Tasks", screens: ["Release Tasks", "Create Release Task", "Release Task Record"] },
    { key: "execution", title: "Execution", screens: ["Approvals", "Deployment", "Validation", "Rollback", "Release Evidence"] },
    { key: "products", title: "Digital Product Release", screens: ["DPR Home", "Products", "Product Record", "Product Releases", "Product Release Record", "Release Readiness", "Release Decision", "Release Evidence"] },
    { key: "configuration", title: "Configuration", screens: ["Release Models", "Release States", "Readiness Criteria", "Release Notifications", "DPR Policies"] },
  ] },
  { phase: 31, slug: "process-mining", title: "Process Mining / Process Optimization", modules: [
    { key: "home", title: "Process Mining Home", screens: ["Process Mining Home", "Mining Jobs", "Discovered Processes", "Event Log Health"] },
    { key: "process-map", title: "Process Map", screens: ["Process Map", "Variant Explorer", "Frequency Map", "Duration Map"] },
    { key: "analysis", title: "Analysis", screens: ["Conformance Analysis", "Performance Analysis", "Bottleneck Analysis", "Root Cause Analysis"] },
    { key: "insights", title: "Insights", screens: ["Process Insights", "Automation Opportunities", "Deviation Insights", "Compliance Insights"] },
    { key: "improvement", title: "Improvement", screens: ["Improvement Register", "Create Improvement", "Improvement Record", "Improvement Impact"] },
    { key: "configuration", title: "Configuration", screens: ["Data Sources", "Mining Configuration", "Analytics Permissions", "Process Properties"] },
  ] },
] as const;

const slugify = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/\//g, "-").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const kindFor = (title: string): ScreenKind => /home|dashboard|overview|health|timeline|calendar|view$/i.test(title) ? "dashboard" : /create |book |builder|editor|reassignment|approve$|reject$|reschedule|cancel |check-in|ship |receive |assign |return |swap |disposal|test$/i.test(title) ? "settings" : /record|detail|context|history|comments|conditions|priority|target|fallback|scope|readiness|risks|validation|rollback|evidence/i.test(title) ? "record" : "list";

export const enterpriseOperationsRoutes: EnterpriseOperationRoute[] = operationSuites.flatMap((suite) => suite.modules.flatMap((module, moduleIndex) => module.screens.map((title, screenIndex) => ({ id: suite.phase * 100000 + (moduleIndex + 1) * 100 + screenIndex + 1, title, path: `/instances/:instanceId/workspace/${suite.slug}/${module.key}/${slugify(title)}`, group: `${suite.title} · ${module.title}`, phase: suite.phase, kind: kindFor(title), area: module.title, module: module.key, screenId: `${suite.phase}.${moduleIndex + 1}.${screenIndex + 1}`, description: `${title} with API-backed lifecycle, permission-aware actions, nested context, audit evidence, and responsive states.` }))));

export const enterpriseOperationsHomePath = (phase: number) => enterpriseOperationsRoutes.find((route) => route.phase === phase)?.path ?? enterpriseOperationsRoutes[0].path;
