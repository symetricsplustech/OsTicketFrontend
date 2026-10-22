/**
 * Generic Organization Admin page for sidebar destinations that do not have a
 * backend data source wired up yet. It intentionally renders NO sample or
 * fabricated content — every former body (stats, tables, settings forms,
 * activity feeds, calendars, workflow diagrams) was demo-only and has been
 * replaced by this honest state.
 *
 * Screens with real endpoints are routed ABOVE this component in
 * `organizationAdminRoutes.tsx` via `TENANT_RESOURCE_LISTS`,
 * `TENANT_RESOURCE_PANELS` and `TENANT_SCREEN_ROUTES`.
 */
export interface OrganizationAdminPageProps {
  sectionKey: string;
  section: string;
  title: string;
  description: string;
  /** Path relative to /organization, e.g. "incident-management/all-incidents". */
  routeKey: string;
}

export function OrganizationAdminPage({
  section,
  title,
  description,
}: OrganizationAdminPageProps) {
  return (
    <div>
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
          {section}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 outline-none md:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-500">{description}</p>
      </header>
      <section className="rounded-xl border border-amber-200 bg-amber-50 p-10 text-center">
        <p className="text-sm font-semibold text-amber-800">
          Not connected yet
        </p>
        <p className="mx-auto mt-2 max-w-xl text-sm text-amber-700">
          “{title}” does not have a backend data source wired up, so this screen
          shows no data. Nothing here is sample or placeholder content.
        </p>
      </section>
    </div>
  );
}
