import { ShieldCheck } from "lucide-react";
import { useWorkRecordAccess } from "../WorkRecordGovernance";

export type WorkRecordView = "ready" | "loading" | "empty" | "error" | "denied";

export function WorkRecordAccessBanner({ scope, state, setState }: { scope: string; state: WorkRecordView; setState: (value: WorkRecordView) => void }) {
  const { canWrite } = useWorkRecordAccess();
  return <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-3 text-xs"><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-700" /><strong>Backend access:</strong> {scope} · {canWrite ? "write" : "read only"}</div><label>Preview <select value={state} onChange={(event) => setState(event.target.value as WorkRecordView)} className="ml-2 rounded border p-1.5"><option value="ready">Ready</option><option value="loading">Loading</option><option value="empty">Empty</option><option value="error">Error</option><option value="denied">Denied</option></select></label></section>;
}
