import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@core/auth/useAuth";
import { enterInstance, instanceApi, type InstanceMembership } from "./services/instanceApi";
import InviteMemberForm from "./InviteMemberForm";

export default function PlatformHome() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [instances, setInstances] = useState<InstanceMembership[]>([]);
  const [form, setForm] = useState({ name: "", domain: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [invitationLink, setInvitationLink] = useState("");

  useEffect(() => {
    instanceApi.list().then(setInstances)
      .catch(() => setError("Unable to load your instances."))
      .finally(() => setLoading(false));
  }, []);

  async function create(event: React.FormEvent) {
    event.preventDefault();
    try {
      setError("");
      const instance = await instanceApi.create(form.name, form.domain);
      enterInstance(await instanceApi.select(instance._id));
    } catch (cause: any) {
      setError(cause?.response?.data?.message || "Unable to create instance.");
    }
  }

  async function select(id: string) {
    try {
      setError("");
      enterInstance(await instanceApi.select(id));
    } catch (cause: any) {
      setError(cause?.response?.data?.message || "Unable to enter instance.");
    }
  }

  function openInvitation(event: React.FormEvent) {
    event.preventDefault();
    try {
      const url = new URL(invitationLink, window.location.origin);
      if (url.origin !== window.location.origin ||
          !/^\/platform\/invitations\/[a-f0-9]{24}$/.test(url.pathname) ||
          !/^[a-f0-9]{64}$/.test(url.searchParams.get("token") || ""))
        throw new Error("Use a valid invitation link for this platform.");
      navigate(url.pathname + url.search);
    } catch {
      setError("Use a valid invitation link for this platform.");
    }
  }

  return <main className="mx-auto max-w-4xl space-y-8 p-6">
    <header className="flex items-center justify-between">
      <div><h1 className="text-2xl font-bold">Platform Home</h1>
        <p className="text-sm text-gray-600">Signed in as {user?.email}</p></div>
      <button onClick={logout} className="text-sm text-brand-600">Sign out</button>
    </header>
    {error && <p role="alert" className="rounded bg-red-50 p-3 text-red-700">{error}</p>}
    <section className="rounded-lg border bg-white p-5">
      <h2 className="font-semibold">Your instances</h2>
      {loading ? <p className="mt-3 text-sm">Loading...</p> : instances.length === 0
        ? <p className="mt-3 text-sm text-gray-600">No memberships yet. Create an instance or accept an invitation sent to your email.</p>
        : <ul className="mt-3 divide-y">{instances.map((instance) =>
          <li key={instance._id} className="py-3">
            <div className="flex items-center justify-between gap-3">
              <div><div className="font-medium">{instance.name}</div>
                <div className="text-sm text-gray-500">{instance.domain} · {instance.role} · {instance.instanceStatus}</div></div>
              <button disabled={instance.membershipStatus !== "active" || !["active", "trial"].includes(instance.instanceStatus)}
                onClick={() => select(instance._id)} className="rounded bg-brand-600 px-3 py-2 text-sm text-white disabled:opacity-50">Enter</button>
            </div>
            {localStorage.getItem("activeInstanceId") === instance._id &&
              ["instance_owner", "instance_admin"].includes(instance.role) &&
              <InviteMemberForm instanceId={instance._id} />}
          </li>)}</ul>}
    </section>
    <form onSubmit={create} className="grid gap-3 rounded-lg border bg-white p-5 md:grid-cols-3">
      <h2 className="font-semibold md:col-span-3">Create an instance</h2>
      <input required aria-label="Instance name" placeholder="Instance name" value={form.name}
        onChange={(event) => setForm({ ...form, name: event.target.value })} className="rounded border px-3 py-2" />
      <input required aria-label="Instance domain" placeholder="Domain, e.g. company.example.com" value={form.domain}
        onChange={(event) => setForm({ ...form, domain: event.target.value })} className="rounded border px-3 py-2" />
      <button className="rounded bg-brand-600 px-4 py-2 text-white">Create</button>
    </form>
    <form onSubmit={openInvitation} className="flex flex-wrap gap-2">
      <input aria-label="Invitation link" required value={invitationLink}
        onChange={(event) => setInvitationLink(event.target.value)} placeholder="Paste your invitation link"
        className="min-w-64 flex-1 rounded border px-3 py-2" />
      <button className="rounded bg-brand-600 px-4 py-2 text-white">Open invitation</button>
    </form>
  </main>;
}
