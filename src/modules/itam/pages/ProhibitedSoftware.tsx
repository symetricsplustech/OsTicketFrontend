import { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import { ShieldAlert, Plus, Trash2, Ban, ScanLine, CheckCircle, XCircle } from 'lucide-react';

interface Rule {
  id: number;
  name: string;
  vendor?: string;
  matchType: string;
  severity: string;
  reason?: string;
}

interface Violation {
  software: string;
  version?: string;
  ruleName?: string;
  severity: string;
  reason?: string;
}

interface ScanResult {
  scanned?: number;
  rulesCount?: number;
  rules?: number;
  violationCount?: number;
  violations?: Violation[];
}

const severityBadge = (severity: string) =>
  severity === 'violation'
    ? 'bg-red-100 text-red-700 border-red-200'
    : 'bg-yellow-100 text-yellow-700 border-yellow-200';

export default function ProhibitedSoftware() {
  const [tab, setTab] = useState<'rules' | 'scan'>('rules');
  const [rules, setRules] = useState<Rule[]>([]);
  const [loadingRules, setLoadingRules] = useState(true);
  const [form, setForm] = useState({ name: '', vendor: '', matchType: 'exact', severity: 'warning', reason: '' });
  const [creating, setCreating] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const loadRules = () => {
    setLoadingRules(true);
    api
      .get('/ops/prohibited-software')
      .then((res: any) => setRules(res.data?.rules || res.data || []))
      .catch(() => setRules([]))
      .finally(() => setLoadingRules(false));
  };

  useEffect(() => {
    loadRules();
  }, []);

  const createRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/ops/prohibited-software', form);
      setForm({ name: '', vendor: '', matchType: 'exact', severity: 'warning', reason: '' });
      loadRules();
    } finally {
      setCreating(false);
    }
  };

  const deleteRule = async (id: number) => {
    await api.delete('/ops/prohibited-software/' + id);
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const runScan = async () => {
    setScanning(true);
    try {
      const res = await api.post('/ops/prohibited-software/scan');
      setScanResult(res.data);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Ban className="h-7 w-7 text-red-600" />
        <h1 className="text-2xl font-bold text-gray-900">Prohibited Software</h1>
      </div>

      <div className="border-b border-gray-200 flex gap-1">
        {(['rules', 'scan'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition ${
              tab === t
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'rules' ? 'Rules' : (
              <span className="inline-flex items-center gap-1.5">
                <ScanLine className="h-4 w-4" />
                Scan
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'rules' && (
        <div className="space-y-6">
          <form onSubmit={createRule} className="bg-white rounded-xl shadow p-6 grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Vendor</label>
              <input
                type="text"
                value={form.vendor}
                onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Match Type</label>
              <select
                value={form.matchType}
                onChange={(e) => setForm({ ...form, matchType: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                <option value="exact">Exact</option>
                <option value="contains">Contains</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Severity</label>
              <select
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                <option value="warning">Warning</option>
                <option value="violation">Violation</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Reason</label>
              <input
                type="text"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
            >
              <Plus className="h-4 w-4" />
              {creating ? 'Adding...' : 'Add Rule'}
            </button>
          </form>

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vendor</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Match Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Severity</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loadingRules ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400">
                      Loading rules...
                    </td>
                  </tr>
                ) : rules.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400">
                      No prohibited software rules defined.
                    </td>
                  </tr>
                ) : (
                  rules.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{r.name}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{r.vendor || '—'}</td>
                      <td className="px-6 py-3 text-sm text-gray-600 capitalize">{r.matchType}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${severityBadge(r.severity)}`}>
                          {r.severity === 'violation' ? <XCircle className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
                          {r.severity}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">{r.reason || '—'}</td>
                      <td className="px-6 py-3 text-right">
                        <button
                          onClick={() => deleteRule(r.id)}
                          title="Delete rule"
                          className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'scan' && (
        <div className="space-y-6">
          <div className="flex justify-center">
            <button
              onClick={runScan}
              disabled={scanning}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl text-base font-semibold shadow transition"
            >
              <ScanLine className={`h-5 w-5 ${scanning ? 'animate-pulse' : ''}`} />
              {scanning ? 'Scanning...' : 'Run Scan'}
            </button>
          </div>

          {scanResult && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow p-5 flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Scanned</p>
                    <p className="text-2xl font-bold text-gray-900">{scanResult.scanned ?? 0}</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow p-5 flex items-center gap-3">
                  <ShieldAlert className="h-6 w-6 text-indigo-600" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Rules</p>
                    <p className="text-2xl font-bold text-gray-900">{scanResult.rulesCount ?? scanResult.rules ?? 0}</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow p-5 flex items-center gap-3">
                  <Ban className={`h-6 w-6 ${((scanResult.violationCount ?? scanResult.violations?.length) ?? 0) > 0 ? 'text-red-600' : 'text-gray-400'}`} />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Violations</p>
                    <p className={`text-2xl font-bold ${((scanResult.violationCount ?? scanResult.violations?.length) ?? 0) > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      {scanResult.violationCount ?? scanResult.violations?.length ?? 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Software</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Version</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Matched Rule</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Severity</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(scanResult.violations || []).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">
                          No violations detected.
                        </td>
                      </tr>
                    ) : (
                      (scanResult.violations || []).map((v, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-6 py-3 text-sm font-medium text-gray-900">{v.software}</td>
                          <td className="px-6 py-3 text-sm text-gray-600">{v.version || '—'}</td>
                          <td className="px-6 py-3 text-sm text-gray-600">{v.ruleName || '—'}</td>
                          <td className="px-6 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${severityBadge(v.severity)}`}>
                              {v.severity === 'violation' ? <XCircle className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
                              {v.severity}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-600">{v.reason || '—'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
