import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Activity,
  ArrowLeft,
  Clock,
  Edit,
  KeyRound,
  Mail,
  RefreshCw,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { SaasAdminScreen } from "@/screens/saas-admin/components/SaasAdminScreen";
import {
  ConfirmDialog,
  DataTable,
  StatCard,
  StatusBadge,
} from "@/screens/saas-admin/components/ui";
import { SectionCard } from "@/screens/saas-admin/components/resource/SectionCard";
import { DetailsGrid } from "@/screens/saas-admin/components/resource/DetailsGrid";
import { formatDate } from "@/screens/saas-admin/components/resource/helpers";
import { Button, ErrorState } from "@components/common/ui";
import { SAAS_ADMIN_PATHS } from "@/navigation/saasAdminPaths";
import { apiErrorMessage } from "@services/http";
import {
  useActivateStaffMutation,
  useDeactivateStaffMutation,
  useGetStaffActivityQuery,
  useGetStaffEffectivePermissionsQuery,
  useGetStaffQuery,
  useInviteStaffMutation,
  useListStaffSessionsQuery,
  useResetStaffPasswordMutation,
  useRevokeStaffSessionMutation,
  useRevokeStaffSessionsMutation,
  useSuspendStaffMutation,
} from "@services/saasadmin";
import type { ApiRecord } from "@services/saasadmin";

const BREADCRUMBS = [
  { label: "SaaS Admin" },
  { label: "Staff & Access" },
  { label: "Staff Accounts", href: SAAS_ADMIN_PATHS.staff.accounts },
  { label: "Staff Member" },
];

function staffName(record: ApiRecord | undefined): string {
  if (!record) return "Staff Member";
  const name = [record.firstName, record.lastName].filter(Boolean).join(" ");
  return String(record.displayName || name || record.email || "Staff Member");
}

function normalisedStatus(
  value: unknown,
): "active" | "invited" | "suspended" | "deactivated" {
  const status = String(value ?? "").toUpperCase();
  if (status === "ACTIVE") return "active";
  if (status === "INVITED") return "invited";
  if (status === "SUSPENDED") return "suspended";
  return "deactivated";
}

const STATUS_VARIANT: Record<string, "active" | "pending" | "suspended"> = {
  active: "active",
  invited: "pending",
  suspended: "suspended",
  deactivated: "suspended",
};

