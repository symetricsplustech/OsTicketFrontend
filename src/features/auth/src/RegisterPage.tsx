import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { PublicShell } from "@shells/PublicShell";
import { Card, CardHeader, CardBody, Input, Field, Button, ErrorState } from "@shared/components/ui";
import { usePortalRegisterMutation, loginErrorMessage } from "@shared/api/authApi";
import { ToastContainer } from "@shared/components/Toast/ToastContainer";
import { PermissionGate } from "@shared/components/PermissionGate";
import { cn } from "@shared/lib/cn";

export function RegisterPage() {
  const navigate = useNavigate();
  const [register] = usePortalRegisterMutation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (!termsAccepted) { setError("Accept the terms to continue."); return; }
    setSubmitting(true);
    try {
      const response = await register({ name: `${firstName.trim()} ${lastName.trim()}`, email: email.trim().toLowerCase(), password }).unwrap();
      setNotice(response.message ?? "Account created.");
      toast.success("Account created successfully.");
      navigate("/confirm-email", { state: { email: email.trim().toLowerCase(), confirmationUrl: response.confirmationUrl } });
    } catch (err) {
      const message = loginErrorMessage((err as { data?: unknown })?.data);
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
          <CardHeader title="Create an account" description="Register for the osTicket ITSM platform." />
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error ? <ErrorState message={error} /> : null}
              {notice ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {notice}
                </div>
              ) : null}
              <div className="grid grid-cols-2 gap-3">
                <Field label="First name">
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" required placeholder="John" />
                </Field>
                <Field label="Last name">
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" required placeholder="Doe" />
                </Field>
              </div>
              <Field label="Email">
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
              </Field>
              <Field label="Password">
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required placeholder="Min 8 characters" />
              </Field>
              <Field label="Confirm password">
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" minLength={8} required placeholder="Confirm password" />
              </Field>
              <label className="flex items-start gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} required className="mt-0.5" /> I accept the terms of service.
              </label>
              <label className="flex items-start gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={marketingConsent} onChange={(e) => setMarketingConsent(e.target.checked)} className="mt-0.5" /> Send me product updates (optional).
              </label>
              <Button type="submit" className="w-full" loading={submitting}>
                Create account
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-slate-500">
              Already registered?{" "}
              <Link to="/login" className="font-medium text-brand-600 hover:underline">
                Sign in
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </PublicShell>
  );
}
