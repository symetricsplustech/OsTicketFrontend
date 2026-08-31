import { useState, useEffect } from 'react';
import { Shield, Users } from 'lucide-react';
import api from '@shared/lib/api';

interface Candidate {
  _id: string;
  name: string;
  email: string;
}

const normalizeCandidates = (data: unknown): Candidate[] => {
  let rows: Record<string, unknown>[] = [];
  if (Array.isArray(data)) rows = data as Record<string, unknown>[];
  else if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.users)) rows = obj.users as Record<string, unknown>[];
    else if (Array.isArray(obj.agents)) rows = obj.agents as Record<string, unknown>[];
  }
  return rows
    .map(r => ({
      _id: String((r as { _id?: string; id?: string })._id ?? (r as { id?: string }).id ?? ''),
      name: String((r as { name?: string; fullName?: string }).name ?? (r as { fullName?: string }).fullName ?? ''),
      email: String((r as { email?: string }).email ?? ''),
    }))
    .filter(c => c._id);
};

export default function HrAccessControl() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [denied, setDenied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    let members: string[] = [];
    try {
      const { data } = await api.get('/ops/hr-scope');
      members = data.agents || [];
    } catch (err) {
      if ((err as { response?: { status?: number } })?.response?.status === 403) {
        setDenied(true);
        return;
      }
    }
    try {
      const { data } = await api.get('/admin/users');
      setCandidates(normalizeCandidates(data));
    } catch {
      try {
        const { data } = await api.get('/agents');
        setCandidates(normalizeCandidates(data));
      } catch {
        setCandidates([]);
      }
    }
    setSelected(members);
  };

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/ops/hr-scope', { agents: selected });
      setToast('HR team access updated successfully');
      setTimeout(() => setToast(''), 3000);
    } catch {}
    finally { setSaving(false); }
  };

  if (denied) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6" /> HR Access Control</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center text-yellow-800 font-medium">
          Only admins and HR team can view this
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6" /> HR Access Control</h1>
        <button onClick={handleSave} disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {toast && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{toast}</div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Shield className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          Only users selected below can access HR endpoints (<code className="font-mono">/offboarding</code>,{' '}
          <code className="font-mono">/document-requests</code>, <code className="font-mono">/policies</code>,{' '}
          <code className="font-mono">/hr-documents</code>). Non-HR-team members receive a 403 response. Admins always have access.
        </p>
      </div>

      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium w-12">Member</th>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {candidates.map(c => (
              <tr key={c._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => toggle(c._id)}>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selected.includes(c._id)} onChange={() => toggle(c._id)} className="rounded" onClick={e => e.stopPropagation()} />
                </td>
                <td className="px-4 py-3 font-medium flex items-center gap-2"><Users className="h-4 w-4 text-gray-400" />{c.name || '—'}</td>
                <td className="px-4 py-3 text-gray-500">{c.email || '—'}</td>
              </tr>
            ))}
            {candidates.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-500">No agent candidates found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
