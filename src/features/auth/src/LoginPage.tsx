import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { PublicShell } from "@shells/PublicShell";
import { Card, CardHeader, CardBody, Input, Field, Button, ErrorState } from "@shared/components/ui";
import { useAppDispatch } from "@shared/store/hooks";
import { runPortalLogin, loginErrorMessage } from "@shared/api/authApi";
import { setMfaChallenge } from "./mfaChallenge";
import { ToastContainer } from "@shared/components/Toast/ToastContainer";
import { PermissionGate } from "@shared/components/PermissionGate";
import { cn } from "@shared/lib/cn";

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await runPortalLogin(dispatch, { email, password });
      toast.success("Signed in successfully.");
      const from = (location.state as { from?: { pathname?: string; search?: string } } | null)?.from;
      navigate(from?.pathname ? `${from.pathname}${from.search ?? ""}` : "/platform", { replace: true });
    } catch (err) {
      const data = (err as { data?: unknown })?.data;
      const details = data && typeof data === "object" ? (data as { details?: { twoFactorRequired?: boolean } }).details : undefined;
      if (details?.twoFactorRequired) {
        setMfaChallenge({ email: email.trim().toLowerCase(), password });
        navigate("/mfa");
        return;
      }
      const message = loginErrorMessage(data);
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicShell>
      <ToastContainer />
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader title="Sign in" description="Access your osTicket ITSM platform." />
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error ? <ErrorState message={error} /> : null}
              <Field label="Email">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                />
              </Field>
              <Field label="Password">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                />
              </Field>
              <Button type="submit" className="w-full" loading={submitting}>
                Sign in
              </Button>
            </form>
            <div className="mt-4 space-y-2 text-center text-sm text-slate-500">
              <Link to="/forgot-password" className="block font-medium text-brand-600 hover:underline">Forgot password?</Link>
              <p>
                No account?{" "}
                <Link to="/register" className="font-medium text-brand-600 hover:underline">
                  Create one
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </PublicShell>
  );
}
