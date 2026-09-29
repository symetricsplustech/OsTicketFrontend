import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { selectPermissions } from "@shared/auth/authSlice";
import { useAppSelector } from "@shared/store/hooks";
import type { ApiRecord } from "@shared/api/itsmTypes";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { useOperationalRepository } from "../api/useOperationalRepository";
import { OperationalEditor } from "./OperationalEditor";
import { OperationalRecordList } from "./OperationalRecordList";
import { OperationalRecordView } from "./OperationalRecordView";

const text = (record: ApiRecord, ...keys: string[]) => String(keys.map((key) => record[key]).find((value) => value != null) ?? "");

export function OperationalWorkspace({ screen }: { screen: ScreenDefinition }) {
  const repository = useOperationalRepository(screen);
  const permissions = useAppSelector(selectPermissions);
  const [editing, setEditing] = useState<ApiRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const location = useLocation();
  const permissionNamespace = screen.phase === 11 ? "itsm.assignment." : screen.phase === 12 ? "itsm.approval." : screen.phase === 13 || screen.phase === 14 || screen.phase === 19 ? "itsm.service_cmdb." : screen.phase === 15 ? "itsm.asset." : screen.phase === 16 ? "itsm.outage." : screen.phase === 17 ? "itsm.on_call." : screen.phase === 18 ? "itsm.walkup." : "itsm.release.";
  const canWrite = permissions.includes("*") || permissions.some((permission) => permission.startsWith(permissionNamespace) && /create|update|delete|manage|assign|decide/.test(permission));
  const canCreate = canWrite && repository.capabilities.create;
  const canUpdate = canWrite && repository.capabilities.update;
  const canDelete = canWrite && repository.capabilities.remove;
  const canTransition = canWrite && repository.capabilities.transition;
  const selectedId = new URLSearchParams(location.search).get("record");
  const selected = repository.records.find((record) => text(record, "id", "_id") === selectedId) ?? (screen.kind === "record" || screen.kind === "workspace" ? repository.records[0] : undefined);
  const createScreen = screen.kind === "settings" || /create|book|assign|reassignment|builder|editor/i.test(screen.title);
  const save = (body: Record<string, unknown>) => {
    const id = editing ? text(editing, "id", "_id") : "";
    const request = id ? repository.update(id, body) : repository.create(body);
    void request.then(() => { toast.success("Record saved"); setEditing(null); setCreating(false); }).catch(() => toast.error("API operation failed"));
  };
  // A screen with no backend surface says so, rather than rendering another
  // module's records under this screen's title.
  if (repository.missing) return <section role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-8"><h2 className="font-bold text-amber-900">{screen.title} is not available yet</h2><p className="mt-2 text-sm text-amber-800">{repository.missing}</p></section>;
  if (repository.isLoading) return <div role="status" className="animate-pulse rounded-xl border bg-white p-8"><div className="h-8 w-64 rounded bg-slate-200" /><div className="mt-5 h-64 rounded bg-slate-100" /></div>;
  if (repository.isError) return <section role="alert" className="rounded-xl border border-red-200 bg-white p-8"><h2 className="font-bold text-red-800">Unable to load {screen.area}</h2><p className="mt-2 text-sm text-slate-600">Authentication, tenant access, or the backend service rejected the request.</p><button onClick={() => void repository.refetch()} className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">Retry</button></section>;
  if (editing || creating || createScreen) return <OperationalEditor screen={screen} record={editing} canWrite={editing ? canUpdate : canCreate} onCancel={() => { setEditing(null); setCreating(false); }} onSave={save} />;
  if (selected) return <OperationalRecordView screen={screen} record={selected} canUpdate={canUpdate} canTransition={canTransition} onEdit={() => setEditing(selected)} onTransition={(status) => void repository.transition(text(selected, "id", "_id"), status).catch(() => toast.error("Lifecycle update failed"))} />;
  const metrics = useMemo(() => ({ total: repository.records.length, active: repository.records.filter((record) => !/closed|complete|retired|cancel/i.test(text(record, "status", "state"))).length }), [repository.records]);
  return <div className="space-y-5">{screen.kind === "dashboard" ? <section className="grid gap-4 sm:grid-cols-2"><article className="rounded-xl border bg-white p-5"><p className="text-xs text-slate-500">Total records</p><p className="mt-2 text-3xl font-bold">{metrics.total}</p></article><article className="rounded-xl border bg-white p-5"><p className="text-xs text-slate-500">Active work</p><p className="mt-2 text-3xl font-bold">{metrics.active}</p></article></section> : null}<OperationalRecordList screen={screen} records={repository.records} canCreate={canCreate} canUpdate={canUpdate} canDelete={canDelete} onCreate={() => setCreating(true)} onEdit={setEditing} onDelete={(record) => { const id = text(record, "id", "_id"); if (id && confirm("Delete this record?")) void repository.remove(id).catch(() => toast.error("Delete failed")); }} /></div>;
}
