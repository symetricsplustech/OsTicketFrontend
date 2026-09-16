import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { enterInstance, instanceApi } from "./services/instanceApi";

export default function AcceptInvitation() {
  const { instanceId } = useParams();
  const [params] = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const token = params.get("token");

  async function accept() {
    if (!instanceId || !token) return;
    try {
      setLoading(true);
      setError("");
      await instanceApi.accept(instanceId, token);
      enterInstance(await instanceApi.select(instanceId));
    } catch (cause: any) {
      setError(cause?.response?.data?.message || "Unable to accept invitation.");
      setLoading(false);
    }
  }

  return <main className="mx-auto mt-20 max-w-md space-y-4 rounded-lg border bg-white p-6">
    <h1 className="text-2xl font-semibold">Accept instance invitation</h1>
    {!token && <p className="text-red-700">This invitation link is missing its token.</p>}
    {error && <p role="alert" className="text-red-700">{error}</p>}
    <button disabled={!token || loading} onClick={accept} className="rounded bg-brand-600 px-4 py-2 text-white disabled:opacity-50">
      {loading ? "Accepting..." : "Accept invitation"}
    </button>
    <p><Link className="text-brand-600 underline" to="/platform/home">Platform Home</Link></p>
  </main>;
}
