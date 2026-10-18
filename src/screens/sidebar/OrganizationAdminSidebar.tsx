import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Search, X } from "lucide-react";
import { logout, selectAuth, selectPermissions } from "@services/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { cn } from "@utils/cn";
import {
  canViewOrganizationAdminItem,
  ORGANIZATION_ADMIN_NAVIGATION,
  organizationItemEntryPath,
  type OrganizationAdminNavigationItem,
  type OrganizationAdminNavigationSection,
} from "@/navigation/organizationAdminNavigation.tsx";

interface ResolvedChild {
  key: string;
  label: string;
  path: string;
}

interface ResolvedItem {
  key: string;
  label: string;
  path?: string;
  entryPath: string | null;
  children: ResolvedChild[];
}

interface ResolvedSection {
  key: string;
  label: string;
  icon: OrganizationAdminNavigationSection["icon"];
  items: ResolvedItem[];
}

/**
 * Organization Admin (Tenant Admin) sidebar. Groups every capability of one
 * customer organization, scoped to the session's tenant permissions.
 */
export function OrganizationAdminSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const auth = useAppSelector(selectAuth);
  const permissions = useAppSelector(selectPermissions);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const searching = query.trim().length > 0;

  const sections = useMemo<ResolvedSection[]>(() => {
    const needle = query.trim().toLowerCase();
    return ORGANIZATION_ADMIN_NAVIGATION.map((section) => {
      const items: ResolvedItem[] = [];
      for (const item of section.items) {
        if (item.hidden) continue;
        if (!canViewOrganizationAdminItem(permissions, item)) continue;
        const children = (item.children ?? [])
          .filter((child) => !child.hidden)
          .filter((child) => canViewOrganizationAdminItem(permissions, child))
          .filter(
            (child) =>
              !needle ||
              child.label.toLowerCase().includes(needle) ||
              section.label.toLowerCase().includes(needle) ||
              item.label.toLowerCase().includes(needle),
          )
          .map((child) => ({ key: child.key, label: child.label, path: child.path }));
        if (children.length === 0 && item.children && item.children.length > 0) continue;
        if (!children.length && needle && !item.label.toLowerCase().includes(needle) && !section.label.toLowerCase().includes(needle)) {
          continue;
        }
        items.push({
          key: item.key,
          label: item.label,
          path: item.path,
          entryPath: organizationItemEntryPath(item),
          children,
        });
      }
      return { key: section.key, label: section.label, icon: section.icon, items };
    }).filter((section) => section.items.length > 0);
  }, [permissions, query]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const isItemActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(`${href}/`);

  const handleSignOut = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const orgName = auth.selectedInstance?.name ?? "ACME Technologies";

  return (
    <aside
      aria-label="Organization Admin navigation"
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white lg:translate-x-0",
        open ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        "transition-transform duration-200 lg:shadow-none",
      )}
    >
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 px-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white">
          O
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{orgName}</p>
          <p className="truncate text-xs text-slate-500">Organization Workspace</p>
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
            placeholder="Search Organization Admin…"
            aria-label="Search Organization Admin"
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </label>
      </div>

      <nav aria-label="Organization Admin" className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        {sections.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-slate-400">
            {searching ? "No capability matches your search." : "No organization capabilities assigned."}
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
              expandedGroups={expanded}
              onToggleGroup={(key) =>
                setExpanded((value) => ({ ...value, [key]: !(value[key] ?? false) }))
              }
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
            <p className="truncate text-xs text-slate-400">{auth.role ?? "Organization Admin"}</p>
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
  section: ResolvedSection;
  searching: boolean;
  expanded: boolean;
  onToggle: () => void;
  onNavigate: () => void;
  isItemActive: (href: string) => boolean;
  expandedGroups: Record<string, boolean>;
  onToggleGroup: (key: string) => void;
}

function Section({
  section,
  searching,
  expanded,
  onToggle,
  onNavigate,
  isItemActive,
  expandedGroups,
  onToggleGroup,
}: SectionProps) {
  const Icon = section.icon;
  const hasActiveChild = section.items.some(
    (item) =>
      (item.path && isItemActive(item.path)) ||
      (item.entryPath && isItemActive(item.entryPath)) ||
      item.children.some((child) => isItemActive(child.path)),
  );

  return (
    <div className="mb-1">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={onToggle}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm font-semibold transition-colors",
          hasActiveChild ? "text-slate-900" : "text-slate-600 hover:bg-slate-50",
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
          {section.items.map((item) =>
            item.children.length > 0 ? (
              <GroupRow
                key={item.key}
                item={item}
                searching={searching}
                active={item.children.some((child) => isItemActive(child.path))}
                expanded={expandedGroups[`${section.key}:${item.key}`] ?? false}
                onToggle={() => onToggleGroup(`${section.key}:${item.key}`)}
                onNavigate={onNavigate}
                isItemActive={isItemActive}
              />
            ) : (
              <li key={item.key}>
                <NavLeaf
                  label={item.label}
                  href={item.path ?? item.entryPath ?? "#"}
                  onNavigate={onNavigate}
                  isItemActive={isItemActive}
                />
              </li>
            ),
          )}
        </ul>
      ) : null}
    </div>
  );
}

function GroupRow({
  item,
  searching,
  active,
  expanded,
  onToggle,
  onNavigate,
  isItemActive,
}: {
  item: ResolvedItem;
  searching: boolean;
  active: boolean;
  expanded: boolean;
  onToggle: () => void;
  onNavigate: () => void;
  isItemActive: (href: string) => boolean;
}) {
  const open = searching || expanded || active;
  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className={cn(
          "flex w-full items-center gap-1 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors",
          active ? "font-semibold text-brand-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        )}
      >
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        <ChevronDown
          className={cn("h-3 w-3 shrink-0 text-slate-400 transition-transform", open && "rotate-180")}
        />
      </button>
      {open ? (
        <ul className="ml-2.5 space-y-0.5 border-l border-slate-200 pl-2">
          {item.children.map((child) => (
            <li key={child.key}>
              <NavLeaf
                label={child.label}
                href={child.path}
                onNavigate={onNavigate}
                isItemActive={isItemActive}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function NavLeaf({
  label,
  href,
  onNavigate,
  isItemActive,
}: {
  label: string;
  href: string;
  onNavigate: () => void;
  isItemActive: (href: string) => boolean;
}) {
  const active = isItemActive(href);
  return (
    <NavLink
      to={href}
      onClick={onNavigate}
      className={cn(
        "block truncate rounded-md px-2.5 py-1.5 text-sm transition-colors",
        active
          ? "bg-brand-50 font-semibold text-brand-700"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      )}
      title={label}
    >
      {label}
    </NavLink>
  );
}

export type { OrganizationAdminNavigationItem };
