import { Card, CardHeader, CardBody, ErrorState, PageLoader, EmptyState } from "@shared/components/ui";
import { useAssignedWorkQuery } from "@shared/api/instanceApi";
import { StatusBadge } from "@shared/components/Badge";
import { formatDateTime } from "@shared/lib/format";
import type { WorkItem } from "@shared/types";

interface AssignedWorkTabProps {
  instanceId: string;
  userId: string;
}

export function AssignedWorkTab({ instanceId, userId }: AssignedWorkTabProps) {
  const { data, isLoading, isError, error } = useAssignedWorkQuery({ instanceId, userId });

  if (isLoading) return <PageLoader label="Loading assigned work…" />;
  if (isError)
    return (
      <ErrorState
        message={`Could not load assigned work: ${(error as { data?: { message?: string } })?.data?.message ?? "unknown error"}`}
      />
    );

  const tickets = data?.tickets ?? [];
  const tasks = data?.tasks ?? [];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <WorkList title="Open tickets" items={tickets} />
      <WorkList title="Open tasks" items={tasks} />
    </div>
  );
}

function WorkList({ title, items }: { title: string; items: WorkItem[] }) {
  return (
    <Card>
      <CardHeader title={title} description={`${items.length} open item(s)`} />
      <CardBody>
        {items.length === 0 ? (
          <EmptyState title={`No ${title.toLowerCase()}`} />
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((item) => (
              <li key={item.id} className="py-2.5">
                <p className="flex items-center gap-2 text-sm font-medium text-slate-800">
                  {item.number}
                  <StatusBadge status={item.status} />
                </p>
                <p className="truncate text-sm text-slate-600">{item.title}</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {item.priority ? `Priority ${item.priority} · ` : ""}
                  Updated {formatDateTime(item.updatedAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}