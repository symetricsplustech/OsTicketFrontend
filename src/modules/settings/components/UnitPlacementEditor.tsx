import { useState } from "react";
import { Button } from "@shared/components/ui";
import type { Unit } from "../services/organizationHierarchyApi";
import type { InstanceCompany } from "../services/instanceCompanyApi";

export default function UnitPlacementEditor({ unit, units, companies, onSave }: {
  unit: Unit;
  units: Unit[];
  companies: InstanceCompany[];
  onSave: (id: string, input: { instanceCompany: string; parent: string | null }) => Promise<void>;
}) {
  const [company, setCompany] = useState(unit.instanceCompany?._id || "");
  const [parent, setParent] = useState(unit.parent?._id || "");
  const [busy, setBusy] = useState(false);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try { await onSave(unit._id, { instanceCompany: company, parent: parent || null }); }
    finally { setBusy(false); }
  }

  return <form onSubmit={save} className="mt-3 flex flex-wrap items-end gap-2 text-sm">
    <label>Company
      <select aria-label={`Company for ${unit.name}`} required value={company}
        onChange={(event) => { setCompany(event.target.value); setParent(""); }}
        className="ml-2 rounded border px-2 py-1">
        {companies.filter((item) => item.status === "active" || item._id === company).map((item) =>
          <option key={item._id} value={item._id}>{item.name}</option>)}
      </select>
    </label>
    <label>Parent
      <select aria-label={`Parent for ${unit.name}`} value={parent}
        onChange={(event) => setParent(event.target.value)} className="ml-2 rounded border px-2 py-1">
        <option value="">Under Company</option>
        {units.filter((item) => item._id !== unit._id && item.instanceCompany?._id === company).map((item) =>
          <option key={item._id} value={item._id}>{item.name}</option>)}
      </select>
    </label>
    <Button disabled={busy} type="submit" variant="secondary">{busy ? "Saving..." : "Move unit"}</Button>
  </form>;
}
