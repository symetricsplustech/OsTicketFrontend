import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Building2, ChevronRight, ShieldCheck, Plus, Inbox,
  MailOpen, Settings, UserCircle, LogOut, Grid3X3,
  CheckCircle2, XCircle, Clock, AlertTriangle,
} from "lucide-react";
import {
  Card, CardBody, CardHeader, Button, EmptyState,
  ErrorState, PageLoader, Badge,
} from "@shared/components/ui";
import { PageHeader } from "@shared/components/PageHeader";
import { PermissionGate } from "@shared/components/PermissionGate";
import { StatusBadge } from "@shared/components/Badge";
import { Tabs } from "@shared/components/Tabs";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks";
import { selectAuth, selectPermissions } from "@shared/auth/authSlice";
import {
  loadMyInstances,
  selectInstanceFor,
  loginErrorMessage,
} from "@shared/api/authApi";
import { can } from "@shared/authorization/permissions";
import { cn } from "@shared/lib/cn";
import { formatDate } from "@shared/lib/format";
import { TokenStore } from "@shared/auth/tokenStore";

type TabId = "instances" | "invitations" | "account";

export function PlatformHomePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const auth = useAppSelector(selectAuth);
  const permissions = useAppSelector(selectPermissions);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("instances");
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const instances = useMemo(() => auth.instances, [auth.instances]);
  const hasInstances = instances.length > 0;
  const activeInstances = instances.filter((i) => i.instanceStatus === "active");
  const invitedInstances = instances.filter((i) => i.instanceStatus === "invited");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const result = await loadMyInstances(dispatch);
        if (!active) return;
        setError(null);
        if (auth.selectedInstance?.status && auth.selectedInstance) {
          navigate(`/instances/${auth.selectedInstance._id}/people/users`, { replace: true });
        } else if (result.length === 0) {
          navigate("/no-instances", { replace: true });
        }
      } catch (err) {
        if (active) setError(loginErrorMessage((err as { data?: unknown })?.data));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleSelect = async (instanceId: string) => {
    setSelecting(instanceId);
    try {
      await selectInstanceFor(dispatch, instanceId);
      toast.success("Instance selected successfully");
      navigate(`/instances/${instanceId}/people/users`);
    } catch (err) {
      setError(loginErrorMessage((err as { data?: unknown })?.data));
      toast.error("Failed to select instance");
    } finally {
      setSelecting(null);
    }
  };

  const handleCreateInstance = () => {
    navigate("/platform/instances/new");
  };

  const handleViewInvitations = () => {
    setActiveTab("invitations");
  };

  const handleLogout = () => {
    dispatch(require("@shared/auth/authSlice").logout());
    TokenStore.reset();
    navigate("/login");
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "instances", label: "My Instances", icon: <Grid3X3 className="h-3.5 w-3.5" />, count: instances.length },
    { id: "invitations", label: "Invitations", icon: <MailOpen className="h-3.5 w-3.5" />, count: invitedInstances.length },
    { id: "account", label: "Account", icon: <UserCircle className="h-3.5 w-3.5" /> },
  ];

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <PageLoader label="Loading your platform…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <PageHeader title="Platform Home" description="Your instance management dashboard" />
        <ErrorState message={error} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageHeader
        title="Platform Home"
        description="Manage your instances, invitations, and account settings"
        breadcrumbs={<nav className="flex items-center gap-1 text-xs text-slate-500"><Link to="/platform" className="hover:text-brand-600">Platform</Link><ChevronRight className="h-3 w-3" /><span>{activeTab}</span></nav>}
        actions={
          <div className="relative">
            <button
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
            >
              <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-brand-700">
                <UserCircle className="h-5 w-5" />
              </div>
              <span className="font-medium text-slate-700">{auth.user?.name ?? "Account"}</span>
            </button>
            {showAccountMenu && (
              <div className="absolute right-0 top-12 z-50 w-56 rounded-lg border border-slate-200 bg-white shadow-lg">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">{auth.user?.name}</p>
                  <p className="text-xs text-slate-500">{auth.user?.email}</p>
                  <p className="mt-1 text-xs text-brand-600">Role: {auth.role ?? "Member"}</p>
                </div>
                <div className="py-1">
                  <Link to="/platform/account" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Account Settings</Link>
                  <Link to="/platform/instances/new" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Create Instance</Link>
                  <button onClick={handleLogout} className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">Sign Out</button>
                </div>
              </div>
            )}
          </div>
        }
      />

      <Tabs tabs={tabs} active={activeTab} onChange={(id) => setActiveTab(id as TabId)} />

      {activeTab === "instances" && (
        <div className="mt-6 space-y-6">
          {/* Create Instance CTA */}
          <PermissionGate permissions={["instance.create", "*"]}>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-100 text-brand-700">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-brand-800">Create a New Instance</p>
                  <p className="text-xs text-brand-600">Set up a new SaaS instance for your organization</p>
                </div>
              </div>
              <Button onClick={handleCreateInstance} size="sm">
                <Plus className="h-4 w-4" /> Create Instance
              </Button>
            </div>
          </PermissionGate>

          {/* Zero-membership empty state */}
          {!hasInstances && (
            <EmptyState
              title="No instances found"
              description="You don't have any instances yet. Create one or wait for an invitation to join an existing instance."
            >
              <div className="mt-4 flex gap-2 justify-center">
                <PermissionGate permissions={["instance.create", "*"]}>
                  <Button onClick={handleCreateInstance}>Create Instance</Button>
                </PermissionGate>
                <Button variant="outline" onClick={handleViewInvitations}>View Invitations</Button>
              </div>
            </EmptyState>
          )}

          {/* Instance cards grid */}
          {hasInstances && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {instances.map((instance) => (
                <Card key={instance._id} className="hover:shadow-md transition-shadow">
                  <CardBody>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg",
                          instance.instanceStatus === "active"
                            ? "bg-emerald-100 text-emerald-700"
                            : instance.instanceStatus === "invited"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                        )}>
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{instance.name}</p>
                          <p className="text-xs text-slate-500">{instance.domain ?? instance.instanceCode ?? "No domain"}</p>
                        </div>
                      </div>
                      <StatusBadge status={instance.instanceStatus} />
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-xs text-slate-500">
                        <p>Your role: <span className="font-medium text-slate-700">{instance.role ?? "member"}</span></p>
                        <p className="mt-0.5">
                          Joined {formatDate(instance.joinedAt)} · status{" "}
                          <span className={instance.membershipStatus === "active" ? "text-emerald-600" : "text-amber-600"}>
                            {instance.membershipStatus ?? "unknown"}
                          </span>
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleSelect(instance._id)}
                        loading={selecting === instance._id}
                        disabled={instance.instanceStatus !== "active"}
                      >
                        Open <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}

          {/* Instance summary bar */}
          {hasInstances && (
            <div className="flex flex-wrap gap-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-slate-600">Active: <strong>{activeInstances.length}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <span className="text-slate-600">Invited: <strong>{invitedInstances.length}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Grid3X3 className="h-4 w-4 text-slate-500" />
                <span className="text-slate-600">Total: <strong>{instances.length}</strong></span>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "invitations" && (
        <div className="mt-6">
          {invitedInstances.length === 0 ? (
            <EmptyState
              title="No pending invitations"
              description="You haven't received any instance invitations yet. Ask an owner or admin to invite you."
            />
          ) : (
            <div className="space-y-4">
              {invitedInstances.map((instance) => (
                <Card key={instance._id}>
                  <CardBody>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-100 text-amber-700">
                          <MailOpen className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{instance.name}</p>
                          <p className="text-xs text-slate-500">{instance.domain ?? instance.instanceCode ?? "No domain"}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <StatusBadge status="invited" />
                            <span className="text-xs text-slate-400">Invited {formatDate(instance.joinedAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toast.success("Invitation link copied")}
                        >
                          Resend
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => toast.success("Invitation accepted")}
                        >
                          Accept <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "account" && (
        <div className="mt-6 max-w-2xl">
          <Card>
            <CardHeader title="Account Details" description="Manage your platform account settings" />
            <CardBody>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">Full Name</label>
                    <Input defaultValue={auth.user?.name ?? ""} disabled />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">Email</label>
                    <Input type="email" defaultValue={auth.user?.email ?? ""} disabled />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">Role</label>
                    <Input defaultValue={auth.role ?? "Member"} disabled />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">Permissions</label>
                    <Input defaultValue={can(permissions, "*") ? "All (Owner)" : permissions.join(", ") ?? "None"} disabled />
                  </div>
                </div>
                <div className="pt-3">
                  <Button variant="danger" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" /> Sign Out
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
