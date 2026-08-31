import { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import { useSearchParams } from 'react-router-dom';
import { FileSignature, Plus, CheckCircle, XCircle, Link2 } from 'lucide-react';

interface ESignRequest {
  id: number;
  entityType?: string;
  entityId?: string | number;
  documentTitle: string;
  signerName: string;
  signerEmail: string;
  status: string;
  signedAt?: string | null;
  provider?: string;
}

const statusBadge = (status: string) => {
  if (status === 'signed') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (status === 'sent' || status === 'pending') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  return 'bg-red-100 text-red-700 border-red-200';
};

function SignerView({ token }: { token: string }) {
  const [doc, setDoc] = useState<any>(null);
  const [typedName, setTypedName] = useState('');
  const [signing, setSigning] = useState(false);
  const [signedResult, setSignedResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/ops/esign/public/' + token)
      .then((res: any) => {
        if (!cancelled) setDoc(res.data);
      })
      .catch(() => {
        if (!cancelled) setLoadError('This signing link is invalid or no longer available.');
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const signDocument = async () => {
    setSigning(true);
    setError(null);
    try {
      const res = await api.post('/ops/esign/public/' + token + '/sign', { typedName });
      if (res.data?.signed) {
        setSignedResult(res.data);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Unable to sign this document.');
    } finally {
      setSigning(false);
    }
  };

  if (loadError) {
    return (
      <div className="max-w-xl mx-auto mt-16 bg-white rounded-xl shadow p-8 text-center">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-700">{loadError}</p>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="max-w-xl mx-auto mt-16 text-center text-gray-500">
        <FileSignature className="h-10 w-10 mx-auto animate-pulse" />
        <p className="mt-3">Loading document...</p>
      </div>
    );
  }

  if (signedResult || doc.status !== 'sent') {
    const status = signedResult ? 'signed' : doc.status;
    return (
      <div className="max-w-xl mx-auto mt-16 bg-white rounded-xl shadow p-8">
        <div className="flex items-center gap-2 mb-6">
          <FileSignature className="h-6 w-6 text-indigo-600" />
          <h1 className="text-xl font-semibold text-gray-900">{doc.documentTitle}</h1>
        </div>
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${statusBadge(status)}`}>
          {status === 'signed' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
        {status === 'signed' && (
          <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-lg p-5">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold mb-3">
              <CheckCircle className="h-5 w-5" />
              Document Signed Successfully
            </div>
            <dl className="space-y-2 text-sm">
              {signedResult?.hash && (
                <div>
                  <dt className="text-emerald-700 font-medium">Signature Hash</dt>
                  <dd className="font-mono text-xs break-all bg-white border border-emerald-200 rounded px-2 py-1 mt-0.5">
                    {signedResult.hash}
                  </dd>
                </div>
              )}
              {(signedResult?.signedAt || doc.signedAt) && (
                <div>
                  <dt className="text-emerald-700 font-medium">Signed At</dt>
                  <dd className="text-gray-700">{new Date(signedResult?.signedAt || doc.signedAt).toLocaleString()}</dd>
                </div>
              )}
            </dl>
          </div>
        )}
        {status !== 'signed' && (
          <p className="mt-4 text-sm text-gray-600">
            This document is currently marked as <span className="font-semibold">{status}</span> and cannot be signed.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-16">
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center gap-2">
          <FileSignature className="h-6 w-6 text-indigo-600" />
          <h1 className="text-xl font-semibold text-gray-900">{doc.documentTitle}</h1>
        </div>
        <div className="px-8 py-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Signer</span>
            <span className="font-medium text-gray-900">{doc.signerEmail}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Status</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusBadge(doc.status)}`}>
              {doc.status}
            </span>
          </div>
        </div>
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">Type your full name to sign</label>
          <input
            type="text"
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            placeholder="Your full legal name"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
          {error && (
            <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <XCircle className="h-4 w-4 shrink-0" />
              {error === 'name_mismatch'
                ? 'The typed name does not match the signer name on file.'
                : error === 'expired'
                  ? 'This signing request has expired.'
                  : error === 'already_signed'
                    ? 'This document has already been signed.'
                    : error}
            </div>
          )}
          <button
            onClick={signDocument}
            disabled={signing || !typedName.trim()}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition"
          >
            <FileSignature className="h-4 w-4" />
            {signing ? 'Signing...' : 'Sign Document'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ESignatures() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [requests, setRequests] = useState<ESignRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    entityType: 'quote',
    entityId: '',
    documentTitle: '',
    signerName: '',
    signerEmail: '',
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [signUrl, setSignUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(true);
      api
        .get('/ops/esign/requests')
        .then((res: any) => setRequests(res.data?.requests || res.data || []))
        .catch(() => setRequests([]))
        .finally(() => setLoading(false));
    }
  }, [token]);

  if (token) return <SignerView token={token} />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    setSignUrl(null);
    try {
      const res = await api.post('/ops/esign/requests', form);
      setSignUrl(res.data?.signUrl);
      setForm({ entityType: 'quote', entityId: '', documentTitle: '', signerName: '', signerEmail: '' });
      const refreshed = await api.get('/ops/esign/requests');
      setRequests(refreshed.data?.requests || refreshed.data || []);
    } catch (err: any) {
      setCreateError(err?.response?.data?.error || 'Failed to create signature request.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSignature className="h-7 w-7 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">E-Signatures</h1>
        </div>
        <span className="text-sm text-gray-500">{requests.length} requests</span>
      </div>

      {signUrl && (
        <div className="bg-white rounded-xl shadow border border-emerald-200 p-5">
          <div className="flex items-center gap-2 text-emerald-700 font-semibold mb-3">
            <Link2 className="h-5 w-5" />
            Signature Request Created
          </div>
          <pre className="bg-gray-900 text-emerald-300 text-xs rounded-lg p-4 overflow-x-auto whitespace-pre-wrap break-all">
            {signUrl}
          </pre>
          <p className="mt-2 text-xs text-gray-600">Send this link to the signer</p>
        </div>
      )}

      <form onSubmit={submit} className="bg-white rounded-xl shadow p-6 grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Entity Type</label>
          <select
            value={form.entityType}
            onChange={(e) => setForm({ ...form, entityType: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            <option value="quote">Quote</option>
            <option value="contract">Contract</option>
            <option value="work_order">Work Order</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Entity ID</label>
          <input
            type="text"
            required
            value={form.entityId}
            onChange={(e) => setForm({ ...form, entityId: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Document Title</label>
          <input
            type="text"
            required
            value={form.documentTitle}
            onChange={(e) => setForm({ ...form, documentTitle: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Signer Name</label>
          <input
            type="text"
            required
            value={form.signerName}
            onChange={(e) => setForm({ ...form, signerName: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Signer Email</label>
          <input
            type="email"
            required
            value={form.signerEmail}
            onChange={(e) => setForm({ ...form, signerEmail: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
        >
          <Plus className="h-4 w-4" />
          {creating ? 'Creating...' : 'Create Request'}
        </button>
        {createError && (
          <p className="md:col-span-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{createError}</p>
        )}
      </form>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Document</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Signer</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Signed At</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Provider</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">
                  Loading requests...
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">
                  No signature requests yet.
                </td>
              </tr>
            ) : (
              requests.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{r.documentTitle}</td>
                  <td className="px-6 py-3 text-sm">
                    <div className="text-gray-900">{r.signerName}</div>
                    <div className="text-gray-500">{r.signerEmail}</div>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${statusBadge(r.status)}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {r.signedAt ? new Date(r.signedAt).toLocaleString() : '—'}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600 capitalize">{r.provider || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
