import type { ScreenDefinition } from "../../models/screen";
import type { WorkRecord } from "../../model/workRecord";
import { KnowledgeFeedbackCard } from "./KnowledgeFeedbackCard";

export function KnowledgeFeedbackView({ screen, items }: { screen: ScreenDefinition; items: WorkRecord[] }) {
  return <section className="rounded-xl border bg-white p-6"><header><h2 className="text-xl font-bold">{screen.title}</h2><p className="mt-1 text-sm text-slate-500">Feedback is loaded and recorded through the knowledge APIs.</p></header><div className="mt-5 space-y-4">{items.map((item) => <KnowledgeFeedbackCard key={item.id} article={item} />)}</div></section>;
}
