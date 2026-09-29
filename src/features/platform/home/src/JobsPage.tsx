import { AlertTriangle, Clock3, ListChecks, Server } from "lucide-react";
import { PageHeader } from "@shared/components/PageHeader";

const metrics = [
  { label: "Active workers", value: "8", icon: Server, tone: "text-emerald-700 bg-emerald-50" },
  { label: "Queued jobs", value: "24", icon: ListChecks, tone: "text-cyan-700 bg-cyan-50" },
  { label: "Scheduled", value: "12", icon: Clock3, tone: "text-indigo-700 bg-indigo-50" },
  { label: "Failed jobs", value: "2", icon: AlertTriangle, tone: "text-red-700 bg-red-50" },
];

export function JobsPage() {
  return <div className="space-y-6">
    <PageHeader title="Platform Jobs" description="Monitor workers, queues, schedules, retries, and failed background work." />
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(({ label, value, icon: Icon, tone }) => <article key={label} className="rounded-xl border border-slate-200 bg-white p-5"><div className={`grid h-10 w-10 place-items-center rounded-lg ${tone}`}><Icon className="h-5 w-5" /></div><p className="mt-4 text-2xl font-bold">{value}</p><p className="text-sm text-slate-500">{label}</p></article>)}</section>
    <section className="rounded-xl border border-slate-200 bg-white"><header className="flex flex-wrap items-center justify-between gap-3 border-b p-4"><div><h2 className="font-bold">Worker health</h2><p className="text-xs text-slate-500">Current platform processing nodes and queue status.</p></div><button type="button" className="rounded-lg border px-3 py-2 text-sm">Refresh</button></header><div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{["Worker", "Queue", "Status", "Last heartbeat", "Actions"].map((heading) => <th key={heading} className="px-4 py-3">{heading}</th>)}</tr></thead><tbody><tr className="border-t"><td className="px-4 py-3 font-medium">worker-primary-01</td><td className="px-4 py-3">default</td><td className="px-4 py-3 text-emerald-700">Healthy</td><td className="px-4 py-3">Just now</td><td className="px-4 py-3"><button type="button" className="font-semibold text-cyan-700">View</button></td></tr></tbody></table></div></section>
  </div>;
}
