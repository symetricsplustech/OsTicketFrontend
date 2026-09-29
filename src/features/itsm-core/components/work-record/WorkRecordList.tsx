import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Download, Filter, Pencil, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import type { ScreenDefinition } from "../../models/screen";
import type { WorkDomain as Domain, WorkRecord as Entry } from "../../model/workRecord";
import { workRecordLabel as labelFor } from "../../model/workRecordLabels";
import { lifecycleTransitions } from "../../model/workRecordLifecycle";
import { useWorkRecordAccess } from "../WorkRecordGovernance";
import { Pill } from "./WorkRecordPrimitives";

export function RecordList({
  domain,
  screen,
  records,
  onDelete,
  onBulkState,
  compact,
}: {
  domain: Domain;
  screen: ScreenDefinition;
  records: Entry[];
  onDelete?: (id: string) => void;
  onBulkState?: (ids: string[], state: string) => void;
  compact?: boolean;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [state, setState] = useState(
    new URLSearchParams(location.search).get("state") ?? "",
  );
  const { canWrite } = useWorkRecordAccess();
  const [advanced, setAdvanced] = useState(false);
  const [savedView, setSavedView] = useState("All records");
  const [sort, setSort] = useState<"updated" | "number" | "priority">("updated");
  const [groupBy, setGroupBy] = useState<"none" | "state" | "service">("none");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [columnPreset, setColumnPreset] = useState<"operations" | "ownership" | "service">("operations");
  const [selected, setSelected] = useState<string[]>([]);
  const [preview, setPreview] = useState<Entry | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = compact ? 5 : 10;
  const visible = useMemo(
    () =>
      records.filter(
        (item) =>
          (!state || item.state === state) &&
          (!priorityFilter || item.priority === priorityFilter) &&
          (!groupFilter || item.group.toLowerCase().includes(groupFilter.toLowerCase())) &&
          `${item.number} ${item.title} ${item.owner} ${item.group} ${item.service}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ).sort((a, b) => {
        const grouped = groupBy === "state" ? a.state.localeCompare(b.state) : groupBy === "service" ? a.service.localeCompare(b.service) : 0;
        return grouped || (sort === "number" ? a.number.localeCompare(b.number) : sort === "priority" ? a.priority.localeCompare(b.priority) : b.updated.localeCompare(a.updated));
      }),
    [records, query, state, priorityFilter, groupFilter, sort, groupBy],
  );
  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  const paged = visible.slice((page - 1) * pageSize, page * pageSize);
  const exportCsv = () => {
    const rows = [["Number", "Summary", "State", "Priority", "Owner", "Group", "Service", "Risk"], ...visible.map((item) => [item.number, item.title, item.state, item.priority, item.owner, item.group, item.service, item.risk])];
    const blob = new Blob([rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${domain}-records.csv`; anchor.click(); URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };
  const open = (id: string) => navigate(`${location.pathname}/records/${id}`);
  return (
    <section className="rounded-xl border bg-white shadow-sm">
      <header className="flex flex-wrap gap-3 border-b p-4">
        <label className="flex min-w-56 flex-1 items-center gap-2 rounded-lg border px-3 py-2">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            aria-label={`Search ${labelFor(domain)} records`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm outline-none"
            placeholder={`Search ${labelFor(domain).toLowerCase()} records…`}
          />
        </label>
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          aria-label="Filter by lifecycle state"
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">All states</option>
          {Object.keys(lifecycleTransitions[domain]).map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select aria-label="Saved view" value={savedView} onChange={(event) => { setSavedView(event.target.value); setState(event.target.value === "Priority work" ? "Active" : ""); }} className="rounded-lg border px-3 py-2 text-sm">
          {["All records", "Priority work", "My team queue"].map((value) => <option key={value}>{value}</option>)}
        </select>
        <select aria-label="Sort records" value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className="rounded-lg border px-3 py-2 text-sm">
          <option value="updated">Recently updated</option><option value="number">Number</option><option value="priority">Priority</option>
        </select>
        <select aria-label="Group records" value={groupBy} onChange={(event) => setGroupBy(event.target.value as typeof groupBy)} className="rounded-lg border px-3 py-2 text-sm">
          <option value="none">No grouping</option><option value="state">Group by state</option><option value="service">Group by service</option>
        </select>
        <button onClick={() => setAdvanced((value) => !value)} aria-expanded={advanced} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
          <Filter className="h-4 w-4" /> Views
        </button>
        <button
          onClick={exportCsv}
          className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
        >
          <Download className="h-4 w-4" /> Export
        </button>
      </header>
      {advanced ? <div className="grid gap-3 border-b bg-slate-50 p-4 md:grid-cols-3"><label className="text-xs font-semibold">Priority<select value={priorityFilter} className="mt-1 w-full rounded border p-2" onChange={(event) => setPriorityFilter(event.target.value)}><option value="">Any priority</option>{["P1", "P2", "P3", "P4"].map((value) => <option key={value}>{value}</option>)}</select></label><label className="text-xs font-semibold">Assignment group<input value={groupFilter} className="mt-1 w-full rounded border p-2" onChange={(event) => setGroupFilter(event.target.value)} placeholder="Contains…" /></label><label className="text-xs font-semibold">Column personalization<select value={columnPreset} onChange={(event) => setColumnPreset(event.target.value as typeof columnPreset)} className="mt-1 w-full rounded border p-2"><option value="operations">Operations default</option><option value="ownership">Ownership focus</option><option value="service">Service focus</option></select></label></div> : null}
      {selected.length && onBulkState ? <div className="flex flex-wrap items-center gap-2 border-b bg-cyan-50 p-3 text-sm"><strong>{selected.length} selected</strong><select aria-label="Bulk lifecycle state" defaultValue="" onChange={(event) => { if (event.target.value) { onBulkState(selected, event.target.value); setSelected([]); event.target.value = ""; } }} className="rounded border p-2" disabled={!canWrite}><option value="">Bulk move to…</option>{Object.keys(lifecycleTransitions[domain]).map((value) => <option key={value}>{value}</option>)}</select></div> : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              {!compact ? <th className="px-4 py-3"><input aria-label="Select visible records" type="checkbox" checked={paged.length > 0 && paged.every((item) => selected.includes(item.id))} onChange={(event) => setSelected(event.target.checked ? Array.from(new Set([...selected, ...paged.map((item) => item.id)])) : selected.filter((id) => !paged.some((item) => item.id === id)))} /></th> : null}
              {[
                "Number",
                "Summary",
                "State",
                "Priority",
                ...(columnPreset !== "service" ? ["Owner"] : []),
                ...(columnPreset !== "service" ? ["Group"] : []),
                ...(columnPreset !== "ownership" ? ["Service"] : []),
                "Risk",
                "Actions",
              ].map((h) => (
                <th key={h} className="px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((item) => (
              <tr key={item.id} onMouseEnter={() => setPreview(item)} className="border-t hover:bg-cyan-50">
                {!compact ? <td className="px-4 py-3"><input aria-label={`Select ${item.number}`} type="checkbox" checked={selected.includes(item.id)} onChange={(event) => setSelected(event.target.checked ? [...selected, item.id] : selected.filter((id) => id !== item.id))} /></td> : null}
                <td className="px-4 py-3">
                  <button
                    onClick={() => open(item.id)}
                    className="font-bold text-cyan-800 hover:underline"
                  >
                    {item.number}
                  </button>
                </td>
                <td className="max-w-xs truncate px-4 py-3">{item.title}</td>
                <td className="px-4 py-3">
                  <Pill>{item.state}</Pill>
                </td>
                <td className="px-4 py-3">{item.priority}</td>
                {columnPreset !== "service" ? <td className="px-4 py-3">{item.owner}</td> : null}
                {columnPreset !== "service" ? <td className="px-4 py-3">{item.group}</td> : null}
                {columnPreset !== "ownership" ? <td className="px-4 py-3">{item.service}</td> : null}
                <td className="px-4 py-3">{item.risk}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      aria-label={`Open ${item.number}`}
                      onClick={() => open(item.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    {onDelete && !compact ? (
                      <button
                        aria-label={`Delete ${item.number}`}
                        disabled={!canWrite}
                        onClick={() => {
                          if (confirm(`Delete ${item.number}?`)) {
                            onDelete(item.id);
                            toast.success("Record deleted");
                          }
                        }}
                        className="text-red-600 disabled:opacity-40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!visible.length ? (
        <div className="p-10 text-center">
          <Search className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">
            No records match this queue.
          </p>
        </div>
      ) : null}
      {preview && !compact ? <aside className="border-t bg-slate-50 p-4 text-sm" aria-live="polite"><strong>Row preview · {preview.number}</strong><p className="mt-1 text-slate-600">{preview.description}</p><p className="mt-2 text-xs text-slate-500">{preview.service} · {preview.group} · Updated {new Date(preview.updated).toLocaleString()}</p></aside> : null}
      <footer className="flex justify-between border-t p-4 text-xs text-slate-500">
        <span>{visible.length} records</span>
        <span className="flex items-center gap-2"><button disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="rounded border px-2 py-1 disabled:opacity-40">Previous</button>Page {page} of {pageCount}<button disabled={page === pageCount} onClick={() => setPage((value) => value + 1)} className="rounded border px-2 py-1 disabled:opacity-40">Next</button></span>
      </footer>
    </section>
  );
}
