import { useEffect, useState } from 'react';
import { adminEn } from '../lib/enterprise.js';

const EMPTY = {
  name: '', organization: '', startDate: '', endDate: '', status: 'active',
  support24x7: false, supportHours: '', includedTicketsPerMonth: 10,
  slaPlans: [], renewal: { autoRenew: false, renewalPeriod: 'annual', noticeDays: 30 }, notes: '',
};

export default function Contracts() {
  const [items, setItems] = useState([]);
  const [ents, setEnts] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [slaPlans, setSlaPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [entForm, setEntForm] = useState({ contract: '', organization: '', service: '', serviceType: 'any', scope: 'included', limitType: 'unlimited', limitValue: 0, timespanDays: 30, isActive: true });

  const load = async () => {
    try {
      const [ct, ent, og, sp] = await Promise.all([adminEn.contracts(), adminEn.entitlements(), adminEn.orgs(), adminEn.skills().then(() => [])]);
      setItems(ct); setEnts(ent); setOrgs(og); setSlaPlans(sp); setError('');
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const entFor = (contractId) => entForm.contract === contractId ? entForm : null;

  const save = async () => {
    try {
      if (editing) { await adminEn.updateContract(editing, form); } else { await adminEn.createContract(form); }
      setEditing(null); setForm(EMPTY); await load();
    } catch (e) { setError(e.message); }
  };

  const setEnt = (k, v) => setEntForm({ ...entForm, [k]: v });

  const addEnt = async (c) => {
    try {
      await adminEn.createEntitlement({ ...entForm, contract: c._id, organization: c.organization?._id || c.organization });
      setEntForm({ ...entForm, contract: '' }); await load();
    } catch (e) { setError(e.message); }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete contract "${c.name}"?`)) return;
    await adminEn.deleteContract(c._id); await load();
  };

  const delEnt = async (e) => { await adminEn.deleteEntitlement(e._id); await load(); };

  const F = ({ label, children }) => <label className="field"><span>{label}</span>{children}</label>;

  return (
    <div>
      <h1>Contracts & Entitlements</h1>
      {error && <div className="alert error">{error}</div>}

      <div className="box">
        <div className="box-header"><h1>{editing ? 'Edit Contract' : 'New Contract'}</h1></div>
        <div className="form-row">
          <F label="Name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></F>
          <F label="Organization"><select value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })}>
            <option value="">— select —</option>
            {orgs.map((o) => <option key={o._id} value={o._id}>{o.name}</option>)}
          </select></F>
          <F label="Status"><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {['draft', 'active', 'expired', 'terminated'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select></F>
        </div>
        <div className="form-row">
          <F label="Start"><input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></F>
          <F label="End"><input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></F>
          <F label="Support Hours"><input value={form.supportHours} onChange={(e) => setForm({ ...form, supportHours: e.target.value })} placeholder="24x7" /></F>
          <label className="field"><span>24x7 Support</span>
            <select value={form.support24x7 ? '1' : '0'} onChange={(e) => setForm({ ...form, support24x7: e.target.value === '1' })}>
              <option value="1">Yes</option><option value="0">No</option>
            </select>
          </label>
        </div>
        <div className="form-row">
          <F label="Included Tickets / Month"><input type="number" value={form.includedTicketsPerMonth} onChange={(e) => setForm({ ...form, includedTicketsPerMonth: +e.target.value })} /></F>
          <F label="Auto-Renew"><select value={form.renewal.autoRenew ? '1' : '0'} onChange={(e) => setForm({ ...form, renewal: { ...form.renewal, autoRenew: e.target.value === '1' } })}>
            <option value="1">Yes</option><option value="0">No</option>
          </select></F>
          <F label="Renewal Period"><select value={form.renewal.renewalPeriod} onChange={(e) => setForm({ ...form, renewal: { ...form.renewal, renewalPeriod: e.target.value } })}>
            {['monthly', 'quarterly', 'annual', 'biennial'].map((x) => <option key={x} value={x}>{x}</option>)}
          </select></F>
          <F label="Notice Days"><input type="number" value={form.renewal.noticeDays} onChange={(e) => setForm({ ...form, renewal: { ...form.renewal, noticeDays: +e.target.value } })} /></F>
        </div>
        <div className="form-row">
          <F label="Notes"><input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></F>
          <div className="field"><span></span>
            <div className="buttons">
              {editing && <button className="btn secondary" onClick={() => { setEditing(null); setForm(EMPTY); }}>Cancel</button>}
              <button className="btn" onClick={save}>{editing ? 'Save Changes' : 'Create Contract'}</button>
            </div>
          </div>
        </div>
      </div>

      <div className="box mt-10">
        <div className="box-header"><h1>Contracts ({items.length})</h1></div>
        {loading ? <p className="muted">Loading…</p> : items.length === 0 ? <p className="muted">No contracts.</p> : (
          <table className="list">
            <thead><tr><th>#</th><th>Name</th><th>Organization</th><th>Term</th><th>Status</th><th>Usage</th><th>Entitlements</th><th></th></tr></thead>
            <tbody>
              {items.map((c) => (
                <tr key={c._id}>
                  <td>{c.number}</td>
                  <td><b>{c.name}</b></td>
                  <td>{c.organization?.name || '—'}</td>
                  <td>{c.startDate ? new Date(c.startDate).toLocaleDateString() : '—'} → {c.endDate ? new Date(c.endDate).toLocaleDateString() : '∞'}</td>
                  <td><span className="pill">{c.status}</span></td>
                  <td>{c.includedTicketsPerMonth > 0 ? `${c.usageThisMonth ?? 0}/${c.includedTicketsPerMonth}` : 'unlimited'}</td>
                  <td>{(ents.filter((e) => String(e.contract) === String(c._id)) || []).map((e) => <span key={e._id} className="pill mb-2" style={{ display: 'inline-block' }}>{e.service || 'any'} · {e.scope}</span>)}</td>
                  <td className="right">
                    <button className="btn secondary" onClick={() => { setEditing(c._id); setForm({ ...EMPTY, ...c, startDate: c.startDate ? new Date(c.startDate).toISOString().slice(0, 10) : '', endDate: c.endDate ? new Date(c.endDate).toISOString().slice(0, 10) : '', organization: c.organization?._id || c.organization, renewal: c.renewal || EMPTY.renewal }); }}>Edit</button>{' '}
                    <button className="btn danger" onClick={() => remove(c)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="box mt-10">
        <div className="box-header"><h1>Entitlements</h1></div>
        <div className="form-row">
          <F label="Contract"><select value={entForm.contract} onChange={(e) => setEnt('contract', e.target.value)}>
            <option value="">— select —</option>
            {items.map((c) => <option key={c._id} value={c._id}>{c.number} · {c.name}</option>)}
          </select></F>
          <F label="Service"><input value={entForm.service} onChange={(e) => setEnt('service', e.target.value)} placeholder="help topic / asset type / any" /></F>
          <F label="Type"><select value={entForm.serviceType} onChange={(e) => setEnt('serviceType', e.target.value)}>
            {['any', 'help_topic', 'category', 'asset_type'].map((x) => <option key={x} value={x}>{x}</option>)}
          </select></F>
          <F label="Scope"><select value={entForm.scope} onChange={(e) => setEnt('scope', e.target.value)}>
            {['included', 'paid', 'blocked', 'approval'].map((x) => <option key={x} value={x}>{x}</option>)}
          </select></F>
        </div>
        <div className="form-row">
          <F label="Limit Type"><select value={entForm.limitType} onChange={(e) => setEnt('limitType', e.target.value)}>
            {['unlimited', 'count', 'timespan'].map((x) => <option key={x} value={x}>{x}</option>)}
          </select></F>
          {entForm.limitType !== 'unlimited' && <F label="Limit Value"><input type="number" value={entForm.limitValue} onChange={(e) => setEnt('limitValue', +e.target.value)} /></F>}
          {entForm.limitType === 'timespan' && <F label="Timespan (days)"><input type="number" value={entForm.timespanDays} onChange={(e) => setEnt('timespanDays', +e.target.value)} /></F>}
          <div className="field"><span></span><button className="btn" disabled={!entForm.contract} onClick={() => addEnt(items.find((c) => c._id === entForm.contract))}>Add Entitlement</button></div>
        </div>
        {ents.length > 0 && (
          <table className="list mt-10">
            <thead><tr><th>Contract</th><th>Service</th><th>Type</th><th>Scope</th><th>Limit</th><th>Used</th><th></th></tr></thead>
            <tbody>
              {ents.map((e) => (
                <tr key={e._id}>
                  <td>{items.find((c) => String(c._id) === String(e.contract))?.number || '—'}</td>
                  <td>{e.service || 'any'}</td>
                  <td>{e.serviceType}</td>
                  <td><span className="pill">{e.scope}</span></td>
                  <td>{e.limitType === 'unlimited' ? '∞' : e.limitType === 'timespan' ? `${e.limitValue}/${e.timespanDays} days` : e.limitValue}</td>
                  <td>{e.usedCount ?? 0}</td>
                  <td className="right"><button className="btn danger" onClick={() => delEnt(e)}>✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}