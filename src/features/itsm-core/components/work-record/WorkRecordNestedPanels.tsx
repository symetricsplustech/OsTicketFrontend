import { useState } from "react";
import { AlertTriangle, ClipboardCheck, ShieldCheck, Users } from "lucide-react";
import toast from "react-hot-toast";
import type { WorkDomain as Domain, WorkRecord as Entry } from "../../model/workRecord";
import { Field, Info, Pill } from "./WorkRecordPrimitives";

export function NestedPanel({
  domain,
  tab,
  item,
  mutate,
}: {
  domain: Domain;
  tab: string;
  item: Entry;
  mutate: (id: string, fn: (e: Entry) => Entry) => void;
}) {
  if (tab === "tasks") return <TaskPanel item={item} mutate={mutate} />;
  if (tab === "approvals" || tab === "cab")
    return <ApprovalPanel item={item} mutate={mutate} />;
  if (
    tab === "activity" ||
    tab === "timeline" ||
    tab === "audit" ||
    tab === "communications"
  )
    return <Timeline item={item} filter={tab} />;
  if (tab === "risk") return <RiskPanel item={item} />;
  if (tab === "conflicts") return <ConflictPanel item={item} />;
  if (tab === "rca" || tab === "investigation" || tab === "evidence")
    return <RcaPanel domain={domain} item={item} />;
  return (
    <article className="rounded-xl border bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold capitalize">{tab.replace("-", " ")}</h3>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {[
          ["State", item.state],
          ["Priority", item.priority],
          ["Risk", item.risk],
          ["Owner", item.owner],
          ["Assignment group", item.group],
          ["Service", item.service],
        ].map(([label, value]) => (
          <Info key={label} label={label} value={value} />
        ))}
      </div>
      <p className="mt-6 whitespace-pre-wrap text-sm leading-6 text-slate-700">
        {item.description}
      </p>
      <div className="mt-6 rounded-lg border border-cyan-100 bg-cyan-50 p-4 text-sm text-cyan-900">
        <ShieldCheck className="mr-2 inline h-4 w-4" />
        Field access, state transitions, and linked records are governed by the
        current role and scope.
      </div>
    </article>
  );
}

