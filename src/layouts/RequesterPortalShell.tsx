import type { ReactNode } from "react";
import { NavLink, Outlet, useParams, useNavigate } from "react-router-dom";
import {
  LifeBuoy,
  ShoppingCart,
  BookOpen,
  ClipboardList,
  AlertTriangle,
  CalendarDays,
  LogOut,
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { logout, selectAuth } from "@services/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { canAny } from "@services/authorization/permissions";
import { cn } from "@utils/cn";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LifeBuoy;
  permissions: string[];
}

const navItems: NavItem[] = [
  {
    to: "home",
    label: "Home",
    icon: LifeBuoy,
    permissions: [
      "itsm.request_catalog.ui.catalog_home.access",
      "itsm.experience.portal_access",
    ],
  },
  {
    to: "help",
    label: "Get Help",
    icon: HelpCircle,
    permissions: [
      "itsm.request_catalog.ui.catalog_home.access",
      "itsm.experience.portal_access",
    ],
  },
  {
    to: "catalog",
    label: "Service Catalog",
    icon: ShoppingCart,
    permissions: [
      "itsm.request_catalog.catalog_item.read",
      "itsm.request_catalog.*",
    ],
  },
  {
    to: "requests",
    label: "My Requests",
    icon: ClipboardList,
    permissions: [
      "itsm.request_catalog.request.read",
      "itsm.request_catalog.*",
    ],
  },
  {
    to: "my-incidents",
    label: "My Incidents",
    icon: AlertTriangle,
    permissions: ["itsm.incident.incident.read", "itsm.incident.*"],
  },
  {
    to: "knowledge",
    label: "Knowledge",
    icon: BookOpen,
    permissions: ["itsm.knowledge.knowledge_article.read", "itsm.knowledge.*"],
  },
  {
    to: "approvals",
    label: "My Approvals",
    icon: CalendarDays,
    permissions: ["itsm.approval.approval_read", "itsm.approval.*"],
  },
];

export function RequesterPortalShell({ children }: { children?: ReactNode }) {
  const { instanceId } = useParams();
  const auth = useAppSelector(selectAuth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const prefix = `/instances/${instanceId}/portal`;

  const visibleItems = navItems.filter((item) =>
    canAny(auth.permissions, item.permissions),
  );

  const handleSignOut = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-slate-200 bg-white">
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-4">
          <LifeBuoy className="h-5 w-5 text-brand-600" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              Requester Portal
            </p>
            <p className="text-[11px] text-slate-400">
              {auth.selectedInstance?.name}
            </p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={`${prefix}/${item.to}`}
                end
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-600 hover:bg-slate-100",
                  )
                }
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="border-t border-slate-200 p-3">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-slate-600 hover:bg-slate-100"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>
      <main className="pl-64">
        <div className="border-b border-slate-200 bg-white px-8 py-3">
          <p className="text-xs text-slate-500">
            Self-Service —{" "}
            <span className="font-medium text-slate-700">
              {auth.selectedInstance?.name}
            </span>
          </p>
        </div>
        <div className="px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
