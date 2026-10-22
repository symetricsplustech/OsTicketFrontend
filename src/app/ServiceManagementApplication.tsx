import { Suspense, useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useRoutes } from "react-router-dom";
import { ChevronRight, Lock, Menu, SearchX } from "lucide-react";
import { RequireSession } from "@app/auth/RequireSession";
import { AUTH_ROUTES } from "@/screens/auth/authRoutes";
import { SAAS_ADMIN_ROUTES } from "@/screens/saas-admin/saasAdminRoutes";
import { ORGANIZATION_ADMIN_ROUTES } from "@/screens/organization-admin/organizationAdminRoutes";
import { ScreenPlaceholder } from "@/screens/saas-admin/components/ScreenPlaceholder";
import { useAppSelector } from "@store/hooks";
import { selectAuth } from "@services/auth/authSlice";
import { canAny } from "@services/authorization/permissions";
import { requiredPermissionsForPath } from "@/navigation/routeAccess";
import { SideNavigation } from "../navigation/SideNavigation.tsx";
import { resolveNavigation } from "../navigation/resolveNavigation.ts";
import {
  SCREEN_ROUTES,
  modulePath,
  type ScreenRoute,
} from "../navigation/screenRegistry.ts";

interface ScreenDefinition {
  title: string;
  description?: string;
  phase?: number;
  module?: string;
  area?: string;
  path?: string;
}

const DEMO_INSTANCE = "demo";

function instanceFromPath(pathname: string): string {
  const [, , instance] = pathname.split("/");
  return instance && instance !== "work" ? instance : DEMO_INSTANCE;
}

function matchesPattern(pattern: string, pathname: string): boolean {
  const source = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(":instanceId", "[^/]+");
  return new RegExp(`^${source}/?$`).test(pathname);
}

const SCREEN_PATH_PREFIX = "/instances/:instanceId/";

function findScreen(
  pathname: string,
  instanceId: string,
): ScreenRoute | undefined {
  if (!pathname.startsWith(`/instances/${instanceId}/`)) return undefined;
  const rest = pathname.slice(`/instances/${instanceId}/`.length);
  if (!rest) return undefined;
  return [...SCREEN_ROUTES]
    .filter((a): a is ScreenRoute => !!a.path)
    .sort((a, b) => (b.path?.length ?? 0) - (a.path?.length ?? 0))
    .find((item) => {
      if (!item.path) return false;
      const template = item.path.slice(SCREEN_PATH_PREFIX.length);
      return rest === template || rest.startsWith(`${template}/`);
    });
}

const ALIAS_TARGETS: Record<string, readonly [number, string]> = {
  [`/instances/:instanceId/admin`]: [0, "instance"],
  [`/instances/:instanceId/workspace/service-desk`]: [1, "home"],
  [`/instances/:instanceId/workspace/incidents`]: [2, "home"],
  [`/instances/:instanceId/workspace/major-incidents`]: [3, "home"],
  [`/instances/:instanceId/workspace/problems`]: [4, "home"],
  [`/instances/:instanceId/workspace/changes`]: [5, "home"],
  [`/instances/:instanceId/workspace/requests`]: [6, "home"],
  [`/instances/:instanceId/workspace/catalog`]: [7, "home"],
  [`/instances/:instanceId/workspace/universal-requests`]: [8, "home"],
  [`/instances/:instanceId/workspace/knowledge`]: [9, "home"],
  [`/instances/:instanceId/workspace/service-levels`]: [10, "home"],
};

const moduleRootAliases = new Map<string, string>();
for (const route of SCREEN_ROUTES) {
  if (!route.path) continue;
  const root = route.path.replace(/\/[^/]+$/, "");
  const rest = root.slice(SCREEN_PATH_PREFIX.length);
  if (rest.split("/").length >= 2 && !moduleRootAliases.has(root)) {
    moduleRootAliases.set(root, route.path);
  }
}

function resolveAlias(pathname: string, instanceId: string): string | null {
  for (const [alias, target] of moduleRootAliases) {
    if (matchesPattern(alias, pathname))
      return target.replace(":instanceId", instanceId);
  }
  for (const [alias, [phase, module]] of Object.entries(ALIAS_TARGETS)) {
    const target = modulePath(phase, module);
    if (target && matchesPattern(alias, pathname))
      return target.replace(":instanceId", instanceId);
  }
  return null;
}

function renderScreen(screen: ScreenDefinition) {
  return <ScreenPlaceholder screen={screen} />;
}

function NotAvailable() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-10 text-center">
      <SearchX className="mx-auto h-8 w-8 text-slate-300" />
      <h1 className="mt-4 text-lg font-semibold text-slate-800">
        Page not available
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        This address does not match any screen you have access to. Use the
        navigation to reach a capability you are entitled to.
      </p>
    </section>
  );
}

