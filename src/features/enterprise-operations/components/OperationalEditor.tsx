import type { FormEvent, ReactNode } from "react";
import type { ApiRecord } from "@shared/api/itsmTypes";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";

const value = (record: ApiRecord | null, key: string) => String(record?.[key] ?? "");

export function OperationalEditor({ screen, record, canWrite, onCancel, onSave }: { screen: ScreenDefinition; record: ApiRecord | null; canWrite: boolean; onCancel: () => void; onSave: (body: Record<string, unknown>) => void }) {
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const data = new FormData(event.currentTarget); onSave({ name: String(data.get("name")), title: String(data.get("name")), description: String(data.get("description")), status: String(data.get("status")), priority: String(data.get("priority")) }); };
  return <form onSubmit={submit} className="rounded-xl border bg-white p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase text-cyan-700">{screen.area}</p><h2 className="mt-1 text-xl font-bold">{record ? `Edit ${screen.title}` : screen.title}</h2></div><button type="button" onClick={onCancel} className="rounded-lg border px-4 py-2 text-sm">Cancel</button></div><fieldset disabled={!canWrite} className="mt-6 grid gap-5 disabled:opacity-50 md:grid-cols-2"><Field label="Name"><input name="name" required defaultValue={value(record, "name") || value(record, "title")} /></Field><Field label="Status"><select name="status" defaultValue={value(record, "status") || "active"}><option value="new">New</option><option value="active">Active</option><option value="pending">Pending</option><option value="completed">Completed</option><option value="closed">Closed</option></select></Field><Field label="Priority"><select name="priority" defaultValue={value(record, "priority") || "P3"}><option>P1</option><option>P2</option><option>P3</option><option>P4</option></select></Field><Field label="Description"><textarea name="description" rows={5} defaultValue={value(record, "description")} /></Field><button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white md:col-span-2">Save through API</button></fieldset></form>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="text-sm font-semibold">{label}<span className="mt-2 block [&>*]:w-full [&>*]:rounded-lg [&>*]:border [&>*]:p-3 [&>*]:font-normal">{children}</span></label>;
}
