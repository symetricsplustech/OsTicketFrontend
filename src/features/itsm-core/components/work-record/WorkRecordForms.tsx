import { useState, type FormEvent } from "react";
import { CalendarDays, Filter } from "lucide-react";
import toast from "react-hot-toast";
import type { WorkDomain as Domain, WorkRecord as Entry } from "../../model/workRecord";
import { workRecordLabel as labelFor } from "../../model/workRecordLabels";
import { Field, Pill } from "./WorkRecordPrimitives";

export function CalendarView({
  domain,
  records,
}: {
  domain: Domain;
  records: Entry[];
}) {
  return (
    <article className="rounded-xl border bg-white p-6 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">{labelFor(domain)} calendar</h2>
          <p className="text-sm text-slate-500">
            Maintenance, blackout, implementation, and conflict overlays.
          </p>
        </div>
        <div className="flex gap-2">
          {["Day", "Week", "Month"].map((view) => (
            <button key={view} className="rounded-lg border px-3 py-2 text-sm">
              {view}
            </button>
          ))}
        </div>
      </header>
      <div className="mt-6 grid grid-cols-7 gap-px overflow-hidden rounded-lg border bg-slate-200">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div
            key={day}
            className="bg-slate-50 p-3 text-center text-xs font-bold"
          >
            {day}
          </div>
        ))}
        {Array.from({ length: 35 }, (_, index) => (
          <div key={index} className="min-h-28 bg-white p-2">
            <span className="text-xs text-slate-400">{index + 1}</span>
            {records[index % records.length] && index % 4 === 0 ? (
              <div className="mt-2 rounded bg-cyan-50 p-2 text-xs text-cyan-900">
                <strong>{records[index % records.length].number}</strong>
                <p className="mt-1 truncate">
                  {records[index % records.length].title}
                </p>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </article>
  );
}
export function EditRecord({
  item,
  save,
}: {
  item: Entry;
  save: (updates: Partial<Entry>) => void;
}) {
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget));
    save({
      title: String(d.title),
      description: String(d.description),
      owner: String(d.owner),
      group: String(d.group),
      service: String(d.service),
      risk: String(d.risk),
    });
    toast.success("Record updated");
  };
  return (
    <form onSubmit={submit} className="rounded-xl border bg-white p-6">
      <h3 className="font-bold">Edit record</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Field label="Title" name="title">
          <input name="title" defaultValue={item.title} required />
        </Field>
        <Field label="Owner" name="owner">
          <input name="owner" defaultValue={item.owner} required />
        </Field>
        <Field label="Assignment group" name="group">
          <input name="group" defaultValue={item.group} required />
        </Field>
        <Field label="Service" name="service">
          <input name="service" defaultValue={item.service} required />
        </Field>
        <Field label="Risk" name="risk">
          <select name="risk" defaultValue={item.risk}>
            {["Low", "Medium", "High", "Critical"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </Field>
        <Field label="Description" name="description" wide>
          <textarea
            name="description"
            defaultValue={item.description}
            rows={4}
          />
        </Field>
      </div>
      <button className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">
        Save changes
      </button>
    </form>
  );
}
