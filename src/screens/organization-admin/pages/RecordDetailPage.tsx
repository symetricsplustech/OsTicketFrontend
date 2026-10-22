import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface RecordDetailPageProps {
  section: string;
  /** Sidebar/screen label this record belongs to, e.g. "All Incidents". */
  collectionTitle: string;
  /** Path relative to /organization, used to scope the collection link. */
  routeKey: string;
}

/**
 * Generic nested record page (`…/:recordId`) for Organization Admin
 * destinations without a backend record source. It intentionally renders NO
 * fabricated attributes, activity timeline or related records — those were
 * demo-only and have been removed. Records reachable through
 * `TENANT_RESOURCE_LISTS` use `OrganizationResourceDetailScreen` instead.
 */
export function RecordDetailPage({
  section,
  collectionTitle,
  routeKey,
}: RecordDetailPageProps) {
  const { recordId } = useParams<{ recordId: string }>();

  const collectionHref = `/organization/${routeKey}`;

  return (
    <div className="space-y-6">
      <header className="min-w-0">
        <Link
          to={collectionHref}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {collectionTitle.toLowerCase()}
        </Link>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-brand-600">
          {section}
        </p>
        <h1 className="mt-1 flex flex-wrap items-center gap-3 text-2xl font-bold text-slate-900 md:text-3xl">
          {collectionTitle}
          <span className="rounded-md bg-slate-100 px-2 py-1 text-sm font-medium text-slate-600">
            {recordId ?? "—"}
          </span>
        </h1>
      </header>

      <section className="rounded-xl border border-amber-200 bg-amber-50 p-10 text-center">
        <p className="text-sm font-semibold text-amber-800">
          Not connected yet
        </p>
        <p className="mx-auto mt-2 max-w-xl text-sm text-amber-700">
          This record has no backend data source wired up — it is not fetched,
          edited or deleted from this screen, and nothing here is sample
          content.
        </p>
      </section>
    </div>
  );
}
