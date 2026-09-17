import { useState } from "react";
import { Button, Card } from "@shared/components/ui";
import type { CompanyInput, InstanceCompany } from "../services/instanceCompanyApi";

export default function InstanceCompanyEditor({ item, onSave }: {
  item: InstanceCompany;
  onSave: (id: string, input: Partial<CompanyInput> & { status?: InstanceCompany["status"] }) => Promise<void>;
}) {
  const [form, setForm] = useState<CompanyInput>({
    name: item.name, domain: item.domain, email: item.email,
    phone: item.phone, address: item.address,
  });
  const [busy, setBusy] = useState(false);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try { await onSave(item._id, form); } finally { setBusy(false); }
  }

  return <Card className="p-4">
    <div className="mb-3 flex items-center justify-between">
      <h2 className="font-semibold">{item.name} {item.isPrimary && <span className="text-xs text-brand-600">Primary</span>}</h2>
      <span className="text-sm text-gray-500">{item.status}</span>
    </div>
    <form onSubmit={save} className="grid gap-3 md:grid-cols-2">
      {(["name", "domain", "email", "phone", "address"] as const).map((field) =>
        <label key={field} className="text-sm capitalize">{field}
          <input className="mt-1 w-full rounded border px-3 py-2" required={field === "name"}
            type={field === "email" ? "email" : "text"} value={form[field]}
            onChange={(event) => setForm({ ...form, [field]: event.target.value })} />
        </label>)}
      <div className="flex items-end gap-2">
        <Button disabled={busy}>{busy ? "Saving..." : "Save profile"}</Button>
        {!item.isPrimary && <Button type="button" variant="secondary" disabled={busy}
          onClick={() => onSave(item._id, { status: item.status === "active" ? "inactive" : "active" })}>
          {item.status === "active" ? "Disable" : "Activate"}
        </Button>}
      </div>
    </form>
  </Card>;
}
