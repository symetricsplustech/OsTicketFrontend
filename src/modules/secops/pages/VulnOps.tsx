import { useImportVulnsDedupeMutation, useGetSpendOptimisationQuery } from '@shared/store/apiEndpoints';
import { useState } from 'react';
import { ShieldCheck, Send, XCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface VulnRow {
  cveId: string;
  title: string;
  severity: string;
  assetId: string;
}

export default function VulnOps() {
  const [tab, setTab] = useState<'import' | 'spend'>('import');
  const [rowsText, setRowsText] = useState('CVE-2024-1234|Example vuln|high|AST-001');
  const [importVulnsDedupe, { isLoading: importing }] = useImportVulnsDedupeMutation();
  const { data: spendOpt, refetch } = useGetSpendOptimisationQuery();

  const [result, setResult] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const parseRows = (): VulnRow[] =>
    rowsText.split('\n').map((l) => l.trim()).filter(Boolean).map((line) => {
      const [cveId, title, severity, assetId] = line.split('|').map((p) => (p || '').trim());
      return { cveId, title: title || '', severity: (severity || 'medium').toLowerCase(), assetId: assetId || '' };
    }).filter((r) => r.cveId);

  const handleImport = async () => {
    setErr(null); setOk(null); setResult(null);
    try {
      const res = await importVulnsDedupe({ vulns: parseRows() }).unwrap();
      setResult(res);
      setOk('Import complete');
    } catch (e: any) {
      setErr(e?.data?.message || 'Import failed');
    }
  };

  const vendors: any[] = (spendOpt as any)?.vendors || [];
  const eosList: any[] = (spendOpt as any)?.eos || (spendOpt as any)?.endOfService || [];
  const hints: string[] = (spendOpt as any)?.hints || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><ShieldCheck className="h-6 w-6" /> Vulnerability Operations</h1>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setTab('import')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === 'import' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Import
        </button>
        <button
          onClick={() => setTab('spend')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === 'spend' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Spend / EOS
        </button>
      </div>

      {(err || ok) && (
        err ? (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-center gap-2"><XCircle className="h-4 w-4" /> {err}</div>
        ) : (
          <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700 flex items-center gap-2"><CheckCircle className="h-4 w-4" /> {ok}</div>
        )
      )}

      {tab === 'import' && (
        <div className="card p-6 space-y-4">
          <p className="text-sm text-gray-500">One vulnerability per line, format: <code className="bg-gray-100 px-1 rounded">cveId|title|severity|assetId</code></p>
          <textarea rows={8} value={rowsText} onChange={(e) => setRowsText(e.target.value)} className="w-full input-field font-mono text-xs" />
          <button onClick={handleImport} disabled={importing} className="btn-primary inline-flex items-center gap-2 disabled:opacity-50">
            <Send className="h-4 w-4" /> {importing ? 'Importing...' : 'Import with Dedupe'}
          </button>

          {result && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                ['Imported', result.imported ?? 0, 'bg-green-100 text-green-700'],
                ['Duplicates', result.dupes ?? result.duplicates ?? 0, 'bg-yellow-100 text-yellow-800'],
                ['Matched', result.matched ?? 0, 'bg-indigo-100 text-indigo-700'],
              ].map(([label, val, cls]) => (
                <div key={String(label)} className={`rounded-lg p-4 ${cls}`}>
                  <p className="text-xs uppercase tracking-wide opacity-75">{label}</p>
                  <p className="text-2xl font-bold">{val}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'spend' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={() => refetch()} className="btn-secondary inline-flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Reload
            </button>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold mb-4">Vendor Spend</h2>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="py-2 pr-4">Vendor</th>
                  <th className="py-2 pr-4">Spend</th>
                  <th className="py-2">Licenses / Notes</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v, i) => (
                  <tr key={v._id || i} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium">{v.vendor || v.name}</td>
                    <td className="py-2 pr-4">{v.spend ?? v.amount ?? '—'}</td>
                    <td className="py-2 text-gray-500">{v.licenses ?? v.notes ?? '—'}</td>
                  </tr>
                ))}
                {!vendors.length && <tr><td colSpan={3} className="py-3 text-gray-500">No vendor data.</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h2 className="font-semibold mb-4">End of Service List</h2>
              <ul className="space-y-2 text-sm">
                {eosList.map((e: any, i) => (
                  <li key={i} className="flex justify-between border-b last:border-0 pb-2">
                    <span className="text-gray-800">{e.product || e.name || e.vendor}</span>
                    <span className="text-gray-500">{e.eosDate ? new Date(e.eosDate).toLocaleDateString() : e.date || ''}</span>
                  </li>
                ))}
                {!eosList.length && <li className="text-gray-500">Nothing at end-of-service.</li>}
              </ul>
            </div>
            <div className="card p-6">
              <h2 className="font-semibold mb-4">Hints</h2>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                {hints.map((h, i) => <li key={i}>{typeof h === 'string' ? h : JSON.stringify(h)}</li>)}
                {!hints.length && <li className="text-gray-500">No hints available.</li>}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
