import { Download, UserCircle } from "lucide-react";
import { formatRelativeTime } from "@shared/lib/format";
import { Button, Card } from "@shared/components/ui";
import type { TicketThreadEntry } from "./types";

export function TicketConversation({
  entries,
  selecting,
  selectedIds,
  onToggle,
}: {
  entries: TicketThreadEntry[];
  selecting: boolean;
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <Card
          key={entry._id}
          className={`p-5 ${entry.type === "note" ? "border-l-4 border-yellow-400 bg-yellow-50/30" : ""}`}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selecting && entry.type !== "note" && (
                <input
                  aria-label={`Select message from ${entry.author?.name || "System"}`}
                  type="checkbox"
                  checked={selectedIds.includes(entry._id)}
                  onChange={() => onToggle(entry._id)}
                />
              )}
              <UserCircle className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium">
                {entry.author?.name || "System"}
              </span>
              {entry.type === "note" && (
                <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
                  Internal Note
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500">
              {formatRelativeTime(entry.createdAt)}
            </span>
          </div>
          <p className="whitespace-pre-wrap text-sm text-gray-700">
            {entry.content}
          </p>
          {!!entry.attachments?.length && (
            <div className="mt-3 flex flex-wrap gap-2">
              {entry.attachments.map((attachment) => (
                <a
                  key={attachment}
                  href={attachment}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200"
                >
                  <Download className="h-3 w-3" /> {attachment.split("/").pop()}
                </a>
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

export function TicketSummary({
  summary,
  onDismiss,
}: {
  summary: any;
  onDismiss: () => void;
}) {
  if (!summary) return null;
  return (
    <Card className="border-brand-200 bg-brand-50/40 p-5">
      <div className="mb-2 flex items-center gap-2">
        <h3 className="text-sm font-semibold">Thread summary</h3>
        <span className="rounded-full border bg-white px-2 py-0.5 text-[10px] text-gray-500">
          {summary.provider === "llm" ? "LLM" : "on-device extractive"}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          onClick={onDismiss}
        >
          Dismiss
        </Button>
      </div>
      <p className="whitespace-pre-wrap text-sm text-gray-700">
        {summary.summary || "Nothing substantial yet."}
      </p>
      <p className="mt-2 text-xs text-gray-400">
        {summary.counts?.messages ?? 0} entries · voices:{" "}
        {(summary.participants || []).join(", ") || "—"}
      </p>
    </Card>
  );
}
