import { Link, useParams } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  ErrorState,
  PageLoader,
  EmptyState,
  DetailRow,
} from "@shared/components/ui";
import { PageHeader } from "@shared/components/PageHeader";
import { Badge, StatusBadge } from "@shared/components/Badge";
import { useMyEffectiveAccessQuery } from "@shared/api/instanceApi";
import { titleCase, formatDate } from "@shared/lib/format";

export function MyEffectiveAccessPage() {
  const { instanceId } = useParams<{ instanceId: string }>();
  const { data, isLoading, isError, error } = useMyEffectiveAccessQuery(instanceId ?? "", {
    skip: !instanceId,
  });

  if (!instanceId) return null;

  return (
    <div>
      <PageHeader
        title="My Effective Access"
        description="What you can do inside this instance, resolved server-side from membership, roles, grants and delegations."
        breadcrumbs={<Link to={`/instances/${instanceId}`}>Instance</Link>}
      />
      {isLoading ? (
        <Card>
          <PageLoader label="Resolving effective access…" />
        </Card>
      ) : isError ? (
        <ErrorState
          message={`Could not resolve effective access: ${(error as { data?: { message?: string } })?.data?.message ?? "unknown error"}`}
        />
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader title="Membership" />
            <CardBody>
              <dl className="divide-y divide-slate-100">
                <DetailRow label="User">{data?.name}</DetailRow>
                <DetailRow label="Email">{data?.email}</DetailRow>
                <DetailRow label="Member role">{data?.membership?.role ?? "—"}</DetailRow>
                <DetailRow label="Status">
                  <StatusBadge status={data?.membership?.status} />
                </DetailRow>
                <DetailRow label="Joined">{formatDate(data?.membership?.joinedAt)}</DetailRow>
              </dl>
            </CardBody>
          </Card>
          <Card>
            <CardHeader
              title="Effective grants"
              description={`${data?.effective?.length ?? 0} effective permission(s).`}
            />
            <CardBody>
              {!data?.effective?.length ? (
                <EmptyState title="No effective grants" />
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {(data.effective ?? []).map((grant) => (
                    <Badge key={grant} variant="success">
                      {titleCase(grant)}
                    </Badge>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Required roles" description={`${data?.roles?.length ?? 0} role(s).`} />
            <CardBody>
              {(data?.roles ?? []).length === 0 ? (
                <EmptyState title="No roles assigned" />
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {(data?.roles ?? []).map((role) => (
                    <Badge key={role._id} variant="info">
                      {role.name}
                    </Badge>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}