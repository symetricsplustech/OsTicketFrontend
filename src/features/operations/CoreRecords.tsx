import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_URL } from "@shared/api/base";
import { TokenStore } from "@shared/auth/tokenStore";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";

type Domain = "incidents" | "problems" | "changes" | "requests" | "knowledge" | "major-incidents" | "cmdb" | "services" | "releases" | "improvements" | "outages";
type RecordData = Record<string, unknown> & { _id?: string; number?: string; title?: string; description?: string; status?: string; priority?: string; assignedTo?: { name?: string } | string; updatedAt?: string };
type ListResponse = { items: RecordData[]; total: number; page: number; pages: number };

const labels: Record<Domain, string> = {
  incidents: "Incident", problems: "Problem", changes: "Change",
  requests: "Request", knowledge: "Knowledge", "major-incidents": "Major Incident",
  cmdb: "Configuration Item", services: "Service", releases: "Release",
  improvements: "Improvement", outages: "Outage",
};

const fields: Record<Domain, Array<{ name: string; label: string; required?: boolean; type?: string; options?: string[] }>> = {
  incidents: [
    { name: "title", label: "Short description", required: true }, { name: "description", label: "Description", required: true, type: "textarea" },
    { name: "category", label: "Category", required: true }, { name: "subcategory", label: "Subcategory" }, { name: "service", label: "Service" },
    { name: "impact", label: "Impact", required: true, type: "select", options: ["low", "medium", "high"] },
    { name: "urgency", label: "Urgency", required: true, type: "select", options: ["low", "medium", "high"] },
    { name: "businessImpact", label: "Business impact", type: "textarea" }, { name: "initialNotes", label: "Initial notes", type: "textarea" },
  ],
  problems: [
    { name: "title", label: "Short description", required: true }, { name: "description", label: "Description", required: true, type: "textarea" },
    { name: "category", label: "Category" }, { name: "service", label: "Service" }, { name: "businessImpact", label: "Business impact", type: "textarea" },
  ],
  changes: [
    { name: "title", label: "Short description", required: true }, { name: "description", label: "Description", required: true, type: "textarea" },
    { name: "type", label: "Change type", required: true, type: "select", options: ["standard", "normal", "emergency"] },
    { name: "businessJustification", label: "Business justification", required: true, type: "textarea" },
    { name: "implementationPlan", label: "Implementation plan", required: true, type: "textarea" },
    { name: "testPlan", label: "Test plan", required: true, type: "textarea" },
    { name: "backoutPlan", label: "Backout plan", required: true, type: "textarea" },
    { name: "windowStart", label: "Planned start", required: true, type: "datetime-local" },
    { name: "windowEnd", label: "Planned end", required: true, type: "datetime-local" },
  ],
  requests: [
    { name: "title", label: "Short description", required: true }, { name: "description", label: "Description", required: true, type: "textarea" },
    { name: "category", label: "Category" }, { name: "service", label: "Service" },
  ],
  knowledge: [
    { name: "title", label: "Title", required: true }, { name: "description", label: "Description", required: true, type: "textarea" },
    { name: "category", label: "Category" }, { name: "tags", label: "Tags" },
  ],
  "major-incidents": [
    { name: "title", label: "Title", required: true }, { name: "description", label: "Description", required: true, type: "textarea" },
    { name: "severity", label: "Severity", required: true, type: "select", options: ["p1", "p2", "p3", "p4"] },
    { name: "status", label: "Status" },
  ],
  cmdb: [
    { name: "name", label: "Name", required: true }, { name: "type", label: "Type", required: true },
    { name: "description", label: "Description", type: "textarea" }, { name: "status", label: "Status" },
  ],
  services: [
    { name: "name", label: "Name", required: true }, { name: "description", label: "Description", type: "textarea" },
    { name: "status", label: "Status" }, { name: "ciCount", label: "CI Count", type: "number" },
  ],
  releases: [
    { name: "title", label: "Title", required: true }, { name: "description", label: "Description", type: "textarea" },
    { name: "version", label: "Version" }, { name: "status", label: "Status" },
  ],
  improvements: [
    { name: "title", label: "Title", required: true }, { name: "description", label: "Description", type: "textarea" },
    { name: "type", label: "Type" }, { name: "status", label: "Status" },
  ],
  outages: [
    { name: "title", label: "Title", required: true }, { name: "description", label: "Description", type: "textarea" },
    { name: "severity", label: "Severity", type: "select", options: ["critical", "major", "minor"] },
    { name: "status", label: "Status" },
  ],
};

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = TokenStore.get();
  if (!token) throw new Error("Sign in and select an instance to access these records.");
  const response = await fetch(`${API_URL}/core${path}`, { ...options, headers: { "content-type": "application/json", authorization: `Bearer ${token}`, ...options.headers } });
  const payload = await response.json().catch(() => ({})) as { message?: string; error?: string };
  if (!response.ok) throw new Error(payload.message ?? payload.error ?? `Request failed (${response.status})`);
  return payload as T;
}

