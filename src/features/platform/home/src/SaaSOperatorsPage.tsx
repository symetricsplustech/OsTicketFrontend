import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Users, Search, Plus, Shield, KeyRound,
  Mail, Clock, AlertTriangle, CheckCircle2,
  ChevronRight, Filter, RefreshCw, MoreVertical,
  Lock, Unlock, Globe,
} from "lucide-react";
import {
  Card, CardBody, Button, Badge, EmptyState,
  ErrorState, PageLoader, Spinner, Input,
} from "@shared/components/ui";
import { PageHeader } from "@shared/components/PageHeader";
import { EntityListPage } from "@page-shells/EntityListPage";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks";
import { selectPermissions } from "@shared/auth/authSlice";
import { can } from "@shared/authorization/permissions";
import { cn } from "@shared/lib/cn";
import { formatDateTime } from "@shared/lib/format";
import { StatusBadge } from "@shared/components/Badge";
import { PermissionGate } from "@shared/components/PermissionGate";
import { Tabs } from "@shared/components/Tabs";

interface Operator {
  _id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  mfaEnabled: boolean;
  lastLogin: string | null;
  status: "active" | "suspended" | "invited";
  ipAddress: string;
  department: string;
  createdAt: string;
}

interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  userCount: number;
}

export function SaaSOperatorsPage() {
  const permissions = useAppSelector(selectPermissions);
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("operators");
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);

  const allOperators: Operator[] = useMemo(() => [
    { _id: "1", name: "Super Admin", email: "superadmin@platform.com", role: "Owner", permissions: ["*"], mfaEnabled: true, lastLogin: "2024-01-15T11:00:00Z", status: "active", ipAddress: "10.0.0.1", department: "Platform", createdAt: "2023-01-01T00:00:00Z" },
    { _id: "2", name: "Ops Manager", email: "ops@platform.com", role: "Admin", permissions: ["tenant.user.read", "tenant.user.update", "itsm.core.audit_read"], mfaEnabled: true, lastLogin: "2024-01-15T10:30:00Z", status: "active", ipAddress: "10.0.0.2", department: "Operations", createdAt: "2023-06-15T00:00:00Z" },
    { _id: "3", name: "Security Lead", email: "security@platform.com", role: "Security", permissions: ["itsm.core.audit_read", "tenant.permission.read"], mfaEnabled: true, lastLogin: "2024-01-14T14:00:00Z", status: "active", ipAddress: "10.0.0.3", department: "Security", createdAt: "2023-08-01T00:00:00Z" },
    { _id: "4", name: "Support Agent", email: "support@platform.com", role: "Member", permissions: ["tenant.user.read"], mfaEnabled: false, lastLogin: "2024-01-10T09:00:00Z", status: "active", ipAddress: "10.0.0.4", department: "Support", createdAt: "2024-01-01T00:00:00Z" },
    { _id: "5", name: "Pending Onboarding", email: "new@platform.com", role: "Member", permissions: [], mfaEnabled: false, lastLogin: null, status: "invited", ipAddress: "—", department: "Engineering", createdAt: "2024-01-15T00:00:00Z" },
  ], []);

  const allRoles: Role[] = useMemo(() => [
    { _id: "1", name: "Owner", description: "Full platform access", permissions: ["*"], isActive: true, userCount: 1 },
    { _id: "2", name: "Admin", description: "Administrative access", permissions: ["tenant.user.read", "tenant.user.update", "tenant.permission.read", "tenant.permission.grant", "itsm.core.audit_read"], isActive: true, userCount: 3 },
    { _id: "3", name: "Security", description: "Security and audit access", permissions: ["itsm.core.audit_read", "tenant.permission.read"], isActive: true, userCount: 1 },
    { _id: "4", name: "Member", description: "Basic platform access", permissions: ["tenant.user.read"], isActive: true, userCount: 5 },
    { _id: "5", name: "Viewer", description: "Read-only access", permissions: [], isActive: true, userCount: 2 },
  ], []);

  const filteredOperators = useMemo(() => {
    if (!searchValue) return allOperators;
    return allOperators.filter(
      (o) =>
        o.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        o.email.toLowerCase().includes(searchValue.toLowerCase()) ||
        o.role.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [allOperators, searchValue]);

  const totalPages = Math.max(1, Math.ceil(filteredOperators.length / 10));
  const paginatedOperators = useMemo(() => {
    const start = (page - 1) * 10;
    return filteredOperators.slice(start, start + 10);
  }, [filteredOperators, page]);

  const selectedOperatorData = allOperators.find((o) => o._id === selectedOperator);

  const operatorColumns = [
    { key: "name", header: "Operator", render: (row: Operator) => <div className="flex items-center gap-3"><div className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-brand-700"><span className="text-xs font-bold">{row.name.charAt(0)}</span></div><span className="font-medium text-slate-900">{row.name}</span></div> },
    { key: "email", header: "Email", render: (row: Operator) => <span className="text-sm text-slate-600">{row.email}</span> },
    { key: "role", header: "Role", render: (row: Operator) => <Badge variant={row.role === "Owner" || row.role === "Admin" ? "default" : row.role === "Security" ? "warning" : "info"}>{row.role}</Badge> },
    { key: "mfaEnabled", header: "MFA", render: (row: Operator) => row.mfaEnabled ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertTriangle className="h-4 w-4 text-amber-500" /> },
    { key: "status", header: "Status", render: (row: Operator) => <StatusBadge status={row.status} /> },
    { key: "lastLogin", header: "Last Login", render: (row: Operator) => <span className="text-sm text-slate-500">{row.lastLogin ? formatDateTime(row.lastLogin) : "Never"}</span> },
  ];

  const handleToggleMFA = (operatorId: string) => {
    const op = allOperators.find((o) => o._id === operatorId);
    if (op) {
      toast.success(`${op.name}'s MFA ${op.mfaEnabled ? "disabled" : "enabled"}`);
    }
  };

  const handleToggleStatus = (operatorId: string) => {
    const op = allOperators.find((o) => o._id === operatorId);
    if (op) {
      const newStatus = op.status === "active" ? "suspended" : "active";
      toast.success(`${op.name} is now ${newStatus}`);
    }
  };

  return (
    <div>
      <PageHeader
        title="SaaS Operators"
        description="Manage platform operators, roles, and permissions"
        breadcrumbs={<nav className="flex items-center gap-1 text-xs text-slate-500"><Link to="/saas" className="hover:text-brand-600">SaaS</Link><ChevronRight className="h-3 w-3" /><span>Operators</span></nav>}
        actions={
          <div className="flex items-center gap-2">
            <PermissionGate permissions={["tenant.permissionGrant", "platform.admin", "*"]}>
              <Button size="sm"><Plus className="h-4 w-4" /> Add Operator</Button>
            </PermissionGate>
            <Button variant="outline" size="sm"><RefreshCw className="h-4 w-4" /> Refresh</Button>
          </div>
        }
      />

      <Tabs
        tabs={[
          { id: "operators", label: "Operators", icon: <Users className="h-3.5 w-3.5" /> },
          { id: "roles", label: "Roles & Permissions", icon: <Shield className="h-3.5 w-3.5" /> },
          { id: "mfa", label: "MFA Status", icon: <Lock className="h-3.5 w-3.5" /> },
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      <div className="mt-6">
        {activeTab === "operators" && (
          <EntityListPage
            title="Operators"
            description={`${filteredOperators.length} operator(s) on the platform`}
            searchValue={searchValue}
            onSearchChange={(value) => { setSearchValue(value); setPage(1); }}
            searchPlaceholder="Search operators by name, email, or role…"
            columns={operatorColumns}
            rows={paginatedOperators}
            rowKey={(row) => row._id}
            onRowClick={(row) => setSelectedOperator(row._id)}
            page={page}
            totalPages={totalPages}
            totalItems={filteredOperators.length}
            onPageChange={setPage}
            loading={false}
            emptyDescription="No operators found"
            actions={
              <div className="flex items-center gap-2">
                <Badge variant="info">{filteredOperators.length} total</Badge>
                <Badge variant="success">{allOperators.filter((o) => o.status === "active").length} active</Badge>
                <Badge variant="danger">{allOperators.filter((o) => !o.mfaEnabled).length} no MFA</Badge>
              </div>
            }
          />
        )}

        {activeTab === "roles" && (
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {allRoles.map((role) => (
                <Card key={role._id} className="hover:shadow-md transition-shadow">
                  <CardBody>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900">{role.name}</h3>
                      <StatusBadge status={role.isActive ? "active" : "suspended"} />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{role.description}</p>
                    <div className="mt-3 space-y-1">
                      <p className="text-xs font-medium text-slate-600">Permissions ({role.permissions.length})</p>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 5).map((p) => (
                          <Badge key={p} variant="muted">{p}</Badge>
                        ))}
                        {role.permissions.length > 5 && <Badge variant="muted">+{role.permissions.length - 5} more</Badge>}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span>{role.userCount} user(s)</span>
                      <Link to="#" className="text-brand-600 hover:underline">Manage</Link>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "mfa" && (
          <Card className="mt-4">
            <CardHeader title="MFA Status Overview" description="Multi-factor authentication status for all operators" />
            <CardBody>
              <div className="space-y-3">
                {allOperators.map((op) => (
                  <div key={op._id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-brand-700">
                        <span className="text-xs font-bold">{op.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{op.name}</p>
                        <p className="text-xs text-slate-500">{op.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {op.mfaEnabled ? (
                        <Badge variant="success"><Unlock className="h-3 w-3 mr-1" /> MFA Enabled</Badge>
                      ) : (
                        <Badge variant="danger"><Lock className="h-3 w-3 mr-1" /> MFA Disabled</Badge>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleToggleMFA(op._id)}>
                        {op.mfaEnabled ? "Disable" : "Enable"} MFA
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Selected Operator Detail */}
        {selectedOperatorData && (
          <Card className="mt-6">
            <CardHeader
              title={selectedOperatorData.name}
              description="Operator details and permissions"
              actions={
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleToggleStatus(selectedOperatorData._id)}>
                    {selectedOperatorData.status === "active" ? "Suspend" : "Activate"}
                  </Button>
                  <Button variant="danger" size="sm">Revoke Access</Button>
                </div>
              }
            />
            <CardBody>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><p className="text-xs text-slate-500">Name</p><p className="font-medium text-slate-900">{selectedOperatorData.name}</p></div>
                <div><p className="text-xs text-slate-500">Email</p><p className="font-medium text-slate-900">{selectedOperatorData.email}</p></div>
                <div><p className="text-xs text-slate-500">Role</p><p className="font-medium text-slate-900">{selectedOperatorData.role}</p></div>
                <div><p className="text-xs text-slate-500">Department</p><p className="font-medium text-slate-900">{selectedOperatorData.department}</p></div>
                <div><p className="text-xs text-slate-500">IP Address</p><p className="font-medium text-slate-900">{selectedOperatorData.ipAddress}</p></div>
                <div><p className="text-xs text-slate-500">MFA</p><p className={selectedOperatorData.mfaEnabled ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>{selectedOperatorData.mfaEnabled ? "Enabled" : "Disabled"}</p></div>
                <div><p className="text-xs text-slate-500">Status</p><StatusBadge status={selectedOperatorData.status} /></div>
                <div><p className="text-xs text-slate-500">Created</p><p className="font-medium text-slate-900">{formatDateTime(selectedOperatorData.createdAt)}</p></div>
              </div>
              <div className="mt-4">
                <p className="text-xs font-medium text-slate-600 mb-2">Permissions</p>
                <div className="flex flex-wrap gap-1">
                  {selectedOperatorData.permissions.length > 0 ? (
                    selectedOperatorData.permissions.map((p) => <Badge key={p} variant="info">{p}</Badge>)
                  ) : (
                    <Badge variant="muted">No specific permissions</Badge>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}

import { toast } from "react-hot-toast";
