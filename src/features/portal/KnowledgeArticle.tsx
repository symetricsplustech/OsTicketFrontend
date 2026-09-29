import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, FileText, Clock, User, BookOpen } from "lucide-react";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardHeader, CardBody } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { Spinner } from "@shared/components/ui";
import { EmptyState } from "@shared/components/ui";
import { ErrorState } from "@shared/components/ui";
import { DetailRow } from "@shared/components/ui";
import { ActivityStream } from "@shared/components/ActivityStream";
import { showSuccess } from "@shared/components/Toast/ToastContainer";

interface KnowledgeArticleData {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: { name: string };
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  helpful: number;
  activity: Array<{ id: string; actor: string; action: string; timestamp: string; details?: string }>;
}

export function KnowledgeArticle() {
  const { instanceId = "", articleId = "" } = useParams();
  const [data, setData] = useState<KnowledgeArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/portal/knowledge/${articleId}`);
        const result = await res.json();
        if (result.success) setData(result.data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [articleId]);

  const handleMarkHelpful = async () => {
    try {
      await fetch(`/api/v1/portal/knowledge/${articleId}/helpful`, { method: "POST" });
      setData((prev) => prev ? { ...prev, helpful: prev.helpful + 1 } : prev);
      showSuccess("Thanks", "You marked this article as helpful.");
    } catch {
      showSuccess("Error", "Failed to mark as helpful.");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Spinner className="h-6 w-6" /><span className="ml-3 text-sm text-slate-500">Loading article…</span></div>;
  }

  if (error || !data) {
    return <div className="max-w-5xl mx-auto"><ErrorState message={error ?? "Article not found."} /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader title={data.title} breadcrumbs={<Link to={`/instances/${instanceId}/portal/knowledge`} className="text-brand-600 hover:underline">Knowledge</Link>} />

      <Card>
        <CardHeader title={data.title} description={<div className="flex items-center gap-3"><Badge variant="muted">{data.category}</Badge><span className="text-xs text-slate-400">{data.tags.map((t) => `#${t}`).join(" ")}</span></div>} />
        <CardBody>
          <div className="mb-4 flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><User className="h-3 w-3" />{data.author.name}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(data.createdAt).toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{data.viewCount} views</span>
          </div>
          <article className="prose prose-sm max-w-none text-sm text-slate-700">{data.content}</article>
          <div className="mt-6 flex items-center gap-3 border-t pt-4">
            <button onClick={handleMarkHelpful} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Was this helpful? ({data.helpful})
            </button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Activity" />
        <CardBody><ActivityStream entries={data.activity} /></CardBody>
      </Card>
    </div>
  );
}
