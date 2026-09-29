import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";
export type KnowledgeRoute = ScreenDefinition & { group: string };
type Module = { key: string; title: string; screens: readonly string[] };
const modules: readonly Module[] = [
  { key: "home", title: "Knowledge Home", screens: ["Knowledge Home", "Knowledge Search", "Browse Knowledge"] },
  { key: "bases", title: "Knowledge Bases", screens: ["Knowledge Bases", "Create Knowledge Base", "Knowledge Base Record", "Owners", "Managers", "Contributors", "Audience", "Approval Policy"] },
  { key: "categories", title: "Categories", screens: ["Knowledge Categories", "Create Category", "Category Record", "Category Tree"] },
  { key: "articles", title: "Articles", screens: ["Articles", "My Drafts", "Awaiting Review", "Awaiting Approval", "Published", "Expiring", "Retired", "Create Article", "Article Editor", "Article Record"] },
  { key: "lifecycle", title: "Article Lifecycle", screens: ["Article Versions", "Compare Versions", "Submit for Review", "Review Article", "Approve Article", "Reject Article", "Publish Article", "Revise Article", "Retire Article", "Archive Article"] },
  { key: "feedback", title: "Feedback", screens: ["Article Feedback", "Helpful / Not Helpful", "Article Flags", "Feedback Tasks", "Feedback Task Record"] },
  { key: "gaps", title: "Knowledge Gaps", screens: ["Knowledge Gaps", "Create Knowledge Gap", "Gap Record", "Create Article from Gap"] },
  { key: "translations", title: "Translations", screens: ["Article Languages", "Translation Request", "Translated Article", "Translation Status"] },
  { key: "analytics", title: "Analytics", screens: ["Knowledge Dashboard", "Article Usage", "Search Analytics", "Deflection", "Feedback Analytics", "Knowledge Coverage"] },
  { key: "configuration", title: "Configuration", screens: ["Knowledge Templates", "Ownership Groups", "Validity Rules", "Article Types", "Knowledge Notifications", "Knowledge Properties"] },
] as const;
const slug = (value: string) => value.toLowerCase().replace(/\//g, "-").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const kindFor = (title: string): ScreenKind => /home$|dashboard|analytics$|usage$|deflection|coverage/i.test(title) ? "dashboard" : /create |editor|submit |approve |reject |publish |revise |retire |archive |translation request/i.test(title) ? "settings" : /search$|browse |bases$|categories$|articles$|drafts$|awaiting |published$|expiring$|retired$|owners$|managers$|contributors$|audience$|feedback$|flags$|tasks$|gaps$|languages$|status$|templates$|groups$|rules$|types$|notifications$|properties$/i.test(title) ? "list" : "record";
export const knowledgeRoutes: KnowledgeRoute[] = modules.flatMap((module, moduleIndex) => module.screens.map((title, screenIndex) => ({ id: 90000 + (moduleIndex + 1) * 100 + screenIndex + 1, title, path: `/instances/:instanceId/workspace/knowledge/${module.key}/${slug(title)}`, group: `Phase 09 · ${module.title}`, phase: 9, kind: kindFor(title), area: module.title, module: module.key, screenId: `09.${moduleIndex + 1}.${screenIndex + 1}`, description: `${title} with governed knowledge authoring, review, approval, publication, feedback, translation, analytics, and audit operations.` })));
export const knowledgeHomePath = knowledgeRoutes[0].path;
