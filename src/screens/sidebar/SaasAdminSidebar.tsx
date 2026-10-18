import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Menu, Search, X } from "lucide-react";
import { logout, selectAuth, selectPermissions } from "@services/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { cn } from "@utils/cn";
import {
  canViewSaasAdminItem,
  SAAS_ADMIN_NAVIGATION,
  type SaasAdminNavigationSection,
} from "@/navigation/saasAdminNavigation.tsx";

export function SaasAdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const auth = useAppSelector(selectAuth);
  const permissions = useAppSelector(selectPermissions);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const searching = query.trim().length > 0;

  const sections = useMemo(() => {
    return SAAS_ADMIN_NAVIGATION.map((section) => ({
      ...section,
      items: section.items
        .filter((item) => !item.hidden)
        .filter((item) => canViewSaasAdminItem(permissions, section, item))
        .filter((item) =>
          !searching ||
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.hint.toLowerCase().includes(query.toLowerCase()) ||
          section.label.toLowerCase().includes(query.toLowerCase())
        )
        .map((item) => ({ ...item, href: item.path })),
    })).filter((section) => section.items.length > 0);
  }, [query, permissions]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const isItemActive = (href: string) => location.pathname === href || location.pathname.startsWith(`${href}/`);

  const handleSignOut = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <aside
      aria-label="SaaS Admin navigation"
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white lg:translate-x-0",
        open ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        "transition-transform duration-200 lg:shadow-none"
      )}
    >
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 px-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white">
          SA
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">SaaS Admin</p>
          <p className="truncate text-xs text-slate-500">Platform Control Plane</p>
        </div>
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      <div className="shrink-0 px-3 pb-2 pt-3">
        <label className="flex items-center gap-2 rounded-md border border-slate-200 px-2.5 py-1.5 focus-within:border-brand-400 focus-within:ring-1 focus-within:ring-brand-200">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search SaaS Admin…"
            aria-label="Search SaaS Admin"
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </label>
      </div>

      <nav aria-label="SaaS Admin" className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        {sections.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-slate-400">
            {searching ? "No section matches your search." : "No sections available."}
          </p>
        ) : (
          sections.map((section) => (
            <Section
              key={section.key}
              section={section}
              searching={searching}
              expanded={expanded[section.key] ?? true}
              onToggle={() =>
                setExpanded((value) => ({ ...value, [section.key]: !(value[section.key] ?? true) }))
              }
              onNavigate={onClose}
              isItemActive={isItemActive}
            />
          ))
        )}
      </nav>

      <footer className="shrink-0 border-t border-slate-200 p-3">
        <div className="flex items-center gap-2 px-2.5 py-1.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
            {(auth.user?.name ?? auth.user?.email ?? "?").charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-700">{auth.user?.name ?? "Signed in"}</p>
            <p className="truncate text-xs text-slate-400">{auth.role ?? "Platform Admin"}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-1 flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-slate-600 hover:bg-slate-100"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </footer>
    </aside>
  );
}

interface SectionProps {
  section: SaasAdminNavigationSection;
  searching: boolean;
  expanded: boolean;
  onToggle: () => void;
  onNavigate: () => void;
  isItemActive: (href: string) => boolean;
}

function Section({
  section,
  searching,
  expanded,
  onToggle,
  onNavigate,
  isItemActive,
}: SectionProps) {
  const Icon = section.icon;
  const hasActiveChild = section.items.some((item) => isItemActive(item.path));

  return (
    <div className="mb-1">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={onToggle}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm font-semibold transition-colors",
          hasActiveChild ? "text-slate-900" : "text-slate-600 hover:bg-slate-50"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate">{section.label}</span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform", expanded && "rotate-180")}
        />
      </button>
      {expanded ? (
        <ul className="mb-1 ml-3.5 space-y-0.5 border-l border-slate-200 pl-2">
          {section.items.map((item) => {
            const active = isItemActive(item.path);
            return (
              <li key={item.key}>
                <NavLink
                  to={item.path}
                  onClick={onNavigate}
                  className={cn(
                    "block truncate rounded-md px-2.5 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-brand-50 font-semibold text-brand-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                  title={item.label}
                >
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}