function errorText(error: unknown) { return error instanceof Error ? error.message : "The request could not be completed." }
function display(value: unknown) { if (value == null || value === "") return "—"; if (typeof value === "object") return (value as { name?: string; number?: string }).name ?? (value as { number?: string }).number ?? "—"; return String(value); }

export function CoreRecords({ screen, domain }: { screen: ScreenDefinition; domain: Domain }) {
  if (screen.kind === "list") return <CoreList domain={domain} />;
  if (screen.kind === "settings") return <CoreCreate domain={domain} />;
  return <CoreDetail domain={domain} />;
}

function CoreList({ domain }: { domain: Domain }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [data, setData] = useState<ListResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => { let active = true; setLoading(true); setError(""); const query = new URLSearchParams({ page: String(page), limit: "25" }); if (submittedSearch) query.set("search", submittedSearch); if (status) query.set("status", status); api<ListResponse>(`/${domain}?${query}`).then((value) => { if (active) setData(value); }).catch((cause) => { if (active) { setError(errorText(cause)); setData(null); } }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [domain, page, submittedSearch, status, revision]);
  const base = location.pathname.replace(/\/$/, "");
  return <section className="rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-wrap items-center gap-3 border-b p-4"><form onSubmit={(event) => { event.preventDefault(); setPage(1); setSubmittedSearch(search.trim()); }} className="flex min-w-60 flex-1 gap-2"><input aria-label={`Search ${domain}`} value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${domain}…`} className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm" /><button className="rounded-lg border px-3 py-2 text-sm font-semibold">Search</button></form><select aria-label="Filter by state" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="rounded-lg border px-3 py-2 text-sm"><option value="">All states</option>{["new", "in_progress", "on_hold", "resolved", "closed"].map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select><button onClick={() => setRevision((value) => value + 1)} className="rounded-lg border px-3 py-2 text-sm">Refresh</button><button onClick={() => navigate(`${base}/new`)} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">Create {labels[domain].toLowerCase()}</button></div>
    {loading ? <p role="status" className="p-6 text-sm text-slate-600">Loading {domain}…</p> : error ? <p role="alert" className="p-6 text-sm text-red-700">{error}</p> : !data?.items?.length ? <p className="p-6 text-sm text-slate-600">No {domain} match this view.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{["Number", "Short description", "State", "Priority", "Assigned to", "Updated"].map((heading) => <th key={heading} className="px-4 py-3">{heading}</th>)}</tr></thead><tbody>{data.items.map((record) => <tr key={record._id} className="border-t hover:bg-cyan-50"><td className="px-4 py-3"><button onClick={() => navigate(`${base}/${record._id}`)} className="font-bold text-cyan-700 hover:underline">{display(record.number)}</button></td><td className="px-4 py-3">{display(record.title)}</td><td className="px-4 py-3">{display(record.status)}</td><td className="px-4 py-3">{display(record.priority)}</td><td className="px-4 py-3">{display(record.assignedTo)}</td><td className="px-4 py-3">{record.updatedAt ? new Date(record.updatedAt).toLocaleString() : "—"}</td></tr>)}</tbody></table></div>}
    <footer className="flex items-center justify-between border-t p-4 text-sm text-slate-600"><span>{data?.total ?? 0} records</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded border px-3 py-1 disabled:opacity-40">Previous</button><span className="px-2 py-1">Page {page}</span><button disabled={!data || page >= data.pages} onClick={() => setPage((value) => value + 1)} className="rounded border px-3 py-1 disabled:opacity-40">Next</button></div></footer></section>;
}

function CoreCreate({ domain }: { domain: Domain }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const body = Object.fromEntries(new FormData(event.currentTarget).entries()); if (domain === "changes" && new Date(String(body.windowEnd)) <= new Date(String(body.windowStart))) { setError("Planned end must be after planned start."); return; } setSaving(true); setError(""); try { const response = await api<{ data: RecordData }>(`/${domain}`, { method: "POST", body: JSON.stringify(body) }); if (!response.data?._id) throw new Error("The server did not return a record ID."); navigate(location.pathname.replace(/\/new$/, `/${response.data._id}`)); } catch (cause) { setError(errorText(cause)); } finally { setSaving(false); } };
  return <form onSubmit={submit} className="max-w-4xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold">Create {labels[domain].toLowerCase()}</h2><p className="mt-1 text-sm text-slate-500">Required fields are marked with an asterisk. The server validates the record and assigns its number.</p><div className="mt-6 grid gap-5 md:grid-cols-2">{fields[domain].map((field) => <label key={field.name} className={field.type === "textarea" ? "md:col-span-2" : ""}><span className="mb-1 block text-sm font-semibold">{field.label}{field.required ? " *" : ""}</span>{field.type === "textarea" ? <textarea name={field.name} required={field.required} maxLength={5000} rows={4} className="w-full rounded-lg border px-3 py-2" /> : field.type === "select" ? <select name={field.name} required={field.required} defaultValue="" className="w-full rounded-lg border px-3 py-2"><option value="" disabled>Select…</option>{field.options?.map((option) => <option key={option} value={option}>{option}</option>)}</select> : <input name={field.name} type={field.type ?? "text"} required={field.required} maxLength={field.type === "text" || !field.type ? 255 : undefined} className="w-full rounded-lg border px-3 py-2" />}</label>)}</div>{error ? <p role="alert" className="mt-5 text-sm text-red-700">{error}</p> : null}<div className="mt-6 flex gap-2"><button disabled={saving} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Creating…" : `Create ${labels[domain].toLowerCase()}`}</button><button type="button" onClick={() => navigate(location.pathname.replace(/\/new$/, ""))} className="rounded-lg border px-4 py-2 text-sm">Cancel</button></div></form>;
}

const nextStates: Record<Domain, Record<string, string[]>> = {
  incidents: { new: ["in_progress", "on_hold_caller", "resolved", "canceled"], in_progress: ["on_hold_caller", "on_hold_change", "on_hold_problem", "on_hold_vendor", "resolved", "canceled"], on_hold_caller: ["in_progress", "canceled"], on_hold_change: ["in_progress", "canceled"], on_hold_problem: ["in_progress", "canceled"], on_hold_vendor: ["in_progress", "canceled"], resolved: ["closed", "in_progress"], closed: ["in_progress"] },
  problems: { new: ["assess", "canceled"], assess: ["root_cause_analysis", "fix_in_progress", "resolved", "canceled"], root_cause_analysis: ["fix_in_progress", "assess", "canceled"], fix_in_progress: ["resolved", "root_cause_analysis"], resolved: ["closed", "fix_in_progress"], closed: ["assess"] },
  changes: { new: ["assess", "canceled"], assess: ["authorize", "canceled"], authorize: ["scheduled", "assess", "canceled"], scheduled: ["implement", "authorize", "canceled"], implement: ["review", "scheduled"], review: ["closed", "implement"], closed: [] },
  requests: { new: ["in_progress", "resolved", "canceled"], in_progress: ["resolved", "canceled"], resolved: ["closed"], closed: [] },
  knowledge: { new: ["draft", "published"], draft: ["published", "archived"], published: ["archived"], archived: [] },
  "major-incidents": { new: ["active", "resolved"], active: ["resolved", "closed"], resolved: ["closed"], closed: [] },
  cmdb: { new: ["active", "inactive"], active: ["inactive", "deleted"], inactive: ["active"], deleted: [] },
  services: { new: ["active", "inactive"], active: ["inactive", "retired"], inactive: ["active", "retired"], retired: [] },
  releases: { new: ["scheduled", "in_progress", "completed"], scheduled: ["in_progress", "canceled"], in_progress: ["completed", "rolled_back"], completed: [], rolled_back: ["in_progress"] },
  improvements: { new: ["approved", "in_progress", "rejected"], approved: ["in_progress", "rejected"], in_progress: ["completed", "rejected"], completed: [], rejected: [] },
  outages: { new: ["in_progress", "resolved"], in_progress: ["resolved", "closed"], resolved: ["closed"], closed: [] },
};

function CoreDetail({ domain }: { domain: Domain }) {
  const location = useLocation();
  const id = location.pathname.split("/").filter(Boolean).at(-1) ?? "";
  const [record, setRecord] = useState<RecordData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api<{ data: RecordData }>(`/${domain}/${encodeURIComponent(id)}`)
      .then((value) => { if (active) { setRecord(value.data); setStatus(value.data.status ?? ""); setError(""); } })
      .catch((cause) => { if (active) { setRecord(null); setError(errorText(cause)); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [domain, id, revision]);

  const transition = async (event: FormEvent) => {
    event.preventDefault();
    if (!status || status === record?.status) return;
    setBusy(true); setError("");
    try {
      await api(`/${domain}/${encodeURIComponent(id)}/transition`, { method: "POST", body: JSON.stringify({ status }) });
      setRevision((value) => value + 1);
    } catch (cause) { setError(errorText(cause)); }
    finally { setBusy(false); }
  };
  const postNote = async (event: FormEvent) => {
    event.preventDefault();
    if (!note.trim() || domain === "changes") return;
    setBusy(true); setError("");
    try {
      await api(`/${domain}/${encodeURIComponent(id)}/comment`, { method: "POST", body: JSON.stringify({ message: note.trim(), type: "work_note" }) });
      setNote(""); setRevision((value) => value + 1);
    } catch (cause) { setError(errorText(cause)); }
    finally { setBusy(false); }
  };
  if (loading) return <p role="status" className="rounded-xl border bg-white p-6">Loading {labels[domain].toLowerCase()}…</p>;
  if (!record) return <p role="alert" className="rounded-xl border bg-white p-6 text-red-700">{error || "Record not found."}</p>;
  const allowed = nextStates[domain][record.status ?? ""] ?? [];
  const timeline = Array.isArray(record.timeline) ? record.timeline as Array<{ at?: string; message?: string }> : [];
  return <div className="space-y-5">
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase text-cyan-700">{record.number}</p><h2 className="mt-1 text-xl font-bold">{record.title}</h2></div><span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">{record.status}</span></div>
      <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-slate-700">{record.description || "No description supplied."}</p>
      <dl className="mt-6 grid gap-4 border-t pt-5 text-sm sm:grid-cols-3">{["priority", "category", "assignedTo", "assignmentGroup", "createdAt", "updatedAt"].map((key) => <div key={key}><dt className="text-xs uppercase text-slate-500">{key.replace(/([A-Z])/g, " $1")}</dt><dd className="mt-1 font-medium">{display(record[key])}</dd></div>)}</dl>
    </article>
    <div className="grid gap-5 lg:grid-cols-2">
      <form onSubmit={transition} className="rounded-xl border bg-white p-5"><h3 className="font-bold">Lifecycle action</h3><p className="mt-1 text-xs text-slate-500">Available targets from the current state; the server validates the transition and your permission.</p><div className="mt-4 flex gap-2"><select aria-label="New state" value={status} onChange={(event) => setStatus(event.target.value)} className="flex-1 rounded-lg border px-3 py-2 text-sm"><option value={record.status}>{record.status}</option>{allowed.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select><button disabled={busy || status === record.status} className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-40">Apply</button></div></form>
      {domain !== "changes" ? <form onSubmit={postNote} className="rounded-xl border bg-white p-5"><h3 className="font-bold">Add work note</h3><textarea aria-label="Work note" required maxLength={5000} value={note} onChange={(event) => setNote(event.target.value)} rows={3} className="mt-3 w-full rounded-lg border p-3 text-sm" /><button disabled={busy || !note.trim()} className="mt-2 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-40">Post note</button></form> : null}
    </div>
    <article className="rounded-xl border bg-white p-5"><h3 className="font-bold">Activity</h3>{timeline.length ? <ol className="mt-4 space-y-3">{timeline.map((entry, index) => <li key={index} className="rounded-lg bg-slate-50 p-3 text-sm"><p>{entry.message}</p><time className="mt-1 block text-xs text-slate-500">{entry.at ? new Date(entry.at).toLocaleString() : ""}</time></li>)}</ol> : <p className="mt-3 text-sm text-slate-500">No activity recorded.</p>}</article>
    {error ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
  </div>;
}
