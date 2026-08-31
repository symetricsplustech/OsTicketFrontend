import api from '@shared/lib/api';
import React, { useEffect, useState } from 'react';
import { Shield, ShieldCheck, FileText, Clock, CheckCircle, Plus } from 'lucide-react';

interface Policy {
  _id: string;
  name?: string;
  title?: string;
  acknowledged: boolean;
}

interface DocumentItem {
  _id: string;
  name: string;
  category: string;
}

interface PortalRequest {
  _id: string;
  type: string;
  purpose: string;
  status: string;
  createdAt?: string;
}

interface PortalData {
  policies: Policy[];
  documents: DocumentItem[];
  requests: PortalRequest[];
}

const REQUEST_TYPES = [
  { value: 'employment_letter', label: 'Employment Letter' },
  { value: 'salary_certificate', label: 'Salary Certificate' },
  { value: 'experience_letter', label: 'Experience Letter' },
  { value: 'other', label: 'Other' },
];

export default function EmployeePortal() {
  const [data, setData] = useState<PortalData>({ policies: [], documents: [], requests: [] });
  const [loading, setLoading] = useState(true);
  const [ackPending, setAckPending] = useState<string | null>(null);
  const [type, setType] = useState('employment_letter');
  const [purpose, setPurpose] = useState('');
  const [requestMsg, setRequestMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get('/ops/portal/me');
        setData({
          policies: res.data.policies || [],
          documents: res.data.documents || [],
          requests: res.data.requests || [],
        });
      } catch {
        setData({ policies: [], documents: [], requests: [] });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const acknowledge = async (id: string) => {
    setAckPending(id);
    try {
      await api.post(`/ops/policies/${id}/acknowledge`);
      setData((prev) => ({
        ...prev,
        policies: prev.policies.map((p) => (p._id === id ? { ...p, acknowledged: true } : p)),
      }));
    } catch {
      setRequestMsg({ ok: false, text: 'Failed to acknowledge policy.' });
    } finally {
      setAckPending(null);
    }
  };

  const submitRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!purpose.trim()) return;
    setSubmitting(true);
    setRequestMsg(null);
    try {
      await api.post('/extra/document-requests', { type, purpose });
      setPurpose('');
      setRequestMsg({ ok: true, text: 'Document request submitted.' });
      const res = await api.get('/ops/portal/me');
      setData({
        policies: res.data.policies || [],
        documents: res.data.documents || [],
        requests: res.data.requests || [],
      });
    } catch {
      setRequestMsg({ ok: false, text: 'Failed to submit document request.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Employee Portal</h1>

      {loading ? (
        <div className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto" />
        </div>
      ) : (
        <>
          <section className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
              <Shield className="h-5 w-5 text-brand-600" />
              My Policies
            </h2>
            {data.policies.length === 0 ? (
              <p className="text-sm text-gray-500">No policies assigned.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {data.policies.map((policy) => (
                  <li key={policy._id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                      {policy.acknowledged ? (
                        <ShieldCheck className="h-5 w-5 text-green-600" />
                      ) : (
                        <Shield className="h-5 w-5 text-gray-300" />
                      )}
                      <span className="text-sm text-gray-900">{policy.name || policy.title}</span>
                    </div>
                    {policy.acknowledged ? (
                      <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                        <CheckCircle className="h-3.5 w-3.5" /> Acknowledged
                      </span>
                    ) : (
                      <button
                        onClick={() => acknowledge(policy._id)}
                        disabled={ackPending === policy._id}
                        className="px-3 py-1.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium disabled:opacity-50"
                      >
                        {ackPending === policy._id ? 'Acknowledging...' : 'Acknowledge'}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
              <FileText className="h-5 w-5 text-brand-600" />
              My Documents
            </h2>
            {data.documents.length === 0 ? (
              <p className="text-sm text-gray-500">No documents available.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {data.documents.map((doc) => (
                  <li key={doc._id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-900">{doc.name}</span>
                    </div>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">{doc.category}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Clock className="h-5 w-5 text-brand-600" />
              My Requests
            </h2>
            {data.requests.length === 0 ? (
              <p className="text-sm text-gray-500">No requests yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {data.requests.map((req) => (
                  <li key={req._id} className="flex items-center justify-between py-3">
                    <div>
                      <span className="text-sm font-medium text-gray-900 capitalize">{req.type.replace(/_/g, ' ')}</span>
                      <p className="text-xs text-gray-500">{req.purpose}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        req.status === 'approved' || req.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : req.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : req.status === 'processing'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {req.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={submitRequest} className="border-t border-gray-200 pt-4 flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {REQUEST_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-gray-500 mb-1">Purpose</label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Why do you need this document?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <button
                type="submit"
                disabled={submitting || !purpose.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Request Document
              </button>
            </form>
            {requestMsg && (
              <p className={`text-sm ${requestMsg.ok ? 'text-green-600' : 'text-red-600'}`}>{requestMsg.text}</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
