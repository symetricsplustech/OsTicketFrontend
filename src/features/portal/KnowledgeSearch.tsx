import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, BookOpen, FileText, Loader2 } from "lucide-react";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardHeader, CardBody } from "@shared/components/ui";
import { Button } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { Input } from "@shared/components/ui";
import { Spinner } from "@shared/components/ui";
import { EmptyState } from "@shared/components/ui";
import { cn } from "@shared/lib/cn";

interface KnowledgeArticle {
  id: string;
  title: string;
  summary: string;
  category: string;
  createdAt: string;
}

export function KnowledgeSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/portal/knowledge/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success) setResults(data.items ?? []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const categories = ["General", "IT Support", "Facilities", "HR", "Finance", "Security"];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader title="Knowledge Base" description="Search for articles, guides, and FAQs." />

      <Card>
        <CardBody className="space-y-4">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} placeholder="Search knowledge articles…" className="pl-11 text-base" />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button key={cat} onClick={() => { setQuery(cat); handleSearch(); }} className={cn("rounded-full px-3 py-1.5 text-xs font-semibold", query === cat ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>{cat}</button>
            ))}
          </div>
        </CardBody>
      </Card>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center py-20"><Spinner className="h-6 w-6" /><span className="ml-3 text-sm text-slate-500">Searching…</span></div>
      ) : results.length > 0 ? (
        <div className="space-y-4">
          {results.map((article) => (
            <Card key={article.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/instances/${useParams()?.instanceId}/portal/knowledge/${article.id}`)}>
              <CardBody className="flex items-start gap-4">
                <FileText className="h-8 w-8 shrink-0 text-sky-600" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-slate-900">{article.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{article.summary}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <Badge variant="muted">{article.category}</Badge>
                    <span className="text-[10px] text-slate-400">{new Date(article.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : query ? (
        <EmptyState title="No articles found" description="Try different search terms or browse categories." />
      ) : (
        <EmptyState title="Search the knowledge base" description="Find articles, guides, and FAQs about services, policies, and procedures." />
      )}
    </div>
  );
}

import { useParams } from "react-router-dom";
