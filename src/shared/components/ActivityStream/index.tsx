import { useState } from "react";
import {
  Clock3, MessageSquare, Paperclip, Image, FileText,
  Download, Trash2, ChevronDown, ChevronUp, Eye,
  Loader2, CheckCircle2, AlertCircle,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { Button } from "@shared/components/ui";
import { cn } from "@shared/lib/cn";

export type ActivityType = "comment" | "work_note" | "attachment" | "status_change" | "assignment" | "escalation" | "system";

export interface ActivityEntry {
  id: string;
  actor: string;
  action: string;
  type: ActivityType;
  resource?: string;
  timestamp: string;
  details?: string;
  public?: boolean;
  attachments?: Array<{ id: string; name: string; type: string; size: string }>;
  before?: string;
  after?: string;
  instanceId?: string;
}

interface ActivityStreamProps {
  entries: ActivityEntry[];
  loading?: boolean;
  emptyDescription?: string;
  showPublicOnly?: boolean;
  onTogglePublicOnly?: (value: boolean) => void;
  onAttachmentDownload?: (id: string) => void;
  onAttachmentRemove?: (id: string) => void;
}

const typeIcons: Record<ActivityType, typeof MessageSquare> = {
  comment: MessageSquare,
  work_note: CheckCircle2,
  attachment: Paperclip,
  status_change: AlertCircle,
  assignment: Clock3,
  escalation: AlertCircle,
  system: Clock3,
};

const typeBadgeColors: Record<ActivityType, "info" | "success" | "muted" | "warning" | "danger"> = {
  comment: "info",
  work_note: "success",
  attachment: "muted",
  status_change: "warning",
  assignment: "info",
  escalation: "danger",
  system: "muted",
};

export function ActivityStream({
  entries, loading, emptyDescription = "No activity recorded.",
  showPublicOnly, onTogglePublicOnly, onAttachmentDownload, onAttachmentRemove,
}: ActivityStreamProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterPublic, setFilterPublic] = useState(showPublicOnly ?? false);

  const filteredEntries = entries.filter((e) => {
    if (filterPublic && !e.public) return false;
    return true;
  });

  const handleToggleFilter = () => {
    const newVal = !filterPublic;
    setFilterPublic(newVal);
    onTogglePublicOnly?.(newVal);
  };

  return (
    <Card>
      <CardHeader
        title="Activity"
        description="Timeline of actions and updates"
        actions={
          <div className="flex items-center gap-2">
            {onTogglePublicOnly ? (
              <Button variant="outline" size="sm" onClick={handleToggleFilter}>
                <Eye className="h-3.5 w-3.5" /> {filterPublic ? "Show All" : "Public Only"}
              </Button>
            ) : null}
          </div>
        }
      />
      <CardBody>
        {loading ? (
          <div className="space-y-3">
            <div className="h-8 animate-pulse rounded bg-slate-100" />
            <div className="h-8 animate-pulse rounded bg-slate-100" />
            <div className="h-8 animate-pulse rounded bg-slate-100" />
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center">
            <Clock3 className="mx-auto h-6 w-6 text-slate-400" />
            <p className="mt-2 text-sm text-slate-500">{emptyDescription}</p>
          </div>
        ) : (
          <div className="relative space-y-0">
            {filteredEntries.map((entry, index) => {
              const Icon = typeIcons[entry.type];
              const isExpanded = expandedId === entry.id;
              const isLast = index === filteredEntries.length - 1;
              return (
                <div key={entry.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${entry.public ? "border-brand-400 bg-brand-50" : "border-slate-300 bg-slate-100"}`}>
                      <Icon className="h-3.5 w-3.5 text-slate-600" />
                    </div>
                    {!isLast ? <div className="w-px flex-1 bg-slate-200" /> : null}
                  </div>
                  <div className={`pb-4 flex-1 rounded-lg border ${isExpanded ? "border-brand-200 bg-brand-50" : "border-slate-200 bg-white"} p-3`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-slate-800">{entry.actor}</p>
                          <Badge variant={typeBadgeColors[entry.type]}>{entry.type.replace("_", " ")}</Badge>
                          {!entry.public ? <Badge variant="muted">Private</Badge> : null}
                        </div>
                        <p className="mt-0.5 text-xs text-slate-600">{entry.action}</p>
                        <p className="mt-0.5 text-[10px] text-slate-400">{new Date(entry.timestamp).toLocaleString()}</p>
                      </div>
                      <button onClick={() => setExpandedId(isExpanded ? null : entry.id)} className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100">
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    {entry.details ? <p className="mt-2 text-xs text-slate-600">{entry.details}</p> : null}
                    {entry.before || entry.after ? (
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        {entry.before ? <div className="rounded bg-red-50 px-2 py-1"><span className="text-red-600">Before:</span> {entry.before}</div> : null}
                        {entry.after ? <div className="rounded bg-emerald-50 px-2 py-1"><span className="text-emerald-600">After:</span> {entry.after}</div> : null}
                      </div>
                    ) : null}
                    {entry.attachments && entry.attachments.length > 0 ? (
                      <div className="mt-2 space-y-1">
                        {entry.attachments.map((att) => (
                          <div key={att.id} className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 p-2">
                            {att.type === "image" ? <Image className="h-4 w-4 text-slate-400" /> : <FileText className="h-4 w-4 text-slate-400" />}
                            <span className="text-xs text-slate-700">{att.name}</span>
                            <span className="text-[10px] text-slate-400">{att.size}</span>
                            {onAttachmentDownload ? <Button variant="ghost" size="sm" onClick={() => onAttachmentDownload(att.id)}><Download className="h-3 w-3" /></Button> : null}
                            {onAttachmentRemove ? <Button variant="ghost" size="sm" onClick={() => onAttachmentRemove(att.id)} className="text-red-500"><Trash2 className="h-3 w-3" /></Button> : null}
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {isExpanded && entry.instanceId ? <p className="mt-2 text-[10px] text-slate-400">Instance: {entry.instanceId}</p> : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
