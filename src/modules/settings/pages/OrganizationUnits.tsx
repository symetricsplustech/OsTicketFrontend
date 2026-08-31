import React, { useEffect, useMemo, useState } from 'react';
import api from '@shared/lib/api';
import toast from 'react-hot-toast';

type Unit = { _id: string; name: string; type: string; label?: string; parent?: string | null; status: string; children?: Unit[] };
const unitTypes = ['organization', 'subsidiary', 'division', 'business_unit', 'department', 'branch', 'location', 'site', 'facility', 'team', 'project', 'cost_centre', 'region', 'territory'];
const readable = (value: string) => value.replace(/_/g, ' ');

function UnitTree({ nodes, allUnits, labels, onRename, onMove, depth = 0 }: { nodes: Unit[]; allUnits: Unit[]; labels: Record<string, string>; onRename: (unit: Unit) => void; onMove: (unit: Unit, parent: string) => void; depth?: number }) {
  return <>{nodes.map((unit) => <React.Fragment key={unit._id}>
    <tr className="border-t hover:bg-gray-50">
      <td className="p-3 font-medium"><span style={{ paddingLeft: `${depth * 20}px` }} className="inline-flex items-center gap-2"><span className="text-gray-400">{unit.children?.length ? '↳' : '•'}</span>{unit.name}</span></td>
      <td className="p-3">{labels[unit.type] || readable(unit.type)}</td>
      <td className="p-3"><button type="button" className="text-brand-600 hover:underline" onClick={() => onRename(unit)}>{unit.label || 'Set label'}</button></td>
      <td className="p-3"><select aria-label={`Move ${unit.name}`} className="input-field py-1 text-xs" value={unit.parent || ''} onChange={(event) => onMove(unit, event.target.value)}><option value="">No parent</option>{allUnits.filter((candidate) => candidate._id !== unit._id).map((candidate) => <option key={candidate._id} value={candidate._id}>{candidate.name} ({readable(candidate.type)})</option>)}</select></td>
      <td className="p-3">{unit.status}</td>
    </tr>
    {unit.children?.length ? <UnitTree nodes={unit.children} allUnits={allUnits} labels={labels} onRename={onRename} onMove={onMove} depth={depth + 1} /> : null}
  </React.Fragment>)}</>;
}

export default function OrganizationUnits() {
  const [items, setItems] = useState<Unit[]>([]);
  const [tree, setTree] = useState<Unit[]>([]);
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [labelForm, setLabelForm] = useState({ type: 'business_unit', label: '' });
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', type: 'business_unit', label: '', parent: '' });
  const load = async () => {
    try {
      const [flat, hierarchy, configuredLabels] = await Promise.all([api.get('/rbac/units'), api.get('/rbac/units/tree'), api.get('/rbac/unit-labels')]);
      setItems(flat.data.items || []);
      setTree(hierarchy.data.items || []);
      setLabels(Object.fromEntries((configuredLabels.data.items || []).map((item: { type: string; label: string }) => [item.type, item.label])));
    } catch { toast.error('Unable to load organisation units'); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try { await api.post('/rbac/units', { ...form, parent: form.parent || null }); setForm({ name: '', type: 'business_unit', label: '', parent: '' }); toast.success('Organisation unit created'); load(); } catch (error: any) { toast.error(error.response?.data?.message || 'Unable to create organisation unit'); }
  };
  const rename = async (unit: Unit) => {
    const label = window.prompt('Custom label', unit.label || '');
    if (label === null) return;
    try { await api.put(`/rbac/units/${unit._id}`, { label }); toast.success('Label updated'); load(); } catch (error: any) { toast.error(error.response?.data?.message || 'Unable to update label'); }
  };
  const move = async (unit: Unit, parent: string) => {
    try { await api.put(`/rbac/units/${unit._id}`, { parent: parent || null }); toast.success('Organisation unit moved'); load(); } catch (error: any) { toast.error(error.response?.data?.message || 'Unable to move organisation unit'); load(); }
  };
  const saveTypeLabel = async (event: React.FormEvent) => {
    event.preventDefault();
    try { await api.put(`/rbac/unit-labels/${labelForm.type}`, { label: labelForm.label }); toast.success('Tenant unit label updated'); setLabels((current) => ({ ...current, [labelForm.type]: labelForm.label })); } catch (error: any) { toast.error(error.response?.data?.message || 'Unable to update tenant unit label'); }
  };
  const parentOptions = useMemo(() => items.filter((unit) => unit.status === 'active'), [items]);
  return <div className="space-y-6">
    <div><h1 className="text-2xl font-bold">Organisation Structure</h1><p className="text-sm text-gray-500">Create tenant-specific parent-child units. Every unit and parent must belong to this organisation.</p></div>
    <form onSubmit={saveTypeLabel} className="card p-6 grid gap-4 md:grid-cols-3"><div className="md:col-span-3"><h2 className="font-semibold">Tenant terminology</h2><p className="text-sm text-gray-500">Rename a unit type everywhere in this tenant. This does not affect other customers.</p></div><select aria-label="Unit type label" className="input-field" value={labelForm.type} onChange={e => setLabelForm({ type: e.target.value, label: labels[e.target.value] || '' })}>{unitTypes.map(type => <option key={type} value={type}>{readable(type)}</option>)}</select><input required aria-label="Tenant unit label" className="input-field" placeholder="e.g. Hospital, Store, Plant" value={labelForm.label} onChange={e => setLabelForm({ ...labelForm, label: e.target.value })} /><button className="btn-primary">Save tenant label</button></form>
    <form onSubmit={submit} className="card p-6 grid gap-4 md:grid-cols-2">
      <input required className="input-field" placeholder="Unit name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
      <select aria-label="Unit type" className="input-field" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>{unitTypes.map(type => <option key={type} value={type}>{readable(type)}</option>)}</select>
      <input className="input-field" placeholder="Custom label, e.g. Hospital or Plant" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} />
      <select aria-label="Parent unit" className="input-field" value={form.parent} onChange={e => setForm({ ...form, parent: e.target.value })}><option value="">No parent</option>{parentOptions.map(unit => <option key={unit._id} value={unit._id}>{unit.name} ({readable(unit.type)})</option>)}</select>
      <button className="btn-primary md:col-span-2">Add unit</button>
    </form>
    <div className="card overflow-hidden"><table className="min-w-full text-sm"><thead className="bg-gray-50"><tr><th className="p-3 text-left">Hierarchy</th><th className="p-3 text-left">Type</th><th className="p-3 text-left">Custom label</th><th className="p-3 text-left">Parent</th><th className="p-3 text-left">Status</th></tr></thead><tbody>{loading ? <tr><td className="p-6" colSpan={5}>Loading…</td></tr> : tree.length ? <UnitTree nodes={tree} allUnits={items} labels={labels} onRename={rename} onMove={move} /> : <tr><td className="p-6 text-gray-500" colSpan={5}>No organisation units yet.</td></tr>}</tbody></table></div>
  </div>;
}
