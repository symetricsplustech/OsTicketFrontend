import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "@shared/lib/api";
import toast from "react-hot-toast";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [policyConsent, setPolicyConsent] = useState(false);
  const [confirmationUrl, setConfirmationUrl] = useState("");
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<{ confirmationUrl?: string }>("/auth/register", {
        name, email, password, policyConsent,
      });
      setConfirmationUrl(res.data.confirmationUrl || "");
      setRegistered(true);
      toast.success("Account created. Check your email to confirm it.");
    } catch (err: unknown) {
      const error = err as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };
      const message =
        error.response?.data?.message ||
        (error instanceof Error ? error.message : "Registration failed");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-bold text-gray-900">
            Create Your Account
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your account to access helpdesk and settings
          </p>
        </div>
        {registered ? (
          <div className="space-y-4 rounded-lg border bg-white p-6 text-sm">
            <p>Check {email} for a confirmation link before signing in.</p>
            {confirmationUrl && <a className="text-brand-600 underline" href={confirmationUrl}>Confirm account (development)</a>}
            <p><Link className="text-brand-600 underline" to="/login">Return to sign in</Link></p>
          </div>
        ) : <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 input-field"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 input-field"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 input-field"
                placeholder="8+ characters"
                minLength={8}
              />
            </div>
          </div>
          <label className="flex items-start gap-2 text-sm text-gray-700">
            <input type="checkbox" required checked={policyConsent}
              onChange={(event) => setPolicyConsent(event.target.checked)} />
            <span>I agree to the privacy policy and terms of service.</span>
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-brand-600 hover:text-brand-500 font-medium"
            >
              Sign in
            </Link>
          </p>
          <p className="text-center text-xs text-gray-500">
            Your organization's admin can grant granular access in Settings.
          </p>
        </form>}
      </div>
    </div>
  );
}