function TaskPanel({
  item,
  mutate,
}: {
  item: Entry;
  mutate: (id: string, fn: (e: Entry) => Entry) => void;
}) {
  const [title, setTitle] = useState("");
  return (
    <article className="rounded-xl border bg-white p-6">
      <h3 className="font-bold">Nested tasks</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          mutate(item.id, (r) => ({
            ...r,
            tasks: [
              ...r.tasks,
              {
                id: crypto.randomUUID(),
                title,
                owner: r.owner,
                state: "New",
                due: new Date().toISOString().slice(0, 10),
              },
            ],
          }));
          setTitle("");
        }}
        className="mt-4 flex gap-2"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="flex-1 rounded-lg border px-3 py-2 text-sm"
          placeholder="New task title"
        />
        <button className="rounded-lg bg-slate-900 px-4 text-sm text-white">
          Add task
        </button>
      </form>
      <div className="mt-4 space-y-3">
        {item.tasks.map((task) => (
          <div
            key={task.id}
            className="flex flex-wrap items-center gap-3 rounded-lg border p-4"
          >
            <ClipboardCheck className="h-5 w-5 text-cyan-700" />
            <div className="flex-1">
              <p className="font-semibold">{task.title}</p>
              <p className="text-xs text-slate-500">
                {task.owner} · Due {task.due}
              </p>
            </div>
            <select
              value={task.state}
              onChange={(e) =>
                mutate(item.id, (r) => ({
                  ...r,
                  tasks: r.tasks.map((t) =>
                    t.id === task.id ? { ...t, state: e.target.value } : t,
                  ),
                }))
              }
              className="rounded border px-2 py-1 text-sm"
            >
              {["New", "In progress", "Blocked", "Complete"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </article>
  );
}
function ApprovalPanel({
  item,
  mutate,
}: {
  item: Entry;
  mutate: (id: string, fn: (e: Entry) => Entry) => void;
}) {
  return (
    <article className="rounded-xl border bg-white p-6">
      <h3 className="font-bold">Approvals and CAB decisions</h3>
      <div className="mt-4 space-y-3">
        {item.approvals.map((approval) => (
          <div
            key={approval.id}
            className="flex flex-wrap items-center gap-3 rounded-lg border p-4"
          >
            <Users className="h-5 w-5 text-indigo-700" />
            <div className="flex-1">
              <p className="font-semibold">{approval.approver}</p>
              <p className="text-xs text-slate-500">{approval.comment}</p>
            </div>
            {["Approved", "Rejected"].map((state) => (
              <button
                key={state}
                onClick={() =>
                  mutate(item.id, (r) => ({
                    ...r,
                    approvals: r.approvals.map((a) =>
                      a.id === approval.id ? { ...a, state } : a,
                    ),
                  }))
                }
                className="rounded-lg border px-3 py-2 text-xs font-semibold"
              >
                {state}
              </button>
            ))}
            <Pill>{approval.state}</Pill>
          </div>
        ))}
      </div>
    </article>
  );
}
function Timeline({ item, filter }: { item: Entry; filter: string }) {
  const notes =
    filter === "communications"
      ? item.notes.filter((n) => n.type === "communication")
      : filter === "audit"
        ? item.notes.filter((n) => n.type === "audit")
        : item.notes;
  return (
    <article className="rounded-xl border bg-white p-6">
      <h3 className="font-bold capitalize">{filter}</h3>
      <ol className="mt-5 space-y-4">
        {notes.map((note) => (
          <li key={note.id} className="flex gap-3">
            <span className="mt-1 h-3 w-3 rounded-full bg-cyan-600" />
            <div>
              <p className="text-sm">{note.body}</p>
              <p className="mt-1 text-xs text-slate-500">
                {note.author} · {new Date(note.at).toLocaleString()}
              </p>
            </div>
          </li>
        ))}
      </ol>
      {!notes.length ? (
        <p className="mt-4 text-sm text-slate-500">No entries yet.</p>
      ) : null}
    </article>
  );
}
function RiskPanel({ item }: { item: Entry }) {
  const factors = [
    ["Business criticality", 4],
    ["Users affected", 3],
    ["Implementation complexity", 3],
    ["Backout readiness", 2],
  ];
  return (
    <article className="rounded-xl border bg-white p-6">
      <h3 className="font-bold">Risk assessment</h3>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {factors.map(([name, score]) => (
          <div key={String(name)} className="rounded-lg border p-4">
            <div className="flex justify-between">
              <span className="text-sm font-semibold">{name}</span>
              <strong>{score}/5</strong>
            </div>
            <div className="mt-3 h-2 rounded bg-slate-100">
              <div
                className="h-full rounded bg-amber-500"
                style={{ width: `${Number(score) * 20}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
        Calculated risk: <strong>{item.risk}</strong>. An override requires a
        reason and is recorded in audit history.
      </p>
    </article>
  );
}
function ConflictPanel({ item }: { item: Entry }) {
  return (
    <article className="rounded-xl border bg-white p-6">
      <h3 className="font-bold">Conflict detection</h3>
      <div className="mt-5 space-y-3">
        {[
          ["Schedule overlap", "CHG000875", "Warning"],
          ["Shared configuration item", "Identity Gateway 01", "Critical"],
          ["Maintenance window", "Approved window", "Clear"],
        ].map(([type, target, state]) => (
          <div
            key={type}
            className="flex items-center gap-3 rounded-lg border p-4"
          >
            <AlertTriangle
              className={`h-5 w-5 ${state === "Clear" ? "text-emerald-600" : "text-amber-600"}`}
            />
            <div className="flex-1">
              <p className="font-semibold">{type}</p>
              <p className="text-xs text-slate-500">{target}</p>
            </div>
            <Pill>{state}</Pill>
          </div>
        ))}
      </div>
      <button
        onClick={() =>
          toast.success(`Conflict scan completed for ${item.number}`)
        }
        className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white"
      >
        Run conflict scan
      </button>
    </article>
  );
}
function RcaPanel({ domain, item }: { domain: Domain; item: Entry }) {
  return (
    <article className="rounded-xl border bg-white p-6">
      <h3 className="font-bold">
        {domain === "major" ? "Investigation" : "Root cause analysis"}
      </h3>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Field label="Analysis method" name="method">
          <select>
            <option>5 Whys</option>
            <option>Fishbone</option>
            <option>Fault tree</option>
          </select>
        </Field>
        <Field label="Root cause category" name="category">
          <select>
            <option>Process</option>
            <option>Technology</option>
            <option>People</option>
            <option>Vendor</option>
          </select>
        </Field>
        <Field label="Evidence" name="evidence" wide>
          <textarea
            rows={4}
            defaultValue={`Evidence collected for ${item.number}`}
          />
        </Field>
        <Field label="Root cause statement" name="root_cause" wide>
          <textarea rows={4} />
        </Field>
      </div>
      <button
        onClick={() => toast.success("RCA saved")}
        className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white"
      >
        Save analysis
      </button>
    </article>
  );
}
