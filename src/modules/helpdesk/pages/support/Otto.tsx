import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "@shared/lib/api";
import toast from "react-hot-toast";

// Otto — tenant assistant (module: ai). Everything here runs on tenant data:
// learned triage suggestions (suggestion.service) and thread summarization
// (extractive offline, LLM only if the operator configured AI_API_URL/KEY).
// No data leaves the tenant unless an LLM endpoint is configured server-side.
export default function Otto() {
  const [ticketNumber, setTicketNumber] = useState("");
  const [freeText, setFreeText] = useState("");
  const [summary, setSummary] = useState<any>(null);
  const [triage, setTriage] = useState<any>(null);
  const [busy, setBusy] = useState<"summary" | "triage" | null>(null);

  const runSummary = async () => {
    const body: any = {};
    if (ticketNumber.trim()) body.ticketNumber = ticketNumber.trim();
    else if (freeText.trim()) body.text = freeText.trim();
    else return toast.error("Enter a ticket number or paste text");
    setBusy("summary");
    try {
      const res = await api.post("/agent/assist/summarize", body);
      setSummary(res.data);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Summarization failed");
    } finally {
      setBusy(null);
    }
  };

  const runTriage = async () => {
    const text = freeText.trim() || (summary?.summary ?? "");
    if (!text && !ticketNumber.trim())
      return toast.error("Enter text or a ticket number");
    setBusy("triage");
    try {
      const res = await api.post("/agent/tickets/suggest", {
        details: text,
        ticketNumber: text ? undefined : ticketNumber.trim(),
      });
      setTriage(res.data);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Triage failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Otto AI Assistant</h1>
        <p className="text-sm text-gray-500">
          Summarize threads and triage like your best agent — learned from your
          resolved tickets
        </p>
      </div>

      <div className="card p-5 space-y-3">
        <div className="flex gap-2">
          <input
            value={ticketNumber}
            onChange={(e) => setTicketNumber(e.target.value)}
            placeholder="Ticket number (e.g. ABC123…)"
            className="input-field text-sm w-56"
          />
          <button
            onClick={runSummary}
            disabled={busy !== null}
            className="btn-primary text-sm disabled:opacity-40"
          >
            {busy === "summary" ? "Summarizing…" : "Summarize"}
          </button>
          <button
            onClick={runTriage}
            disabled={busy !== null}
            className="btn-secondary text-sm disabled:opacity-40"
          >
            {busy === "triage" ? "Triaging…" : "Suggest triage"}
          </button>
        </div>
        <textarea
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          rows={4}
          placeholder="…or paste a subject + description here for instant triage/summary"
          className="input-field text-sm w-full"
        />
      </div>

      {summary && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="font-semibold text-sm">Summary</h2>
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-gray-100 text-gray-500">
              {summary.provider === "llm" ? "LLM" : "on-device extractive"}
            </span>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {summary.summary || "Nothing substantial to summarize yet."}
          </p>
          <div className="mt-3 flex gap-4 text-xs text-gray-500">
            <span>
              {summary.counts?.messages ?? 0} entries (
              {summary.counts?.replies ?? 0} replies,{" "}
              {summary.counts?.notes ?? 0} notes)
            </span>
            {(summary.participants || []).length > 0 && (
              <span>Voices: {summary.participants.join(", ")}</span>
            )}
          </div>
          {ticketNumber.trim() && (
            <Link
              to={`/tickets/${ticketNumber.trim()}`}
              className="text-xs text-brand-600 hover:underline mt-2 inline-block"
            >
              Open ticket #{ticketNumber.trim()} →
            </Link>
          )}
        </div>
      )}

      {triage && (
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-sm">Triage suggestions</h2>
            <span className="text-xs text-gray-400">
              learned from {triage.trainedOn ?? 0} resolved tickets
            </span>
          </div>
          {!triage.learned && (
            <p className="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded-lg p-2.5">
              No resolved history yet — suggestions activate as your team closes
              tickets.
            </p>
          )}
          {(["department", "topic", "priority"] as const).map((k) => (
            <div key={k}>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1.5">
                {k}
              </p>
              {(triage[k] || []).length === 0 ? (
                <p className="text-xs text-gray-400">No signal</p>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {(triage[k] || []).map((v: any) => (
                    <span
                      key={v.id}
                      className="px-2.5 py-1 bg-brand-50 border border-brand-200 rounded-full text-xs font-medium text-brand-700"
                    >
                      {v.name} · {Math.round(v.score * 100)}%
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {(triage.similar || []).length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1.5">
                Similar past tickets
              </p>
              <ul className="divide-y text-sm">
                {triage.similar.map((s: any) => (
                  <li key={s.id} className="py-1.5 flex justify-between gap-3">
                    <Link
                      to={`/tickets/${s.number}`}
                      className="text-brand-700 hover:underline truncate"
                    >
                      #{s.number} — {s.title}
                    </Link>
                    <span className="text-xs text-gray-400 shrink-0">
                      {Math.round(s.score * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
