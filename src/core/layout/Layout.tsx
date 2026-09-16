import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@core/auth/useAuth";
import {
  useGetNotificationsQuery,
  useMarkReadMutation,
  useMarkAllReadMutation,
  useGlobalSearchQuery,
  useMyApprovalsQuery,
} from "@shared/store/apiEndpoints";
import {
  LayoutDashboard,
  Ticket,
  AlertTriangle,
  Search,
  BookOpen,
  ShoppingCart,
  Server,
  Users,
  UserPlus,
  Phone,
  BarChart3,
  Briefcase,
  FolderKanban,
  Heart,
  Wrench,
  Zap,
  Settings,
  ShieldCheck,
  Clock,
  Calendar,
  MessageSquare,
  DollarSign,
  FileText,
  Flag,
  Mail,
  Play,
  RotateCcw,
  Package,
  BoxesIcon,
  Network,
  ShieldAlert,
  Scale,
  Gavel,
  Calculator,
  Leaf,
  Layers,
  CloudCog,
  Megaphone,
  Target,
  Package2,
  Bell,
  Inbox,
  Repeat,
  MapPin,
  Store,
  ScanBarcode,
  Users2,
  KeyRound,
  Grid3x3,
  Radio,
  GitBranch,
  FileStack,
  MapPinned,
  ScrollText,
  HeartPulse,
  LineChart,
  Truck,
  Send,
  Database,
  CheckCircle,
  Table2,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  Activity,
  Building2,
} from "lucide-react";
import { getItsmRouteAccess } from "@shared/itsmAccess";

interface NavItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
  module?: string;
  permission?: string;
  permissions?: string[];
  section?: string;
}

