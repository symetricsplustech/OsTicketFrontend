import { useScanAssetAuditBatchMutation, useReportLostAssetMutation, useGetSpendOptimisationQuery } from '@shared/store/apiEndpoints';
import { useState } from 'react';
import { ScanBarcode, Send, CheckCircle, XCircle } from 'lucide-react';

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';

const splitIds = (text: string) =>
  text
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

export default function AuditScanner() {
  const [scanAssetAuditBatch] = useScanAssetAuditBatchMutation();
  const [reportLostAsset] = useReportLostAssetMutation();
  const { data: spendData, isLoading: spendLoading } = useGetSpendOptimisationQuery();

  const [expectedText, setExpectedText] = useState('');
  const [scannedText, setScannedText] = useState('');
  const [scanResult, setScanResult] = useState<{ missing: string[]; unexpected: string[]; matched: string[] } | null>(null);
  const [scanErr, setScanErr] = useState('');
  const [scanBusy, setScanBusy] = useState(false);

  const [lostForm, setLostForm] = useState({ assetId: '', type: 'lost', policeRef: '' });
  const [lostErr, setLostErr] = useState('');
  const [lostMsg, setLostMsg] = useState('');
  const [lostBusy, setLostBusy] = useState(false);

  const vendors: any[] = spendData?.spendByVendor ?? [];
  const endOfSupportList: any[] = spendData?.endOfSupportList ?? [];
  const hints: any[] = spendData?.optimisationHints ?? [];

  const runScan = async () => {
    setScanErr('');
    setScanBusy(true);
    const expectedIds = splitIds(expectedText);
    const scannedIds = splitIds(scannedText);
    try {
      const res: any = await scanAssetAuditBatch({ expectedIds, scannedIds }).unwrap();
      const missing: string[] = res?.missing ?? expectedIds.filter((id) => !scannedIds.includes(id));
      const unexpected: string[] = res?.unexpected ?? scannedIds.filter((id) => !expectedIds.includes(id));
      const matched: string[] = res?.matched ?? scannedIds.filter((id) => expectedIds.includes(id));
      setScanResult({ missing, unexpected, matched });
    } catch (err: any) {
      setScanErr(err?.data?.error || err?.data?.message || 'Batch scan failed.');
    } finally {
      setScanBusy(false);
    }
  };

  const submitLost = async (e: React.FormEvent) => {
    e.preventDefault();
    setLostErr('');
    setLostMsg('');
    setLostBusy(true);
    try {
      const res: any = await reportLostAsset({
        assetId: lostForm.assetId.trim(),
        type: lostForm.type,
        policeRef: lostForm.policeRef.trim() || undefined,
      }).unwrap();
      const number =
        res?.securityIncident?.number ??
        res?.securityIncidentNumber ??
        res?.incidentNumber ??
        res?.number;
      setLostMsg(number ? `Security incident ${number} created.` : 'Loss report submitted.');
      setLostForm({ assetId: '', type: 'lost', policeRef: '' });
    } catch (err: any) {
      setLostErr(err?.data?.error || err?.data?.message || 'Failed to submit loss report.');
    } finally {
      setLostBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ScanBarcode className="h-6 w-6 text-brand-600" />
        <h1 className="text-2xl font-bold text-gray-900">Audit Scanner</h1>
      </div>

      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Batch Scan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected IDs</label>
            <textarea
              rows={5}
              placeholder={'AST-001\nAST-002\nAST-003'}
              value={expectedText}
              onChange={(e) => setExpectedText(e.target.value)}
              className={`${inputCls} font-mono`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Scanned IDs</label>
            <textarea
              rows={5}
              placeholder={'AST-002\nAST-003\nAST-999'}
              value={scannedText}
              onChange={(e) => setScannedText(e.target.value)}
              className={`${inputCls} font-mono`}
            />
          </div>
        </div>
        <button
          onClick={runScan}
          disabled={scanBusy || !splitIds(scannedText).length}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium disabled:opacity-50"
        >
          <Send className="h-4 w-4" /> {scanBusy ? 'Scanning…' : 'Scan'}
        </button>
        {scanErr && <p className="text-sm text-red-600">{scanErr}</p>}
        {scanResult && (
          <div className="space-y-3 border-t border-gray-100 pt-3">
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="inline-flex items-center gap-1 font-medium text-red-600">
                <XCircle className="h-4 w-4" /> Missing: {scanResult.missing.length}
              </span>
              <span className="inline-flex items-center gap-1 font-medium text-red-600">
                <XCircle className="h-4 w-4" /> Unexpected: {scanResult.unexpected.length}
              </span>
              <span className="inline-flex items-center gap-1 font-medium text-green-600">
                <CheckCircle className="h-4 w-4" /> Matched: {scanResult.matched.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {scanResult.matched.map((id) => (
                <span key={`m-${id}`} className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">{id}</span>
              ))}
              {scanResult.missing.map((id) => (
                <span key={`x-${id}`} className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">{id}</span>
              ))}
              {scanResult.unexpected.map((id) => (
                <span key={`u-${id}`} className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">{id}</span>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 max-w-2xl">
        <h2 className="font-semibold text-gray-900">Report Lost / Stolen</h2>
        <form onSubmit={submitLost} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            required
            placeholder="Asset ID"
            value={lostForm.assetId}
            onChange={(e) => setLostForm({ ...lostForm, assetId: e.target.value })}
            className={inputCls}
          />
          <select
            value={lostForm.type}
            onChange={(e) => setLostForm({ ...lostForm, type: e.target.value })}
            className={inputCls}
          >
            <option value="lost">lost</option>
            <option value="stolen">stolen</option>
            <option value="damaged">damaged</option>
          </select>
          <input
            placeholder="Police reference (optional)"
            value={lostForm.policeRef}
            onChange={(e) => setLostForm({ ...lostForm, policeRef: e.target.value })}
            className={inputCls}
          />
          <button
            type="submit"
            disabled={lostBusy}
            className="md:col-span-3 inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium disabled:opacity-50"
          >
            <Send className="h-4 w-4" /> {lostBusy ? 'Submitting…' : 'Submit Report'}
          </button>
        </form>
        {lostErr && <p className="text-sm text-red-600">{lostErr}</p>}
        {!lostErr && lostMsg && (
          <p className="inline-flex items-center gap-1 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" /> {lostMsg}
          </p>
        )}
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Spend & End of Support</h2>
        {spendLoading ? (
          <p className="text-sm text-gray-400 animate-pulse">Loading spend data…</p>
        ) : vendors.length === 0 && endOfSupportList.length === 0 && hints.length === 0 ? (
          <p className="text-sm text-gray-500">No spend optimisation data available.</p>
        ) : (
          <div className="space-y-5">
            {vendors.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Vendor</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Spend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {vendors.map((v, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2 text-sm text-gray-900">{v.vendor ?? v.name ?? '—'}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">${Number(v.spend ?? v.total ?? v.amount ?? 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {endOfSupportList.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">End of Support</h3>
                <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
                  {endOfSupportList.map((e, i) => (
                    <li key={i} className="flex items-center justify-between px-4 py-2 text-sm">
                      <span className="text-gray-900">{e.name ?? e.product ?? e.asset ?? '—'}</span>
                      <span className="text-gray-500">{e.endOfSupport ?? e.eolDate ?? e.eosDate ?? '—'}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {hints.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">Optimisation Hints</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {hints.map((h, i) => (
                    <li key={i} className="text-sm text-gray-700">
                      {typeof h === 'string' ? h : h?.hint || h?.text || JSON.stringify(h)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
