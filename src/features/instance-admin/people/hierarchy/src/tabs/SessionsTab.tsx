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
import { useSessionsQuery, useRevokeSessionMutation } from "@shared/api/instanceApi";
import { formatDateTime } from "@shared/lib/format";

interface SessionsTabProps {
  instanceId: string;
  userId: string;
}

export function SessionsTab({ instanceId, userId }: SessionsTabProps) {
  const { data, isLoading, isError, error } = useSessionsQuery({ instanceId, userId });
  const [revoke, { isLoading: revoking }] = useRevokeSessionMutation();

  if (isLoading) return <PageLoader label="Loading sessions…" />;
  if (isError)
    return (
      <ErrorState
        message={`Could not load sessions: ${(error as { data?: { message?: string } })?.data?.message ?? "unknown error"}`}
      />
    );

  const mfa = data?.mfa;
  const items = data?.items ?? [];

  const handleRevoke = async (sessionId: string) => {
    try {
      await revoke({ instanceId, userId, sessionId }).unwrap();
      toast.success("Session revoked");
    } catch {
      toast.error("Failed to revoke session");
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader title="MFA Status" />
        <CardBody>
          <dl className="divide-y divide-slate-100">
            <DetailRow label="MFA enabled">
              <StatusBadge status={mfa?.enabled ? "enabled" : "disabled"} />
            </DetailRow>
            <DetailRow label="Backup codes remaining">{mfa?.backupCodesRemaining ?? 0}</DetailRow>
            <DetailRow label="Last login">{formatDateTime(mfa?.lastLogin)}</DetailRow>
            <DetailRow label="Session version">{mfa?.sessionVersion ?? 0}</DetailRow>
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Active & recorded sessions" />
        <CardBody>
          {items.length === 0 ? (
            <EmptyState title="No sessions recorded" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {items.map((session) => (
                <li key={session.id} className="py-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {session.device || session.userAgent || "Unknown device"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {session.email} · {session.ip || "no ip"} ·{" "}
                        {formatDateTime(session.createdAt)}
                      </p>
                      <p className="text-xs text-slate-400">
                        Last active {formatDateTime(session.lastActiveAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <StatusBadge status={session.status} />
                      {session.status === "active" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          loading={revoking}
                          onClick={() => handleRevoke(session.id)}
                        >
                          Revoke
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}