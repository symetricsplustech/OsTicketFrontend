import toast from "react-hot-toast";
import { useAddKnowledgeFeedbackMutation, useListKnowledgeFeedbackQuery } from "@features/knowledge-management/api/knowledgeApi";
import { apiRows } from "@shared/api/itsmTypes";
import type { WorkRecord } from "../../model/workRecord";
import { Pill } from "./WorkRecordPrimitives";

export function KnowledgeFeedbackCard({ article }: { article: WorkRecord }) {
  const { data, isLoading } = useListKnowledgeFeedbackQuery({ articleId: article.id });
  const [addFeedback, { isLoading: isSaving }] = useAddKnowledgeFeedbackMutation();
  const feedback = apiRows(data);
  const helpful = feedback.filter((item) => item.helpful === true || item.rating === "helpful").length;
  const notHelpful = feedback.filter((item) => item.helpful === false || item.rating === "not_helpful").length;
  const submit = (value: boolean) => void addFeedback({ articleId: article.id, helpful: value }).unwrap().then(() => toast.success("Feedback recorded")).catch(() => toast.error("Unable to record feedback"));
  return <article className="rounded-xl border p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold text-cyan-700">{article.number}</p><h3 className="mt-1 font-bold">{article.title}</h3></div><Pill>{article.state}</Pill></div><div className="mt-4 flex flex-wrap gap-2"><button disabled={isLoading || isSaving} onClick={() => submit(true)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Helpful · {helpful}</button><button disabled={isLoading || isSaving} onClick={() => submit(false)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Not helpful · {notHelpful}</button></div></article>;
}
