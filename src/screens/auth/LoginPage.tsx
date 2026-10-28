import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight } from "lucide-react";
import { AuthLayout } from "./AuthLayout.tsx";
import { Button, Field, Input } from "@components/common/ui";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { runLogin, apiErrorMessage, selectAuth } from "@services/auth";
import { postAuthDestination } from "@app/auth/postAuthDestination";
import { canAccessSaasAdmin } from "@/navigation/saasAdminNavigation";
import { canAccessOrganizationAdmin } from "@/navigation/organizationAdminNavigation";
import { setMfaChallenge } from "./mfaChallenge.ts";

interface RedirectState {
  from?: { pathname?: string; search?: string };
  returnTo?: string;
}

const NON_RETURN_PATHS = new Set(["/", "/login", "/mfa", "/register"]);

/**
 * A stored return path is only honoured when the freshly signed-in session may
 * actually open it. Prevents an org admin from being bounced back into a stale
 * `/saas-admin` URL (and vice versa) after signing in.
 */
export function canOpenPath(
  pathname: string,
  permissions: readonly string[],
): boolean {
  if (pathname.startsWith("/saas-admin"))
    return canAccessSaasAdmin(permissions);
  if (pathname.startsWith("/organization"))
    return canAccessOrganizationAdmin(permissions);
  return true;
}

export function postLoginPath(
  state: unknown,
  permissions: readonly string[],
  instanceId?: string | null,
): string {
  const redirect = state as RedirectState | null;
  const from = redirect?.from?.pathname;
  if (from && !NON_RETURN_PATHS.has(from) && canOpenPath(from, permissions)) {
    return `${from}${redirect?.from?.search ?? ""}`;
  }
  const returnTo = redirect?.returnTo;
  if (
    returnTo &&
    !NON_RETURN_PATHS.has(returnTo) &&
    canOpenPath(returnTo, permissions)
  ) {
    return returnTo;
  }
  return postAuthDestination(permissions, instanceId);
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Valid work email is required");
      setSubmitting(false);
      return;
    }
    if (!password.trim()) {
      setError("Password is required");
      setSubmitting(false);
      return;
    }
    try {
      const response = await runLogin(dispatch, {
        email: email.trim().toLowerCase(),
        password,
      });
      if (response.mfaRequired) {
        setMfaChallenge({ mfaToken: response.mfaToken });
        navigate("/mfa", { replace: true });
        return;
      }
      navigate(
        postLoginPath(
          location.state,
          response.permissions,
          auth.selectedInstance?._id,
        ),
        { replace: true },
      );
    } catch (err) {
      setError(apiErrorMessage((err as { data?: unknown })?.data));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Sign in"
      description="Use your work email address to reach your service desk workspace."
      footer={
        <p>
          No account yet?{" "}
          <Link
            to="/register"
            className="font-medium text-brand-600 hover:underline"
          >
            Create one
          </Link>
        </p>
      }
    >
<form onSubmit={handleSubmit} className="space-y-5">
        {error ? (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <Field label="Work email" htmlFor="email">
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            autoFocus
            required
            placeholder="you@company.com"
          />
        </Field>

        <div>
          <div className="mb-1 flex items-baseline justify-between">
            <label
              htmlFor="password"
              className="text-xs font-medium text-slate-600"
            >
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-brand-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            placeholder="Enter your password"
          />
        </div>

        <Button type="submit" className="w-full" loading={submitting}>
          {submitting ? "Signing in" : "Sign in"}
          {submitting ? null : <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>

        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-500">
          <p className="mb-1 font-semibold uppercase tracking-wide text-slate-600">
            Seeded accounts
          </p>
          <p>
            <span className="font-medium text-slate-700">
              Platform Owner
            </span>{" "}
            — platform.owner@example.com / Platform#2026Aa!
          </p>
          <p>
            <span className="font-medium text-slate-700">Organization Admin</span>{" "}
            — admin@acmetech.io / OrgAdmin@123
          </p>
          <p>
            <span className="font-medium text-slate-700">Operations Employee</span>{" "}
            — ops.employee@acmetech.io / ops.employee@123
          </p>
          <p>
            <span className="font-medium text-slate-700">Team Lead</span>{" "}
            — team.lead@acmetech.io / team.lead@123
          </p>
          <p>
            <span className="font-medium text-slate-700">Remote Engineer</span>{" "}
            — remote.engineer@acmetech.io / remote.engineer@123
          </p>
          <p>
            <span className="font-medium text-slate-700">Field Engineer</span>{" "}
            — field.engineer@acmetech.io / field.engineer@123
          </p>
          <p>
            <span className="font-medium text-slate-700">Customer Contact</span>{" "}
            — ravi.sharma@northwind-dc.example / Customer@123
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
