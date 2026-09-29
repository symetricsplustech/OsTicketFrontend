import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Textarea,
  Field,
  Button,
  ErrorState,
  PageLoader,
  EmptyState,
  DetailRow,
} from "@shared/components/ui";
import { PageHeader } from "@shared/components/PageHeader";
import { StatusBadge } from "@shared/components/Badge";
import {
  useDelegationsQuery,
  useCreateDelegationMutation,
  useRevokeDelegationMutation,
} from "@shared/api/instanceApi";
import { useDirectoryQuery } from "@shared/api/instanceApi";
import { formatDate } from "@shared/lib/format";
import type { DirectoryUser, Delegation } from "@shared/types";

export function DelegationsPage() {
  const { instanceId } = useParams<{ instanceId: string }>();
  const { data, isLoading, isError, error } = useDelegationsQuery(
    { instanceId: instanceId ?? "", includeInactive: true },
    { skip: !instanceId },
  );
  const { data: directory } = useDirectoryQuery(
    { instanceId: instanceId ?? "", limit: 50 },
    { skip: !instanceId },
  );
  const [create] = useCreateDelegationMutation();

  const [delegateUserId, setDelegateUserId] = useState("");
  const [reason, setReason] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  if (!instanceId) return null;

  const users = directory?.items ?? [];
  const items = data?.items ?? [];

  const handleCreate = async () => {
    try {
      await create({
        instanceId,
        body: {
          delegateUserId,
          reason: reason || null,
          startsAt: null,
          expiresAt: expiresAt || null,
        },
      }).unwrap();
      toast.success("Delegation created");
      setDelegateUserId("");
      setReason("");
      setExpiresAt("");
    } catch {
      toast.error("Failed to create delegation");
    }
  };

  return (
    <div>
      <PageHeader
        title="Delegations"
        description="Temporary permission/role lending between members of this instance."
        breadcrumbs={<Link to={`/instances/${instanceId}`}>Instance</Link>}
      />

      <Card className="mb-4">
        <CardHeader title="Create delegation" description="Delegate permissions from yourself (delegator) to another member." />
        <CardBody>
          <div className="grid max-w-lg gap-3">
            <Field label="Delegate user">
              <select
                value={delegateUserId}
                onChange={(e) => setDelegateUserId(e.target.value)}
                className="focus-ring block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">— Select a member —</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Expires at (optional)">
              <Input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
            </Field>
            <Field label="Reason">
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} />
            </Field>
            <div>
              <Button onClick={handleCreate}>Create delegation</Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {isLoading ? (
        <Card>
          <PageLoader label="Loading delegations…" />
        </Card>
      ) : isError ? (
        <ErrorState
          message={`Could not load delegations: ${(error as { data?: { message?: string } })?.data?.message ?? "unknown error"}`}
        />
      ) : items.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState title="No delegations yet" />
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader title="All delegations" />
          <CardBody>
            <div className="grid gap-3 lg:grid-cols-2">
              {items.map((delegation) => (
                <DelegationCardView key={delegation.id} delegation={delegation} instanceId={instanceId} />
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function DelegationCardView({ delegation, instanceId }: { delegation: Delegation; instanceId: string }) {
  const [revoke] = useRevokeDelegationMutation();

  const handleRevoke = async () => {
    try {
      await revoke({ instanceId, delegationId: delegation.id }).unwrap();
      toast.success("Delegation revoked");
    } catch {
      toast.error("Failed to revoke delegation");
    }
  };

  return (
    <div className="rounded-md border border-slate-200 px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm">
          <span className="font-medium text-slate-800">{delegation.delegatorUserId}</span>
          <span className="text-slate-400"> → </span>
          <span className="font-medium text-slate-800">{delegation.delegateUserId}</span>
        </span>
        <div className="flex items-center gap-2">
          <StatusBadge status={delegation.status} />
          {delegation.status === "active" ? (
            <Button variant="danger" size="sm" onClick={handleRevoke}>
              Revoke
            </Button>
          ) : null}
        </div>
      </div>
      <dl className="mt-1.5 space-y-1">
        <DetailRow label="Window">
          {formatDate(delegation.startsAt)} → {formatDate(delegation.expiresAt)}
        </DetailRow>
        <DetailRow label="Grants">
          {(delegation.permissions ?? []).length} permission(s), {(delegation.roleIds ?? []).length} role(s)
        </DetailRow>
        {delegation.reason ? <DetailRow label="Reason">{delegation.reason}</DetailRow> : null}
      </dl>
    </div>
  );
}