function AccessDenied() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-10 text-center">
      <Lock className="mx-auto h-8 w-8 text-slate-300" />
      <h1 className="mt-4 text-lg font-semibold text-slate-800">
        Access denied
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        You do not have permission to view this screen. Use the navigation to
        reach a capability you are entitled to.
      </p>
    </section>
  );
}

function WorkArea({ instanceId }: { instanceId: string }) {
  const location = useLocation();
  const auth = useAppSelector(selectAuth);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    headingRef.current?.focus();
  }, [location.pathname]);

  const areas = resolveNavigation(auth.permissions, instanceId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <a
        href="#main-content"
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

      <SideNavigation
        instanceId={instanceId}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      <div className="lg:pl-72">
        <TopBar
          instanceId={instanceId}
          onOpenNavigation={() => setDrawerOpen(true)}
        />

        <main
          id="main-content"
          className="mx-auto max-w-[1400px] px-4 py-6 md:px-8"
        >
          <SurfaceBody
            instanceId={instanceId}
            permissions={auth.permissions}
            headingRef={headingRef}
          />
        </main>
      </div>
    </div>
  );
}

function TopBar({
  instanceId,
  onOpenNavigation,
}: {
  instanceId: string;
  onOpenNavigation: () => void;
}) {
  const location = useLocation();
  const auth = useAppSelector(selectAuth);
  const areas = resolveNavigation(auth.permissions, instanceId);
  const screen = findScreen(location.pathname, instanceId);
  const here = screen ? locateScreen(areas, screen) : null;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 md:px-8">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={onOpenNavigation}
          className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
          <ol className="flex items-center gap-1.5 text-sm text-slate-500">
            <li className="truncate">
              {auth.selectedInstance?.name ?? "Workspace"}
            </li>
            {here ? (
              <>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                <li className="truncate">{here.area}</li>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                <li className="truncate font-medium text-slate-800">
                  {here.item}
                </li>
              </>
            ) : null}
          </ol>
        </nav>
      </div>
    </header>
  );
}

function locateScreen(
  areas: ReturnType<typeof resolveNavigation>,
  screen: Pick<ScreenRoute, "phase" | "module">,
): { area: string; item: string; href: string } | null {
  const key = `${screen.phase ?? 0}:${screen.module ?? ""}`;
  for (const area of areas) {
    for (const item of area.items) {
      if (`${item.phase}:${item.module}` === key) {
        return { area: area.label, item: item.label, href: item.href };
      }
    }
  }
  return null;
}

interface SurfaceBodyProps {
  instanceId: string;
  permissions: string[];
  headingRef: React.RefObject<HTMLHeadingElement>;
}

function SurfaceBody({
  instanceId,
  permissions,
  headingRef,
}: SurfaceBodyProps) {
  const location = useLocation();
  const screen = findScreen(location.pathname, instanceId);
  if (screen) {
    const required = requiredPermissionsForPath(location.pathname);
    if (required !== null && !canAny(permissions, required)) {
      return <AccessDenied />;
    }
    const areas = resolveNavigation(permissions, instanceId);
    const here = locateScreen(areas, screen);
    return (
      <>
        <header className="mb-6">
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-2xl font-bold text-slate-900 outline-none md:text-3xl"
          >
            {screen.title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">
            {screen.description}
          </p>
          {here ? (
            <Link
              to={here.href}
              className="mt-2 inline-block text-xs font-medium text-brand-600 hover:underline"
            >
              Go to {here.item}
            </Link>
          ) : null}
        </header>
        {renderScreen(screen)}
      </>
    );
  }

  const alias = resolveAlias(location.pathname, instanceId);
  if (alias) return <Navigate to={alias} replace />;

  return <NotAvailable />;
}

function AppRoutes({ instanceId }: { instanceId: string }) {
  const routes = useRoutes([
    { path: "/", element: <Navigate to="/login" replace /> },
    ...AUTH_ROUTES,
    ...SAAS_ADMIN_ROUTES,
    ...ORGANIZATION_ADMIN_ROUTES,
    {
      path: `/instances/${instanceId}/*`,
      element: <WorkArea instanceId={instanceId} />,
    },
    { path: "*", element: <NotAvailable /> },
  ]);
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <span className="text-sm text-slate-500">Loading…</span>
        </div>
      }
    >
      {routes}
    </Suspense>
  );
}

export function ServiceManagementApplication() {
  return (
    <RequireSession>
      <AppRoutes instanceId={DEMO_INSTANCE} />
    </RequireSession>
  );
}
