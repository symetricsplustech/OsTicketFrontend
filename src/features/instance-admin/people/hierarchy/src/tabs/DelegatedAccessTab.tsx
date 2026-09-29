import { useState } from "react";
import { toast } from "react-hot-toast";
import {
  Card,
  CardHeader,
  CardBody,
  DetailRow,
  Button,
  ErrorState,
  PageLoader,
  EmptyState,
} from "@shared/components/ui";
import { StatusBadge } from "@shared/components/Badge";
import {
  useDelegationsQuery,
  useRevokeDelegationMutation,
} from "@shared/api/instanceApi";
import { formatDate } from "@shared/lib/format";
import type { Delegation } from "@shared/types";

interface DelegatedAccessTabProps {
  instanceId: string;
  userId: string;
}

export function DelegatedAccessTab({ instanceId, userId }: DelegatedAccessTabProps) {
  return <DelegationCard instanceId={instanceId} userId={userId} />;
}

function DelegationCard({ instanceId, userId }: { instanceId: string; userId: string }) {
  const { data, isLoading, isError, error } = useDelegationsQuery({
    instanceId,
    userId,
    includeInactive: true,
  });
  const [revoke] = useRevokeDelegationMutation();

  if (isLoading) return <PageLoader label="Loading delegations…" />;
  if (isError)
    return (
      <ErrorState
        message={`Could not load delegations: ${(error as { data?: { message?: string } })?.data?.message ?? "unknown error"}`}
      />
    );

  const items = data?.items ?? [];

  const handleRevoke = async (delegationId: string) => {
    try {
      await revoke({ instanceId, delegationId }).unwrap();
      toast.success("Delegation revoked");
    } catch {
      toast.error("Failed to revoke delegation");
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader title="Delegations" description="Access temporarily lent to or from this user." />
        <CardBody>
          {items.length === 0 ? (
            <EmptyState title="No delegations for this user" />
          ) : (
            <div className="space-y-3">
              {items.map((delegation) => (
                <DelegationRow
                  key={delegation.id}
                  delegation={delegation}
                  onRevoke={() => handleRevoke(delegation.id)}
                />
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Active for me" description="Delegations currently active toward this user." />
        <CardBody>
          {(data?.activeForMe ?? []).length === 0 ? (
            <EmptyState title="None active" />
          ) : (
            <div className="space-y-3">
              {(data?.activeForMe ?? []).map((delegation) => (
                <DelegationRow
                  key={delegation.id}
                  delegation={delegation}
                  onRevoke={() => handleRevoke(delegation.id)}
                />
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function DelegationRow({
  delegation,
  onRevoke,
}: {
  delegation: Delegation;
  onRevoke: () => void;
}) {
  return (
    <div className="rounded-md border border-slate-200 px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-slate-800">
            {delegation.delegatorUserId} → {delegation.delegateUserId}
          </span>
          <StatusBadge status={delegation.status} />
        </div>
        {delegation.status === "active" ? (
          <Button variant="outline" size="sm" onClick={onRevoke}>
            Revoke
          </Button>
        ) : null}
      </div>
      <dl className="mt-1.5 space-y-1">
        <DetailRow label="Window">
          {formatDate(delegation.startsAt)} → {formatDate(delegation.expiresAt)}
        </DetailRow>
        <DetailRow label="Permissions">{(delegation.permissions ?? []).length} granted</DetailRow>
        <DetailRow label="Roles">{(delegation.roleIds ?? []).length} role(s)</DetailRow>
        {delegation.reason ? <DetailRow label="Reason">{delegation.reason}</DetailRow> : null}
      </dl>
    </div>
  );
}