const allNavItems: NavItem[] = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  // Helpdesk
  {
    label: "Tasks",
    path: "/tasks",
    icon: Ticket,
    module: "helpdesk",
    section: "ITSM",
    permissions: [
      "itsm.core.task.read",
      "itsm.core.ui.task_record_shell.access",
    ],
  },
  {
    label: "Incidents",
    path: "/incidents",
    icon: AlertTriangle,
    module: "helpdesk",
    permissions: [
      "itsm.incident.incident.read",
      "itsm.incident.ui.incident_list.access",
    ],
  },
  {
    label: "Problems",
    path: "/problems",
    icon: Search,
    module: "helpdesk",
    permissions: [
      "itsm.problem.problem.read",
      "itsm.problem.ui.problem_list.access",
    ],
  },
  {
    label: "Changes",
    path: "/changes",
    icon: Zap,
    module: "helpdesk",
    permissions: [
      "itsm.change.change_request.read",
      "itsm.change.ui.change_list.access",
    ],
  },
  {
    label: "Requests & Catalog",
    path: "/catalog",
    icon: ShoppingCart,
    module: "helpdesk",
    permissions: [
      "itsm.request_catalog.catalog_item.read",
      "itsm.request_catalog.ui.catalog_home.access",
    ],
  },
  {
    label: "Knowledge",
    path: "/kb",
    icon: BookOpen,
    module: "helpdesk",
    permissions: [
      "itsm.knowledge.knowledge_article.read",
      "itsm.knowledge.ui.knowledge_search.access",
    ],
  },
  {
    label: "Service Levels",
    path: "/sla-dashboard",
    icon: Clock,
    module: "helpdesk",
    permissions: [
      "itsm.sla.definition_read",
      "itsm.sla.ui.sla_dashboard.access",
    ],
  },
  {
    label: "Assignment",
    path: "/assignment-dashboard",
    icon: GitBranch,
    module: "helpdesk",
    permissions: [
      "itsm.assignment.routing_rule.read",
      "itsm.assignment.ui.assignment_admin.access",
    ],
  },
  {
    label: "Approvals",
    path: "/approval-dashboard",
    icon: CheckCircle,
    module: "helpdesk",
    permissions: [
      "itsm.approval.approval_read",
      "itsm.approval.ui.my_approvals.access",
    ],
  },
  {
    label: "Major Incidents",
    path: "/major-incidents",
    icon: ShieldAlert,
    module: "helpdesk",
    permissions: [
      "itsm.major_incident.major_incident.read",
      "itsm.major_incident.ui.mi_dashboard.access",
    ],
  },
  {
    label: "Walk-Up",
    path: "/walkup",
    icon: Store,
    module: "helpdesk",
    permissions: [
      "itsm.walkup.walkup_location.read",
      "itsm.walkup.ui.location_finder.access",
    ],
  },
  {
    label: "Walk-Up Check-In",
    path: "/walkup/checkin",
    icon: CheckCircle,
    module: "helpdesk",
    permissions: [
      "itsm.walkup.walkup_checkin.create",
      "itsm.walkup.ui.check_in.access",
    ],
  },
  {
    label: "Walk-Up Queue",
    path: "/walkup/queue",
    icon: Users,
    module: "helpdesk",
    permissions: [
      "itsm.walkup.walkup_queue.read",
      "itsm.walkup.ui.queue_monitor.access",
    ],
  },
  { label: "Playbooks", path: "/playbooks", icon: Play, module: "helpdesk" },
  {
    label: "On-Call",
    path: "/oncall",
    icon: Calendar,
    module: "helpdesk",
    permissions: [
      "itsm.on_call.on_call_schedule.read",
      "itsm.on_call.ui.on_call_dashboard.access",
    ],
  },
  {
    label: "Templates",
    path: "/templates",
    icon: FileText,
    module: "helpdesk",
  },
  {
    label: "Outages",
    path: "/outages",
    icon: AlertTriangle,
    module: "helpdesk",
  },
  {
    label: "Change Calendar",
    path: "/change-calendar",
    icon: Calendar,
    module: "helpdesk",
  },
  { label: "PIR", path: "/pir", icon: FileText, module: "helpdesk" },
  {
    label: "War Room",
    path: "/warroom",
    icon: MessageSquare,
    module: "helpdesk",
  },
  { label: "Diagnosis", path: "/diagnosis", icon: Search, module: "helpdesk" },
  {
    label: "Ticket Board",
    path: "/ticket-board",
    icon: LayoutDashboard,
    module: "helpdesk",
  },
  {
    label: "Handover",
    path: "/shift-handover",
    icon: Repeat,
    module: "helpdesk",
  },
  {
    label: "KB Insights",
    path: "/knowledge-insights",
    icon: FileText,
    module: "helpdesk",
  },
  {
    label: "Priority Matrix",
    path: "/priority-matrix",
    icon: Grid3x3,
    module: "helpdesk",
  },
  { label: "My Work", path: "/my-work", icon: Inbox, module: "helpdesk" },
  { label: "CAB Board", path: "/cab", icon: Gavel, module: "helpdesk" },
  {
    label: "Known Errors",
    path: "/known-errors",
    icon: FileStack,
    module: "helpdesk",
  },
  {
    label: "Escalations",
    path: "/escalations",
    icon: Flag,
    module: "helpdesk",
  },
  {
    label: "SLA Monitor",
    path: "/sla-monitor",
    icon: Clock,
    module: "helpdesk",
  },
  { label: "CSAT", path: "/csat", icon: Heart, module: "helpdesk" },
  {
    label: "Support Email",
    path: "/support-email",
    icon: Mail,
    module: "helpdesk",
  },
  {
    label: "HD Reports",
    path: "/helpdesk-reports",
    icon: LineChart,
    module: "helpdesk",
  },
  {
    label: "HD Admin",
    path: "/helpdesk-admin",
    icon: Layers,
    module: "helpdesk",
  },
  {
    label: "Audit Trail",
    path: "/audit-trail",
    icon: ScrollText,
    module: "helpdesk",
  },
  {
    label: "Ops Workspace",
    path: "/ops-workspace",
    icon: LayoutDashboard,
    module: "helpdesk",
  },
  {
    label: "Neural Search",
    path: "/neural-search",
    icon: Search,
    module: "helpdesk",
  },

  // Settings & Admin
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
    module: "settings",
    section: "Admin",
  },
  {
    label: "Access Control",
    path: "/settings/access",
    icon: KeyRound,
    module: "settings",
  },
  {
    label: "Organization Structure",
    path: "/settings/organization-structure",
    icon: Building2,
    module: "settings",
  },
];

