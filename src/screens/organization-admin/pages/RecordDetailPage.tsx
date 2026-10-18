import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button, Input, Select } from "@components/common/ui";
import { Badge, StatusBadge } from "@components/common/Badge";
import { showConfirm, showSuccess } from "@components/common/Toast/ToastContainer";

interface RecordDetailPageProps {
  section: string;
  /** Sidebar/screen label this record belongs to, e.g. "All Incidents". */
  collectionTitle: string;
  /** Path relative to /organization, used to scope the record prefix. */
  routeKey: string;
}

const OWNERS = ["Priya Nair", "Marcus Webb", "Elena Kovacs", "Tom Whitfield"];
const STATUSES = ["Open", "In Progress", "Resolved", "Pending approval"];

/**
 * Generic nested record page (`…/:recordId`) for every Organization Admin
 * collection. Renders a full record workspace — header, attributes, activity
 * timeline and related records — with working inline Edit and Delete actions.
 */
export function RecordDetailPage({ section, collectionTitle, routeKey }: RecordDetailPageProps) {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();
  const seed = (recordId ?? "rec").length + routeKey.length;

  const [owner, setOwner] = useState(OWNERS[seed % OWNERS.length]);
  const [status, setStatus] = useState(STATUSES[seed % STATUSES.length]);
  const [name, setName] = useState(
    `${collectionTitle.replace(/^All\s+/, "").replace(/s$/, "")} ${recordId ?? ""}`.trim(),
  );
  const [editing, setEditing] = useState(false);

  const collectionHref = `/organization/${routeKey}`;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <Link
            to={collectionHref}
            className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to {collectionTitle.toLowerCase()}
          </Link>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-brand-600">{section}</p>
          <h1 className="mt-1 flex flex-wrap items-center gap-3 text-2xl font-bold text-slate-900 md:text-3xl">
            {name}
            <StatusBadge status={status} />
            <Badge variant="muted">{recordId ?? "—"}</Badge>
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">
            {collectionTitle} record · owned by {owner}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditing((value) => !value)}>
            <Pencil className="h-4 w-4" />
            {editing ? "Close editor" : "Edit"}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() =>
              showConfirm({
                title: `Delete ${name}?`,
                message: "This action cannot be undone.",
                onConfirm: () => {
                  showSuccess("Record deleted", `${name} was removed.`);
                  navigate(collectionHref);
                },
              })
            }
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </header>

      {editing ? (
        <form
          className="rounded-xl border border-brand-200 bg-brand-50/40 p-6"
          onSubmit={(event) => {
            event.preventDefault();
            setEditing(false);
            showSuccess("Record updated", `${name} has been saved.`);
          }}
        >
          <h2 className="text-sm font-semibold text-slate-800">Edit record</h2>
          <div className="mt-4 grid gap-5 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="record-name">
                Name
              </label>
              <Input id="record-name" value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="record-status">
                Status
              </label>
              <Select id="record-status" value={status} onChange={(event) => setStatus(event.target.value)}>
                {STATUSES.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="record-owner">
                Owner
              </label>
              <Select id="record-owner" value={owner} onChange={(event) => setOwner(event.target.value)}>
                {OWNERS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </Select>
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button type="submit">Save changes</Button>
          </div>
        </form>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white lg:col-span-2">
          <h2 className="border-b border-slate-100 px-5 py-4 text-sm font-semibold text-slate-800">Attributes</h2>
          <dl className="grid gap-x-6 gap-y-4 px-5 py-5 sm:grid-cols-2">
            {[
              ["Record ID", recordId ?? "—"],
              ["Status", status],
              ["Owner", owner],
              ["Assignment group", ["Tier 1 Support", "Platform SRE", "Network Ops", "Field Service"][seed % 4]],
              ["Priority", ["Critical", "High", "Medium", "Low"][seed % 4]],
              ["Department", ["IT Operations", "Finance", "Facilities", "Engineering"][seed % 4]],
              ["Created", "Oct 14, 2026 · 09:12"],
              ["Last updated", editing ? "Unsaved changes" : "2 hours ago"],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
                <dd className="mt-1 text-sm text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-800">SLA</h2>
          <div className="mt-4 space-y-4">
            {[
              { label: "Response target", value: "Met (18m / 1h)", ok: true },
              { label: "Resolution target", value: "4h remaining", ok: true },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{row.label}</span>
                <Badge variant={row.ok ? "success" : "warning"}>{row.value}</Badge>
              </div>
            ))}
          </div>
          <h2 className="mt-6 text-sm font-semibold text-slate-800">Tags</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {["acmetech", "tier-1", "vip"].map((tag) => (
              <Badge key={tag} variant="muted">
                {tag}
              </Badge>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white">
        <h2 className="border-b border-slate-100 px-5 py-4 text-sm font-semibold text-slate-800">Activity</h2>
        <ol className="space-y-0 px-5 py-4">
          {[
            { title: "Status changed to In Progress", actor: owner, time: "2 hours ago" },
            { title: "Assigned to assignment group", actor: "Automation rule", time: "4 hours ago" },
            { title: "Record created", actor: "Service portal", time: "Yesterday · 16:40" },
          ].map((entry, index, list) => (
            <li key={entry.title} className="relative flex gap-4 pb-6 last:pb-0">
              {index < list.length - 1 ? <span className="absolute left-[7px] top-6 h-full w-px bg-slate-200" aria-hidden /> : null}
              <span className="mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full bg-emerald-500 ring-4 ring-white" />
              <div>
                <p className="text-sm font-medium text-slate-800">{entry.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {entry.actor} · {entry.time}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white">
        <h2 className="border-b border-slate-100 px-5 py-4 text-sm font-semibold text-slate-800">Related records</h2>
        <table className="min-w-full text-sm">
          <tbody className="divide-y divide-slate-100">
            {[
              ["Linked change", "CHG-2074 – TLS cert renewal"],
              ["Duplicate of", "INC-10381"],
              ["Problem record", "PRB-401 – Intermittent CRM timeouts"],
            ].map(([kind, value]) => (
              <tr key={kind} className="hover:bg-slate-50/70">
                <td className="w-48 px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-400">{kind}</td>
                <td className="px-5 py-3 font-medium text-slate-800">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
