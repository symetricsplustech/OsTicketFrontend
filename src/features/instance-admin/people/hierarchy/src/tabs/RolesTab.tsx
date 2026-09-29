import { Card, CardBody, DetailRow, EmptyState, ErrorState, PageLoader } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { useEffectiveAccessQuery } from "@shared/api/instanceApi";

interface RolesTabProps {
  instanceId: string;
  userId: string;
}

export function RolesTab({ instanceId, userId }: RolesTabProps) {
  const { data, isLoading, isError, error } = useEffectiveAccessQuery({ instanceId, userId });

  if (isLoading) return <PageLoader label="Loading roles…" />;
  if (isError)
    return (
      <ErrorState
        message={`Could not load roles: ${(error as { data?: { message?: string } })?.data?.message ?? "unknown error"}`}
      />
    );

  const roles = data?.roles ?? [];
  if (roles.length === 0) {
    return (
      <Card>
        <CardBody>
          <EmptyState title="No roles assigned" description="This user has no instance roles configured." />
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {roles.map((role) => (
        <Card key={role._id}>
          <CardBody>
            <dl className="divide-y divide-slate-100">
              <DetailRow label="Role">{role.name}</DetailRow>
              <DetailRow label="Status">
                <Badge variant={role.status ? "success" : "muted"}>{role.status ?? "active"}</Badge>
              </DetailRow>
              <DetailRow label="Granted permissions">{(role.permissions?.length ?? 0)} grants</DetailRow>
              <DetailRow label="Denied permissions">{(role.deniedPermissions?.length ?? 0)} denials</DetailRow>
            </dl>
          </CardBody>
        </Card>
      ))}
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
        Permission counts shown above; the complete grant list is visible on the Effective Access tab.
      </div>
    </div>
  );
}