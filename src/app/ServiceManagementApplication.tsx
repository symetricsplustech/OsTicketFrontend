import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle, CalendarDays, ChevronDown, Command, GitBranch, Home, Menu, Plus, Search, Settings, X } from "lucide-react";
import { LoginPage } from "@features/auth/src/LoginPage";
import { RegisterPage } from "@features/auth/src/RegisterPage";
import { MfaPage } from "@features/auth/src/MfaPage";
import { ForgotPasswordPage, ResetPasswordPage } from "@features/auth/src/AccountRecoveryPages";
import { MajorIncidentManagementPage } from "@features/major-incident-management/pages/MajorIncidentManagementPage";
import { majorIncidentHomePath, majorIncidentRoutes } from "@features/major-incident-management/model/majorIncidentRoutes";
import { ProblemManagementPage } from "@features/problem-management/pages/ProblemManagementPage";
import { problemHomePath, problemRoutes } from "@features/problem-management/model/problemRoutes";
import { ChangeManagementPage } from "@features/change-management/pages/ChangeManagementPage";
import { changeHomePath, changeRoutes } from "@features/change-management/model/changeRoutes";
import { RequestManagementPage } from "@features/request-management/pages/RequestManagementPage";
import { requestHomePath, requestRoutes } from "@features/request-management/model/requestRoutes";
import { CatalogManagementPage } from "@features/catalog-management/pages/CatalogManagementPage";
import { catalogHomePath, catalogRoutes } from "@features/catalog-management/model/catalogRoutes";
import { UniversalRequestManagementPage } from "@features/universal-request-management/pages/UniversalRequestManagementPage";
import { universalRequestHomePath, universalRequestRoutes } from "@features/universal-request-management/model/universalRequestRoutes";
import { KnowledgeManagementPage } from "@features/knowledge-management/pages/KnowledgeManagementPage";
import { knowledgeHomePath, knowledgeRoutes } from "@features/knowledge-management/model/knowledgeRoutes";
import { ServiceLevelManagementPage } from "@features/service-level-management/pages/ServiceLevelManagementPage";
import { serviceLevelHomePath, serviceLevelRoutes } from "@features/service-level-management/model/serviceLevelRoutes";
import { EnterpriseOperationsPage } from "@features/enterprise-operations/pages/EnterpriseOperationsPage";
import { enterpriseOperationsRoutes } from "@features/enterprise-operations/model/enterpriseOperationsRoutes";
import { EnterpriseExperiencePage } from "@features/enterprise-experience/pages/EnterpriseExperiencePage";
import { enterpriseExperienceRoutes } from "@features/enterprise-experience/model/enterpriseExperienceRoutes";
import { PlatformAdministrationPage } from "@features/platform-administration/pages/PlatformAdministrationPage";
import { platformAdministrationHomePath, platformAdministrationRoutes } from "@features/platform-administration/model/platformAdministrationRoutes";
import { ServiceDeskPage } from "@features/service-desk/pages/ServiceDeskPage";
import { serviceDeskHomePath, serviceDeskRoutes } from "@features/service-desk/model/serviceDeskRoutes";
import { IncidentManagementPage } from "@features/incident-management/pages/IncidentManagementPage";
import { incidentHomePath, incidentRoutes } from "@features/incident-management/model/incidentRoutes";
import type { ScreenDefinition, ScreenKind } from "@features/itsm-core/models/screen";

type RouteDefinition = ScreenDefinition & { group: string };

const route = (id: number, title: string, path: string, group: string, phase: number, kind: ScreenKind, description: string): RouteDefinition => ({ id, title, path, group, phase, kind, area: group, description, screenId: path.split("/").at(-1), module: group });

// Every entry below is backed by WorkRecordWorkspace behavior. No route is generated
// from a specification file or counted merely because a catalog entry exists.
const routes: RouteDefinition[] = [
  ...platformAdministrationRoutes,
  ...serviceDeskRoutes,
  ...incidentRoutes,
  ...majorIncidentRoutes,
  ...problemRoutes,
  ...changeRoutes,
  ...requestRoutes,
  ...catalogRoutes,
  ...universalRequestRoutes,
  ...knowledgeRoutes,
  ...serviceLevelRoutes,
  ...enterpriseOperationsRoutes,
  ...enterpriseExperienceRoutes,
];