const platformNavItems: NavItem[] = [
  { label: "Platform overview", path: "/", icon: LayoutDashboard },
  { label: "Organizations", path: "/platform/organizations", icon: Building2 },
  {
    label: "Organization permissions",
    path: "/platform/permissions",
    icon: CloudCog,
  },
  {
    label: "Platform operators",
    path: "/platform/operators",
    icon: ShieldCheck,
  },
  { label: "Audit & operations", path: "/platform", icon: Activity },
];

export default function Layout() {
  const { user, logout, hasModule, hasPermission, hasAnyPermission } =
    useAuth();
  const { data: notifData } = useGetNotificationsQuery();
  const [markRead] = useMarkReadMutation();
  const [markAllRead] = useMarkAllReadMutation();
  const { data: approvals } = useMyApprovalsQuery(undefined, {
    skip: user?.role === "superadmin",
  });
  const [showNotifs, setShowNotifs] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { data: searchResults } = useGlobalSearchQuery(
    searchQ.length >= 2 ? searchQ : "",
  );
  const totalUnread = notifData?.unread || 0;
  const approvalCount = Array.isArray(approvals)
    ? approvals.reduce((s2: number, a2: any) => s2 + (a2.count || 1), 0)
    : 0;
  const location = useLocation();

  // Items visible based on module/permission
  const canSeeModuleItem = (item: NavItem): boolean => {
    if (item.path === "/settings/organization-structure")
      return hasModule("settings") && !!localStorage.getItem("activeInstanceId") &&
        ["instance_owner", "instance_admin"].includes(user?.instanceRole || "");
    if (!item.module && !item.permission) return true;
    const moduleAllowed = !item.module || hasModule(item.module);
    // Settings is owner-owned: visible only to admins who hold admin/access
    // permissions (granted per user/role via Settings -> Access Control).
    if (
      item.module === "settings" &&
      !hasPermission("admin.manage") &&
      !hasPermission("access.manage")
    )
      return false;
    const requiredPermissions =
      item.permissions || getItsmRouteAccess(item.path)?.permissions;
    const permissionAllowed = requiredPermissions?.length
      ? hasAnyPermission([...requiredPermissions])
      : !item.permission || hasPermission(item.permission);
    return moduleAllowed && permissionAllowed;
  };

  const visibleItems =
    user?.role === "superadmin"
      ? platformNavItems
      : allNavItems.filter(canSeeModuleItem);

  const renderNavItem = (item: NavItem, colorClass: string) => {
    const isActive =
      location.pathname === item.path ||
      (item.path !== "/" && location.pathname.startsWith(item.path));
    const Icon = item.icon;
    return (
      <Link
        key={item.path}
        to={item.path}
        title={collapsed ? item.label : undefined}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? colorClass === "purple"
              ? "bg-purple-50 text-purple-700"
              : "bg-brand-50 text-brand-700"
            : colorClass === "purple"
              ? "text-purple-600 hover:bg-purple-50 hover:text-purple-800"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        } ${collapsed ? "justify-center px-2" : ""}`}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    );
  };

  const renderNavItems = () => {
    const elements: React.ReactNode[] = [];
    let lastSection: string | null = null;

    for (const item of visibleItems) {
      if (item.section && item.section !== lastSection) {
        lastSection = item.section;
        if (!collapsed) {
          elements.push(
            <div
              key={`section-${item.section}`}
              className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase text-gray-400 tracking-wider first:pt-1"
            >
              {item.section}
            </div>,
          );
        } else {
          elements.push(
            <div
              key={`section-${item.section}`}
              className="border-t border-gray-200 my-2 mx-2"
            />,
          );
        }
      }
      elements.push(renderNavItem(item, "brand"));
    }
    return elements;
  };

  const sidebarWidth = collapsed
    ? "w-16"
    : user?.role === "superadmin"
      ? "w-80"
      : "w-64";

  return (
    <div className="flex h-screen bg-gray-50">
      <aside
        className={`${sidebarWidth} bg-white border-r border-gray-200 flex flex-col transition-all duration-200`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b border-gray-200 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}
        >
          {!collapsed && (
            <h1 className="text-lg font-bold text-brand-600">
              Unified Platform
            </h1>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="px-3 pb-2 relative">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                value={searchQ}
                onChange={(e) => {
                  setSearchQ(e.target.value);
                  setShowSearchResults(e.target.value.length >= 2);
                }}
                placeholder="Search everything..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border rounded-md focus:bg-white focus:border-brand-300 outline-none transition-all"
              />
            </div>
            {showSearchResults && searchResults && (
              <div className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto">
                {(searchResults as any[]).map((r: any) => (
                  <Link
                    key={`${r.entity}-${r.id}`}
                    to={`/${r.module}`}
                    className="block px-3 py-2 hover:bg-gray-50 border-b last:border-0"
                  >
                    <span className="text-[10px] uppercase text-brand-500 font-semibold">
                      {r.label}
                    </span>
                    <p className="text-sm truncate">{r.title}</p>
                  </Link>
                ))}
                {!searchResults.length && (
                  <p className="px-3 py-4 text-xs text-gray-400">
                    No results for "{searchQ}"
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Approval badge */}
        {!collapsed && approvalCount > 0 && (
          <div className="px-3 pb-2">
            <Link
              to="/approvals"
              className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg text-xs font-medium text-purple-700 hover:bg-purple-100"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              {approvalCount} pending approval{approvalCount > 1 ? "s" : ""}
            </Link>
          </div>
        )}

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {/* Main Nav */}
          {renderNavItems()}
        </nav>

        {/* User footer */}
        <div
          className={`p-4 border-t border-gray-200 ${collapsed ? "flex flex-col items-center gap-2" : ""}`}
        >
          <div
            className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}
          >
            <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-semibold text-sm flex-shrink-0">
              {user?.name?.charAt(0) || "?"}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            )}
          </div>

          {!collapsed && (
            <div className="flex items-center gap-2 mt-2">
              <div className="relative flex-1">
                <button
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="relative text-gray-400 hover:text-gray-600"
                >
                  <Bell className="h-5 w-5" />
                  {totalUnread > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                      {totalUnread > 9 ? "9+" : totalUnread}
                    </span>
                  )}
                </button>
                {showNotifs && (
                  <div className="fixed bottom-16 right-6 w-80 bg-white border rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
                    <div className="sticky top-0 bg-white border-b px-4 py-2.5 flex items-center justify-between">
                      <h3 className="font-semibold text-sm">Notifications</h3>
                      <button
                        onClick={() => markAllRead()}
                        className="text-xs text-brand-600 hover:text-brand-800"
                      >
                        Mark all read
                      </button>
                    </div>
                    {(notifData?.items || []).map((n: any) => (
                      <div
                        key={n._id}
                        onClick={() => markRead(n._id)}
                        className={`px-4 py-2.5 border-b cursor-pointer hover:bg-gray-50 ${!n.read ? "bg-blue-50" : ""}`}
                      >
                        <p className="text-sm font-medium truncate">
                          {n.title}
                        </p>
                        {n.message && (
                          <p className="text-xs text-gray-400 truncate">
                            {n.message}
                          </p>
                        )}
                        <p className="text-[10px] text-gray-300">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                    {!notifData?.items?.length && (
                      <p className="px-4 py-6 text-center text-sm text-gray-400">
                        All caught up!
                      </p>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={logout}
                className="text-gray-400 hover:text-red-500 text-sm whitespace-nowrap"
              >
                Sign out
              </button>
            </div>
          )}
          {collapsed && (
            <button
              onClick={logout}
              className="text-gray-400 hover:text-red-500 text-xs mt-1"
              title="Sign out"
            >
              <Mail className="h-4 w-4" />
            </button>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
