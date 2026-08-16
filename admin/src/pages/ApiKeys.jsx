import { useEffect, useState } from 'react';
import { adminEn } from '../lib/enterprise.js';

const SCOPES = [
  'tickets:read', 'tickets:write', 'tickets:delete', 'users:read', 'users:write',
  'skills:read', 'skills:write', 'workflows:read', 'workflows:write',
  'incidents:read', 'incidents:write', 'problems:read', 'problems:write', 'changes:read', 'changes:write',
  'assets:read', 'assets:write', 'contracts:read', 'contracts:write', 'reports:read', 'chat:read', 'chat:write', '*',
];

export default function ApiKeys() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', scopes: ['tickets:read', 'tickets:write'], expiresAt: '' });
  const [createdKey, setCreatedKey] = useState(null);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    try { setItems(await adminEn.apiKeys()); setError(''); } catch (e) { setError(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    try {
      const key = await adminEn.createApiKey({ ...form, expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null });
      setCreatedKey(key); setForm({ name: '', scopes: ['tickets:read', 'tickets:write'], expiresAt: '' });
      await load();
    } catch (e) { setError(e.message); }
  };

  const remove = async (k) => {
    if (!window.confirm(`Revoke API key "${k.name}"?`)) return;
    await adminEn.deleteApiKey(k._id);
    if (createdKey?._id === k._id) setCreatedKey(null);
    await load();
  };

  const setScope = (s, on) => setForm({ ...form, scopes: on ? [...form.scopes, s] : form.scopes.filter((x) => x !== s) });

  const F = ({ label, children }) => <label className="field"><span>{label}</span>{children}</label>;

  return (
    <div>
      <h1>API Keys & Developer Access</h1>
      {error && <div className="alert error">{error}</div>}

      {createdKey && !createdKey.archived && (
        <div className="box">
          <div className="box-header"><h1>Key Created — copy it now</h1></div>
          <p className="muted small">The raw key is shown once. Store it in your integration secret store.</p>
          <div className="form-row">
            <input readOnly value={createdKey.raw || createdKey.key || ''} style={{ width: 420 }} />
            <button className="btn" onClick={() => { navigator.clipboard?.writeText(createdKey.raw || createdKey.key || ''); setCopied(true); }}>{copied ? 'Copied ✓' : 'Copy'}</button>
          </div>
        </div>
      )}

      <div className="box">
        <div className="box-header"><h1>Generate Key</h1></div>
        <div className="form-row">
          <F label="Name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Production sync" /></F>
          <F label="Expires"><input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} /></F>
          <div className="field"><span></span><button className="btn" onClick={create} disabled={!form.name.trim()}>Generate</button></div>
        </div>
        <div className="box-header mt-10"><h1>Scopes</h1></div>
        <div className="form-row">
          {SCOPES.map((s) => (
            <button key={s} className={`pill ${form.scopes.includes(s) ? '' : 'muted'}`} style={{ cursor: 'pointer', marginRight: 4, marginBottom: 4 }}
              onClick={() => setScope(s, !form.scopes.includes(s))}>
              {form.scopes.includes(s) ? '✓' : '+'} {s}
            </button>
          ))}
        </div>
      </div>

      <div className="box mt-10">
        <div className="box-header"><h1>Active Keys ({items.length})</h1></div>
        <table className="list">
          <thead><tr><th>Name</th><th>Prefix</th><th>Scopes</th><th>Created</th><th>Expires</th><th>Last Used</th><th></th></tr></thead>
          <tbody>
            {items.map((k) => (
              <tr key={k._id}>
                <td><b>{k.name}</b></td>
                <td><code>{k.keyPrefix}…</code></td>
                <td>{(k.scopes || []).map((s) => <span key={s} className="pill" style={{ marginRight: 4 }}>{s}</span>)}</td>
                <td>{new Date(k.createdAt).toLocaleDateString()}</td>
                <td>{k.expiresAt ? new Date(k.expiresAt).toLocaleDateString() : 'never'}</td>
                <td>{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : 'never'}</td>
                <td className="right"><button className="btn danger" onClick={() => remove(k)}>Revoke</button></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={7} className="muted">No API keys yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}