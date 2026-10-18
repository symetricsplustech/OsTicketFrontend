interface OrganizationAdminScreenProps {
  section: string;
  title: string;
  description: string;
}

const PLACEHOLDER_CARDS = [
  { label: "Active", width: "w-16" },
  { label: "Pending", width: "w-12" },
  { label: "Last updated", width: "w-24" },
];

/**
 * Placeholder body for a catalogued Organization Admin destination. Each
 * sidebar entry resolves to a screen that renders its own module content here.
 */
export function OrganizationAdminScreen({ section, title, description }: OrganizationAdminScreenProps) {
  return (
    <div>
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{section}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 outline-none md:text-3xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-500">{description}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {PLACEHOLDER_CARDS.map((card) => (
          <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{card.label}</p>
            <div className={`mt-3 h-7 rounded bg-slate-100 ${card.width}`} />
          </div>
        ))}
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-800">Module workspace</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-500">
          This destination is scoped to your organization and enforced by your role permissions.
          Configuration, records and reports shown here never cross into another organization.
        </p>
        <div className="mt-5 space-y-3">
          <div className="h-4 w-2/3 rounded bg-slate-100" />
          <div className="h-4 w-1/2 rounded bg-slate-100" />
          <div className="h-4 w-3/5 rounded bg-slate-100" />
        </div>
      </section>
    </div>
  );
}
