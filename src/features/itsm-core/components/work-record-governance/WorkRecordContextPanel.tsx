import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Activity, Link2 } from "lucide-react";
import type { AuditEvent } from "../../api/auditApi";
import type { ScreenDefinition } from "../../models/screen";

type Route = ScreenDefinition & { group: string };

export function WorkRecordContextPanel({ screen, routes, scope, events }: { screen: ScreenDefinition; routes: Route[]; scope: string; events: AuditEvent[] }) {
  const [tab, setTab] = useState("summary");
  const location = useLocation();
  const navigate = useNavigate();
  const related = routes.filter((route) => route.module !== screen.module && ["dashboard", "list"].includes(route.kind)).slice(0, 4);
  const tabs = ["summary", "details", "activity", "related", "audit"];
  return <section className="rounded-xl border bg-white"><header className="border-b p-5"><p className="text-xs font-bold uppercase text-cyan-700">{scope} context</p><h2 className="mt-1 font-bold">{screen.title} operations and evidence</h2></header><nav className="flex overflow-x-auto border-b">{tabs.map((value) => <button key={value} onClick={() => setTab(value)} className={`whitespace-nowrap border-b-2 px-4 py-3 text-xs font-semibold capitalize ${tab === value ? "border-cyan-600 text-cyan-700" : "border-transparent text-slate-500"}`}>{value}</button>)}</nav><div className="p-6">{tab === "summary" ? <dl className="grid gap-4 md:grid-cols-3"><Info label="Screen" value={screen.screenId ?? "Unknown"} /><Info label="Module" value={screen.area} /><Info label="Lifecycle" value="Backend governed" /></dl> : tab === "details" ? <div className="grid gap-4 md:grid-cols-2"><Info label="Path" value={location.pathname} /><Info label="Permission scope" value={scope} /><p className="md:col-span-2 text-sm text-slate-600">{screen.description}</p></div> : tab === "related" ? <div className="grid gap-3 md:grid-cols-2">{related.map((route) => <button key={route.id} onClick={() => navigate(route.path.replace(":instanceId", location.pathname.split("/")[2] || "demo"))} className="flex items-center gap-3 rounded-lg border p-4 text-left"><Link2 className="h-4 w-4 text-cyan-700" /><span><strong className="block text-sm">{route.title}</strong><span className="text-xs text-slate-500">Owned by {route.area}</span></span></button>)}</div> : <AuditTimeline events={tab === "activity" ? events.slice(0, 8) : events} />}</div></section>;
}

function AuditTimeline({ events }: { events: AuditEvent[] }) {
  return events.length ? <ol className="space-y-3">{events.slice(0, 12).map((event) => <li key={event.id} className="flex gap-3"><Activity className="mt-1 h-4 w-4 text-cyan-700" /><div><p className="text-sm font-semibold">{event.action}</p><p className="text-xs text-slate-500">{event.target} · {event.actor} · {new Date(event.at).toLocaleString()}</p></div></li>)}</ol> : <p className="text-sm text-slate-500">No backend audit events match this screen.</p>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-bold uppercase text-slate-500">{label}</dt><dd className="mt-1 break-all text-sm">{value}</dd></div>;
}
