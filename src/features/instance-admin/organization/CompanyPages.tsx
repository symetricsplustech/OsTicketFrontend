import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCompaniesQuery, useCompanyQuery, useCreateCompanyMutation, useUpdateCompanyMutation, type CompanyInput, type InstanceCompany } from "@shared/api/companyApi";

function message(error: unknown) {
  if (error && typeof error === "object" && "data" in error) {
    const data = (error as { data?: { message?: string; error?: string } }).data;
    return data?.message ?? data?.error ?? "Request failed.";
  }
  return "Request failed.";
}

export function CompanyListPage() {
  const { instanceId = "" } = useParams();
  const { data, error, isLoading, refetch } = useCompaniesQuery(instanceId, { skip: !instanceId });
  const [search, setSearch] = useState("");
  const rows = (data?.items ?? []).filter((item) => `${item.name} ${item.domain ?? ""} ${item.email ?? ""}`.toLowerCase().includes(search.toLowerCase()));
  return <section><header className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-bold">Companies</h1><p className="mt-1 text-sm text-slate-600">Companies belonging to this instance.</p></div><Link to="new" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Create company</Link></header><div className="rounded-xl border border-slate-200 bg-white"><div className="flex gap-2 border-b p-4"><input aria-label="Search companies" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search companies…" className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm" /><button onClick={() => void refetch()} className="rounded-lg border px-3 py-2 text-sm">Refresh</button></div>{isLoading ? <p role="status" className="p-6 text-sm">Loading companies…</p> : error ? <p role="alert" className="p-6 text-sm text-red-700">{message(error)}</p> : rows.length ? <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{["Company", "Domain", "Support email", "Status", "Type"].map((column) => <th key={column} className="px-4 py-3">{column}</th>)}</tr></thead><tbody>{rows.map((item) => <tr key={item._id} className="border-t"><td className="px-4 py-3"><Link to={item._id} className="font-semibold text-cyan-700 hover:underline">{item.name}</Link></td><td className="px-4 py-3">{item.domain || "—"}</td><td className="px-4 py-3">{item.email || "—"}</td><td className="px-4 py-3">{item.status || "active"}</td><td className="px-4 py-3">{item.isPrimary ? "Primary" : "Additional"}</td></tr>)}</tbody></table></div> : <p className="p-6 text-sm text-slate-600">No companies match this view.</p>}</div></section>;
}

function CompanyForm({ item, onDone }: { item?: InstanceCompany; onDone?: () => void }) {
  const { instanceId = "" } = useParams();
  const base = `/instances/${instanceId}/admin/organization/companies`;
  const navigate = useNavigate();
  const [create, createState] = useCreateCompanyMutation();
  const [update, updateState] = useUpdateCompanyMutation();
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">(item?.status ?? "active");
  const busy = createState.isLoading || updateState.isLoading;
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const body: CompanyInput = { name: String(values.name ?? "").trim(), domain: String(values.domain ?? "").trim().toLowerCase(), email: String(values.email ?? "").trim().toLowerCase(), phone: String(values.phone ?? "").trim(), address: String(values.address ?? "").trim() };
    if (body.name.length < 2) { setError("Company name must contain at least two characters."); return; }
    try {
      if (item) await update({ instanceId, companyId: item._id, body: { ...body, status } }).unwrap();
      else { const response = await create({ instanceId, body }).unwrap(); navigate(`${base}/${response.item._id}`, { replace: true }); return; }
      onDone?.();
    } catch (cause) { setError(message(cause)); }
  };
  return <form onSubmit={submit} className="max-w-3xl rounded-xl border bg-white p-6"><h1 className="text-xl font-bold">{item ? "Edit company" : "Create company"}</h1><p className="mt-1 text-sm text-slate-600">The company name must be unique in this instance.</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Company name *<input name="name" defaultValue={item?.name ?? ""} required minLength={2} maxLength={200} className="mt-1 w-full rounded-lg border px-3 py-2 font-normal" /></label><label className="text-sm font-semibold">Domain<input name="domain" defaultValue={item?.domain ?? ""} pattern="[A-Za-z0-9.-]+" title="Use a domain such as example.com" className="mt-1 w-full rounded-lg border px-3 py-2 font-normal" /></label><label className="text-sm font-semibold">Support email<input name="email" type="email" defaultValue={item?.email ?? ""} className="mt-1 w-full rounded-lg border px-3 py-2 font-normal" /></label><label className="text-sm font-semibold">Phone<input name="phone" type="tel" defaultValue={item?.phone ?? ""} maxLength={40} className="mt-1 w-full rounded-lg border px-3 py-2 font-normal" /></label><label className="text-sm font-semibold sm:col-span-2">Address<textarea name="address" defaultValue={item?.address ?? ""} maxLength={1000} rows={3} className="mt-1 w-full rounded-lg border px-3 py-2 font-normal" /></label>{item ? <label className="text-sm font-semibold">Status<select value={status} onChange={(event) => setStatus(event.target.value as "active" | "inactive")} disabled={item.isPrimary} className="mt-1 w-full rounded-lg border px-3 py-2 font-normal"><option value="active">Active</option><option value="inactive">Inactive</option></select></label> : null}</div>{error ? <p role="alert" className="mt-4 text-sm text-red-700">{error}</p> : null}<div className="mt-6 flex gap-2"><button disabled={busy} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Saving…" : item ? "Save changes" : "Create company"}</button><button type="button" onClick={() => item ? onDone?.() : navigate(base)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button></div></form>;
}

export function CompanyCreatePage() { return <CompanyForm />; }

export function CompanyDetailPage() {
  const { instanceId = "", companyId = "" } = useParams();
  const { data, error, isLoading } = useCompanyQuery({ instanceId, companyId }, { skip: !instanceId || !companyId });
  const [editing, setEditing] = useState(false);
  if (isLoading) return <p role="status">Loading company…</p>;
  if (error || !data?.item) return <p role="alert" className="text-red-700">{message(error)}</p>;
  if (editing) return <CompanyForm item={data.item} onDone={() => setEditing(false)} />;
  const item = data.item;
  return <section className="max-w-3xl"><Link to={`/instances/${instanceId}/admin/organization/companies`} className="text-sm text-cyan-700 hover:underline">← Companies</Link><article className="mt-4 rounded-xl border bg-white p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs uppercase text-slate-500">{item.isPrimary ? "Primary company" : "Company"}</p><h1 className="mt-1 text-2xl font-bold">{item.name}</h1></div><button onClick={() => setEditing(true)} className="rounded-lg border px-4 py-2 text-sm font-semibold">Edit</button></div><dl className="mt-6 grid gap-5 border-t pt-5 text-sm sm:grid-cols-2">{[["Domain", item.domain], ["Support email", item.email], ["Phone", item.phone], ["Address", item.address], ["Status", item.status]].map(([label, value]) => <div key={label}><dt className="text-xs uppercase text-slate-500">{label}</dt><dd className="mt-1 font-medium">{value || "—"}</dd></div>)}</dl></article></section>;
}
