import type { ReactNode } from "react";

export function Field({ label, name, required, wide, children }: { label: string; name: string; required?: boolean; wide?: boolean; children?: ReactNode }) {
  return <label className={`text-sm font-semibold ${wide ? "md:col-span-2" : ""}`}><span>{label}{required ? <span className="text-red-600"> *</span> : null}</span><div className="mt-2 [&>*]:w-full [&>*]:rounded-lg [&>*]:border [&>*]:p-3 [&>*]:font-normal">{children ?? <input name={name} required={required} />}</div></label>;
}

export function Pill({ children }: { children: ReactNode }) {
  return <span className="inline-flex rounded-full border bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">{children}</span>;
}

export function Info({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold text-slate-800">{value || "—"}</p></div>;
}
