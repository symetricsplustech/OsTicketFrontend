import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users, Search, Filter, Plus, ChevronRight,
  Mail, Shield, Clock, UserCircle, MoreVertical,
  AlertTriangle, KeyRound, BadgeCheck,
} from "lucide-react";
import {
  Card, CardBody, Button, Badge, EmptyState,
  ErrorState, PageLoader, Spinner, Input,
} from "@shared/components/ui";
import { PageHeader } from "@shared/components/PageHeader";
import { EntityListPage } from "@page-shells/EntityListPage";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks";
import { selectAuth } from "@shared/auth/authSlice";
import { useDirectoryQuery } from "@shared/api/instanceApi";
import { can } from "@shared/authorization/permissions";
import { cn } from "@shared/lib/cn";
import { formatDate } from "@shared/lib/format";
import { StatusBadge } from "@shared/components/Badge";
import { PermissionGate } from "@shared/components/PermissionGate";
import { UserAccessWorkspace } from "@page-shells/UserAccessWorkspace";
import { Tabs } from "@shared/components/Tabs";
import { ActivityStream } from "@shared/components/ActivityStream";

interface PlatformUser {
  _id: string;
  name: string;
  email: string;
  membershipStatus: string;
  role: string | null;
  company: string | null;
  accessStatus: string;
  lastSignIn: string | null;
  directory?: {
    unitPath: Array<{ name: string; type: string }>;
    groups: Array<{ id: string; name: string }>;
  };
}

