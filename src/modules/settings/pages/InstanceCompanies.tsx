import { useEffect, useState } from "react";
import { Button, Card } from "@shared/components/ui";
import InstanceCompanyEditor from "../components/InstanceCompanyEditor";
import { instanceCompanyApi, type CompanyInput, type InstanceCompany } from "../services/instanceCompanyApi";

const emptyForm: CompanyInput = { name: "", domain: "", email: "", phone: "", address: "" };

export default function InstanceCompanies() {
  const [items, setItems] = useState<InstanceCompany[]>([]);
  const [form, setForm] = useState<CompanyInput>(emptyForm);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() { setItems(await instanceCompanyApi.list()); }
  useEffect(() => { load().catch(() => setError("Unable to load companies.")); }, []);

  async function create(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await instanceCompanyApi.create(form);
      setForm(emptyForm);
      await load();
    } catch (cause: any) {
      setError(cause?.response?.data?.message || "Unable to create company.");
    } finally { setBusy(false); }
  }

  async function update(id: string, input: Partial<CompanyInput> & { status?: InstanceCompany["status"] }) {
    setError("");
    try { await instanceCompanyApi.update(id, input); await load(); }
    catch (cause: any) { setError(cause?.response?.data?.message || "Unable to update company."); }
  }

  return <div className="space-y-6">
    <header><p className="text-sm text-brand-600">Instance administration</p>
      <h1 className="text-2xl font-bold">Companies</h1>
      <p className="text-sm text-gray-500">Manage company profiles inside this instance.</p></header>
    {error && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <Card className="p-4"><h2 className="mb-3 font-semibold">Add company</h2>
      <form onSubmit={create} className="grid gap-3 md:grid-cols-3">
        {(["name", "domain", "email", "phone", "address"] as const).map((field) =>
          <label key={field} className="text-sm capitalize">{field}
            <input className="mt-1 w-full rounded border px-3 py-2" required={field === "name"}
              type={field === "email" ? "email" : "text"} value={form[field]}
              onChange={(event) => setForm({ ...form, [field]: event.target.value })} />
          </label>)}
        <div className="flex items-end"><Button disabled={busy}>{busy ? "Creating..." : "Add company"}</Button></div>
      </form>
    </Card>
    <div className="grid gap-4">{items.map((item) =>
      <InstanceCompanyEditor key={item._id} item={item} onSave={update} />)}</div>
  </div>;
}
