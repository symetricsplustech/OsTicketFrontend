import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import toast from "react-hot-toast";
import type { ScreenDefinition } from "../../models/screen";
import type { WorkDomain as Domain, WorkRecord as Entry } from "../../model/workRecord";
import { applyLifecycleTransition, lifecycleTransitions } from "../../model/workRecordLifecycle";
import { useWorkRecordAccess } from "../WorkRecordGovernance";
import { RecordList } from "./WorkRecordList";
import { Pill } from "./WorkRecordPrimitives";

export function SlaOperationalView({ screen, items, mutate }: { screen: ScreenDefinition; items: Entry[]; mutate: (id: string, fn: (entry: Entry) => Entry) => void }) {
  const { canWrite } = useWorkRecordAccess();
  const [query, setQuery] = useState("");
  const [state, setState] = useState("");
  const visible = items.filter((item) => (!state || item.state === state) && `${item.number} ${item.title} ${item.service}`.toLowerCase().includes(query.toLowerCase()));
  const percentFor = (item: Entry) => item.state === "Breached" ? 100 : item.state === "At Risk" ? 82 : item.state === "Paused" ? 55 : item.state === "Complete" || item.state === "Closed" ? 100 : 38;
  return <section className="rounded-xl border bg-white shadow-sm"><header className="flex flex-wrap gap-3 border-b p-5"><div className="mr-auto"><h2 className="text-xl font-bold">{screen.title}</h2><p className="text-sm text-slate-500">Live business-time consumption, warnings, breaches, pauses, and escalation controls.</p></div><label className="flex items-center gap-2 rounded-lg border px-3 py-2"><Search className="h-4 w-4" /><input aria-label="Search task SLAs" value={query} onChange={(event) => setQuery(event.target.value)} className="outline-none" placeholder="Search SLAs…" /></label><select aria-label="Filter task SLA state" value={state} onChange={(event) => setState(event.target.value)} className="rounded-lg border px-3 py-2"><option value="">All states</option>{Object.keys(lifecycleTransitions.sla).map((value) => <option key={value}>{value}</option>)}</select></header><div className="space-y-4 p-5">{visible.map((item) => { const percent = percentFor(item); return <article key={item.id} className="rounded-xl border p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold text-cyan-700">{item.number}</p><h3 className="mt-1 font-bold">{item.title}</h3><p className="mt-1 text-xs text-slate-500">{item.service} · {item.group}</p></div><Pill>{item.state}</Pill></div><div className="mt-4"><div className="flex justify-between text-xs"><span>Business time consumed</span><strong>{percent}%</strong></div><div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100"><div className={`h-full ${percent >= 100 ? "bg-red-600" : percent >= 80 ? "bg-amber-500" : "bg-emerald-600"}`} style={{ width: `${percent}%` }} /></div></div><ol className="mt-4 grid gap-2 text-xs md:grid-cols-4"><li className="rounded bg-slate-50 p-3">Started<br /><strong>{new Date(item.updated).toLocaleString()}</strong></li><li className="rounded bg-slate-50 p-3">Warning<br /><strong>80% elapsed</strong></li><li className="rounded bg-slate-50 p-3">Target<br /><strong>{item.end.replace("T", " ")}</strong></li><li className="rounded bg-slate-50 p-3">Schedule<br /><strong>Business hours</strong></li></ol><div className="mt-4 flex flex-wrap gap-2">{(lifecycleTransitions.sla[item.state] ?? []).map((next) => <button key={next} disabled={!canWrite} onClick={() => mutate(item.id, (entry) => applyLifecycleTransition("sla", entry, next))} className="rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-40">{next}</button>)}</div></article>; })}{!visible.length ? <p className="py-10 text-center text-sm text-slate-500">No task SLAs match the active view.</p> : null}</div></section>;
}

export function LifecycleDashboard({
  domain,
  screen,
  records,
}: {
  domain: Domain;
  screen: ScreenDefinition;
  records: Entry[];
}) {
  const navigate = useNavigate();
  const base = useLocation().pathname;
  const [scope, setScope] = useState("All services");
  const [range, setRange] = useState("Last 30 days");
  const [refreshedAt, setRefreshedAt] = useState(new Date());
  const metrics = [
    [
      "Open records",
      records.filter(
        (r) => !["Closed", "Rejected", "Canceled"].includes(r.state),
      ).length,
    ],
    [
      "Critical / high",
      records.filter((r) => ["P1", "P2"].includes(r.priority)).length,
    ],
    [
      "Pending actions",
      records.reduce(
        (n, r) => n + r.tasks.filter((t) => t.state !== "Complete").length,
        0,
      ),
    ],
    [
      "Awaiting approval",
      records.reduce(
        (n, r) => n + r.approvals.filter((a) => a.state === "Pending").length,
        0,
      ),
    ],
  ];
  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4">
        <div>
          <h2 className="font-bold">{screen.title}</h2>
          <p className="text-xs text-slate-500">Updated {refreshedAt.toLocaleTimeString()}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select aria-label="Dashboard service scope" value={scope} onChange={(event) => setScope(event.target.value)} className="rounded-lg border px-3 py-2 text-sm">
            {["All services", ...Array.from(new Set(records.map((record) => record.service)))].map((value) => <option key={value}>{value}</option>)}
          </select>
          <select aria-label="Dashboard time range" value={range} onChange={(event) => setRange(event.target.value)} className="rounded-lg border px-3 py-2 text-sm">
            {["Last 24 hours", "Last 7 days", "Last 30 days", "Last 90 days"].map((value) => <option key={value}>{value}</option>)}
          </select>
          <button onClick={() => { setRefreshedAt(new Date()); toast.success("Dashboard refreshed"); }} className="rounded-lg border px-3 py-2 text-sm">Refresh</button>
        </div>
      </header>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value]) => (
          <article
            key={String(label)}
            className="rounded-xl border bg-white p-5 shadow-sm"
          >
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-bold">{value}</p>
          </article>
        ))}
      </section>
      <section className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
        <RecordList domain={domain} screen={screen} records={records} compact />
        <article className="rounded-xl border bg-white p-5">
          <h2 className="font-bold">Lifecycle distribution</h2>
          {Object.entries(
            records.reduce<Record<string, number>>(
              (acc, item) => ({
                ...acc,
                [item.state]: (acc[item.state] ?? 0) + 1,
              }),
              {},
            ),
          ).map(([state, count]) => (
            <button
              key={state}
              onClick={() =>
                navigate(`${base}?state=${encodeURIComponent(state)}`)
              }
              className="mt-4 flex w-full items-center justify-between rounded-lg bg-slate-50 p-3 text-sm"
            >
              <span>{state}</span>
              <strong>{count}</strong>
            </button>
          ))}
        </article>
      </section>
    </div>
  );
}
