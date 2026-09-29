import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import type { ScreenDefinition } from "../../models/screen";
import type { WorkDomain as Domain, WorkRecord as Entry } from "../../model/workRecord";
import { workRecordLabel as labelFor, workRecordPrefix as prefixFor } from "../../model/workRecordLabels";
import { createLifecycleRecord } from "../../model/workRecordLifecycle";
import { useWorkRecordAccess } from "../WorkRecordGovernance";
import { Field } from "./WorkRecordPrimitives";

export function WorkRecordCreateView({
  domain,
  screen,
  onCreate,
}: {
  domain: Domain;
  screen: ScreenDefinition;
  onCreate: (entry: Entry) => Promise<boolean> | boolean;
}) {
  const navigate = useNavigate();
  const { canWrite, authorize, audit } = useWorkRecordAccess();
  const [dirty, setDirty] = useState(false);
  const [risk, setRisk] = useState("Medium");
  const [preview, setPreview] = useState(false);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const now = Date.now();
    const number = `${prefixFor(domain)}${String(now).slice(-6)}`;
    const item = createLifecycleRecord(
      number,
      String(data.title),
      domain === "major" ? "Candidate" : domain === "catalog" || domain === "knowledge" || domain === "sla" ? "Draft" : "New",
      String(data.priority),
      String(data.owner),
      String(data.group),
      String(data.service),
      String(data.risk),
    );
    item.description = String(data.description);
    item.start = String(data.start);
    item.end = String(data.end);
    if (item.start && item.end && new Date(item.end) <= new Date(item.start))
      return toast.error("Planned end must be after planned start");
    if (!(await onCreate(item))) return;
    setDirty(false);
    toast.success(`${labelFor(domain)} created`);
    navigate(
      `${location.pathname.replace(/\/[^/]+$/, "")}/${screen.screenId}/records/${item.id}`,
    );
  };
  return (
    <form
      onSubmit={submit}
      onChange={() => setDirty(true)}
      className="rounded-xl border bg-white p-6 shadow-sm"
    >
      <h2 className="text-xl font-bold">{screen.title}</h2>
      <p className="mt-1 text-sm text-slate-500">
        Create governed work with validation, ownership, service context,
        planning, and risk.
      </p>
      <fieldset className="mt-6 grid gap-5 rounded-xl border p-5 md:grid-cols-2">
        <legend className="px-2 text-sm font-bold">Identity and classification</legend>
        <Field label="Short description" required name="title" />
        <Field label="Priority" name="priority">
          <select name="priority" required defaultValue="">
            <option value="" disabled>
              Select…
            </option>
            {["P1", "P2", "P3", "P4"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </Field>
        <Field label="Description" required name="description" wide>
          <textarea name="description" required rows={4} />
        </Field>
      </fieldset>
      <fieldset className="mt-5 grid gap-5 rounded-xl border p-5 md:grid-cols-2">
        <legend className="px-2 text-sm font-bold">Ownership and service references</legend>
        <Field label="Owner" required name="owner"><input name="owner" required list="work-record-owners" /><datalist id="work-record-owners"><option value="Riya Verma" /><option value="Kabir Rao" /><option value="Neha Singh" /><option value="Catalog Owner" /></datalist></Field>
        <Field label="Assignment group" required name="group"><input name="group" required list="work-record-groups" /><datalist id="work-record-groups"><option value="Problem Management" /><option value="Platform Engineering" /><option value="Identity Engineering" /></datalist></Field>
        <Field label="Service" required name="service"><input name="service" required list="work-record-services" /><datalist id="work-record-services"><option value="Identity Platform" /><option value="Payment Service" /><option value="Workplace Service" /></datalist></Field>
        <Field label="Risk" name="risk">
          <select name="risk" required value={risk} onChange={(event) => setRisk(event.target.value)}>
            {["Low", "Medium", "High", "Critical"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </Field>
        {risk === "Critical" ? <Field label="Critical risk justification" name="riskJustification" wide required><textarea name="riskJustification" required rows={3} /></Field> : null}
      </fieldset>
      <fieldset className="mt-5 grid gap-5 rounded-xl border p-5 md:grid-cols-2">
        <legend className="px-2 text-sm font-bold">Planning window</legend>
        <Field label="Planned start" name="start">
          <input name="start" type="datetime-local" />
        </Field>
        <Field label="Planned end" name="end">
          <input name="end" type="datetime-local" />
        </Field>
      </fieldset>
      {preview ? <section className="mt-5 rounded-xl border border-cyan-200 bg-cyan-50 p-5" aria-live="polite"><h3 className="font-bold">Validation preview</h3><p className="mt-2 text-sm">The record will start in <strong>{domain === "major" ? "Candidate" : domain === "catalog" || domain === "knowledge" || domain === "sla" ? "Draft" : "New"}</strong> with <strong>{risk}</strong> risk. Required ownership, service, dates, and lifecycle policy will be validated on create.</p></section> : null}
      <div className="mt-6 flex gap-2 border-t pt-5">
        <button disabled={!canWrite} className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">
          <Plus className="h-4 w-4" /> Create
        </button>
        <button
          type="button"
          disabled={!canWrite}
          onClick={() => { if (!authorize("save draft", screen.title)) return; audit("Draft saved", screen.title); toast.success("Draft saved locally"); }}
          className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40"
        >
          Save draft
        </button>
        <button type="button" onClick={() => setPreview((value) => !value)} className="rounded-lg border px-4 py-2 text-sm">{preview ? "Hide preview" : "Preview & validate"}</button>
        <button
          type="button"
          onClick={() => { if (!dirty || confirm("Discard unsaved changes?")) navigate(-1); }}
          className="rounded-lg border px-4 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
