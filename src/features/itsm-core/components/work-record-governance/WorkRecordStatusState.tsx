import type { LucideIcon } from "lucide-react";

export function WorkRecordLoadingState({ scope }: { scope: string }) {
  return <div role="status" className="animate-pulse space-y-4 rounded-xl border bg-white p-6"><span className="sr-only">Loading {scope}</span><div className="h-8 w-64 rounded bg-slate-200" /><div className="h-28 rounded bg-slate-100" /><div className="h-52 rounded bg-slate-100" /></div>;
}

export function WorkRecordStatusState({ icon: Icon, title, detail, action, onAction }: { icon: LucideIcon; title: string; detail: string; action: string; onAction: () => void }) {
  return <section role="status" className="rounded-xl border bg-white p-12 text-center"><Icon className="mx-auto h-8 w-8 text-slate-400" /><h2 className="mt-4 text-xl font-bold">{title}</h2><p className="mt-2 text-sm text-slate-500">{detail}</p><button onClick={onAction} className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">{action}</button></section>;
}
