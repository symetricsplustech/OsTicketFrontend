import { useEffect, useState } from "react";
import { Button, Card } from "@shared/components/ui";
import { knowledgeApi } from "@modules/helpdesk/services";

type KnowledgeItem = { _id: string; question: string; helpful?: number };

export function RelatedKnowledge({ subject }: { subject: string }) {
  const [items, setItems] = useState<KnowledgeItem[]>([]);

  useEffect(() => {
    if (subject.trim().length < 4) return;
    const timer = window.setTimeout(async () => {
      try {
        const response = await knowledgeApi.search(subject);
        setItems(
          (response.data.data || []).map((article: any) => ({
            _id: article._id,
            question: article.title || article.question,
            helpful: article.helpfulCount || 0,
          })),
        );
      } catch {
        setItems([]);
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [subject]);

  const vote = async (id: string, helpful: boolean) => {
    try {
      await knowledgeApi.rateArticle(id, helpful ? 5 : 1);
      if (helpful) {
        setItems((current) =>
          current.map((item) =>
            item._id === id
              ? { ...item, helpful: (item.helpful || 0) + 1 }
              : item,
          ),
        );
      }
    } catch {
      // Suggestions and votes are intentionally best-effort.
    }
  };

  if (!items.length) return null;

  return (
    <Card className="p-5">
      <h3 className="mb-3 text-sm font-semibold">Related knowledge</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item._id} className="text-sm">
            <div className="text-gray-800">{item.question}</div>
            <div className="mt-1 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => vote(item._id, true)}
              >
                Helpful{item.helpful ? ` (${item.helpful})` : ""}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => vote(item._id, false)}
              >
                Not helpful
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
