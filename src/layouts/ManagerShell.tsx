import type { ReactNode } from "react";
import { NavLink, Outlet, useParams, useNavigate } from "react-router-dom";
import {
  Gauge, Users, ClipboardList, Clock3, AlertTriangle,
  CheckCircle2, CalendarDays, BarChart3, LogOut, KeyRound,
} from "lucide-react";
import { logout, selectAuth } from "@services/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { canAny } from "@services/authorization/permissions";
import { cn } from "@utils/cn";

interface NavItem { to: string; label: string; icon: typeof Gauge; permissions: string[]; }

const navItems: NavItem[] = [
  { to: "", label: "Dashboard", icon: Gauge, permissions: ["itsm.core.task_read", "itsm.incident.incident.read"] },
  { to: "team-work", label: "Team Work", icon: ClipboardList, permissions: ["itsm.core.task_read", "itsm.incident.incident.read"] },
  { to: "queues", label: "Queues", icon: Users, permissions: ["itsm.assignment.queue.read", "itsm.assignment.*"] },
  { to: "workload", label: "Workload", icon: BarChart3, permissions: ["itsm.assignment.capacity_read_team", "itsm.assignment.*"] },
  { to: "sla-risk", label: "SLA Risk", icon: AlertTriangle, permissions: ["itsm.sla.definition_read", "itsm.sla.*"] },
  { to: "escalations", label: "Escalations", icon: AlertTriangle, permissions: ["itsm.incident.incident.read", "itsm.incident.*"] },
  { to: "approvals", label: "Approvals", icon: CheckCircle2, permissions: ["itsm.approval.approval_read", "itsm.approval.*"] },
  { to: "reports", label: "Reports", icon: BarChart3, permissions: ["itsm.reporting_admin.report_read", "itsm.reporting_admin.*"] },
  { to: "engineers", label: "Engineers", icon: Users, permissions: ["tenant.user.read", "itsm.core.user.read"] },
];

export function ManagerShell({ children }: { children?: ReactNode }) {
  const { instanceId } = useParams();
  const auth = useAppSelector(selectAuth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const prefix = `/instances/${instanceId}/manager`;

  const visibleItems = navItems.filter((item) => canAny(auth.permissions, item.permissions));

  const handleSignOut = () => { dispatch(logout()); navigate("/login"); };

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-slate-200 bg-white">
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-4">
          <Gauge className="h-5 w-5 text-brand-600" />
          <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">Manager</p><p className="text-[11px] text-slate-400">{auth.selectedInstance?.name}</p></div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return <NavLink key={item.label} to={item.to ? `${prefix}/${item.to}` : prefix} end className={({ isActive }) => cn("flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors", isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100")}><Icon className="h-4 w-4" /><span>{item.label}</span></NavLink>;
          })}
        </nav>
        <div className="border-t border-slate-200 p-3">
          <button onClick={handleSignOut} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-slate-600 hover:bg-slate-100"><LogOut className="h-4 w-4" />Sign out</button>
        </div>
      </aside>
      <main className="pl-64"><div className="border-b border-slate-200 bg-white px-8 py-3"><p className="text-xs text-slate-500">Manager Workspace — <span className="font-medium text-slate-700">{auth.selectedInstance?.name}</span></p></div><div className="px-8 py-6"><Outlet /></div></main>
    </div>
  );
}