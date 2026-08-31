import api from '@shared/lib/api';
import React, { useEffect, useState } from 'react';
import { Users, CheckCircle, XCircle } from 'lucide-react';

interface Company {
  _id: string;
  name: string;
  tier?: string;
  partnerType?: string;
  portalAccess?: boolean;
  status?: string;
}

interface KnownIssue {
  _id: string;
  title: string;
  severity?: string;
  affectsPartners?: boolean;
  status?: string;
}

export default function PartnerPortal() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [issues, setIssues] = useState<KnownIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [partnerFilter, setPartnerFilter] = useState('all');
  const [promoting, setPromoting] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get('/companies');
      setCompanies(res.data.companies || res.data);
    } catch {
      setCompanies([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const loadIssues = async () => {
      try {
        const res = await api.get('/ops/known-issues');
        setIssues(Array.isArray(res.data) ? res.data : res.data.issues || []);
      } catch {
        setIssues([]);
      }
    };
    loadIssues();
  }, []);

  const filtered =
    partnerFilter === 'all'
      ? companies
      : companies.filter((c) => c.partnerType === partnerFilter);

  const promote = async (company: Company) => {
    const partnerType = selectedType[company._id] || 'partner';
    setActionError(null);
    try {
      await api.put(`/ops/companies/${company._id}/partner-type`, { partnerType, portalAccess: true });
      setPromoting(null);
      await load();
    } catch {
      setActionError('Failed to update partner type.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users className="h-6 w-6 text-brand-600" />
        <h1 className="text-2xl font-bold text-gray-900">Partner Portal</h1>
      </div>

      {issues.filter((i) => i.affectsPartners !== false).map((issue) => (
        <div
          key={issue._id}
          className={`flex items-start gap-3 rounded-xl border p-4 ${
            issue.severity === 'critical' || issue.severity === 'high'
              ? 'bg-red-50 border-red-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}
        >
          <XCircle
            className={`h-5 w-5 shrink-0 ${
              issue.severity === 'critical' || issue.severity === 'high' ? 'text-red-600' : 'text-yellow-600'
            }`}
          />
          <div>
            <p
              className={`text-sm font-semibold ${
                issue.severity === 'critical' || issue.severity === 'high' ? 'text-red-800' : 'text-yellow-800'
              }`}
            >
              {issue.title}
            </p>
            {issue.status && (
              <p className="text-xs mt-0.5 text-gray-500 capitalize">Status: {issue.status}</p>
            )}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Partner Type:</label>
        <select
          value={partnerFilter}
          onChange={(e) => setPartnerFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="all">All</option>
          <option value="partner">Partner</option>
          <option value="reseller">Reseller</option>
          <option value="distributor">Distributor</option>
        </select>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 py-16 text-center">
          <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            {error ? 'Unable to load companies right now.' : 'No companies found for this filter.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((company) => (
                <tr key={company._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">{company.name}</span>
                    {company.partnerType && (
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700 capitalize">
                        {company.partnerType}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 capitalize">{company.tier || '—'}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 text-sm">
                      {company.status === 'active' ? (
                        <><CheckCircle className="h-4 w-4 text-green-500" /><span className="text-green-700 capitalize">{company.status}</span></>
                      ) : (
                        <><XCircle className="h-4 w-4 text-gray-400" /><span className="text-gray-500 capitalize">{company.status || 'unknown'}</span></>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {promoting === company._id ? (
                      <div className="inline-flex items-center gap-2">
                        <select
                          value={selectedType[company._id] || company.partnerType || 'partner'}
                          onChange={(e) =>
                            setSelectedType((prev) => ({ ...prev, [company._id]: e.target.value }))
                          }
                          className="px-2 py-1 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="partner">Partner</option>
                          <option value="reseller">Reseller</option>
                          <option value="distributor">Distributor</option>
                        </select>
                        <button
                          onClick={() => promote(company)}
                          className="px-3 py-1 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setPromoting(null)}
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setActionError(null);
                          setSelectedType((prev) => ({ ...prev, [company._id]: company.partnerType || 'partner' }));
                          setPromoting(company._id);
                        }}
                        className="px-3 py-1.5 border border-brand-300 text-brand-700 rounded-lg hover:bg-brand-50 text-sm font-medium"
                      >
                        Promote
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {actionError && <p className="text-sm text-red-600">{actionError}</p>}
    </div>
  );
}
