import { useEffect, useMemo, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Menu, SearchX } from "lucide-react";
import { SaasAdminSidebar } from "@/screens/sidebar/SaasAdminSidebar";
import { Unauthorized } from "@app/layouts/Unauthorized";
import { NotFound } from "@app/layouts/NotFound";
import { useAppSelector } from "@store/hooks";
import { selectPermissions } from "@services/auth/authSlice";
import {
  canAccessSaasAdmin,
  canViewSaasAdminItem,
  firstAccessibleSaasAdminPath,
  SAAS_ADMIN_BASE_PATH,
  SAAS_ADMIN_NAVIGATION,
  type SaasAdminNavigationSection,
  type SaasAdminNavigationItem,
} from "@/navigation/saasAdminNavigation.tsx";
import {
  canAccessOrganizationAdmin,
  firstAccessibleOrganizationAdminPath,
} from "@/navigation/organizationAdminNavigation.tsx";

interface FlatItem {
  section: SaasAdminNavigationSection;
  item: SaasAdminNavigationItem;
}

function NotAvailable({ item }: { item: SaasAdminNavigationItem }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-10 text-center">
      <SearchX className="mx-auto h-8 w-8 text-slate-300" />
      <h1 className="mt-4 text-lg font-semibold text-slate-800">
        Access restricted
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        Your permissions do not include{" "}
        <span className="font-medium text-slate-700">{item.label}</span>. Use
        the navigation to reach a capability you are entitled to.
      </p>
    </section>
  );
}

function navPathMatches(pattern: string, pathname: string): boolean {
  if (pattern === pathname) return true;
  const escaped = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/:[A-Za-z]+/g, "[^/]+");
  return new RegExp(`^${escaped}(/.*)?$`).test(pathname);
}

export function SaasAdminSurface() {
  const location = useLocation();
  const navigate = useNavigate();
  const permissions = useAppSelector(selectPermissions);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const flat = useMemo<FlatItem[]>(
    () =>
      SAAS_ADMIN_NAVIGATION.flatMap((section) =>
        section.items.map((item) => ({ section, item })),
      ),
    [],
  );

  const hasAccess = useMemo(
    () => canAccessSaasAdmin(permissions),
    [permissions],
  );

  const matched = useMemo<FlatItem | null>(
    () =>
      flat.find((entry) =>
        navPathMatches(entry.item.path, location.pathname),
      ) ?? null,
    [flat, location.pathname],
  );

  const atBasePath =
    location.pathname === SAAS_ADMIN_BASE_PATH ||
    location.pathname === `${SAAS_ADMIN_BASE_PATH}/`;

  // Redirect the bare control-plane root to the first item the session may view.
  useEffect(() => {
    if (!hasAccess || !atBasePath) return;
    const target = firstAccessibleSaasAdminPath(permissions);
    if (target) navigate(target, { replace: true });
  }, [hasAccess, atBasePath, permissions, navigate]);

  if (!hasAccess) {
    // An organization session that reached a control-plane URL belongs in the
    // organization workspace — never show it a dead end.
    if (canAccessOrganizationAdmin(permissions)) {
      const orgTarget = firstAccessibleOrganizationAdminPath(permissions);
      if (orgTarget) return <Navigate to={orgTarget} replace />;
    }
    return <Unauthorized />;
  }

  if (atBasePath) {
    return null;
  }

  if (!matched) {
    return <NotFound />;
  }

  const current = matched;
  const canViewCurrent = canViewSaasAdminItem(
    permissions,
    current.section,
    current.item,
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <a
        href="#saas-admin-content"
        className="sr-only z-50 rounded bg-white p-3 focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Skip to main content
      </a>

      {drawerOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
        />
      ) : null}

      <SaasAdminSidebar
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 md:px-8">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setDrawerOpen(true)}
              className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
              <ol className="flex items-center gap-1.5 text-sm text-slate-500">
                <li className="truncate">SaaS Admin</li>
                <li className="truncate text-slate-300">/</li>
                <li className="truncate font-medium text-slate-800">
                  {current?.item.label ?? "Dashboard"}
                </li>
              </ol>
            </nav>
          </div>
        </header>

        <main
          id="saas-admin-content"
          className="mx-auto max-w-[1400px] px-4 py-6 md:px-8"
        >
          {canViewCurrent ? <Outlet /> : <NotAvailable item={current.item} />}
        </main>
      </div>
    </div>
  );
}
