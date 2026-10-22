import type { ReactNode } from "react";
import { NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import {
  Building2,
  LogOut,
  ShieldCheck,
  Users,
  Network,
  KeyRound,
  ClipboardList,
  GitBranch,
  CalendarDays,
} from "lucide-react";
import { logout, selectAuth } from "@services/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { canAny, PERMISSIONS } from "@services/authorization/permissions";
import { cn } from "@utils/cn";

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  permissions?: string[];
  matchEnd?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function InstanceAdminShell() {
  const { instanceId } = useParams();
  const auth = useAppSelector(selectAuth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const prefix = `/instances/${instanceId}`;

  const sections: NavSection[] = [
    {
      title: "Organization",
      items: [
        {
          to: `${prefix}/admin/organization/companies`,
          label: "Companies",
          icon: <Building2 className="h-4 w-4" />,
          permissions: [
            "tenant.organization.read",
            "tenant.organization.update",
          ],
        },
      ],
    },
    {
      title: "Service operations",
      items: [
        {
          to: `/${instanceId}/workspace/incidents`,
          label: "Incidents",
          icon: <ClipboardList className="h-4 w-4" />,
          permissions: ["itsm.incident.incident.read", "itsm.incident.*"],
        },
        {
          to: `/${instanceId}/workspace/problems`,
          label: "Problems",
          icon: <GitBranch className="h-4 w-4" />,
          permissions: ["itsm.problem.problem.read", "itsm.problem.*"],
        },
        {
          to: `/${instanceId}/workspace/changes`,
          label: "Changes",
          icon: <CalendarDays className="h-4 w-4" />,
          permissions: ["itsm.change.change_request.read", "itsm.change.*"],
        },
      ],
    },
    {
      title: "People",
      items: [
        {
          to: `${prefix}/people/users`,
          label: "Users Directory",
          icon: <Users className="h-4 w-4" />,
          permissions: [PERMISSIONS.tenantUserRead],
        },
        {
          to: `${prefix}/people/hierarchy`,
          label: "Reporting Lines",
          icon: <Network className="h-4 w-4" />,
          permissions: [PERMISSIONS.tenantUserRead],
        },
      ],
    },
    {
      title: "Access",
      items: [
        {
          to: `${prefix}/access/effective-access`,
          label: "Effective Access",
          icon: <ShieldCheck className="h-4 w-4" />,
          permissions: [PERMISSIONS.tenantPermissionRead],
          matchEnd: true,
        },
        {
          to: `${prefix}/access/delegations`,
          label: "Delegations",
          icon: <KeyRound className="h-4 w-4" />,
          permissions: [PERMISSIONS.tenantPermissionRead],
        },
      ],
    },
  ];

  const visibleSections = sections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          !item.permissions || canAny(auth.permissions, item.permissions),
      ),
    }))
    .filter((section) => section.items.length > 0);

  const handleSignOut = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-slate-200 bg-white">
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-4">
          <Building2 className="h-5 w-5 text-brand-600" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {auth.selectedInstance?.name ?? instanceId}
            </p>
            <p className="text-[11px] text-slate-400">Instance Admin</p>
          </div>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {visibleSections.map((section) => (
            <div key={section.title}>
              <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.matchEnd}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-brand-50 text-brand-700"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                      )
                    }
                  >
                    {item.icon}
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <div className="mb-2 flex items-center gap-2 px-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
              {auth.user?.name?.charAt(0).toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-slate-800">
                {auth.user?.name ?? "Account"}
              </p>
              <p className="truncate text-[11px] text-slate-400">
                {auth.role ?? "member"}
              </p>
            </div>
          </div>
          <button
            type="button"
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
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Instance:{" "}
              <span className="font-medium text-slate-700">
                {auth.selectedInstance?.name}
              </span>
            </p>
            <p className="flex items-center gap-1 text-xs text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Instance Admin experience
            </p>
          </div>
        </div>
        <div className="px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
