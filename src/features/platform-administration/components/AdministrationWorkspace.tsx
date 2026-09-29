import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { selectAuth, selectPermissions } from "@shared/auth/authSlice";
import { useAppSelector } from "@shared/store/hooks";
import { useAuditQuery, useDelegationsQuery, useDirectoryQuery, useSessionsQuery } from "@shared/api/instanceApi";
import type { ApiRecord } from "@shared/api/itsmTypes";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { administrationRows, useCreateAdministrationRecordMutation, useDeleteAdministrationRecordMutation, useGetInstancePreferencesQuery, useGetInstanceProfileQuery, useListAdministrationRecordsQuery, useListInstanceModulesQuery, useUpdateAdministrationRecordMutation, useUpdateInstancePreferencesMutation } from "../api/platformAdministrationApi";
import { administrationResource } from "../model/administrationResource";

const value = (record: ApiRecord, ...keys: string[]) => String(keys.map((key) => record[key]).find((item) => item != null) ?? "");

export function AdministrationWorkspace({ screen, instanceId }: { screen: ScreenDefinition; instanceId: string }) {
  const resource = administrationResource(screen);
  const modulesScreen = screen.module === "instance" && /module|entitlement/i.test(screen.title);
  const specialScreen = ["users", "delegation", "audit", "identity"].includes(screen.module ?? "");
  const auth = useAppSelector(selectAuth);
  const userId = auth.user?._id ?? "";
  // System Preferences belong to the signed-in user, so they read their own
  // endpoint. They used to fall through to the instance profile, which rendered
  // the tenant record on a user's preference screen.
  const preferencesScreen = screen.module === "preferences";
  const profile = useGetInstanceProfileQuery(instanceId, { skip: Boolean(resource) || modulesScreen || specialScreen || preferencesScreen });
  const preferences = useGetInstancePreferencesQuery(instanceId, { skip: !preferencesScreen });
  const collection = useListAdministrationRecordsQuery({ instanceId, resource: resource ?? "roles" }, { skip: !resource });
  const modules = useListInstanceModulesQuery(instanceId, { skip: !modulesScreen });
  const directory = useDirectoryQuery({ instanceId, limit: 100 }, { skip: screen.module !== "users" });
  const delegations = useDelegationsQuery({ instanceId, includeInactive: true }, { skip: screen.module !== "delegation" });
  const sessions = useSessionsQuery({ instanceId, userId }, { skip: screen.module !== "identity" || !userId });
  const audit = useAuditQuery({ limit: 100 }, { skip: screen.module !== "audit" });
  const specialRecords = screen.module === "users" ? directory.data?.items : screen.module === "delegation" ? delegations.data?.items : screen.module === "identity" ? sessions.data?.items : screen.module === "audit" ? audit.data?.events : undefined;
  const records = useMemo(() => specialRecords ? specialRecords as unknown as ApiRecord[] : administrationRows(resource ? collection.data : modulesScreen ? modules.data : preferencesScreen ? preferences.data : profile.data), [specialRecords, collection.data, modules.data, preferences.data, profile.data, resource, modulesScreen, preferencesScreen]);
  const specialQuery = screen.module === "users" ? directory : screen.module === "delegation" ? delegations : screen.module === "identity" ? sessions : audit;
  const loading = specialScreen ? specialQuery.isLoading : resource ? collection.isLoading : modulesScreen ? modules.isLoading : preferencesScreen ? preferences.isLoading : profile.isLoading;
  const error = specialScreen ? specialQuery.isError : resource ? collection.isError : modulesScreen ? modules.isError : preferencesScreen ? preferences.isError : profile.isError;
  const refetch = specialScreen ? specialQuery.refetch : resource ? collection.refetch : modulesScreen ? modules.refetch : preferencesScreen ? preferences.refetch : profile.refetch;
  if (loading) return <div role="status" className="animate-pulse rounded-xl border bg-white p-8"><div className="h-8 w-64 rounded bg-slate-200" /><div className="mt-5 h-64 rounded bg-slate-100" /></div>;
  if (error) return <section role="alert" className="rounded-xl border border-red-200 bg-white p-8"><h2 className="font-bold text-red-800">Administration API unavailable</h2><button onClick={() => void refetch()} className="mt-4 rounded bg-slate-900 px-4 py-2 text-sm text-white">Retry</button></section>;
  return resource ? <AdministrationCollection screen={screen} instanceId={instanceId} resource={resource} records={records} /> : preferencesScreen ? <AdministrationPreferencesView screen={screen} instanceId={instanceId} record={records[0] ?? null} /> : <AdministrationReadView screen={screen} records={records} />;
}

