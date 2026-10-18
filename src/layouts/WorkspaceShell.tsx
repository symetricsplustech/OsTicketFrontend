import type { ReactNode } from "react";
import { NavLink, Outlet, useParams, useNavigate } from "react-router-dom";
import { Inbox, ClipboardList, AlertTriangle, CalendarDays, BookOpen, Boxes, CheckCircle2, Clock3, LogOut, Activity } from "lucide-react";
import { logout, selectAuth } from "@services/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { canAny } from "@services/authorization/permissions";
import { cn } from "@utils/cn";

interface NavItem { to: string; label: string; icon: typeof Inbox; permissions: string[]; }

const navItems: NavItem[] = [
  { to: "", label: "Home", icon: Activity, permissions: ["itsm.core.task_read", "itsm.assignment.ui.agent_inbox.access"] },
  { to: "my-work", label: "My Work", icon: ClipboardList, permissions: ["itsm.core.task_read", "itsm.assignment.ui.agent_inbox.access"] },
  { to: "incidents", label: "Incidents", icon: AlertTriangle, permissions: ["itsm.incident.incident.read", "itsm.incident.*"] },
  { to: "requests", label: "Requests", icon: CalendarDays, permissions: ["itsm.request_catalog.request.read", "itsm.request_catalog.*"] },
  { to: "problems", label: "Problems", icon: Boxes, permissions: ["itsm.problem.problem.read", "itsm.problem.*"] },
  { to: "changes", label: "Changes", icon: CalendarDays, permissions: ["itsm.change.change_request.read", "itsm.change.*"] },
  { to: "knowledge", label: "Knowledge", icon: BookOpen, permissions: ["itsm.knowledge.knowledge_article.read", "itsm.knowledge.*"] },
  { to: "cmdb", label: "CMDB", icon: Boxes, permissions: ["itsm.service_cmdb.ci_read", "itsm.service_cmdb.*"] },
  { to: "approvals", label: "Approvals", icon: CheckCircle2, permissions: ["itsm.approval.approval_read", "itsm.approval.*"] },
  { to: "sla", label: "SLA Risk", icon: Clock3, permissions: ["itsm.sla.definition_read", "itsm.sla.*"] },
];

export function WorkspaceShell({ children }: { children?: ReactNode }) {
  const { instanceId } = useParams();
  const auth = useAppSelector(selectAuth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const prefix = `/instances/${instanceId}/workspace`;

  const visibleItems = navItems.filter((item) => canAny(auth.permissions, item.permissions));

  const handleSignOut = () => { dispatch(logout()); navigate("/login"); };

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-slate-200 bg-white">
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-4">
          <Inbox className="h-5 w-5 text-brand-600" />
          <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">Engineer Workspace</p><p className="text-[11px] text-slate-400">{auth.selectedInstance?.name}</p></div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return <NavLink key={item.to} to={item.to ? `${prefix}/${item.to}` : prefix} end className={({ isActive }) => cn("flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors", isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100")}><Icon className="h-4 w-4" /><span>{item.label}</span></NavLink>;
          })}
        </nav>
        <div className="border-t border-slate-200 p-3">
          <button onClick={handleSignOut} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-slate-600 hover:bg-slate-100"><LogOut className="h-4 w-4" />Sign out</button>
        </div>
      </aside>
      <main className="pl-64">
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur px-8 py-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">Workspace — <span className="font-medium text-slate-700">{auth.selectedInstance?.name}</span></p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Activity className="h-3.5 w-3.5" />
              <span>{auth.user?.name}</span>
            </div>
          </div>
        </div>
        <div className="px-8 py-6"><Outlet /></div>
      </main>
    </div>
  );
}