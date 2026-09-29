import { Card, CardBody, ErrorState, PageLoader, EmptyState } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { useEffectiveAccessQuery } from "@shared/api/instanceApi";
import { titleCase } from "@shared/lib/format";

interface EffectiveAccessTabProps {
  instanceId: string;
  userId: string;
}

export function EffectiveAccessTab({ instanceId, userId }: EffectiveAccessTabProps) {
  const { data, isLoading, isError, error } = useEffectiveAccessQuery({ instanceId, userId });

  if (isLoading) return <PageLoader label="Resolving effective access…" />;
  if (isError)
    return (
      <ErrorState
        message={`Could not resolve effective access: ${(error as { data?: { message?: string } })?.data?.message ?? "unknown error"}`}
      />
    );

  const grants = data?.effective ?? [];
  const denied = data?.denied ?? [];
  const sources = data?.sources ?? {};

  return (
    <div className="space-y-4">
      <Card>
        <CardBody>
          <h4 className="mb-1 text-sm font-semibold text-slate-800">Effective grants</h4>
          <p className="mb-3 text-xs text-slate-500">
            Resolved server-side from membership, roles, grants and delegations.
          </p>
          {grants.length === 0 ? (
            <EmptyState title="No effective grants" />
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {grants.map((grant) => (
                <Badge key={grant} variant="success">
                  {titleCase(grant)}
                  {sources[grant] ? (
                    <span className="ml-1 text-[10px] uppercase opacity-70">· {sources[grant]}</span>
                  ) : null}
                </Badge>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <h4 className="mb-3 text-sm font-semibold text-slate-800">Explicit deny list</h4>
          {denied.length === 0 ? (
            <EmptyState title="No explicit denials" />
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {denied.map((deny) => (
                <Badge key={deny} variant="danger">
                  {titleCase(deny)}
                </Badge>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
      {data?.delegatedGrants?.length ? (
        <Card>
          <CardBody>
            <h4 className="mb-3 text-sm font-semibold text-slate-800">Delegated grants</h4>
            <div className="space-y-2">
              {(data.delegatedGrants ?? []).map((grant) => (
                <div
                  key={grant.delegationId}
                  className="rounded-md border border-slate-200 px-3 py-2 text-xs text-slate-600"
                >
                  From delegator <span className="font-medium">{grant.delegatorUserId}</span> ·{" "}
                  {(grant.permissions ?? []).length} permission(s)
                  {grant.expiresAt ? ` · expires ${new Date(grant.expiresAt).toLocaleString()}` : ""}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}