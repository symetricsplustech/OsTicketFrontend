import { useState } from "react";
import { Button, Card } from "@shared/components/ui";
import type { Unit } from "../services/organizationHierarchyApi";
import type { OperationalDepartment } from "../services/instanceDepartmentApi";

export default function DepartmentLinks({ departments, units, onLink }: {
  departments: OperationalDepartment[];
  units: Unit[];
  onLink: (departmentId: string, unitId: string | null) => Promise<void>;
}) {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState("");
  const departmentUnits = units.filter((unit) => unit.type === "department");

  async function save(departmentId: string, unitId: string) {
    setBusy(departmentId);
    try { await onLink(departmentId, unitId || null); }
    finally { setBusy(""); }
  }

  return <Card className="p-5">
    <h2 className="font-semibold">Operational departments</h2>
    <p className="mb-4 text-sm text-gray-500">Link each helpdesk department to a Department node in the organization tree.</p>
    <div className="space-y-3">
      {departments.map((department) => {
        const value = selected[department._id] ?? department.organizationUnit?._id ?? "";
        const linkedElsewhere = new Set(departments
          .filter((item) => item._id !== department._id && item.organizationUnit)
          .map((item) => item.organizationUnit!._id));
        return <div key={department._id} className="flex flex-wrap items-center gap-3">
          <span className="min-w-32 text-sm font-medium">{department.name}</span>
          <select aria-label={`Organization unit for ${department.name}`} value={value}
            onChange={(event) => setSelected({ ...selected, [department._id]: event.target.value })}
            className="rounded border px-3 py-2 text-sm">
            <option value="">Unlinked</option>
            {departmentUnits.filter((unit) => !linkedElsewhere.has(unit._id)).map((unit) => <option key={unit._id} value={unit._id}>
              {unit.name} ({unit.instanceCompany?.name || "Company"})
            </option>)}
          </select>
          <Button size="sm" disabled={busy === department._id}
            onClick={() => save(department._id, value)}>
            {busy === department._id ? "Saving..." : "Save link"}
          </Button>
        </div>;
      })}
      {!departments.length && <p className="text-sm text-gray-500">No operational departments found.</p>}
    </div>
  </Card>;
}
