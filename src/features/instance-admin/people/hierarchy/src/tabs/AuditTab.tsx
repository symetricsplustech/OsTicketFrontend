import { Card, CardHeader, CardBody, ErrorState, PageLoader, EmptyState } from "@shared/components/ui";
import { StatusBadge } from "@shared/components/Badge";
import { useAuditQuery } from "@shared/api/instanceApi";
import { formatDateTime } from "@shared/lib/format";

interface AuditTabProps {
  userId: string;
}

export function AuditTab({ userId }: AuditTabProps) {
  const { data, isLoading, isError, error } = useAuditQuery({
    actor: userId,
    limit: 50,
  });

  if (isLoading) return <PageLoader label="Loading audit trail…" />;
  if (isError)
    return (
      <ErrorState
        message={`Could not load audit events: ${(error as { data?: { message?: string } })?.data?.message ?? "unknown error"}`}
      />
    );

  const events = data?.events ?? [];

  return (
    <Card>
      <CardHeader
        title="Audit Trail"
        description={`${data?.total ?? 0} events attributed to this actor.`}
      />
      <CardBody>
        {events.length === 0 ? (
          <EmptyState title="No audit events found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {["Time", "Action", "Resource", "Outcome"].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {events.map((event) => (
                  <tr key={event.id}>
                    <td className="px-4 py-2 text-xs text-slate-500">
                      {formatDateTime(event.createdAt)}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs text-slate-800">{event.action}</td>
                    <td className="px-4 py-2 text-xs text-slate-600">
                      {event.resourceType}
                      {event.resourceId ? (
                        <span className="ml-1 font-mono text-slate-400">#{event.resourceId}</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-2">
                      <StatusBadge status={event.outcome ?? "success"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}