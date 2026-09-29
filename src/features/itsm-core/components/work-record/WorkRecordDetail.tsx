import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Send } from "lucide-react";
import toast from "react-hot-toast";
import type { ScreenDefinition } from "../../models/screen";
import type { WorkDomain as Domain, WorkRecord as Entry } from "../../model/workRecord";
import { lifecycleTransitions } from "../../model/workRecordLifecycle";
import { useWorkRecordAccess } from "../WorkRecordGovernance";
import { EditRecord } from "./WorkRecordForms";
import { NestedPanel } from "./WorkRecordNestedPanels";
import { Pill } from "./WorkRecordPrimitives";

export function RecordWorkspace({
  domain,
  screen,
  record: item,
  mutate,
  transitionRecord,
  nested,
}: {
  domain: Domain;
  screen: ScreenDefinition;
  record: Entry;
  mutate: (id: string, fn: (e: Entry) => Entry) => void;
  transitionRecord: (id: string, state: string) => void;
  nested: string;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { canWrite } = useWorkRecordAccess();
  const [tab, setTab] = useState(nested.split("/")[2] || defaultTab(screen));
  const [note, setNote] = useState("");
  const [editing, setEditing] = useState(false);
  const tabs =
    domain === "major"
      ? [
          "overview",
          "impact",
          "services",
          "cis",
          "responders",
          "tasks",
          "timeline",
          "investigation",
          "communications",
          "resolution",
          "pir",
          "audit",
        ]
      : domain === "problem"
        ? [
            "overview",
            "details",
            "activity",
            "incidents",
            "cis-services",
            "rca",
            "evidence",
            "workaround",
            "known-error",
            "tasks",
            "changes",
            "attachments",
            "audit",
          ]
        : domain === "request"
          ? ["overview", "details", "activity", "requested-items", "approvals", "fulfillment", "tasks", "dependencies", "exceptions", "attachments", "audit"]
          : domain === "catalog"
            ? ["overview", "details", "variables", "ui-policies", "user-criteria", "fulfillment", "pricing", "versions", "preview", "activity", "attachments", "audit"]
            : domain === "knowledge"
              ? ["overview", "content", "versions", "review", "approval", "feedback", "translations", "related", "activity", "attachments", "audit"]
              : domain === "sla"
                ? ["overview", "conditions", "duration", "schedule", "timeline", "breach-warning", "escalations", "related", "activity", "attachments", "audit"]
        : [
            "overview",
            "details",
            "planning",
            "risk",
            "schedule",
            "conflicts",
            "approvals",
            "cab",
            "tasks",
            "cis",
            "services",
            "implementation",
            "validation",
            "pir",
            "related",
            "activity",
            "attachments",
            "audit",
          ];
  const changeTab = (value: string) => {
    setTab(value);
    navigate(
      `${location.pathname.split("/records/")[0]}/records/${item.id}/${value}`,
    );
  };
  const transition = (state: string) => transitionRecord(item.id, state);
  return (
    <div className="space-y-5">
      <button
        onClick={() => navigate(location.pathname.split("/records/")[0])}
        className="flex items-center gap-2 text-sm font-semibold text-cyan-800"
      >
        <ArrowLeft className="h-4 w-4" /> Back to {screen.title}
      </button>
      <header className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-cyan-700">{item.number}</p>
            <h2 className="mt-1 text-2xl font-bold">{item.title}</h2>
            <p className="mt-2 text-sm text-slate-500">
              {item.service} · {item.group} · Owner {item.owner}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Pill>{item.state}</Pill>
            <button
              disabled={!canWrite}
              onClick={() => setEditing(!editing)}
              className="rounded-lg border p-2 disabled:opacity-40"
              aria-label="Edit record"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <select
            disabled={!canWrite}
            aria-label="Lifecycle transition"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                transition(e.target.value);
                toast.success(`Moved to ${e.target.value}`);
                e.target.value = "";
              }
            }}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="">Move to…</option>
            {(lifecycleTransitions[domain][item.state] ?? []).map((state) => (
              <option key={state}>{state}</option>
            ))}
          </select>
          {[
            "Assign",
            "Relate record",
            "Add task",
            domain === "major"
              ? "Send communication"
              : domain === "problem"
                ? "Publish workaround"
                : "Run conflict check",
          ].map((action) => (
            <button
              key={action}
              disabled={!canWrite}
              onClick={() => toast.success(`${action} opened`)}
              className="rounded-lg border px-3 py-2 text-sm font-semibold disabled:opacity-40"
            >
              {action}
            </button>
          ))}
        </div>
      </header>
      {editing ? (
        <EditRecord
          item={item}
          save={(updates) => {
            mutate(item.id, (entry) => ({
              ...entry,
              ...updates,
              updated: new Date().toISOString(),
            }));
            setEditing(false);
          }}
        />
      ) : null}
      <nav
        className="flex overflow-x-auto rounded-xl border bg-white"
        aria-label="Record sections"
      >
        {tabs.map((value) => (
          <button
            key={value}
            onClick={() => changeTab(value)}
            className={`whitespace-nowrap border-b-2 px-4 py-3 text-xs font-semibold capitalize ${tab === value ? "border-cyan-600 text-cyan-700" : "border-transparent text-slate-500"}`}
          >
            {value.replace("-", " ")}
          </button>
        ))}
      </nav>
      <NestedPanel domain={domain} tab={tab} item={item} mutate={mutate} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!note.trim()) return;
          mutate(item.id, (entry) => ({
            ...entry,
            notes: [
              {
                id: crypto.randomUUID(),
                author: "Current user",
                body: note.trim(),
                at: new Date().toISOString(),
                type: "work_note",
              },
              ...entry.notes,
            ],
          }));
          setNote("");
          toast.success("Work note added");
        }}
        className="rounded-xl border bg-white p-5"
      >
        <label className="text-sm font-bold">Add work note</label>
        <textarea
          disabled={!canWrite}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="mt-3 w-full rounded-lg border p-3 text-sm"
        />
        <button disabled={!canWrite} className="mt-3 flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">
          <Send className="h-4 w-4" /> Post note
        </button>
      </form>
    </div>
  );
}

function defaultTab(screen: ScreenDefinition) {
  const title = screen.title.toLowerCase();
  if (title.includes("risk")) return "risk";
  if (title.includes("conflict")) return "conflicts";
  if (title.includes("approval") || title.includes("cab")) return "approvals";
  if (title.includes("task")) return "tasks";
  if (title.includes("timeline") || title.includes("activity")) return "timeline";
  if (title.includes("root cause") || title.includes("investigation")) return "rca";
  return "overview";
}
