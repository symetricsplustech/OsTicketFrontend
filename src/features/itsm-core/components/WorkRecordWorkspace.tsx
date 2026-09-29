import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import type { ScreenDefinition } from "../models/screen";
import { useWorkRecordAccess } from "./WorkRecordGovernance";
import { useWorkRecordRepository } from "../api/useWorkRecordRepository";
import type { WorkDomain, WorkRecord } from "../model/workRecord";
import { textValue } from "../model/workRecordAdapter";
import { workRecordLabel as labelFor } from "../model/workRecordLabels";
import { CalendarView } from "./work-record/WorkRecordForms";
import { WorkRecordCreateView } from "./work-record/WorkRecordCreateView";
import { RecordWorkspace } from "./work-record/WorkRecordDetail";
import { RecordList } from "./work-record/WorkRecordList";
import { CatalogShoppingView } from "./work-record/CatalogShoppingView";
import { KnowledgeFeedbackView } from "./work-record/KnowledgeFeedbackView";
import { LifecycleDashboard, SlaOperationalView } from "./work-record/WorkRecordOverviewViews";

export type Domain = WorkDomain;
export type Entry = WorkRecord;
export { applyLifecycleTransition, createLifecycleRecord, lifecycleTransitions, allowedTransitions } from "../model/workRecordLifecycle";

const apiError = (error: unknown) => typeof error === "object" && error && "data" in error ? textValue((error as { data?: { message?: unknown } }).data?.message, "API request failed") : error instanceof Error ? error.message : "API request failed";

export function WorkRecordWorkspace({ screen }: { screen: ScreenDefinition }) {
  const store = useWorkRecordRepository(screen);
  const domain = store.domain;
  const access = useWorkRecordAccess();
  const location = useLocation();
  const nested = location.pathname.split(`/${screen.screenId}/`)[1] ?? "";
  const recordId = nested.split("/")[1];
  const selected = store.records.find((item) => item.id === recordId);
  const mutate = (id: string, fn: (entry: Entry) => Entry) => {
    const current = store.records.find((item) => item.id === id);
    if (!current || !access.authorize("update record", current.number)) return;
    void store.update(id, fn(current)).catch((error) => toast.error(apiError(error)));
    access.audit("Record updated", current.number);
  };
  const transitionRecord = (id: string, state: string) => {
    const current = store.records.find((item) => item.id === id);
    if (!current || !access.authorize("transition record", current.number)) return;
    void store.transition(id, state).then(() => access.audit(`State changed to ${state}`, current.number)).catch((error) => toast.error(apiError(error)));
  };
  const title = screen.title.toLowerCase();
  if (store.isLoading) return <section role="status" className="animate-pulse rounded-xl border bg-white p-8"><div className="h-7 w-64 rounded bg-slate-200" /><div className="mt-5 h-52 rounded bg-slate-100" /></section>;
  if (store.isError) return <section role="alert" className="rounded-xl border border-red-200 bg-white p-8"><h2 className="font-bold text-red-800">Unable to load {labelFor(domain)} data</h2><p className="mt-2 text-sm text-slate-600">The backend API request failed. Check authentication, permissions, and service availability.</p><button onClick={() => void store.refetch()} className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">Retry</button></section>;
  if (domain === "catalog" && screen.module === "shopping")
    return <CatalogShoppingView screen={screen} items={store.records} />;
  if (domain === "knowledge" && screen.module === "feedback")
    return <KnowledgeFeedbackView screen={screen} items={store.records} />;
  if (domain === "sla" && screen.module === "task-sla" && screen.kind === "record")
    return <SlaOperationalView screen={screen} items={store.records} mutate={mutate} />;
  if (selected)
    return (
      <RecordWorkspace
        domain={domain}
        screen={screen}
        record={selected}
        mutate={mutate}
        transitionRecord={transitionRecord}
        nested={nested}
      />
    );
  if (
    /calendar|day view|week view|month view|window overlay|blackout overlay|conflict overlay/.test(
      title,
    )
  )
    return <CalendarView domain={domain} records={store.records} />;
  if (screen.kind === "settings" ||
    /new |create |editor|composer|propose|questionnaire|override|accept|reject|publish|decision|resolution|select change model/.test(
      title,
    )
  )
    return (
      <WorkRecordCreateView
        domain={domain}
        screen={screen}
        onCreate={(entry) => {
          if (!access.authorize("create record", entry.number)) return false;
          return store.create(entry).then(() => { access.audit("Record created", entry.number); return true; }).catch((error) => { toast.error(apiError(error)); return false; });
        }}
      />
    );
  if (screen.kind === "dashboard" || /dashboard|home$/.test(title))
    return (
      <LifecycleDashboard
        domain={domain}
        screen={screen}
        records={store.records}
      />
    );
  if ((screen.kind === "record" || screen.kind === "workspace") && store.records[0])
    return (
      <RecordWorkspace
        domain={domain}
        screen={screen}
        record={store.records[0]}
        mutate={mutate}
        transitionRecord={transitionRecord}
        nested=""
      />
    );
  return (
    <RecordList
      domain={domain}
      screen={screen}
      records={store.records}
      onDelete={(id) => {
        const current = store.records.find((item) => item.id === id);
        if (!current || !access.authorize("delete record", current.number)) return;
        void store.remove(id).then(() => access.audit("Record deleted", current.number)).catch((error) => toast.error(apiError(error)));
      }}
      onBulkState={(ids, nextState) =>
        ids.forEach((id) =>
          mutate(id, (entry) => ({
            ...entry,
            state: nextState,
            updated: new Date().toISOString(),
          })),
        )
      }
    />
  );
}
