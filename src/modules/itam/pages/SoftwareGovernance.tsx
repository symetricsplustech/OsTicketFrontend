import { useImportSoftwareMutation, useRequestReclamationMutation, useConfirmReclamationMutation, useGetSaasRosterQuery } from '@shared/store/apiEndpoints';
import { useState } from 'react';
import { Package2, FileStack, Plus, CheckCircle, XCircle } from 'lucide-react';

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';

type Tab = 'import' | 'reclamation' | 'roster';

export default function SoftwareGovernance() {
  const [tab, setTab] = useState<Tab>('import');
  const { data: roster } = useGetSaasRosterQuery();

  const [importSoftware] = useImportSoftwareMutation();
  const [requestReclamation] = useRequestReclamationMutation();
  const [confirmReclamation] = useConfirmReclamationMutation();

  const [assetId, setAssetId] = useState('');
  const [rowsText, setRowsText] = useState('');
  const [importResult, setImportResult] = useState<{ matchedProducts?: number; createdProducts?: number } | null>(null);
  const [importErr, setImportErr] = useState('');

  const [reqForm, setReqForm] = useState({ licenseId: '', userId: '', lastUsedDays: '' });
  const [reqMsg, setReqMsg] = useState('');
  const [reqErr, setReqErr] = useState('');

  const [confId, setConfId] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [confStatus, setConfStatus] = useState('');
  const [confErr, setConfErr] = useState('');

  const parseRows = () =>
    rowsText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) => {
        const [name, version, publisher] = line.split('|').map((s) => s.trim());
        return { name: name || '', version: version || '', publisher: publisher || '' };
      });

  const doImport = async () => {
    setImportResult(null); setImportErr('');
    try {
      const res = await importSoftware({ assetId, rows: parseRows() }).unwrap();
      setImportResult({ matchedProducts: res.matchedProducts, createdProducts: res.createdProducts });
    } catch (err: any) {
      setImportErr(err?.data?.error || err?.data?.message || 'Import failed.');
    }
  };

  const submitRequest = async () => {
    setReqMsg(''); setReqErr('');
    try {
      await requestReclamation({
        licenseId: reqForm.licenseId,
        userId: reqForm.userId,
        lastUsedDays: Number(reqForm.lastUsedDays),
      }).unwrap();
      setReqMsg('Reclamation requested.');
      setReqForm({ licenseId: '', userId: '', lastUsedDays: '' });
    } catch (err: any) {
      setReqErr(err?.data?.error || err?.data?.message || 'Failed to request reclamation.');
    }
  };

  const doConfirm = async () => {
    setConfStatus(''); setConfErr('');
    try {
      const res = await confirmReclamation({ id: confId, confirmed }).unwrap();
      setConfStatus(res.status || (confirmed ? 'confirmed' : 'rejected'));
    } catch (err: any) {
      setConfErr(err?.data?.error || err?.data?.message || 'Confirmation failed.');
    }
  };

  const seats = roster?.seats ?? roster?.totalSeats ?? 0;
  const idleOver30 = roster?.idleOver30 ?? roster?.idleOverThirty ?? 0;
  const rows: any[] = roster?.items || roster?.rows || roster?.licenses || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Package2 className="h-6 w-6 text-brand-600" />
        <h1 className="text-2xl font-bold text-gray-900">Software Governance</h1>
      </div>

      <div className="flex gap-1 border-b">
        {(['import', 'reclamation', 'roster'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t === 'import' ? 'Discovery Import' : t === 'reclamation' ? 'Reclamation' : 'SaaS Roster'}
          </button>
        ))}
      </div>

      {tab === 'import' && (
        <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asset ID</label>
            <input placeholder="Asset to attach discovered software" value={assetId} onChange={(e) => setAssetId(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discovered software</label>
            <textarea
              rows={6}
              placeholder={'name|version|publisher\nChrome|120.0|Google\nSlack|4.39|Salesforce'}
              value={rowsText}
              onChange={(e) => setRowsText(e.target.value)}
              className={`${inputCls} font-mono`}
            />
            <p className="mt-1 text-xs text-gray-500">{parseRows().length} row(s) parsed — one per line.</p>
          </div>
          <button onClick={doImport} disabled={!assetId.trim() || parseRows().length === 0} className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium disabled:opacity-50">
            Import
          </button>
          {importResult && (
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-green-50 p-4 text-center">
                <p className="text-2xl font-bold text-green-700">{importResult.matchedProducts ?? 0}</p>
                <p className="text-xs text-green-700">products matched</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-4 text-center">
                <p className="text-2xl font-bold text-blue-700">{importResult.createdProducts ?? 0}</p>
                <p className="text-xs text-blue-700">products created</p>
              </div>
            </div>
          )}
          {importErr && <p className="text-sm text-red-600 flex items-center gap-1"><XCircle className="h-4 w-4" /> {importErr}</p>}
        </section>
      )}

      {tab === 'reclamation' && (
        <div className="space-y-6 max-w-2xl">
          <form
            onSubmit={(e) => { e.preventDefault(); submitRequest(); }}
            className="bg-white rounded-xl border border-gray-200 p-5 space-y-3"
          >
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900"><Plus className="h-5 w-5 text-brand-600" /> Request Reclamation</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input placeholder="License ID" value={reqForm.licenseId} onChange={(e) => setReqForm({ ...reqForm, licenseId: e.target.value })} className={inputCls} required />
              <input placeholder="User ID" value={reqForm.userId} onChange={(e) => setReqForm({ ...reqForm, userId: e.target.value })} className={inputCls} required />
              <input type="number" min="0" placeholder="Days since last used" value={reqForm.lastUsedDays} onChange={(e) => setReqForm({ ...reqForm, lastUsedDays: e.target.value })} className={inputCls} required />
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium">Submit Request</button>
              {reqMsg && <span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle className="h-4 w-4" /> {reqMsg}</span>}
              {reqErr && <span className="flex items-center gap-1 text-sm text-red-600"><XCircle className="h-4 w-4" /> {reqErr}</span>}
            </div>
          </form>

          <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900"><FileStack className="h-5 w-5 text-brand-600" /> Confirm Reclamation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input placeholder="Reclamation ID" value={confId} onChange={(e) => setConfId(e.target.value)} className={inputCls} />
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="rounded border-gray-300" />
                Confirm reclaim of this license
              </label>
            </div>
            <button onClick={doConfirm} disabled={!confId.trim()} className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium disabled:opacity-50">Apply Decision</button>
            {confStatus && (
              <p className={`text-sm flex items-center gap-1 ${confirmed ? 'text-green-600' : 'text-orange-600'}`}>
                <CheckCircle className="h-4 w-4" /> Resulting status: <span className="font-semibold">{confStatus}</span>
              </p>
            )}
            {confErr && <p className="text-sm text-red-600 flex items-center gap-1"><XCircle className="h-4 w-4" /> {confErr}</p>}
          </section>
        </div>
      )}

      {tab === 'roster' && (
        <section className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
              <p className="text-3xl font-bold text-brand-700">{seats}</p>
              <p className="text-xs text-gray-500">total seats</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
              <p className="text-3xl font-bold text-red-600">{idleOver30}</p>
              <p className="text-xs text-gray-500">idle over 30 days</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-5 py-3 font-medium">License</th>
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Idle Days</th>
                  <th className="px-5 py-3 font-medium">Allocated At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-4 text-gray-500">No SaaS roster entries.</td></tr>
                )}
                {rows.map((r, i) => (
                  <tr key={r._id || i}>
                    <td className="px-5 py-3 font-medium text-gray-900">{typeof r.license === 'object' ? r.license?.name || r.license?.key : r.licenseName || r.license}</td>
                    <td className="px-5 py-3">{typeof r.user === 'object' ? r.user?.name || r.user?.email : r.userName || r.user}</td>
                    <td className={`px-5 py-3 font-medium ${Number(r.idleDays || 0) > 30 ? 'text-red-600' : 'text-gray-700'}`}>{r.idleDays ?? 0}</td>
                    <td className="px-5 py-3 text-gray-500">{r.allocatedAt ? new Date(r.allocatedAt).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
