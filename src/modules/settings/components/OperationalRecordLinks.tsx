import { useState } from "react";
import { Button, Card } from "@shared/components/ui";
import type { Unit } from "../services/organizationHierarchyApi";
import type { OperationalRecord } from "../types/OperationalRecord";

export default function OperationalRecordLinks({ title, kind, unitType, records, units, onLink }: {
  title: string;
  kind: string;
  unitType: string;
  records: OperationalRecord[];
  units: Unit[];
  onLink: (recordId: string, unitId: string | null) => Promise<void>;
}) {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState("");
  const choices = units.filter((unit) => unit.type === unitType);

  async function save(recordId: string, unitId: string) {
    setBusy(recordId);
    try { await onLink(recordId, unitId || null); }
    finally { setBusy(""); }
  }

  return <Card className="p-5">
    <h2 className="font-semibold">{title}</h2>
    <p className="mb-4 text-sm text-gray-500">Link each helpdesk {kind.toLowerCase()} to a {kind} node in the organization tree.</p>
    <div className="space-y-3">
      {records.map((record) => {
        const value = selected[record._id] ?? record.organizationUnit?._id ?? "";
        const linkedElsewhere = new Set(records
          .filter((item) => item._id !== record._id && item.organizationUnit)
          .map((item) => item.organizationUnit!._id));
        return <div key={record._id} className="flex flex-wrap items-center gap-3">
          <span className="min-w-32 text-sm font-medium">{record.name}</span>
          <select aria-label={`Organization unit for ${record.name}`} value={value}
            onChange={(event) => setSelected({ ...selected, [record._id]: event.target.value })}
            className="rounded border px-3 py-2 text-sm">
            <option value="">Unlinked</option>
            {choices.filter((unit) => !linkedElsewhere.has(unit._id)).map((unit) => <option key={unit._id} value={unit._id}>
              {unit.name} ({unit.instanceCompany?.name || "Company"})
            </option>)}
          </select>
          <Button size="sm" disabled={busy === record._id} onClick={() => save(record._id, value)}>
            {busy === record._id ? "Saving..." : "Save link"}
          </Button>
        </div>;
      })}
      {!records.length && <p className="text-sm text-gray-500">No operational {kind.toLowerCase()}s found.</p>}
    </div>
  </Card>;
}
