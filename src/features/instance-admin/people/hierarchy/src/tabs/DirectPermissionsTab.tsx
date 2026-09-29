import { Card, CardBody, EmptyState, ErrorState, PageLoader } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { useEffectiveAccessQuery } from "@shared/api/instanceApi";
import { titleCase } from "@shared/lib/format";

interface DirectPermissionsTabProps {
  instanceId: string;
  userId: string;
}

export function DirectPermissionsTab({ instanceId, userId }: DirectPermissionsTabProps) {
  const { data, isLoading, isError, error } = useEffectiveAccessQuery({ instanceId, userId });

  if (isLoading) return <PageLoader label="Loading permissions…" />;
  if (isError)
    return (
      <ErrorState
        message={`Could not load permissions: ${(error as { data?: { message?: string } })?.data?.message ?? "unknown error"}`}
      />
    );

  const direct = data?.directPermissions ?? [];
  const membership = data?.membershipPermissions ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardBody>
          <h4 className="mb-2 text-sm font-semibold text-slate-800">Membership defaults</h4>
          <PermissionChips permissions={membership} />
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <h4 className="mb-2 text-sm font-semibold text-slate-800">Direct grants on this user</h4>
          <PermissionChips permissions={direct} />
        </CardBody>
      </Card>
    </div>
  );
}

function PermissionChips({ permissions }: { permissions: string[] }) {
  if (permissions.length === 0) {
    return <EmptyState title="None" />;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {permissions.map((permission) => (
        <Badge key={permission}>{titleCase(permission)}</Badge>
      ))}
    </div>
  );
}