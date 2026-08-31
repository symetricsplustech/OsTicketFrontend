import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@shared/lib/api';
import { formatDate } from '@shared/lib/format';

interface Account {
  _id: string;
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
  revenue?: number;
  employees?: number;
  status?: string;
  createdAt: string;
}

export default function AccountDetail() {
  const { id } = useParams();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/crm/accounts/${id}`);
        setAccount(res.data.account || res.data);
      } catch {} finally { setLoading(false); }
    };
    load();
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" /></div>;
  if (!account) return <div className="text-center py-12 text-gray-500">Account not found</div>;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/accounts" className="text-sm text-gray-500 hover:text-gray-700">&larr; Back to Accounts</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">{account.name}</h1>
      </div>
      <div className="card p-6">
        <h2 className="font-semibold mb-4">Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">Industry:</span> {account.industry || '—'}</div>
          <div><span className="text-gray-500">Website:</span> {account.website || '—'}</div>
          <div><span className="text-gray-500">Phone:</span> {account.phone || '—'}</div>
          <div><span className="text-gray-500">Email:</span> {account.email || '—'}</div>
          <div><span className="text-gray-500">Revenue:</span> {account.revenue ? `$${account.revenue.toLocaleString()}` : '—'}</div>
          <div><span className="text-gray-500">Employees:</span> {account.employees || '—'}</div>
          <div><span className="text-gray-500">Created:</span> {formatDate(account.createdAt)}</div>
        </div>
      </div>
    </div>
  );
}