export function StaffDetailsScreen() {
  const { staffId } = useParams<{ staffId: string }>();
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [sessionToRevoke, setSessionToRevoke] = useState<ApiRecord | null>(
    null,
  );

  const staffQuery = useGetStaffQuery(staffId ?? "", { skip: !staffId });
  const activityQuery = useGetStaffActivityQuery(
    { staffId: staffId ?? "", limit: 20 },
    { skip: !staffId },
  );
  const sessionsQuery = useListStaffSessionsQuery(staffId ?? "", {
    skip: !staffId,
  });
  const effectiveQuery = useGetStaffEffectivePermissionsQuery(staffId ?? "", {
    skip: !staffId,
  });

  const [inviteStaff, { isLoading: inviting }] = useInviteStaffMutation();
  const [activateStaff, { isLoading: activating }] = useActivateStaffMutation();
  const [suspendStaff, { isLoading: suspending }] = useSuspendStaffMutation();
  const [deactivateStaff, { isLoading: deactivating }] =
    useDeactivateStaffMutation();
  const [resetPassword, { isLoading: resetting }] =
    useResetStaffPasswordMutation();
  const [revokeSessions, { isLoading: revoking }] =
    useRevokeStaffSessionsMutation();
  const [revokeStaffSession, { isLoading: revokingSession }] =
    useRevokeStaffSessionMutation();

  const staff = staffQuery.data?.data as ApiRecord | undefined;

  if (staffQuery.isLoading) {
    return (
      <SaasAdminScreen
        title="Staff Member"
        description="Loading staff member…"
        backTo={SAAS_ADMIN_PATHS.staff.accounts}
        backLabel="Back to Staff Accounts"
        breadcrumbs={BREADCRUMBS}
      >
        <p className="text-sm text-slate-500">Loading staff member…</p>
      </SaasAdminScreen>
    );
  }

  if (staffQuery.isError || !staff) {
    return (
      <SaasAdminScreen
        title="Staff Member"
        description="Staff details"
        backTo={SAAS_ADMIN_PATHS.staff.accounts}
        backLabel="Back to Staff Accounts"
        breadcrumbs={BREADCRUMBS}
      >
        <ErrorState message="Could not load this staff member." />
      </SaasAdminScreen>
    );
  }

  const status = normalisedStatus(staff.status);
  const roles = (Array.isArray(staff.roles) ? staff.roles : []) as ApiRecord[];
  const recentLogins = (
    Array.isArray(staff.recentLogins) ? staff.recentLogins : []
  ) as ApiRecord[];
  const sessions = (sessionsQuery.data?.data ?? []) as ApiRecord[];
  const effective = (effectiveQuery.data?.data ?? {}) as ApiRecord;
  const permissionCodes = Array.isArray(effective.permissions)
    ? (effective.permissions as string[])
    : [];
  const activity = ((activityQuery.data?.data ?? []) as ApiRecord[]).map(
    (event) => ({
      id: String(event.id),
      action: String(event.action ?? "—"),
      resourceType: String(event.resourceType ?? "—"),
      resourceId: event.resourceId ? String(event.resourceId) : "",
      outcome: String(event.outcome ?? ""),
      createdAt: event.createdAt ? String(event.createdAt) : "",
    }),
  );
  const activeSessions = Number(staff.activeSessions ?? 0);

  const run = async (label: string, action: () => Promise<unknown>) => {
    try {
      await action();
      toast.success(label);
      staffQuery.refetch();
      activityQuery.refetch();
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  };

  const loginColumns = [
    {
      key: "outcome",
      header: "Outcome",
      render: (row: ApiRecord) => (
        <StatusBadge
          status={String(row.outcome ?? "—").toLowerCase()}
          variant={String(row.outcome) === "SUCCESS" ? "active" : "suspended"}
          size="sm"
        />
      ),
    },
    {
      key: "ipAddress",
      header: "IP Address",
      render: (row: ApiRecord) => (
        <span className="text-sm text-slate-700">
          {String(row.ipAddress ?? "—")}
        </span>
      ),
    },
    {
      key: "userAgent",
      header: "Device",
      render: (row: ApiRecord) => (
        <span className="text-xs text-slate-500">
          {String(row.userAgent ?? "—").slice(0, 60)}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "When",
      render: (row: ApiRecord) => (
        <span className="text-sm text-slate-700">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
  ];

  const activityColumns = [
    {
      key: "action",
      header: "Action",
      render: (row: (typeof activity)[number]) => (
        <span className="font-mono text-xs text-slate-800">{row.action}</span>
      ),
    },
    {
      key: "resourceType",
      header: "Resource",
      render: (row: (typeof activity)[number]) => (
        <span className="text-sm text-slate-700">
          {row.resourceType}
          {row.resourceId ? ` · ${row.resourceId.slice(0, 10)}…` : ""}
        </span>
      ),
    },
    {
      key: "outcome",
      header: "Outcome",
      render: (row: (typeof activity)[number]) => (
        <StatusBadge
          status={row.outcome.toLowerCase() || "—"}
          variant={
            row.outcome === "SUCCESS"
              ? "active"
              : row.outcome === "DENIED"
                ? "suspended"
                : "pending"
          }
          size="sm"
        />
      ),
    },
    {
      key: "createdAt",
      header: "When",
      render: (row: (typeof activity)[number]) => (
        <span className="text-sm text-slate-700">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
  ];

  const sessionStatus = (
    row: ApiRecord,
  ): { label: string; variant: "active" | "pending" | "suspended" } => {
    if (row.isCurrent) return { label: "Current", variant: "active" };
    if (!row.isActive)
      return {
        label: row.revokedAt ? "Revoked" : "Expired",
        variant: "suspended",
      };
    return { label: "Active", variant: "active" };
  };

  const sessionsColumns = [
    {
      key: "userAgent",
      header: "Device",
      render: (row: ApiRecord) => (
        <span className="text-xs text-slate-600">
          {String(row.userAgent ?? "Unknown device").slice(0, 60)}
        </span>
      ),
    },
    {
      key: "ipAddress",
      header: "IP Address",
      render: (row: ApiRecord) => (
        <span className="text-sm text-slate-700">
          {String(row.ipAddress ?? "—")}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Signed In",
      render: (row: ApiRecord) => (
        <span className="text-sm text-slate-700">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      key: "lastUsedAt",
      header: "Last Used",
      render: (row: ApiRecord) => (
        <span className="text-sm text-slate-700">
          {formatDate(row.lastUsedAt)}
        </span>
      ),
    },
    {
      key: "expiresAt",
      header: "Expires",
      render: (row: ApiRecord) => (
        <span className="text-sm text-slate-700">
          {formatDate(row.expiresAt)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: ApiRecord) => {
        const s = sessionStatus(row);
        return <StatusBadge status={s.label} variant={s.variant} size="sm" />;
      },
    },
    {
      key: "actions",
      header: "",
      render: (row: ApiRecord) =>
        row.isActive ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:bg-red-50"
            onClick={() => setSessionToRevoke(row)}
          >
            Revoke
          </Button>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
  ];

  const visibleSessions = sessions.filter(
    (session) => Boolean(session.isActive) || Boolean(session.isCurrent),
  );

  return (
    <SaasAdminScreen
      title={staffName(staff)}
      description={
        String(staff.email ?? "") +
        (staff.jobTitle ? ` · ${String(staff.jobTitle)}` : "")
      }
      backTo={SAAS_ADMIN_PATHS.staff.accounts}
      backLabel="Back to Staff Accounts"
      breadcrumbs={BREADCRUMBS}
      actions={
        <div className="flex flex-wrap gap-2">
          <Link to={SAAS_ADMIN_PATHS.staff.edit(staffId ?? "")}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" /> Edit
            </Button>
          </Link>
          <Link to={SAAS_ADMIN_PATHS.staff.edit(staffId ?? "")}>
            <Button variant="outline">
              <Shield className="h-4 w-4 mr-2" /> Manage Roles
            </Button>
          </Link>
          {status === "invited" ? (
            <Button
              variant="outline"
              loading={inviting}
              onClick={() =>
                void run("Invitation sent.", () =>
                  inviteStaff({ staffId: staffId! }).unwrap(),
                )
              }
            >
              <Mail className="h-4 w-4 mr-2" /> Resend Invitation
            </Button>
          ) : null}
          {status === "active" ? (
            <Button
              variant="outline"
              className="text-red-600 hover:bg-red-50"
              loading={suspending}
              onClick={() =>
                void run("Staff member suspended.", () =>
                  suspendStaff(staffId!).unwrap(),
                )
              }
            >
              <UserX className="h-4 w-4 mr-2" /> Disable
            </Button>
          ) : null}
          {status === "suspended" || status === "deactivated" ? (
            <Button
              variant="outline"
              loading={activating}
              onClick={() =>
                void run("Staff member activated.", () =>
                  activateStaff(staffId!).unwrap(),
                )
              }
            >
              <UserCheck className="h-4 w-4 mr-2" /> Activate
            </Button>
          ) : null}
          {status !== "deactivated" ? (
            <Button
              variant="ghost"
              loading={revoking}
              onClick={() =>
                void run("Sessions revoked.", () =>
                  revokeSessions(staffId!).unwrap(),
                )
              }
            >
              <Clock className="h-4 w-4 mr-2" /> Revoke Sessions
            </Button>
          ) : null}
          <Button
            variant="ghost"
            loading={resetting}
            onClick={() =>
              void run("Password reset email sent.", () =>
                resetPassword(staffId!).unwrap(),
              )
            }
          >
            <KeyRound className="h-4 w-4 mr-2" /> Reset Password
          </Button>
          {status === "suspended" ? (
            <Button
              variant="ghost"
              className="text-red-600 hover:bg-red-50"
              onClick={() => setConfirmDeactivate(true)}
            >
              <ArrowLeft className="h-4 w-4 mr-2 rotate-90" /> Deactivate
            </Button>
          ) : null}
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          label="Status"
          value={status.charAt(0).toUpperCase() + status.slice(1)}
          color={
            status === "active"
              ? "success"
              : status === "invited"
                ? "warning"
                : "default"
          }
          icon={<UserCheck className="h-6 w-6" />}
        />
        <StatCard
          label="MFA"
          value={staff.mfaEnabled ? "Enabled" : "Disabled"}
          color={staff.mfaEnabled ? "success" : "warning"}
          icon={<ShieldCheck className="h-6 w-6" />}
        />
        <StatCard
          label="Active Sessions"
          value={activeSessions}
          color="info"
          icon={<Users className="h-6 w-6" />}
        />
        <StatCard
          label="Last Login"
          value={staff.lastLoginAt ? formatDate(staff.lastLoginAt) : "Never"}
          color="default"
          icon={<RefreshCw className="h-6 w-6" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <SectionCard title="Details" className="lg:col-span-2">
          <DetailsGrid
            items={[
              { label: "Email", value: String(staff.email ?? "—") },
              {
                label: "Status",
                value: (
                  <StatusBadge
                    status={status}
                    variant={STATUS_VARIANT[status]}
                    size="sm"
                  />
                ),
              },
              {
                label: "MFA",
                value: (
                  <StatusBadge
                    status={staff.mfaEnabled ? "enabled" : "disabled"}
                    variant={staff.mfaEnabled ? "active" : "suspended"}
                    size="sm"
                  />
                ),
              },
              {
                label: "Email Verified",
                value: staff.emailVerifiedAt
                  ? formatDate(staff.emailVerifiedAt)
                  : "Pending",
              },
              {
                label: "Last Login",
                value: staff.lastLoginAt
                  ? formatDate(staff.lastLoginAt)
                  : "Never",
              },
              { label: "Active Sessions", value: activeSessions },
              { label: "Phone", value: String(staff.phone ?? "—") },
              { label: "Job Title", value: String(staff.jobTitle ?? "—") },
              { label: "Timezone", value: String(staff.timezone ?? "—") },
              { label: "Locale", value: String(staff.locale ?? "—") },
              { label: "Created", value: formatDate(staff.createdAt) },
              { label: "Updated", value: formatDate(staff.updatedAt) },
              ...(staff.lockedUntil
                ? [
                    {
                      label: "Locked Until",
                      value: (
                        <span className="text-red-600">
                          {formatDate(staff.lockedUntil)}
                        </span>
                      ),
                    },
                  ]
                : []),
            ]}
          />
          <p className="mt-4 text-xs text-slate-500">
            Email address, account status and password are managed through the
            actions above so privileged changes stay on the audited flows.
          </p>
        </SectionCard>

        <SectionCard title={`Roles (${roles.length})`}>
          {roles.length === 0 ? (
            <p className="text-sm text-slate-500">No roles assigned.</p>
          ) : (
            <ul className="space-y-2">
              {roles.map((role) => (
                <li
                  key={String(role.id)}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <div className="min-w-0">
                    <Link
                      to={SAAS_ADMIN_PATHS.staff.role(String(role.id))}
                      className="block truncate text-sm font-medium text-brand-700 hover:underline"
                    >
                      {String(role.name ?? role.key)}
                    </Link>
                    {role.description ? (
                      <p className="truncate text-xs text-slate-500">
                        {String(role.description)}
                      </p>
                    ) : null}
                  </div>
                  <StatusBadge
                    status={role.isSystem ? "system" : "custom"}
                    variant={role.isSystem ? "default" : "pending"}
                    size="sm"
                  />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <SectionCard
          title={`Active Sessions (${visibleSessions.length})`}
          className="lg:col-span-2"
        >
          {sessionsQuery.isError ? (
            <ErrorState message="Could not load sessions for this staff member." />
          ) : (
            <DataTable
              columns={sessionsColumns}
              rows={visibleSessions}
              rowKey={(row) => String(row.id)}
              loading={sessionsQuery.isLoading}
              emptyTitle="No active sessions"
              emptyDescription="This account has no active sessions."
            />
          )}
        </SectionCard>

        <SectionCard title={`Permissions (${permissionCodes.length})`}>
          {effectiveQuery.isError ? (
            <ErrorState message="Could not load effective permissions." />
          ) : effectiveQuery.isLoading ? (
            <p className="text-sm text-slate-500">Loading permissions…</p>
          ) : permissionCodes.length === 0 ? (
            <p className="text-sm text-slate-500">No effective permissions.</p>
          ) : (
            <div className="flex max-h-64 flex-wrap gap-1.5 overflow-y-auto">
              {permissionCodes.map((code) => (
                <span
                  key={code}
                  className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-700"
                >
                  {code}
                </span>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {recentLogins.length > 0 ? (
        <SectionCard title="Recent Sign-ins" className="mb-6">
          <DataTable
            columns={loginColumns}
            rows={recentLogins}
            rowKey={(row) => String(row.id)}
            emptyTitle="No sign-in history"
            emptyDescription="This account has not signed in yet."
          />
        </SectionCard>
      ) : null}

      <SectionCard title="Administrative Activity">
        <div className="mb-4 flex items-center gap-2 text-slate-400">
          <Activity className="h-4 w-4" />
          <span className="text-xs uppercase tracking-wide">
            Audit trail for this account
          </span>
        </div>
        {activityQuery.isError ? (
          <ErrorState message="Could not load activity for this staff member." />
        ) : (
          <DataTable
            columns={activityColumns}
            rows={activity}
            rowKey={(row) => row.id}
            loading={activityQuery.isLoading}
            emptyTitle="No activity"
            emptyDescription="No administrative actions recorded for this account."
          />
        )}
      </SectionCard>

      <ConfirmDialog
        isOpen={confirmDeactivate}
        onClose={() => setConfirmDeactivate(false)}
        onConfirm={async () => {
          setConfirmDeactivate(false);
          await run("Staff member deactivated.", () =>
            deactivateStaff(staffId!).unwrap(),
          );
        }}
        loading={deactivating}
        title="Deactivate Staff Account"
        message={`Deactivate ${staffName(staff)}? The account will lose access and all sessions will be revoked.`}
        confirmLabel="Deactivate"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={Boolean(sessionToRevoke)}
        onClose={() => setSessionToRevoke(null)}
        onConfirm={async () => {
          const target = sessionToRevoke;
          setSessionToRevoke(null);
          if (!target || !staffId) return;
          try {
            await revokeStaffSession({
              staffId,
              sessionId: String(target.id),
            }).unwrap();
            toast.success("Session revoked.");
            sessionsQuery.refetch();
          } catch (cause) {
            toast.error(apiErrorMessage((cause as { data?: unknown }).data));
          }
        }}
        loading={revokingSession}
        title="Revoke Session"
        message="Revoke this session? The device will be signed out immediately."
        confirmLabel="Revoke"
        variant="danger"
      />
    </SaasAdminScreen>
  );
}
