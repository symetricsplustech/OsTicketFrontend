import { useState, type FormEvent } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { PublicShell } from "@shells/PublicShell";
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Field,
  Button,
  ErrorState,
} from "@shared/components/ui";
import {
  useConfirmEmailQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  loginErrorMessage,
} from "@shared/api/authApi";
import { ToastContainer } from "@shared/components/Toast/ToastContainer";

function AuthPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <PublicShell>
      <ToastContainer />
      <section className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        <div className="mt-5 space-y-4 text-sm text-slate-700">{children}</div>
      </section>
    </PublicShell>
  );
}

export function ConfirmEmailPage() {
  const [params] = useSearchParams();
  const location = useLocation();
  const token = params.get("token") ?? "";
  const { data, isLoading, error } = useConfirmEmailQuery(token, {
    skip: !token,
  });
  const state = location.state as {
    email?: string;
    confirmationUrl?: string;
  } | null;
  const email = state?.email;
  const maskedEmail = email
    ? email.replace(/^(.{1,2}).*(@.*)$/, "$1•••$2")
    : null;
  return (
    <AuthPanel title="Confirm your email">
      {maskedEmail ? (
        <p>We sent a confirmation link to {maskedEmail}.</p>
      ) : null}
      {!token ? (
        <p>
          Open the confirmation link in your email to activate your account.
        </p>
      ) : isLoading ? (
        <p>Checking your confirmation link…</p>
      ) : error ? (
        <p role="alert" className="text-red-700">
          {loginErrorMessage((error as { data?: unknown }).data)}. The link may
          have expired.
        </p>
      ) : (
        <p role="status" className="text-emerald-700">
          {data?.message ?? "Email confirmed."}
        </p>
      )}
      <Link
        to="/login"
        className="inline-block font-semibold text-cyan-700 underline"
      >
        Go to sign in
      </Link>
    </AuthPanel>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [requestReset, { isLoading, data, error }] =
    useForgotPasswordMutation();
  const submit = (event: FormEvent) => {
    event.preventDefault();
    void requestReset(email.trim().toLowerCase());
  };
  return (
    <AuthPanel title="Reset your password">
      <p>Enter the email address associated with your account.</p>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Business email">
          <Input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </Field>
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Sending…" : "Send reset link"}
        </Button>
      </form>
      {data ? (
        <p role="status" className="text-emerald-700">
          {data.message}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-red-700">
          {loginErrorMessage((error as { data?: unknown }).data)}
        </p>
      ) : null}
      <Link to="/login" className="inline-block text-cyan-700 underline">
        Back to sign in
      </Link>
    </AuthPanel>
  );
}

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [localError, setLocalError] = useState("");
  const [reset, { isLoading, data, error }] = useResetPasswordMutation();
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (password !== confirm) {
      setLocalError("Passwords do not match.");
      return;
    }
    setLocalError("");
    void reset({ token, password });
  };
  return (
    <AuthPanel title="Choose a new password">
      {!token ? (
        <p role="alert" className="text-red-700">
          The reset link is missing its token. Request a new link.
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Field label="New password">
            <Input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </Field>
          <Field label="Confirm password">
            <Input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </Field>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Updating…" : "Update password"}
          </Button>
        </form>
      )}
      {localError ? (
        <p role="alert" className="text-red-700">
          {localError}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-red-700">
          {loginErrorMessage((error as { data?: unknown }).data)}
        </p>
      ) : null}
      {data ? (
        <p role="status" className="text-emerald-700">
          {data.message}
        </p>
      ) : null}
      <Link
        to={data ? "/login" : "/forgot-password"}
        className="inline-block text-cyan-700 underline"
      >
        {data ? "Go to sign in" : "Request another link"}
      </Link>
    </AuthPanel>
  );
}
