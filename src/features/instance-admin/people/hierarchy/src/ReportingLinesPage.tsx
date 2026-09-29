import { Link, useParams } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  ErrorState,
  EmptyState,
} from "@shared/components/ui";
import { PageHeader } from "@shared/components/PageHeader";
import { Badge } from "@shared/components/Badge";
import { useDirectoryQuery } from "@shared/api/instanceApi";
import { useMyEffectiveAccessQuery } from "@shared/api/instanceApi";

/**
 * People / Reporting Lines explorer: direct reports + my chain resolved from
 * real reporting-line rows (manager/team lead), driven strictly by the
 * backend hierarchy service.
 */
export function ReportingLinesPage() {
  const { instanceId } = useParams<{ instanceId: string }>();

  const effective = useMyEffectiveAccessQuery(instanceId ?? "", { skip: !instanceId });
  const directory = useDirectoryQuery(
    { instanceId: instanceId ?? "", limit: 50 },
    { skip: !instanceId },
  );

  if (!instanceId) return null;

  const selfId = effective.data?.userId;

  if (effective.isLoading) return null;

  return (
    <div>
      <PageHeader
        title="Reporting Lines"
        description="Manager and team-lead reporting relationships across this instance."
        breadcrumbs={<Link to={`/instances/${instanceId}`}>Instance</Link>}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="My reporting chain" description="Ancestors above the signed-in user." />
          <CardBody>
            {effective.isError ? (
              <ErrorState
                message={`Could not load chain: ${(effective.error as { data?: { message?: string } })?.data?.message ?? "unknown error"}`}
              />
            ) : (
              <EmptyState
                title="Chain viewer"
                description="Open a user's workspace to see their reporting chain and direct reports."
              />
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Directory users" description={`${directory.data?.total ?? 0} members`} />
          <CardBody>
            {directory.isLoading ? null : directory.isError ? (
              <ErrorState message="Could not load the directory." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {(directory.data?.items ?? []).slice(0, 20).map((user) => (
                  <li key={user._id} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{user.name}</p>
                      <p className="text-xs text-slate-500">
                        {user.managerName
                          ? `Reports to ${user.managerName}`
                          : user.teamLeadName
                            ? `Team lead ${user.teamLeadName}`
                            : "No manager assigned"}
                      </p>
                    </div>
                    <Link
                      to={`/instances/${instanceId}/people/users/${user._id}/access`}
                      className="text-xs font-medium text-brand-600 hover:underline"
                    >
                      Open workspace →
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {selfId ? (
              <div className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
                Current viewer id: <span className="font-mono">{selfId}</span>
                <Badge variant="info" className="ml-2">
                  {effective.data?.membership?.role ?? "member"}
                </Badge>
              </div>
            ) : null}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}