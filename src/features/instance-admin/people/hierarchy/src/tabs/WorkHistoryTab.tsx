import { Card, CardHeader, CardBody, ErrorState, PageLoader, EmptyState } from "@shared/components/ui";
import { useWorkHistoryQuery } from "@shared/api/instanceApi";
import { Badge } from "@shared/components/Badge";
import { formatDateTime } from "@shared/lib/format";

interface WorkHistoryTabProps {
  instanceId: string;
  userId: string;
}

export function WorkHistoryTab({ instanceId, userId }: WorkHistoryTabProps) {
  const { data, isLoading, isError, error } = useWorkHistoryQuery({
    instanceId,
    userId,
    limit: 100,
  });

  if (isLoading) return <PageLoader label="Loading work history…" />;
  if (isError)
    return (
      <ErrorState
        message={`Could not load work history: ${(error as { data?: { message?: string } })?.data?.message ?? "unknown error"}`}
      />
    );

  const items = data?.items ?? [];

  return (
    <Card>
      <CardHeader
        title="Work History"
        description="Closed tasks, resolved tickets and audit events attributed to this user."
      />
      <CardBody>
        {items.length === 0 ? (
          <EmptyState title="No history recorded" />
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-800">
                    <span className="text-slate-400">{item.reference}</span>
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-500">{item.status}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Badge variant={item.type === "audit" ? "muted" : "info"}>{item.type}</Badge>
                  <span className="text-xs text-slate-400">{formatDateTime(item.at)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}