import { useEffect, useMemo, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Menu, SearchX } from "lucide-react";
import { OrganizationAdminSidebar } from "@/screens/sidebar/OrganizationAdminSidebar";
import { Unauthorized } from "@app/layouts/Unauthorized";
import { useAppSelector } from "@store/hooks";
import { selectPermissions } from "@services/auth/authSlice";
import {
  canAccessOrganizationAdmin,
  canViewOrganizationAdminItem,
  locateOrganizationAdminScreen,
} from "@/navigation/organizationAdminNavigation.tsx";
import {
  canAccessSaasAdmin,
  firstAccessibleSaasAdminPath,
} from "@/navigation/saasAdminNavigation.tsx";
import { NotificationBell } from "@/components/common/NotificationBell";

function NotAvailable({ label }: { label: string }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-10 text-center">
      <SearchX className="mx-auto h-8 w-8 text-slate-300" />
      <h1 className="mt-4 text-lg font-semibold text-slate-800">
        Access restricted
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        Your permissions do not include{" "}
        <span className="font-medium text-slate-700">{label}</span>. Use the
        navigation to reach a capability you are entitled to.
      </p>
    </section>
  );
}

/**
 * Tenant Admin surface: shell for the Organization Admin workspace. All access
 * is scoped to the signed-in user's organization permissions.
 */
export function OrganizationAdminSurface() {
  const location = useLocation();
  const permissions = useAppSelector(selectPermissions);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const hasAccess = useMemo(
    () => canAccessOrganizationAdmin(permissions),
    [permissions],
  );
  const current = useMemo(
    () => locateOrganizationAdminScreen(location.pathname),
    [location.pathname],
  );

  const canViewCurrent = useMemo(() => {
    if (!current) return false;
    if (current.child) {
      return (
        canViewOrganizationAdminItem(permissions, current.item) &&
        canViewOrganizationAdminItem(permissions, current.child)
      );
    }
    return canViewOrganizationAdminItem(permissions, current.item);
  }, [current, permissions]);

  if (!hasAccess) {
    // A control-plane session that reached an organization URL belongs in the
    // SaaS admin surface — never show it a dead end.
    if (canAccessSaasAdmin(permissions)) {
      const saasTarget = firstAccessibleSaasAdminPath(permissions);
      if (saasTarget) return <Navigate to={saasTarget} replace />;
    }
    return <Unauthorized />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <a
        href="#organization-admin-content"
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

      <OrganizationAdminSidebar
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
                <li className="truncate">Organization Admin</li>
                <li className="truncate text-slate-300">/</li>
                <li className="truncate">
                  {current?.section.label ?? "Dashboard"}
                </li>
                <li className="truncate text-slate-300">/</li>
                <li className="truncate font-medium text-slate-800">
                  {current?.label ?? "Overview"}
                </li>
              </ol>
            </nav>
            <NotificationBell />
          </div>
        </header>

        <main
          id="organization-admin-content"
          className="mx-auto max-w-[1400px] px-4 py-6 md:px-8"
        >
          {canViewCurrent ? (
            <Outlet />
          ) : (
            <NotAvailable label={current?.label ?? "this screen"} />
          )}
        </main>
      </div>
    </div>
  );
}
