import { useState } from "react";
import { Button, Card } from "@shared/components/ui";
import type { Unit } from "../services/organizationHierarchyApi";
import type { InstanceMember } from "../services/instanceMemberApi";

export default function MemberPlacement({ members, units, onPlace }: {
  members: InstanceMember[];
  units: Unit[];
  onPlace: (userId: string, unitId: string | null) => Promise<void>;
}) {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState("");
  async function save(userId: string, value: string) {
    setBusy(userId);
    try { await onPlace(userId, value || null); }
    finally { setBusy(""); }
  }
  return <Card className="p-5">
    <h2 className="font-semibold">Instance member placement</h2>
    <p className="mb-4 text-sm text-gray-500">Place each member in an organizational node for this Instance.</p>
    <div className="space-y-3">
      {members.map((member) => {
        const value = selected[member._id] ?? member.organizationUnit ?? "";
        return <div key={member._id} className="flex flex-wrap items-center gap-3">
          <span className="min-w-48 text-sm"><strong>{member.name}</strong> · {member.role}</span>
          <select aria-label={`Organization unit for ${member.name}`} value={value}
            onChange={(event) => setSelected({ ...selected, [member._id]: event.target.value })}
            className="rounded border px-3 py-2 text-sm">
            <option value="">Unplaced</option>
            {units.filter((unit) => unit.active !== false).map((unit) => <option key={unit._id} value={unit._id}>
              {unit.name} ({unit.instanceCompany?.name || "Company"})
            </option>)}
          </select>
          <Button size="sm" disabled={busy === member._id} onClick={() => save(member._id, value)}>
            {busy === member._id ? "Saving..." : "Save placement"}
          </Button>
        </div>;
      })}
      {!members.length && <p className="text-sm text-gray-500">No Instance members found.</p>}
    </div>
  </Card>;
}
