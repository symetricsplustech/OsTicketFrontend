import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "@shared/lib/api";
import { ModuleGuard } from "@core/permissions/ModuleGuard";
import { Search, Loader2 } from "lucide-react";

interface SemanticResult {
  entity: string;
  label: string;
  module: string;
  id: string;
  title: string;
  recordNumber?: string;
  score: number;
  snippet?: string;
}

const ENTITY_LABELS: Record<string, string> = {
  ticket: "Ticket",
  incident: "Incident",
  faq: "Knowledge Base",
  ci: "CMDB CI",
  asset: "Asset",
  change: "Change",
};

const ENTITY_ORDER = ["ticket", "incident", "faq", "ci", "asset", "change"];

function routeFor(entity: string, id: string): string | null {
  const map: Record<string, string> = {
    ticket: `/tickets/manage/${id}`,
    change: `/changes-crud/${id}`,
    incident: `/incidents/${id}`,
    ci: `/cmdb/${id}`,
    asset: `/assets/${id}`,
    faq: `/kb/${id}`,
  };
  return map[entity] || null;
}

function scorePercent(score: number): string {
  const pct = Math.round(Math.min(1, Math.max(0, score)) * 100);
  return `${pct}%`;
}

function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SemanticResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get("/agent/search/semantic", {
        params: { q: trimmed, limit: 30 },
      });
      setResults(res.data.results || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (timer.current) clearTimeout(timer.current);
    runSearch(query);
  };

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (query.trim().length >= 2) {
      timer.current = setTimeout(() => runSearch(query), 350);
    } else {
      setResults([]);
      setHasSearched(false);
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [query]);

  const handleClick = (r: SemanticResult) => {
    const route = routeFor(r.entity, r.id);
    if (route) navigate(route);
  };

  const grouped = ENTITY_ORDER.map((entity) => ({
    entity,
    label: ENTITY_LABELS[entity] || entity,
    items: results.filter((r) => r.entity === entity),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">
        Neural Search
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Cross-entity semantic search across tickets, incidents, knowledge, CIs,
        assets, and changes.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across your service desk…"
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Search
        </button>
      </form>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500 py-10 justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
          Searching…
        </div>
      ) : hasSearched && grouped.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-500">
          No results
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.entity}>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                {group.label}
              </div>
              <div className="space-y-2">
                {group.items.map((r, i) => (
                  <button
                    key={`${r.entity}-${r.id}-${i}`}
                    onClick={() => handleClick(r)}
                    className="w-full rounded-lg border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-400 hover:shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="font-medium text-gray-900 truncate">
                          {r.title || r.label}
                        </span>
                        {r.recordNumber && (
                          <span className="inline-flex shrink-0 items-center rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                            {r.recordNumber}
                          </span>
                        )}
                      </div>
                      <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                        {scorePercent(r.score)}
                      </span>
                    </div>
                    {r.snippet && (
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                        {r.snippet.length > 140
                          ? `${r.snippet.slice(0, 140)}…`
                          : r.snippet}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NeuralSearch() {
  return (
    <ModuleGuard module="helpdesk">
      <SearchPage />
    </ModuleGuard>
  );
}
