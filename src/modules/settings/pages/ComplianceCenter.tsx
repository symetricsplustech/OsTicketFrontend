import { useGetRetentionPoliciesQuery, useAddRetentionPolicyMutation, useDeleteRetentionPolicyMutation, useGetDsarQuery, useCreateDsarMutation, useExportDsarMutation, useGetFieldMaskingQuery, useAddFieldMaskingMutation, useGetIpAllowlistQuery, useUpdateIpAllowlistMutation, useGetPasswordPolicyQuery, useUpdatePasswordPolicyMutation, useValidatePasswordMutation, useGetBackupTestsQuery, useRecordBackupTestMutation } from '@shared/store/apiEndpoints';
import { useEffect, useState } from 'react';
import { ShieldCheck, Plus, CheckCircle, XCircle, Download } from 'lucide-react';

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';

type Tab = 'retention' | 'dsar' | 'masking' | 'access' | 'backups';

export default function ComplianceCenter() {
  const [tab, setTab] = useState<Tab>('retention');
  const { data: policies = [] } = useGetRetentionPoliciesQuery();
  const { data: dsars = [] } = useGetDsarQuery();
  const { data: masks = [] } = useGetFieldMaskingQuery();
  const { data: allowlist } = useGetIpAllowlistQuery();
  const { data: pwPolicy } = useGetPasswordPolicyQuery();
  const { data: backups = [] } = useGetBackupTestsQuery();

  const [addRetentionPolicy] = useAddRetentionPolicyMutation();
  const [deleteRetentionPolicy] = useDeleteRetentionPolicyMutation();
  const [createDsar] = useCreateDsarMutation();
  const [exportDsar] = useExportDsarMutation();
  const [addFieldMasking] = useAddFieldMaskingMutation();
  const [updateIpAllowlist] = useUpdateIpAllowlistMutation();
  const [updatePasswordPolicy] = useUpdatePasswordPolicyMutation();
  const [validatePassword] = useValidatePasswordMutation();
  const [recordBackupTest] = useRecordBackupTestMutation();

  const [retForm, setRetForm] = useState({ name: '', retainDays: '', action: 'archive' });
  const [retMsg, setRetMsg] = useState('');
  const [retErr, setRetErr] = useState('');

  const [dsarForm, setDsarForm] = useState({ type: 'access', subjectEmail: '' });
  const [dsarMsg, setDsarMsg] = useState('');
  const [dsarErr, setDsarErr] = useState('');
  const [exportMsg, setExportMsg] = useState('');

  const [maskForm, setMaskForm] = useState({ model: 'Ticket', field: '', maskType: 'full' });
  const [maskMsg, setMaskMsg] = useState('');
  const [maskErr, setMaskErr] = useState('');

  const [cidrsText, setCidrsText] = useState('');
  const [cidrMsg, setCidrMsg] = useState('');
  const [cidrErr, setCidrErr] = useState('');

  const [pwForm, setPwForm] = useState({ minLength: '', requireUpper: false, requireNumber: false, requireSymbol: false, rotationDays: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [testPw, setTestPw] = useState('');
  const [pwErrors, setPwErrors] = useState<string[]>([]);

  const [bkForm, setBkForm] = useState({ scope: '', rtoMinutes: '', result: 'pass' });
  const [bkMsg, setBkMsg] = useState('');
  const [bkErr, setBkErr] = useState('');

  useEffect(() => {
    if (allowlist && Array.isArray(allowlist.cidrs)) {
      setCidrsText(allowlist.cidrs.join(', '));
    }
  }, [allowlist]);

  useEffect(() => {
    if (pwPolicy) {
      setPwForm({
        minLength: pwPolicy.minLength != null ? String(pwPolicy.minLength) : '',
        requireUpper: !!pwPolicy.requireUpper,
        requireNumber: !!pwPolicy.requireNumber,
        requireSymbol: !!pwPolicy.requireSymbol,
        rotationDays: pwPolicy.rotationDays != null ? String(pwPolicy.rotationDays) : '',
      });
    }
  }, [pwPolicy]);

  const addRet = async () => {
    setRetMsg(''); setRetErr('');
    try {
      await addRetentionPolicy({ name: retForm.name, retainDays: Number(retForm.retainDays), action: retForm.action }).unwrap();
      setRetMsg('Retention policy added.');
      setRetForm({ name: '', retainDays: '', action: 'archive' });
    } catch (err: any) {
      setRetErr(err?.data?.error || err?.data?.message || 'Failed to add retention policy.');
    }
  };

  const delRet = async (id: string) => {
    setRetMsg(''); setRetErr('');
    try {
      await deleteRetentionPolicy(id).unwrap();
      setRetMsg('Retention policy deleted.');
    } catch (err: any) {
      setRetErr(err?.data?.error || err?.data?.message || 'Failed to delete retention policy.');
    }
  };

  const createReq = async () => {
    setDsarMsg(''); setDsarErr(''); setExportMsg('');
    try {
      await createDsar({ type: dsarForm.type, subjectEmail: dsarForm.subjectEmail }).unwrap();
      setDsarMsg('DSAR request created.');
      setDsarForm({ type: 'access', subjectEmail: '' });
    } catch (err: any) {
      setDsarErr(err?.data?.error || err?.data?.message || 'Failed to create DSAR request.');
    }
  };

  const doExport = async (id: string) => {
    setDsarMsg(''); setDsarErr(''); setExportMsg('');
    try {
      const res = await exportDsar(id).unwrap();
      if (typeof res === 'string' || res instanceof Blob) {
        setExportMsg('Export downloaded');
      } else {
        setExportMsg(typeof res === 'object' && res !== null ? JSON.stringify(res) : String(res));
      }
    } catch (err: any) {
      setDsarErr(err?.data?.error || err?.data?.message || 'Export failed.');
    }
  };

  const addMask = async () => {
    setMaskMsg(''); setMaskErr('');
    try {
      await addFieldMasking({ model: maskForm.model, field: maskForm.field, maskType: maskForm.maskType }).unwrap();
      setMaskMsg('Field masking rule added.');
      setMaskForm({ model: 'Ticket', field: '', maskType: 'full' });
    } catch (err: any) {
      setMaskErr(err?.data?.error || err?.data?.message || 'Failed to add masking rule.');
    }
  };

  const saveCidrs = async () => {
    setCidrMsg(''); setCidrErr('');
    try {
      const cidrs = cidrsText.split(',').map((c) => c.trim()).filter(Boolean);
      await updateIpAllowlist({ cidrs }).unwrap();
      setCidrMsg('IP allowlist saved.');
    } catch (err: any) {
      setCidrErr(err?.data?.error || err?.data?.message || 'Failed to save IP allowlist.');
    }
  };

  const savePw = async () => {
    setPwMsg(''); setPwErr('');
    try {
      await updatePasswordPolicy({
        minLength: Number(pwForm.minLength),
        requireUpper: pwForm.requireUpper,
        requireNumber: pwForm.requireNumber,
        requireSymbol: pwForm.requireSymbol,
        rotationDays: Number(pwForm.rotationDays),
      }).unwrap();
      setPwMsg('Password policy saved.');
    } catch (err: any) {
      setPwErr(err?.data?.error || err?.data?.message || 'Failed to save password policy.');
    }
  };

  const runValidate = async () => {
    setPwErrors([]);
    try {
      const res = await validatePassword(testPw).unwrap();
      setPwErrors(res.errors || []);
    } catch (err: any) {
      setPwErrors([err?.data?.error || err?.data?.message || 'Validation failed.']);
    }
  };

  const addBackup = async () => {
    setBkMsg(''); setBkErr('');
    try {
      await recordBackupTest({ scope: bkForm.scope, rtoMinutes: Number(bkForm.rtoMinutes), result: bkForm.result }).unwrap();
      setBkMsg('Backup test recorded.');
      setBkForm({ scope: '', rtoMinutes: '', result: 'pass' });
    } catch (err: any) {
      setBkErr(err?.data?.error || err?.data?.message || 'Failed to record backup test.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-6 w-6 text-brand-600" />
        <h1 className="text-2xl font-bold text-gray-900">Compliance Center</h1>
      </div>

      <div className="flex gap-1 border-b">
        {(['retention', 'dsar', 'masking', 'access', 'backups'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t === 'dsar' ? 'DSAR Requests' : t === 'masking' ? 'Field Masking' : t === 'access' ? 'Access Control' : t === 'backups' ? 'Backups' : 'Retention'}
          </button>
        ))}
      </div>

      {tab === 'retention' && (
        <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="space-y-3">
            {policies.length === 0 && <p className="text-sm text-gray-500">No retention policies yet.</p>}
            {policies.map((p: any) => (
              <div key={p._id} className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3">
                <div>
                  <p className="font-medium text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-500">{(p.entityTypes || []).join(', ')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">{p.retainDays}d</span>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">{p.action}</span>
                  <button onClick={() => delRet(p._id)} className="text-sm text-red-600 hover:text-red-800">Delete</button>
                </div>
              </div>
            ))}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); addRet(); }}
            className="grid grid-cols-1 md:grid-cols-4 gap-3 border-t border-gray-200 pt-4"
          >
            <input placeholder="Policy name" value={retForm.name} onChange={(e) => setRetForm({ ...retForm, name: e.target.value })} className={inputCls} required />
            <input type="number" min="0" placeholder="Retain days" value={retForm.retainDays} onChange={(e) => setRetForm({ ...retForm, retainDays: e.target.value })} className={inputCls} required />
            <select value={retForm.action} onChange={(e) => setRetForm({ ...retForm, action: e.target.value })} className={inputCls}>
              <option value="archive">archive</option>
              <option value="delete">delete</option>
            </select>
            <button type="submit" className="flex items-center justify-center gap-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium">
              <Plus className="h-4 w-4" /> Add Policy
            </button>
          </form>
          {retMsg && <span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle className="h-4 w-4" /> {retMsg}</span>}
          {retErr && <span className="flex items-center gap-1 text-sm text-red-600"><XCircle className="h-4 w-4" /> {retErr}</span>}
        </section>
      )}

      {tab === 'dsar' && (
        <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="space-y-3">
            {dsars.length === 0 && <p className="text-sm text-gray-500">No DSAR requests yet.</p>}
            {dsars.map((d: any) => (
              <div key={d._id} className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3">
                <div>
                  <p className="font-medium text-gray-900 capitalize">{d.type}</p>
                  <p className="text-xs text-gray-500">{d.subjectEmail}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700">{d.status}</span>
                  <span className="text-xs text-gray-500">Due {d.dueAt ? new Date(d.dueAt).toLocaleDateString() : '-'}</span>
                  <button onClick={() => doExport(d._id)} className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-800">
                    <Download className="h-4 w-4" /> Export
                  </button>
                </div>
              </div>
            ))}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); createReq(); }}
            className="grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-gray-200 pt-4"
          >
            <select value={dsarForm.type} onChange={(e) => setDsarForm({ ...dsarForm, type: e.target.value })} className={inputCls}>
              <option value="access">access</option>
              <option value="delete">delete</option>
              <option value="correct">correct</option>
            </select>
            <input type="email" placeholder="Subject email" value={dsarForm.subjectEmail} onChange={(e) => setDsarForm({ ...dsarForm, subjectEmail: e.target.value })} className={inputCls} required />
            <button type="submit" className="flex items-center justify-center gap-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium">
              <Plus className="h-4 w-4" /> Create Request
            </button>
          </form>
          {exportMsg && <span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle className="h-4 w-4" /> {exportMsg}</span>}
          {dsarMsg && <span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle className="h-4 w-4" /> {dsarMsg}</span>}
          {dsarErr && <span className="flex items-center gap-1 text-sm text-red-600"><XCircle className="h-4 w-4" /> {dsarErr}</span>}
        </section>
      )}

      {tab === 'masking' && (
        <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="space-y-3">
            {masks.length === 0 && <p className="text-sm text-gray-500">No masking rules yet.</p>}
            {masks.map((m: any) => (
              <div key={m._id} className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3">
                <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700">{m.model}</span>
                <span className="font-mono text-sm text-gray-900">{m.field}</span>
                <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">{m.maskType}</span>
              </div>
            ))}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); addMask(); }}
            className="grid grid-cols-1 md:grid-cols-4 gap-3 border-t border-gray-200 pt-4"
          >
            <select value={maskForm.model} onChange={(e) => setMaskForm({ ...maskForm, model: e.target.value })} className={inputCls}>
              <option value="Ticket">Ticket</option>
              <option value="User">User</option>
              <option value="Lead">Lead</option>
            </select>
            <input placeholder="Field name" value={maskForm.field} onChange={(e) => setMaskForm({ ...maskForm, field: e.target.value })} className={inputCls} required />
            <select value={maskForm.maskType} onChange={(e) => setMaskForm({ ...maskForm, maskType: e.target.value })} className={inputCls}>
              <option value="full">full</option>
              <option value="partial">partial</option>
              <option value="hash">hash</option>
            </select>
            <button type="submit" className="flex items-center justify-center gap-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium">
              <Plus className="h-4 w-4" /> Add Rule
            </button>
          </form>
          {maskMsg && <span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle className="h-4 w-4" /> {maskMsg}</span>}
          {maskErr && <span className="flex items-center gap-1 text-sm text-red-600"><XCircle className="h-4 w-4" /> {maskErr}</span>}
        </section>
      )}

      {tab === 'access' && (
        <div className="space-y-6">
          <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">IP Allowlist</h2>
            <textarea
              rows={3}
              placeholder="10.0.0.0/8, 192.168.1.0/24"
              value={cidrsText}
              onChange={(e) => setCidrsText(e.target.value)}
              className={`${inputCls} font-mono`}
            />
            <div className="flex items-center gap-3">
              <button onClick={saveCidrs} className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium">Save Allowlist</button>
              {cidrMsg && <span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle className="h-4 w-4" /> {cidrMsg}</span>}
              {cidrErr && <span className="flex items-center gap-1 text-sm text-red-600"><XCircle className="h-4 w-4" /> {cidrErr}</span>}
            </div>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Password Policy</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="flex flex-col gap-1 text-sm text-gray-700">
                Min length
                <input type="number" min="0" value={pwForm.minLength} onChange={(e) => setPwForm({ ...pwForm, minLength: e.target.value })} className={inputCls} />
              </label>
              <label className="flex flex-col gap-1 text-sm text-gray-700">
                Rotation days
                <input type="number" min="0" value={pwForm.rotationDays} onChange={(e) => setPwForm({ ...pwForm, rotationDays: e.target.value })} className={inputCls} />
              </label>
              <div className="flex items-end gap-4 pb-2 text-sm text-gray-700">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={pwForm.requireUpper} onChange={(e) => setPwForm({ ...pwForm, requireUpper: e.target.checked })} className="rounded border-gray-300" />
                  Uppercase
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={pwForm.requireNumber} onChange={(e) => setPwForm({ ...pwForm, requireNumber: e.target.checked })} className="rounded border-gray-300" />
                  Number
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={pwForm.requireSymbol} onChange={(e) => setPwForm({ ...pwForm, requireSymbol: e.target.checked })} className="rounded border-gray-300" />
                  Symbol
                </label>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={savePw} className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium">Save Policy</button>
              {pwMsg && <span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle className="h-4 w-4" /> {pwMsg}</span>}
              {pwErr && <span className="flex items-center gap-1 text-sm text-red-600"><XCircle className="h-4 w-4" /> {pwErr}</span>}
            </div>
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <p className="text-sm font-medium text-gray-700">Test a password</p>
              <div className="flex gap-3">
                <input type="text" placeholder="Candidate password" value={testPw} onChange={(e) => setTestPw(e.target.value)} className={inputCls} />
                <button onClick={runValidate} disabled={!testPw} className="px-4 py-2 border border-brand-300 text-brand-700 rounded-lg hover:bg-brand-50 text-sm font-medium disabled:opacity-50 whitespace-nowrap">Validate</button>
              </div>
              {pwErrors.length > 0 ? (
                <ul className="text-sm text-red-600 list-disc list-inside">
                  {pwErrors.map((er, i) => <li key={i}>{er}</li>)}
                </ul>
              ) : testPw && pwErrors.length === 0 && (
                <p className="text-sm text-green-600 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Password meets the policy.</p>
              )}
            </div>
          </section>
        </div>
      )}

      {tab === 'backups' && (
        <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="space-y-3">
            {backups.length === 0 && <p className="text-sm text-gray-500">No backup tests recorded yet.</p>}
            {backups.map((b: any) => (
              <div key={b._id} className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3">
                <div>
                  <p className="font-medium text-gray-900">{b.scope}</p>
                  <p className="text-xs text-gray-500">{b.testedAt ? new Date(b.testedAt).toLocaleString() : ''}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">RTO {b.rtoMinutes}m</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${b.result === 'pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{b.result}</span>
                </div>
              </div>
            ))}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); addBackup(); }}
            className="grid grid-cols-1 md:grid-cols-4 gap-3 border-t border-gray-200 pt-4"
          >
            <input placeholder="Scope" value={bkForm.scope} onChange={(e) => setBkForm({ ...bkForm, scope: e.target.value })} className={inputCls} required />
            <input type="number" min="0" placeholder="RTO minutes" value={bkForm.rtoMinutes} onChange={(e) => setBkForm({ ...bkForm, rtoMinutes: e.target.value })} className={inputCls} required />
            <select value={bkForm.result} onChange={(e) => setBkForm({ ...bkForm, result: e.target.value })} className={inputCls}>
              <option value="pass">pass</option>
              <option value="fail">fail</option>
            </select>
            <button type="submit" className="flex items-center justify-center gap-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium">
              <Plus className="h-4 w-4" /> Record Test
            </button>
          </form>
          {bkMsg && <span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle className="h-4 w-4" /> {bkMsg}</span>}
          {bkErr && <span className="flex items-center gap-1 text-sm text-red-600"><XCircle className="h-4 w-4" /> {bkErr}</span>}
        </section>
      )}
    </div>
  );
}
