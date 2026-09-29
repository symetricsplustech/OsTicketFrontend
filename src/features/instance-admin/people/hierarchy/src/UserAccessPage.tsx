import { Link, useParams } from "react-router-dom";
import {
  User,
  Building,
  Network,
  Users,
  Layers,
  AlertTriangle,
  UserCircle,
  BadgeCheck,
  KeyRound,
  ShieldCheck,
  Monitor,
  ClipboardList,
  History,
  FileSearch,
} from "lucide-react";
import { useDirectoryQuery } from "@shared/api/instanceApi";
import { UserAccessWorkspace } from "@page-shells/UserAccessWorkspace";
import { ProfileTab } from "./tabs/ProfileTab";
import { InstanceMembershipTab } from "./tabs/InstanceMembershipTab";
import { OrganizationPlacementTab } from "./tabs/OrganizationPlacementTab";
import { ReportingLineTab } from "./tabs/ReportingLineTab";
import { GroupsTab } from "./tabs/GroupsTab";
import { RolesTab } from "./tabs/RolesTab";
import { DirectPermissionsTab } from "./tabs/DirectPermissionsTab";
import { DelegatedAccessTab } from "./tabs/DelegatedAccessTab";
import { EffectiveAccessTab } from "./tabs/EffectiveAccessTab";
import { SessionsTab } from "./tabs/SessionsTab";
import { AssignedWorkTab } from "./tabs/AssignedWorkTab";
import { WorkHistoryTab } from "./tabs/WorkHistoryTab";
import { AuditTab } from "./tabs/AuditTab";
import { PageLoader } from "@shared/components/ui";
import { ErrorState } from "@shared/components/ui";

export function UserAccessPage() {
  const { instanceId, userId } = useParams<{ instanceId: string; userId: string }>();

  const { data, isLoading, isError, error } = useDirectoryQuery(
    { instanceId: instanceId ?? "", userId: userId ?? "", limit: 1 },
    { skip: !instanceId || !userId },
  );

  if (!instanceId || !userId) return null;
  const user = data?.items?.[0];

  if (isLoading) {
    return (
      <div>
        <PageLoader label="Loading user access workspace…" />
      </div>
    );
  }
  if (isError || !user) {
    const message =
      (error && typeof error === "object" && "data" in error
        ? (error.data as { message?: string })?.message
        : undefined) ?? "Could not load the user.";
    return <ErrorState message={message} />;
  }

  const base = `/instances/${instanceId}/people/users/${userId}`;

  return (
    <UserAccessWorkspace
      title={user.name}
      email={user.email}
      role={user.role}
      accessStatus={user.accessStatus}
      breadcrumbs={
        <>
          <Link to={`/instances/${instanceId}/people/users`} className="hover:text-brand-600">
            Users Directory
          </Link>
        </>
      }
      loading={false}
      tabs={[
        {
          id: "profile",
          label: "Profile",
          icon: <User className="h-3.5 w-3.5" />,
          render: () => <ProfileTab user={user} />,
        },
        {
          id: "membership",
          label: "Instance Membership",
          icon: <Building className="h-3.5 w-3.5" />,
          render: () => <InstanceMembershipTab user={user} />,
        },
        {
          id: "org-placement",
          label: "Organization Placement",
          icon: <Network className="h-3.5 w-3.5" />,
          render: () => <OrganizationPlacementTab instanceId={instanceId} userId={userId} user={user} />,
        },
        {
          id: "reporting-line",
          label: "Reporting Line",
          icon: <Layers className="h-3.5 w-3.5" />,
          render: () => <ReportingLineTab instanceId={instanceId} userId={userId} />,
        },
        {
          id: "groups",
          label: "Groups",
          icon: <Users className="h-3.5 w-3.5" />,
          render: () => <GroupsTab groups={user.groups} />,
        },
        {
          id: "assignment-groups",
          label: "Assignment Groups",
          icon: <ShieldCheck className="h-3.5 w-3.5" />,
          render: () => <GroupsTab groups={user.assignmentGroups} assignment />,
        },
        {
          id: "roles",
          label: "Roles",
          icon: <BadgeCheck className="h-3.5 w-3.5" />,
          render: () => <RolesTab instanceId={instanceId} userId={userId} />,
        },
        {
          id: "direct-permissions",
          label: "Direct Permissions",
          icon: <KeyRound className="h-3.5 w-3.5" />,
          render: () => <DirectPermissionsTab instanceId={instanceId} userId={userId} />,
        },
        {
          id: "delegated-access",
          label: "Delegated Access",
          icon: <UserCircle className="h-3.5 w-3.5" />,
          render: () => <DelegatedAccessTab instanceId={instanceId} userId={userId} />,
        },
        {
          id: "effective-access",
          label: "Effective Access",
          icon: <ShieldCheck className="h-3.5 w-3.5" />,
          render: () => <EffectiveAccessTab instanceId={instanceId} userId={userId} />,
        },
        {
          id: "sessions",
          label: "Sessions / MFA",
          icon: <Monitor className="h-3.5 w-3.5" />,
          render: () => <SessionsTab instanceId={instanceId} userId={userId} />,
        },
        {
          id: "assigned-work",
          label: "Assigned Work",
          icon: <ClipboardList className="h-3.5 w-3.5" />,
          render: () => <AssignedWorkTab instanceId={instanceId} userId={userId} />,
        },
        {
          id: "work-history",
          label: "Work History",
          icon: <History className="h-3.5 w-3.5" />,
          render: () => <WorkHistoryTab instanceId={instanceId} userId={userId} />,
        },
        {
          id: "audit",
          label: "Audit",
          icon: <FileSearch className="h-3.5 w-3.5" />,
          render: () => <AuditTab userId={userId} />,
        },
      ]}
    />
  );
}