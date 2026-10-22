import { useState, type FormEvent } from "react";
import { toast } from "react-hot-toast";
import { SaasAdminScreen } from "../components/SaasAdminScreen";
import { Button } from "@components/common/ui";
import { apiErrorMessage, useChangePasswordMutation } from "@services/auth";

const fieldClass =
  "block w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-400 focus:ring-1 focus:ring-brand-200 outline-none";

export function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [change] = useChangePasswordMutation();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    setBusy(true);
    try {
      await change({ currentPassword, newPassword }).unwrap();
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated.");
    } catch (cause) {
      const message = apiErrorMessage((cause as { data?: unknown }).data);
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SaasAdminScreen
      title="Change Password"
      description="Update the password you use to sign in to the platform."
      breadcrumbs={[
        { label: "SaaS Admin" },
        { label: "My Account" },
        { label: "Change Password" },
      ]}
    >
      <div className="max-w-lg rounded-xl border border-slate-200 bg-white p-6">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label
              htmlFor="current-password"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
              className={fieldClass}
            />
          </div>
          <div>
            <label
              htmlFor="new-password"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
              className={fieldClass}
            />
          </div>
          <div>
            <label
              htmlFor="confirm-password"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className={fieldClass}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end">
            <Button type="submit" disabled={busy}>
              {busy ? "Updating…" : "Update Password"}
            </Button>
          </div>
        </form>
      </div>
    </SaasAdminScreen>
  );
}