function AdministrationCollection({ screen, instanceId, resource, records }: { screen: ScreenDefinition; instanceId: string; resource: NonNullable<ReturnType<typeof administrationResource>>; records: ApiRecord[] }) {
  const permissions = useAppSelector(selectPermissions);
  const canWrite = permissions.includes("*") || permissions.some((permission) => permission.startsWith("instance.") && /create|update|delete|manage/.test(permission));
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<ApiRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [createRecord] = useCreateAdministrationRecordMutation();
  const [updateRecord] = useUpdateAdministrationRecordMutation();
  const [deleteRecord] = useDeleteAdministrationRecordMutation();
  const visible = records.filter((record) => `${value(record, "name", "title")} ${value(record, "code", "email")}`.toLowerCase().includes(query.toLowerCase()));
  const remove = (record: ApiRecord) => {
    if (resource === "companies") return toast.error("Companies are deactivated instead of deleted");
    const id = value(record, "id", "_id");
    if (!id || !confirm(`Delete ${value(record, "name", "title") || "this record"}?`)) return;
    void deleteRecord({ instanceId, resource, id }).unwrap().then(() => toast.success("Record deleted")).catch(() => toast.error("Delete failed"));
  };
  if (editing || creating) return <AdministrationEditor title={screen.title} record={editing} onCancel={() => { setEditing(null); setCreating(false); }} onSubmit={(body) => { const id = editing ? value(editing, "id", "_id") : ""; const request = id ? updateRecord({ instanceId, resource, id, body }).unwrap() : createRecord({ instanceId, resource, body }).unwrap(); void request.then(() => { toast.success("Record saved"); setEditing(null); setCreating(false); }).catch(() => toast.error("Save failed")); }} />;
  return <section className="rounded-xl border bg-white"><header className="flex flex-wrap gap-3 border-b p-5"><label className="flex min-w-64 flex-1 items-center gap-2 rounded-lg border px-3 py-2"><Search className="h-4 w-4" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${screen.area.toLowerCase()}`} className="w-full outline-none" /></label><button disabled={!canWrite} onClick={() => setCreating(true)} className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"><Plus className="h-4 w-4" /> Create</button></header><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Name</th><th className="px-5 py-3">Code / type</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Actions</th></tr></thead><tbody>{visible.map((record, index) => <tr key={value(record, "id", "_id") || index} className="border-t"><td className="px-5 py-4 font-semibold">{value(record, "name", "title", "displayName") || "Unnamed"}</td><td className="px-5 py-4">{value(record, "code", "type", "email") || "—"}</td><td className="px-5 py-4">{value(record, "status") || "Active"}</td><td className="px-5 py-4"><button disabled={!canWrite} onClick={() => setEditing(record)} aria-label="Edit record"><Pencil className="h-4 w-4" /></button><button disabled={!canWrite} onClick={() => remove(record)} aria-label="Delete record" className="ml-4 text-red-700"><Trash2 className="h-4 w-4" /></button></td></tr>)}</tbody></table></div>{!visible.length ? <p className="p-8 text-center text-sm text-slate-500">No backend records found.</p> : null}</section>;
}

function AdministrationEditor({ title, record, onCancel, onSubmit }: { title: string; record: ApiRecord | null; onCancel: () => void; onSubmit: (body: ApiRecord) => void }) {
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const data = new FormData(event.currentTarget); onSubmit({ name: String(data.get("name")), code: String(data.get("code")), description: String(data.get("description")), status: String(data.get("status")) }); };
  return <form onSubmit={submit} className="rounded-xl border bg-white p-6"><button type="button" onClick={onCancel} className="flex items-center gap-2 text-sm font-semibold text-cyan-800"><ArrowLeft className="h-4 w-4" /> Back</button><h2 className="mt-5 text-xl font-bold">{record ? `Edit ${title}` : `Create ${title}`}</h2><div className="mt-6 grid gap-5 md:grid-cols-2"><Field label="Name"><input name="name" required defaultValue={record ? value(record, "name", "title") : ""} /></Field><Field label="Code"><input name="code" defaultValue={record ? value(record, "code") : ""} /></Field><Field label="Status"><select name="status" defaultValue={record ? value(record, "status") || "active" : "active"}><option value="active">Active</option><option value="inactive">Inactive</option></select></Field><Field label="Description"><textarea name="description" rows={4} defaultValue={record ? value(record, "description") : ""} /></Field></div><button className="mt-6 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Save through API</button></form>;
}

function AdministrationReadView({ screen, records }: { screen: ScreenDefinition; records: ApiRecord[] }) {
  const navigate = useNavigate();
  const location = useLocation();
  return <section className="rounded-xl border bg-white p-6"><h2 className="text-xl font-bold">{screen.title}</h2><p className="mt-2 text-sm text-slate-500">Live instance data loaded from the administration API.</p><div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{records.map((record, index) => <article key={value(record, "id", "_id") || index} className="rounded-lg border p-4"><strong>{value(record, "name", "title", "moduleKey", "key") || screen.title}</strong><p className="mt-2 text-xs text-slate-500">{value(record, "description", "status", "code") || "Configured"}</p></article>)}</div>{!records.length ? <p className="mt-6 text-sm text-slate-500">The API returned no records for this view.</p> : null}<button onClick={() => navigate(location.pathname)} className="mt-6 rounded-lg border px-4 py-2 text-sm">Refresh route</button></section>;
}

const LOCALES = ["en-US", "en-GB", "en-AU", "en-CA", "en-IN", "en-ZA", "de-DE", "fr-FR", "es-ES", "it-IT", "pt-BR", "nl-NL", "sv-SE", "pl-PL"];
const TIMEZONES = ["UTC", "America/Los_Angeles", "America/New_York", "America/Sao_Paulo", "Europe/London", "Europe/Berlin", "Europe/Paris", "Asia/Kolkata", "Asia/Singapore", "Asia/Tokyo", "Australia/Sydney"];

function AdministrationPreferencesView({ screen, instanceId, record }: { screen: ScreenDefinition; instanceId: string; record: ApiRecord | null }) {
  const [locale, setLocale] = useState(String(record?.locale ?? "en-US"));
  const [timezone, setTimezone] = useState(String(record?.timezone ?? "UTC"));
  const [update, { isLoading }] = useUpdateInstancePreferencesMutation();
  return <section className="rounded-xl border bg-white p-6"><h2 className="text-xl font-bold">{screen.title}</h2><p className="mt-2 text-sm text-slate-500">Your own preferences, loaded from the instance preferences API.</p><form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); void update({ instanceId, body: { locale, timezone } }).then(() => toast.success("Preferences saved")).catch(() => toast.error("Could not save preferences")); }}><Field label="Language and region"><select value={locale} onChange={(event) => setLocale(event.target.value)}>{LOCALES.map((item) => <option key={item} value={item}>{item}</option>)}</select></Field><Field label="Time zone"><select value={timezone} onChange={(event) => setTimezone(event.target.value)}>{TIMEZONES.map((item) => <option key={item} value={item}>{item}</option>)}</select></Field><div className="md:col-span-2"><button type="submit" disabled={isLoading} className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60">{isLoading ? "Saving..." : "Save preferences"}</button></div></form></section>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="text-sm font-semibold">{label}<span className="mt-2 block [&>*]:w-full [&>*]:rounded-lg [&>*]:border [&>*]:p-3 [&>*]:font-normal">{children}</span></label>;
}
