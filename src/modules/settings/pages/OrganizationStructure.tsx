import { useEffect, useState } from "react";
import { organizationHierarchyApi, type Unit, type UnitType } from "../services/organizationHierarchyApi";
import { instanceCompanyApi, type InstanceCompany } from "../services/instanceCompanyApi";
import UnitPlacementEditor from "../components/UnitPlacementEditor";
import OperationalRecordLinks from "../components/OperationalRecordLinks";
import type { OperationalRecord } from "../types/OperationalRecord";
import { Button, Card } from "@shared/components/ui";
import { instanceDepartmentApi, type OperationalDepartment } from "../services/instanceDepartmentApi";
import { instanceTeamApi } from "../services/instanceTeamApi";

export default function OrganizationStructure() {
  const [types, setTypes] = useState<UnitType[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [companies, setCompanies] = useState<InstanceCompany[]>([]);
  const [departments, setDepartments] = useState<OperationalDepartment[]>([]);
  const [teams, setTeams] = useState<OperationalRecord[]>([]);
  const [typeForm, setTypeForm] = useState({ type: "", label: "" });
  const [unitForm, setUnitForm] = useState({ name: "", type: "", parent: "", instanceCompany: "" });
  const [error, setError] = useState("");

  async function load() {
    const [unitTypes, organizationUnits, instanceCompanies, operationalDepartments, operationalTeams] = await Promise.all([
      organizationHierarchyApi.listTypes(),
      organizationHierarchyApi.listUnits(),
      instanceCompanyApi.list(),
      instanceDepartmentApi.list(),
      instanceTeamApi.list(),
    ]);
    setTypes(unitTypes);
    setUnits(organizationUnits);
    setCompanies(instanceCompanies);
    setDepartments(operationalDepartments);
    setTeams(operationalTeams);
    setUnitForm((current) => ({ ...current, instanceCompany: current.instanceCompany || instanceCompanies.find((item) => item.isPrimary)?._id || "" }));
  }

  useEffect(() => {
    load().catch(() => setError("Unable to load organization structure."));
  }, []);

  async function addType(event: React.FormEvent) {
    event.preventDefault();
    try {
      setError("");
      await organizationHierarchyApi.createType(typeForm);
      setTypeForm({ type: "", label: "" });
      await load();
    } catch (cause: any) {
      setError(cause?.response?.data?.message || "Unable to create unit type.");
    }
  }

  async function addUnit(event: React.FormEvent) {
    event.preventDefault();
    try {
      setError("");
      await organizationHierarchyApi.createUnit({ ...unitForm, parent: unitForm.parent || null });
      setUnitForm({ name: "", type: "", parent: "", instanceCompany: unitForm.instanceCompany });
      await load();
    } catch (cause: any) {
      setError(cause?.response?.data?.message || "Unable to create unit.");
    }
  }

  async function removeUnit(id: string) {
    if (!window.confirm("Delete this unit?")) return;
    try {
      setError("");
      await organizationHierarchyApi.removeUnit(id);
      await load();
    } catch (cause: any) {
      setError(cause?.response?.data?.message || "Unable to delete unit.");
    }
  }

  async function moveUnit(id: string, input: { instanceCompany: string; parent: string | null }) {
    try {
      setError("");
      await organizationHierarchyApi.updateUnit(id, input);
      await load();
    } catch (cause: any) {
      setError(cause?.response?.data?.message || "Unable to move unit.");
    }
  }

  async function linkDepartment(departmentId: string, unitId: string | null) {
    try {
      setError("");
      await instanceDepartmentApi.linkUnit(departmentId, unitId);
      await load();
    } catch (cause: any) {
      setError(cause?.response?.data?.message || "Unable to link department.");
    }
  }

  async function linkTeam(teamId: string, unitId: string | null) {
    try {
      setError("");
      await instanceTeamApi.linkUnit(teamId, unitId);
      await load();
    } catch (cause: any) {
      setError(cause?.response?.data?.message || "Unable to link team.");
    }
  }

  const labelFor = (type: string) => types.find((item) => item.type === type)?.label || type;
  const childrenOf = (parentId: string | null) =>
    units.filter((unit) => (unit.parent?._id || null) === parentId)
      .sort((a, b) => a.name.localeCompare(b.name));
  const visited = new Set<string>();
  const rows: Array<{ unit: Unit; depth: number }> = [];
  function appendChildren(parentId: string | null, depth: number) {
    for (const unit of childrenOf(parentId)) {
      if (visited.has(unit._id)) continue;
      visited.add(unit._id);
      rows.push({ unit, depth });
      appendChildren(unit._id, depth + 1);
    }
  }
  appendChildren(null, 0);
  for (const unit of units) {
    if (!visited.has(unit._id)) appendChildren(unit.parent?._id || null, 0);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-brand-600">Instance administration</p>
        <h1 className="mt-1 text-2xl font-bold">Organization structure</h1>
        <p className="mt-1 text-sm text-gray-500">Create types and nested units for your organization.</p>
      </div>
      {error && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <Card><form onSubmit={addType} className="grid gap-3 p-5 md:grid-cols-3">
        <input required aria-label="Type key" placeholder="Type key, e.g. business_unit" value={typeForm.type}
          onChange={(event) => setTypeForm({ ...typeForm, type: event.target.value })} className="rounded border px-3 py-2 text-sm" />
        <input required aria-label="Type label" placeholder="Display label, e.g. Business Unit" value={typeForm.label}
          onChange={(event) => setTypeForm({ ...typeForm, label: event.target.value })} className="rounded border px-3 py-2 text-sm" />
        <Button>Add unit type</Button>
      </form></Card>
      <Card><form onSubmit={addUnit} className="grid gap-3 p-5 md:grid-cols-5">
        <input required aria-label="Unit name" placeholder="Unit name" value={unitForm.name}
          onChange={(event) => setUnitForm({ ...unitForm, name: event.target.value })} className="rounded border px-3 py-2 text-sm" />
        <select required aria-label="Unit type" value={unitForm.type}
          onChange={(event) => setUnitForm({ ...unitForm, type: event.target.value })} className="rounded border px-3 py-2 text-sm">
          <option value="">Choose type</option>
          {types.map((item) => <option key={item.type} value={item.type}>{item.label}</option>)}
        </select>
        <select required aria-label="Company" value={unitForm.instanceCompany}
          onChange={(event) => setUnitForm({ ...unitForm, instanceCompany: event.target.value, parent: "" })} className="rounded border px-3 py-2 text-sm">
          <option value="">Choose company</option>
          {companies.filter((item) => item.status === "active").map((item) =>
            <option key={item._id} value={item._id}>{item.name}</option>)}
        </select>
        <select aria-label="Parent unit" value={unitForm.parent}
          onChange={(event) => setUnitForm({ ...unitForm, parent: event.target.value })} className="rounded border px-3 py-2 text-sm">
          <option value="">Under Company</option>
          {units.filter((item) => item.instanceCompany?._id === unitForm.instanceCompany).map((item) =>
            <option key={item._id} value={item._id}>{item.name} ({labelFor(item.type)})</option>)}
        </select>
        <Button disabled={!types.length}>Add unit</Button>
      </form></Card>
      <Card className="divide-y">
        {rows.map(({ unit, depth }) => <div key={unit._id} className="flex items-center justify-between p-4" style={{ paddingLeft: `${1 + depth * 1.5}rem` }}>
          <div><div className="font-medium">{unit.name}</div>
            <div className="text-sm text-gray-500">{labelFor(unit.type)} · {unit.parent?.name || unit.instanceCompany?.name || "Company"}</div>
            <UnitPlacementEditor unit={unit} units={units} companies={companies} onSave={moveUnit} /></div>
          <Button variant="danger" size="sm" onClick={() => removeUnit(unit._id)}>Delete</Button>
        </div>)}
        {!units.length && <p className="p-5 text-sm text-gray-500">No organization units yet.</p>}
      </Card>
      <OperationalRecordLinks title="Operational departments" kind="Department" unitType="department"
        records={departments} units={units} onLink={linkDepartment} />
      <OperationalRecordLinks title="Operational teams" kind="Team" unitType="team"
        records={teams} units={units} onLink={linkTeam} />
    </div>
  );
}