function matchPath(pattern: string, pathname: string) {
  const source = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(":instanceId", "[^/]+");
  return new RegExp(`^${source}(?:/.*)?$`).test(pathname);
}

export function ServiceManagementApplication() {
  const location = useLocation(); const navigate = useNavigate(); const [open, setOpen] = useState(false); const [query, setQuery] = useState(""); const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const pageHeadingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { setOpen(false); requestAnimationFrame(() => pageHeadingRef.current?.focus()); }, [location.pathname]);
  useEffect(() => { const close = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); }; window.addEventListener("keydown", close); return () => window.removeEventListener("keydown", close); }, []);
  if (location.pathname === "/login") return <LoginPage />;
  if (location.pathname === "/register") return <RegisterPage />;
  if (location.pathname === "/mfa") return <MfaPage />;
  if (location.pathname === "/forgot-password") return <ForgotPasswordPage />;
  if (location.pathname === "/reset-password") return <ResetPasswordPage />;
  if (location.pathname === "/") return <Navigate to={platformAdministrationHomePath.replace(":instanceId", "demo")} replace />;
  if (/^\/instances\/[^/]+\/admin\/?$/.test(location.pathname)) return <Navigate to={platformAdministrationHomePath.replace(":instanceId", location.pathname.split("/")[2] || "demo")} replace />;
  if (/^\/instances\/[^/]+\/workspace\/service-desk\/?$/.test(location.pathname)) return <Navigate to={serviceDeskHomePath.replace(":instanceId", location.pathname.split("/")[2] || "demo")} replace />;
  if (/^\/instances\/[^/]+\/workspace\/incidents\/?$/.test(location.pathname)) return <Navigate to={incidentHomePath.replace(":instanceId", location.pathname.split("/")[2] || "demo")} replace />;
  if (/^\/instances\/[^/]+\/workspace\/major-incidents\/?$/.test(location.pathname)) return <Navigate to={majorIncidentHomePath.replace(":instanceId", location.pathname.split("/")[2] || "demo")} replace />;
  if (/^\/instances\/[^/]+\/workspace\/problems\/?$/.test(location.pathname)) return <Navigate to={problemHomePath.replace(":instanceId", location.pathname.split("/")[2] || "demo")} replace />;
  if (/^\/instances\/[^/]+\/workspace\/changes\/?$/.test(location.pathname)) return <Navigate to={changeHomePath.replace(":instanceId", location.pathname.split("/")[2] || "demo")} replace />;
  if (/^\/instances\/[^/]+\/workspace\/requests\/?$/.test(location.pathname)) return <Navigate to={requestHomePath.replace(":instanceId", location.pathname.split("/")[2] || "demo")} replace />;
  if (/^\/instances\/[^/]+\/workspace\/catalog\/?$/.test(location.pathname)) return <Navigate to={catalogHomePath.replace(":instanceId", location.pathname.split("/")[2] || "demo")} replace />;
  if (/^\/instances\/[^/]+\/workspace\/universal-requests\/?$/.test(location.pathname)) return <Navigate to={universalRequestHomePath.replace(":instanceId", location.pathname.split("/")[2] || "demo")} replace />;
  if (/^\/instances\/[^/]+\/workspace\/knowledge\/?$/.test(location.pathname)) return <Navigate to={knowledgeHomePath.replace(":instanceId", location.pathname.split("/")[2] || "demo")} replace />;
  if (/^\/instances\/[^/]+\/workspace\/service-levels\/?$/.test(location.pathname)) return <Navigate to={serviceLevelHomePath.replace(":instanceId", location.pathname.split("/")[2] || "demo")} replace />;
  const selected = routes.sort((a, b) => b.path.length - a.path.length).find((item) => matchPath(item.path, location.pathname));
  const groups = [...new Set(routes.map((item) => item.group))];
  const visible = useMemo(() => routes.filter((item) => `${item.title} ${item.group}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const go = (path: string) => { navigate(path.replace(":instanceId", location.pathname.split("/")[2] || "demo")); setOpen(false); };
  return <div className="min-h-screen bg-slate-50 text-slate-950"><a href="#main-content" className="sr-only z-50 rounded bg-white p-3 focus:not-sr-only focus:fixed focus:left-3 focus:top-3">Skip to main content</a>{open ? <button aria-label="Close navigation" onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" /> : null}<aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-[#0b1830] text-white transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}><header className="flex h-16 items-center justify-between border-b border-white/10 px-5"><button onClick={() => go(routes[0].path)} className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-400 text-slate-950"><Command className="h-5 w-5" /></span><span className="text-left"><strong className="block text-sm">NEXA ITSM</strong><span className="text-[10px] text-slate-400">Code-backed operations</span></span></button><button aria-label="Close navigation" className="lg:hidden" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button></header><div className="p-3"><label className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2"><Search className="h-4 w-4 text-slate-400" /><input aria-label="Find implemented screen" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find implemented screen…" className="w-full bg-transparent text-xs outline-none" /></label></div><nav className="flex-1 overflow-y-auto px-3 pb-5">{groups.map((group) => { const items = visible.filter((item) => item.group === group); if (!items.length) return null; const Icon = group.includes("00") ? Settings : group.includes("01") ? Command : group.includes("02") || group.includes("03") ? AlertTriangle : group.includes("04") ? GitBranch : CalendarDays; return <div key={group} className="mb-2"><button aria-expanded={!collapsed[group]} onClick={() => setCollapsed((value) => ({ ...value, [group]: !value[group] }))} className="flex w-full items-center gap-2 px-2 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400"><Icon className="h-3.5 w-3.5" /><span className="flex-1">{group}</span><ChevronDown className={`h-3 w-3 transition ${collapsed[group] ? "-rotate-90" : ""}`} /></button>{!collapsed[group] ? items.map((item) => <button key={item.id} onClick={() => go(item.path)} className={`mb-0.5 block w-full rounded-lg px-3 py-2 text-left text-xs ${selected?.id === item.id ? "bg-cyan-400 font-bold text-slate-950" : "text-slate-300 hover:bg-white/10"}`}>{item.title}</button>) : null}</div>})}</nav></aside><div className="lg:pl-72"><header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-white/95 px-4 backdrop-blur md:px-8"><button aria-label="Open navigation" onClick={() => setOpen(true)} className="rounded-lg border p-2 lg:hidden"><Menu className="h-5 w-5" /></button><Home className="h-4 w-4 text-slate-400" /><span className="text-xs text-slate-500">{selected?.group ?? "Not found"}</span></header><main id="main-content" className="mx-auto max-w-[1500px] p-4 md:p-8">{selected ? <><section className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-cyan-700">{selected.screenId} · {selected.group}</p><h1 ref={pageHeadingRef} tabIndex={-1} className="mt-2 text-3xl font-bold outline-none">{selected.title}</h1><p className="mt-2 max-w-3xl text-sm text-slate-500">{selected.description}</p></div></section>{selected.phase === 0 ? <PlatformAdministrationPage screen={selected} /> : selected.phase === 1 ? <ServiceDeskPage screen={selected} /> : selected.phase === 2 ? <IncidentManagementPage screen={selected} /> : selected.phase === 3 ? <MajorIncidentManagementPage screen={selected} /> : selected.phase === 4 ? <ProblemManagementPage screen={selected} /> : selected.phase === 5 ? <ChangeManagementPage screen={selected} /> : selected.phase === 6 ? <RequestManagementPage screen={selected} /> : selected.phase === 7 ? <CatalogManagementPage screen={selected} /> : selected.phase === 8 ? <UniversalRequestManagementPage screen={selected} /> : selected.phase === 9 ? <KnowledgeManagementPage screen={selected} /> : selected.phase === 10 ? <ServiceLevelManagementPage screen={selected} /> : (selected.phase ?? 0) <= 20 ? <EnterpriseOperationsPage screen={selected} /> : <EnterpriseExperiencePage screen={selected} />}</> : <section className="rounded-xl border bg-white p-8"><Settings className="h-8 w-8 text-slate-300" /><h1 className="mt-4 text-xl font-bold">No implemented route</h1><p className="mt-2 text-sm text-slate-500">This URL does not map to a code-backed screen.</p></section>}</main></div></div>;
}
