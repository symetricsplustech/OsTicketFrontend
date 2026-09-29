import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDelegationsQuery, useCreateDelegationMutation, useRevokeDelegationMutation } from "@shared/api/instanceApi";
import { useDirectoryQuery } from "@shared/api/instanceApi";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody, CardHeader, Button, EmptyState, Label, Input } from "@shared/components/ui";
import { StatusBadge } from "@shared/components/Badge";
import { showSuccess, showError } from "@shared/components/Toast/ToastContainer";
import { formatDate } from "@shared/lib/format";
import type { Delegation } from "@shared/types";

export function DelegationsPage() {
  const { instanceId = "" } = useParams<{ instanceId: string }>();
  const { data, isLoading, isError, error } = useDelegationsQuery({ instanceId, includeInactive: true }, { skip: !instanceId });
  const { data: directory } = useDirectoryQuery({ instanceId, limit: 50 }, { skip: !instanceId });
  const [create] = useCreateDelegationMutation();
  const [revoke] = useRevokeDelegationMutation();
  const [delegateUserId, setDelegateUserId] = useState("");
  const [reason, setReason] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const users = directory?.items ?? [];
  const items = data?.items ?? [];

  const handleCreate = async () => {
    try {
      await create({ instanceId, body: { delegateUserId, reason: reason || null, startsAt: null, expiresAt: expiresAt || null } }).unwrap();
      showSuccess("Delegation created");
      setDelegateUserId("");
      setReason("");
      setExpiresAt("");
    } catch {
      showError("Failed to create delegation");
    }
  };

  const handleRevoke = async (delegationId: string) => {
    try {
      await revoke({ instanceId, delegationId }).unwrap();
      showSuccess("Delegation revoked");
    } catch {
      showError("Failed to revoke delegation");
    }
  };

  return (
    <div>
      <PageHeader
        title="Delegations"
        description="Temporary permission/role lending between members of this instance."
        breadcrumbs={<Link to={`/instances/${instanceId}`} className="hover:text-brand-600">Instance</Link>}
      />
      <Card className="mb-4">
        <CardHeader title="Create delegation" description="Delegate permissions from yourself to another member." />
        <CardBody>
          <div className="grid max-w-lg gap-3">
            <div><Label>Delegate user</Label><select value={delegateUserId} onChange={(e) => setDelegateUserId(e.target.value)} className="focus-ring block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"><option value="">— Select a member —</option>{users.map((user) => <option key={user._id} value={user._id}>{user.name} ({user.email})</option>)}</select></div>
            <div><Label>Expires at (optional)</Label><Input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div><Label>Reason</Label><textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="focus-ring w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <Button onClick={handleCreate}>Create delegation</Button>
          </div>
        </CardBody>
      </Card>
      {isLoading ? <Card><CardBody><p className="py-12 text-center text-sm text-slate-500">Loading delegations…</p></CardBody></Card> : isError ? <Card><CardBody><p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Could not load delegations.</p></CardBody></Card> : items.length === 0 ? <Card><CardBody><EmptyState title="No delegations yet" /></CardBody></Card> : (
        <Card>
          <CardHeader title="All delegations" />
          <CardBody>
            <div className="grid gap-3 lg:grid-cols-2">
              {items.map((delegation: Delegation) => (
                <div key={delegation.id} className="rounded-md border border-slate-200 px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm"><span className="font-medium text-slate-800">{delegation.delegateUserId}</span> <span className="text-slate-400">←</span> <span className="font-medium text-slate-800">{delegation.delegatorUserId}</span></span>
                    <div className="flex items-center gap-2"><StatusBadge status={delegation.status} />{delegation.status === "active" ? <Button variant="danger" size="sm" onClick={() => handleRevoke(delegation.id)}>Revoke</Button> : null}</div>
                  </div>
                  <dl className="mt-1.5 space-y-1">
                    <div className="flex justify-between text-xs"><span className="text-slate-500">Window</span><span>{formatDate(delegation.startsAt)} → {formatDate(delegation.expiresAt)}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-slate-500">Grants</span><span>{(delegation.permissions ?? []).length} permission(s), {(delegation.roleIds ?? []).length} role(s)</span></div>
                    {delegation.reason ? <div className="flex justify-between text-xs"><span className="text-slate-500">Reason</span><span>{delegation.reason}</span></div> : null}
                  </dl>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}


