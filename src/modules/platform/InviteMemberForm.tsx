import { useState } from "react";
import { instanceApi } from "./services/instanceApi";

export default function InviteMemberForm({ instanceId }: { instanceId: string }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"instance_admin" | "agent" | "requester">("agent");
  const [message, setMessage] = useState("");
  const [invitationUrl, setInvitationUrl] = useState("");
  const [busy, setBusy] = useState(false);

  async function invite(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setInvitationUrl("");
    try {
      const result = await instanceApi.invite(instanceId, email, role);
      setMessage(`Invitation sent to ${email}.`);
      setInvitationUrl(result.invitationUrl || "");
      setEmail("");
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Unable to send invitation.");
    } finally {
      setBusy(false);
    }
  }

  return <form onSubmit={invite} className="mt-3 grid gap-2 md:grid-cols-3">
    <input aria-label="Invitee email" type="email" required value={email}
      onChange={(event) => setEmail(event.target.value)} placeholder="person@example.com"
      className="rounded border px-3 py-2" />
    <select aria-label="Instance role" value={role}
      onChange={(event) => setRole(event.target.value as typeof role)} className="rounded border px-3 py-2">
      <option value="agent">Agent</option>
      <option value="requester">Requester</option>
      <option value="instance_admin">Instance admin</option>
    </select>
    <button disabled={busy} className="rounded bg-brand-600 px-3 py-2 text-white disabled:opacity-50">
      {busy ? "Sending..." : "Send invitation"}
    </button>
    {message && <p role="status" className="text-sm md:col-span-3">{message}</p>}
    {invitationUrl && <a className="break-all text-sm text-brand-600 underline md:col-span-3"
      href={invitationUrl}>Open invitation (development)</a>}
  </form>;
}
