import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import type { ApiRecord } from "@shared/api/itsmTypes";
import { selectPermissions } from "@shared/auth/authSlice";
import { useAppSelector } from "@shared/store/hooks";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { OperationalEditor } from "@features/enterprise-operations/components/OperationalEditor";
import { OperationalRecordList } from "@features/enterprise-operations/components/OperationalRecordList";
import { OperationalRecordView } from "@features/enterprise-operations/components/OperationalRecordView";
import { useExperienceRepository } from "../api/useExperienceRepository";

const text = (record: ApiRecord, ...keys: string[]) => String(keys.map((key) => record[key]).find((item) => item != null) ?? "");

export function ExperienceWorkspace({ screen }: { screen: ScreenDefinition }) {
  const repository = useExperienceRepository(screen);
  const permissions = useAppSelector(selectPermissions);
  const canWrite = permissions.includes("*") || permissions.some((permission) => permission.startsWith("itsm.experience.") && /create|update|delete|manage/.test(permission));
  const [editing, setEditing] = useState<ApiRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const location = useLocation();
  const selectedId = new URLSearchParams(location.search).get("record");
  const selected = repository.records.find((record) => text(record, "id", "_id") === selectedId) ?? (screen.kind === "record" || screen.kind === "workspace" ? repository.records[0] : undefined);
  const createScreen = screen.kind === "settings" || /create|new |builder|designer|setup|book|submit|compose/i.test(screen.title);
  const save = (body: Record<string, unknown>) => {
    const id = editing ? text(editing, "id", "_id") : "";
    void (id ? repository.update(id, body) : repository.create(body)).then(() => { toast.success("Record saved"); setEditing(null); setCreating(false); }).catch(() => toast.error("API operation failed"));
  };
  const metrics = useMemo(() => ({ total: repository.records.length, active: repository.records.filter((record) => !/closed|complete|retired|cancel/i.test(text(record, "status", "state"))).length }), [repository.records]);

  if (repository.isLoading) return <div role="status" className="animate-pulse rounded-xl border bg-white p-8"><div className="h-8 w-64 rounded bg-slate-200" /><div className="mt-5 h-64 rounded bg-slate-100" /></div>;
  if (repository.isError) return <section role="alert" className="rounded-xl border border-red-200 bg-white p-8"><h2 className="font-bold text-red-800">Unable to load {screen.area}</h2><p className="mt-2 text-sm text-slate-600">The tenant API rejected or could not complete this request.</p><button onClick={() => void repository.refetch()} className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">Retry</button></section>;
  if (editing || creating || createScreen) return <OperationalEditor screen={screen} record={editing} canWrite={canWrite} onCancel={() => { setEditing(null); setCreating(false); }} onSave={save} />;
  if (selected) return <OperationalRecordView screen={screen} record={selected} canUpdate={canWrite} canTransition={canWrite} onEdit={() => setEditing(selected)} onTransition={(status) => void repository.transition(text(selected, "id", "_id"), status).catch(() => toast.error("Lifecycle update failed"))} />;
  return <div className="space-y-5">{screen.kind === "dashboard" ? <section className="grid gap-4 sm:grid-cols-2"><article className="rounded-xl border bg-white p-5"><p className="text-xs text-slate-500">Total records</p><p className="mt-2 text-3xl font-bold">{metrics.total}</p></article><article className="rounded-xl border bg-white p-5"><p className="text-xs text-slate-500">Active work</p><p className="mt-2 text-3xl font-bold">{metrics.active}</p></article></section> : null}<OperationalRecordList screen={screen} records={repository.records} canCreate={canWrite} canUpdate={canWrite} canDelete={canWrite} onCreate={() => setCreating(true)} onEdit={setEditing} onDelete={(record) => { const id = text(record, "id", "_id"); if (id && confirm("Delete this record?")) void repository.remove(id).catch(() => toast.error("Delete failed")); }} /></div>;
}
