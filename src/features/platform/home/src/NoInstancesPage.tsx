import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Inbox, Plus, MailOpen, ArrowLeft, Building2,
  CheckCircle2, Loader2,
} from "lucide-react";
import {
  Card, CardBody, CardHeader, Button, EmptyState,
  ErrorState, PageLoader,
} from "@shared/components/ui";
import { PageHeader } from "@shared/components/PageHeader";
import { PermissionGate } from "@shared/components/PermissionGate";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks";
import { selectAuth } from "@shared/auth/authSlice";
import {
  loadMyInstances,
  loginErrorMessage,
} from "@shared/api/authApi";
import { can } from "@shared/authorization/permissions";
import { cn } from "@shared/lib/cn";

export function NoInstancesPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const auth = useAppSelector(selectAuth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateInstance = async () => {
    setLoading(true);
    setError("");
    try {
      navigate("/platform/instances/new");
    } catch (err) {
      setError(loginErrorMessage((err as { data?: unknown })?.data));
      toast.error("Failed to navigate to instance creation");
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvitations = () => {
    navigate("/platform?tab=invitations");
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const instances = await loadMyInstances(dispatch);
      if (instances.length > 0) {
        navigate("/platform", { replace: true });
      } else {
        toast("Still no instances found", { icon: "ℹ️" });
      }
    } catch (err) {
      setError(loginErrorMessage((err as { data?: unknown })?.data));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <PageHeader
        title="No Instances"
        description="You're not yet a member of any instance"
        breadcrumbs={<nav className="flex items-center gap-1 text-xs text-slate-500"><Link to="/platform" className="hover:text-brand-600">Platform</Link><ArrowLeft className="h-3 w-3" /><span>No instances</span></nav>}
      />

      <div className="mt-6">
        {error && <ErrorState message={error} />}

        <Card>
          <CardBody className="text-center py-12">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
              <Inbox className="h-10 w-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">No instances yet</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              You are not a member of any instance. Ask an instance owner or admin to
              invite you, or use the platform administration to create one.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <PermissionGate permissions={["instance.create", "*"]}>
                <Button onClick={handleCreateInstance} loading={loading} size="lg">
                  <Plus className="h-4 w-4" /> Create an Instance
                </Button>
              </PermissionGate>
              <Button variant="outline" onClick={handleViewInvitations} size="lg">
                <MailOpen className="h-4 w-4" /> View Invitations
              </Button>
            </div>

            <div className="mt-8 border-t border-slate-200 pt-6">
              <h3 className="text-sm font-semibold text-slate-700">What you can do</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  { icon: <Plus className="h-4 w-4" />, title: "Create an instance", desc: "Set up a new SaaS instance as the owner" },
                  { icon: <MailOpen className="h-4 w-4" />, title: "Accept an invitation", desc: "Use an invitation link to join an existing instance" },
                  { icon: <Building2 className="h-4 w-4" />, title: "Contact an admin", desc: "Ask an instance owner or admin for access" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 rounded-lg bg-slate-50 p-4 text-left">
                    <div className="grid h-8 w-8 place-items-center rounded-md bg-brand-100 text-brand-700">{item.icon}</div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {auth.instances.length > 0 && (
              <div className="mt-6">
                <Button variant="outline" onClick={handleRefresh} loading={loading}>
                  <CheckCircle2 className="h-4 w-4" /> Refresh Instance List
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