export function PlatformUsersPage() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("directory");

  const { data: directoryData, isLoading, isError, error } = useDirectoryQuery(
    { instanceId: "_platform", search: searchValue, page, limit: 10 },
    { skip: !searchValue }
  );

  // Mock users for the platform
  const allUsers: PlatformUser[] = useMemo(() => [
    { _id: "1", name: "Alice Johnson", email: "alice@platform.com", membershipStatus: "active", role: "Admin", company: "Acme Corp", accessStatus: "granted", lastSignIn: "2024-01-15T10:30:00Z" },
    { _id: "2", name: "Bob Smith", email: "bob@platform.com", membershipStatus: "active", role: "Member", company: "TechInc", accessStatus: "granted", lastSignIn: "2024-01-14T16:00:00Z" },
    { _id: "3", name: "Carol Davis", email: "carol@platform.com", membershipStatus: "invited", role: "Member", company: null, accessStatus: "pending", lastSignIn: null },
    { _id: "4", name: "David Wilson", email: "david@platform.com", membershipStatus: "active", role: "Viewer", company: "Global Ltd", accessStatus: "granted", lastSignIn: "2024-01-13T09:15:00Z" },
    { _id: "5", name: "Eve Martinez", email: "eve@platform.com", membershipStatus: "suspended", role: "Member", company: "StartUp", accessStatus: "revoked", lastSignIn: "2024-01-10T14:20:00Z" },
  ], []);

  const filteredUsers = useMemo(() => {
    if (!searchValue) return allUsers;
    return allUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        u.email.toLowerCase().includes(searchValue.toLowerCase()) ||
        u.company?.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [allUsers, searchValue]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / 10));
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * 10;
    return filteredUsers.slice(start, start + 10);
  }, [filteredUsers, page]);

  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId);
  };

  const selectedUser = allUsers.find((u) => u._id === selectedUserId);

  const tabs = [
    { id: "directory", label: "Directory", icon: <Users className="h-3.5 w-3.5" /> },
    { id: "activity", label: "Activity", icon: <Clock className="h-3.5 w-3.5" /> },
    { id: "permissions", label: "Permissions", icon: <Shield className="h-3.5 w-3.5" /> },
  ];

  return (
    <div>
      <PageHeader
        title="Platform Users"
        description="Manage all platform users across instances"
        breadcrumbs={<nav className="flex items-center gap-1 text-xs text-slate-500"><Link to="/saas" className="hover:text-brand-600">SaaS</Link><ChevronRight className="h-3 w-3" /><span>Users</span></nav>}
        actions={
          <div className="flex items-center gap-2">
            <PermissionGate permissions={["tenant.userUpdate", "platform.admin", "*"]}>
              <Button size="sm"><Plus className="h-4 w-4" /> Invite User</Button>
            </PermissionGate>
            <Button variant="outline" size="sm">Export</Button>
          </div>
        }
      />

      {selectedUserId && selectedUser ? (
        <UserAccessWorkspace
          title={selectedUser.name}
          email={selectedUser.email}
          role={selectedUser.role}
          accessStatus={selectedUser.accessStatus}
          breadcrumbs={<><Link to="/saas/platform-users" className="hover:text-brand-600">Platform Users</Link><ChevronRight className="h-3 w-3" /><span>{selectedUser.name}</span></>}
          loading={false}
          tabs={[
            { id: "profile", label: "Profile", icon: <UserCircle className="h-3.5 w-3.5" />, render: () => (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><p className="text-xs text-slate-500">Name</p><p className="font-medium text-slate-900">{selectedUser.name}</p></div>
                  <div><p className="text-xs text-slate-500">Email</p><p className="font-medium text-slate-900">{selectedUser.email}</p></div>
                  <div><p className="text-xs text-slate-500">Role</p><p className="font-medium text-slate-900">{selectedUser.role ?? "Member"}</p></div>
                  <div><p className="text-xs text-slate-500">Company</p><p className="font-medium text-slate-900">{selectedUser.company ?? "—"}</p></div>
                  <div><p className="text-xs text-slate-500">Membership</p><StatusBadge status={selectedUser.membershipStatus} /></div>
                  <div><p className="text-xs text-slate-500">Last Sign In</p><p className="font-medium text-slate-900">{formatDate(selectedUser.lastSignIn)}</p></div>
                </div>
              </div>
            ) },
            { id: "access", label: "Access Workspace", icon: <Shield className="h-3.5 w-3.5" />, render: () => (
              <Card><CardBody><p className="text-sm text-slate-500">Access details for {selectedUser.name}</p></CardBody></Card>
            ) },
          ]}
        />
      ) : (
        <div className="mt-6">
          <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
          <div className="mt-6">
            {isLoading ? (
              <Card><PageLoader label="Loading platform users…" /></Card>
            ) : isError ? (
              <Card><ErrorState message={(error as any)?.data?.message ?? "Failed to load platform users"} /></Card>
            ) : (
              <EntityListPage
                title="All Users"
                description={`${filteredUsers.length} user(s) across the platform`}
                searchValue={searchValue}
                onSearchChange={(value) => { setSearchValue(value); setPage(1); }}
                searchPlaceholder="Search users by name, email, or company…"
                columns={[
                  { key: "name", header: "User", render: (row: PlatformUser) => <div className="flex items-center gap-3"><div className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-brand-700"><UserCircle className="h-4 w-4" /></div><span className="font-medium text-slate-900">{row.name}</span></div> },
                  { key: "email", header: "Email", render: (row: PlatformUser) => <span className="text-sm text-slate-600">{row.email}</span> },
                  { key: "role", header: "Role", render: (row: PlatformUser) => <Badge variant={row.role === "Admin" ? "default" : row.role === "Viewer" ? "muted" : "info"}>{row.role ?? "Member"}</Badge> },
                  { key: "company", header: "Company", render: (row: PlatformUser) => <span className="text-sm text-slate-600">{row.company ?? "—"}</span> },
                  { key: "membershipStatus", header: "Status", render: (row: PlatformUser) => <StatusBadge status={row.membershipStatus} /> },
                  { key: "lastSignIn", header: "Last Sign In", render: (row: PlatformUser) => <span className="text-sm text-slate-500">{formatDate(row.lastSignIn)}</span> },
                ]}
                rows={paginatedUsers}
                rowKey={(row) => row._id}
                onRowClick={(row) => handleViewUser(row._id)}
                page={page}
                totalPages={totalPages}
                totalItems={filteredUsers.length}
                onPageChange={setPage}
                loading={false}
                emptyDescription="No platform users found"
              />
            )}
          </div>

          {activeTab === "activity" && (
            <Card className="mt-4">
              <CardBody>
                <ActivityStream
                  entries={[
                    { id: "1", actor: "alice@platform.com", action: "Updated user profile", resource: "Bob Smith", timestamp: "2024-01-15T10:30:00Z" },
                    { id: "2", actor: "admin@platform.com", action: "Changed role", resource: "David Wilson", timestamp: "2024-01-14T16:00:00Z" },
                    { id: "3", actor: "system", action: "Suspended account", resource: "Eve Martinez", timestamp: "2024-01-13T09:15:00Z" },
                  ]}
                  emptyDescription="No user activity recorded"
                />
              </CardBody>
            </Card>
          )}

          {activeTab === "permissions" && (
            <Card className="mt-4">
              <CardBody>
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-700">Platform Permission Summary</h3>
                  {[
                    { permission: "tenant.user.read", granted: true },
                    { permission: "tenant.user.update", granted: true },
                    { permission: "tenant.permission.read", granted: true },
                    { permission: "platform.admin", granted: false },
                    { permission: "itsm.core.audit_read", granted: true },
                  ].map((perm) => (
                    <div key={perm.permission} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-2">
                      <span className="text-sm text-slate-700">{perm.permission}</span>
                      <Badge variant={perm.granted ? "success" : "muted"}>{perm.granted ? "Granted" : "Denied"}</Badge>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

import { Shield } from "lucide-react";
