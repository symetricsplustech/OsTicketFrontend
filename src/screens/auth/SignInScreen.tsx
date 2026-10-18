import React from "react";
import { useDispatch } from "react-redux";
import { ScreenHeader } from "@components/ui/screen-header";
import { LoadingEmptyError } from "@components/ui/loading-empty-error";
import { cn } from "@utils/cn";
import { sessionSet } from "@services/auth/authSlice";

type Role = "Platform Admin" | "Organization Admin" | "Agent" | "Requester";

const rolePermissions: Record<Role, string[]> = {
  "Platform Admin": ["*"],
  "Organization Admin": [
    "tenant.settings.read",
    "tenant.settings.update",
    "tenant.organization.read",
    "tenant.organization.update",
    "tenant.department.read",
    "tenant.location.read",
    "tenant.user.read",
    "tenant.group.read",
    "tenant.role.read",
    "itsm.core.task_read",
    "itsm.core.task_create",
    "itsm.incident.incident.read",
    "itsm.incident.incident.create",
    "itsm.problem.problem.read",
    "itsm.change.change_request.read",
    "itsm.request_catalog.request.read",
    "itsm.knowledge.kb_read",
  ],
  "Agent": [
    "itsm.core.task_read",
    "itsm.core.task_create",
    "itsm.assignment.ui.agent_inbox.access",
    "itsm.incident.incident.read",
    "itsm.incident.incident.create",
    "itsm.problem.problem.read",
    "itsm.change.change_request.read",
    "itsm.request_catalog.request.read",
    "itsm.knowledge.kb_read",
  ],
  "Requester": [
    "itsm.request_catalog.ui.catalog_home.access",
    "itsm.experience.portal_access",
    "itsm.request_catalog.request.read",
    "itsm.incident.incident.read",
    "itsm.knowledge.knowledge_article.read",
  ],
};

export function SignInScreen() {
  const dispatch = useDispatch();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<Role>("Platform Admin");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockUser = {
        id: "1",
        email,
        name: email.split("@")[0],
        role,
      };

      dispatch(sessionSet({
        token: "dummy-token-" + Date.now(),
        user: mockUser,
        role: mockUser.role,
        permissions: rolePermissions[role],
      }));

      setLoading(false);
      const redirectMap: Record<Role, string> = {
        "Platform Admin": "/saas-admin/dashboard/overview",
        "Organization Admin": "/instances/demo/admin/instance",
        "Agent": "/instances/demo/work/1/home",
        "Requester": "/portal",
      };
      window.location.href = redirectMap[role];
    } catch (err) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <ScreenHeader contract={{
          screenId: "00.2.1",
          canonicalRoute: "/login",
          owningModule: "00.2 - Identity",
          owningSubmodule: "Module 00.2",
          pageTitle: "Sign In",
          pageContext: "Authentication service desk portal access",
          primaryAction: {
            label: "Sign In",
            onClick: handleLogin,
            disabled: loading,
          },
          loading,
          skeleton: loading,
        }}>
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">Email address</label>
              <input
                type="email"
                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 disabled:bg-slate-100 disabled:text-slate-500"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 disabled:bg-slate-100 disabled:text-slate-500"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <LoadingEmptyError
              loading={loading}
              skeleton={loading}
              error={error}
            />
            
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={handleLogin}
                className={cn(
                  "flex-1 px-4 py-2 font-medium text-white bg-brand-600 rounded hover:bg-brand-500 transition-colors",
                  loading && "opacity-50 cursor-not-allowed"
                )}
                disabled={loading}
              >
                {loading ? "Signing in…" : "Sign In"}
              </button>
              <span className="text-sm text-slate-500">
                <a href="#" className="underline text-slate-400 hover:text-slate-600">
                  Forgot password?
                </a>
              </span>
            </div>
          </div>
        </ScreenHeader>
      </div>
    </div>
  );
}