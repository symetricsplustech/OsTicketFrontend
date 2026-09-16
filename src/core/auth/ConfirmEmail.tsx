import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "@shared/lib/api";

export default function ConfirmEmail() {
  const [params] = useSearchParams();
  const [message, setMessage] = useState("Confirming your email...");
  const [confirmed, setConfirmed] = useState(false);
  const token = params.get("token");

  useEffect(() => {
    if (!token) {
      setMessage("Confirmation link is missing its token.");
      return;
    }
    api.get(`/auth/confirm?token=${encodeURIComponent(token)}`)
      .then(() => {
        setConfirmed(true);
        setMessage("Email confirmed. You can now sign in.");
        window.history.replaceState({}, "", "/confirm-email");
      })
      .catch((error) => setMessage(error?.response?.data?.message || "Confirmation link is invalid or expired."));
  }, [token]);

  return <main className="mx-auto mt-24 max-w-md rounded-lg border bg-white p-6 text-center">
    <h1 className="text-2xl font-semibold">Email confirmation</h1>
    <p role="status" className="my-5 text-gray-600">{message}</p>
    {confirmed && <Link className="text-brand-600 underline" to="/login">Sign in</Link>}
  </main>;
}
