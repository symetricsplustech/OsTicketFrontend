import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { PublicShell } from "@layouts/PublicShell";
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Field,
  Button,
  ErrorState,
} from "@components/common/ui";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { runMfaVerify, apiErrorMessage, selectAuth } from "@services/auth";
import { postAuthDestination } from "@app/auth/postAuthDestination";
import { clearMfaChallenge, getMfaChallenge } from "./mfaChallenge.ts";

export function MfaPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const auth = useAppSelector(selectAuth);
  const challenge = getMfaChallenge();
  const [code, setCode] = useState("");
  const [recovery, setRecovery] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!challenge) return;
    setBusy(true);
    setError("");
    try {
      const session = await runMfaVerify(dispatch, {
        mfaToken: challenge.mfaToken,
        code: code.trim(),
      });
      clearMfaChallenge();
      toast.success("Two-factor verified.");
      navigate(
        postAuthDestination(session.permissions, auth.selectedInstance?._id),
        { replace: true },
      );
    } catch (cause) {
      const message = apiErrorMessage((cause as { data?: unknown }).data);
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <PublicShell>
      <section className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
        <h1 className="text-xl font-bold">Two-factor verification</h1>
        {challenge ? (
          <>
            <p className="mt-2 text-sm text-slate-600">
              Enter the code from your authenticator, or use an unused recovery
              code.
            </p>
            <form onSubmit={submit} className="mt-5 space-y-4">
              <Field label={recovery ? "Recovery code" : "Authenticator code"}>
                <Input
                  autoFocus
                  autoComplete="one-time-code"
                  inputMode={recovery ? "text" : "numeric"}
                  required
                  minLength={6}
                  maxLength={recovery ? 64 : 8}
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder={
                    recovery ? "Enter recovery code" : "Enter 6-digit code"
                  }
                />
              </Field>
              {error ? <ErrorState message={error} /> : null}
              <Button type="submit" className="w-full" loading={busy}>
                {busy ? "Verifying…" : "Verify and sign in"}
              </Button>
            </form>
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => {
                  setRecovery((value) => !value);
                  setCode("");
                  setError("");
                }}
                className="text-sm font-semibold text-brand-600 hover:underline"
              >
                {recovery ? "Use authenticator code" : "Use a recovery code"}
              </button>
              <button
                onClick={() => {
                  clearMfaChallenge();
                  navigate("/login", { replace: true });
                }}
                className="text-sm text-slate-600 hover:underline"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <p className="mt-3 text-sm text-slate-600">
            Your sign-in challenge expired.{" "}
            <Link
              to="/login"
              className="font-medium text-brand-600 hover:underline"
            >
              Sign in again
            </Link>
          </p>
        )}
      </section>
    </PublicShell>
  );
}
