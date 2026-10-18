import type { ReactNode } from "react";
import { NavLink, Outlet, useParams, useNavigate, useState } from "react-router-dom";
import {
  Wrench, Settings, AlertTriangle, GitBranch, CalendarDays,
  BookOpen, ShieldCheck, Activity, Network, ClipboardList,
  KeyRound, Bell, Search, LogOut,
} from "lucide-react";
import { logout, selectAuth } from "@services/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { canAny } from "@services/authorization/permissions";
import { cn } from "@utils/cn";

interface NavItem { to: string; label: string; icon: typeof Wrench; permissions: string[]; }

const navItems: NavItem[] = [
  { to: "overview", label: "Overview", icon: Settings, permissions: ["itsm.core.task_read", "tenant.settings.read"] },
  { to: "incident", label: "Incident", icon: AlertTriangle, permissions: ["itsm.incident.incident.read", "itsm.incident.*"] },
  { to: "problem", label: "Problem", icon: GitBranch, permissions: ["itsm.problem.problem.read", "itsm.problem.*"] },
  { to: "change", label: "Change", icon: CalendarDays, permissions: ["itsm.change.change_request.read", "itsm.change.*"] },
  { to: "catalog", label: "Catalog", icon: BookOpen, permissions: ["itsm.request_catalog.catalog_item.read", "itsm.request_catalog.*"] },
  { to: "knowledge", label: "Knowledge", icon: BookOpen, permissions: ["itsm.knowledge.knowledge_article.read", "itsm.knowledge.*"] },
  { to: "sla", label: "SLA", icon: ShieldCheck, permissions: ["itsm.sla.definition_read", "itsm.sla.*"] },
  { to: "routing", label: "Routing", icon: Network, permissions: ["itsm.assignment.routing_read", "itsm.assignment.*"] },
  { to: "approvals", label: "Approvals", icon: KeyRound, permissions: ["itsm.approval.approval_read", "itsm.approval.*"] },
  { to: "on-call", label: "On-Call", icon: Activity, permissions: ["itsm.on_call.current_on_call_read", "itsm.on_call.*"] },
  { to: "cmdb", label: "CMDB", icon: Activity, permissions: ["itsm.service_cmdb.ci_read", "itsm.service_cmdb.*"] },
  { to: "release", label: "Release", icon: CalendarDays, permissions: ["itsm.release.release.read", "itsm.release.*"] },
  { to: "improvement", label: "Improvement", icon: GitBranch, permissions: ["itsm.improvement.opportunity_read", "itsm.improvement.*"] },
  { to: "outage", label: "Outage", icon: AlertTriangle, permissions: ["itsm.outage.outage.read", "itsm.outage.*"] },
];

export function ItsmAdminShell({ children }: { children?: ReactNode }) {
  const { instanceId } = useParams();
  const auth = useAppSelector(selectAuth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const prefix = `/instances/${instanceId}/itsm-admin`;
  const visibleItems = navItems.filter((item) =>
    canAny(auth.permissions, item.permissions) &&
    (!query.trim() || item.label.toLowerCase().includes(query.trim().toLowerCase())),
  );

  const handleSignOut = () => { dispatch(logout()); navigate("/login"); };

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-slate-200 bg-white">
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-4">
          <Wrench className="h-5 w-5 text-brand-600" />
          <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">ITSM Admin</p><p className="text-[11px] text-slate-400">{auth.selectedInstance?.name}</p></div>
        </div>
        <div className="p-3"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search modules…" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return <NavLink key={item.to} to={`${prefix}/${item.to}`} end className={({ isActive }) => cn("flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors", isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100")}><Icon className="h-4 w-4" /><span>{item.label}</span></NavLink>;
          })}
        </nav>
        <div className="border-t border-slate-200 p-3"><button onClick={handleSignOut} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-slate-600 hover:bg-slate-100"><LogOut className="h-4 w-4" />Sign out</button></div>
      </aside>
      <main className="pl-64"><div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur px-8 py-3"><div className="flex items-center justify-between"><p className="text-xs text-slate-500">Instance: <span className="font-medium text-slate-700">{auth.selectedInstance?.name}</span></p><p className="flex items-center gap-1 text-xs text-slate-400"><Wrench className="h-3.5 w-3.5" /> ITSM Admin</p></div></div><div className="px-8 py-6"><Outlet /></div></main>
    </div>
  );
}