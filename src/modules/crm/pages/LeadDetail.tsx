import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@shared/lib/api';
import { formatDate } from '@shared/lib/format';

interface Lead {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  status: string;
  source?: string;
  score?: number;
  assignedTo?: { name: string };
  notes?: string;
  createdAt: string;
}

export default function LeadDetail() {
  const { id } = useParams();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/crm/leads/${id}`);
        setLead(res.data.lead || res.data);
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" /></div>;
  if (!lead) return <div className="text-center py-12 text-gray-500">Lead not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/leads" className="text-sm text-gray-500 hover:text-gray-700">&larr; Back to Leads</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{lead.name}</h1>
        </div>
        <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700">{lead.status}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold mb-4">Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Email:</span> {lead.email || '—'}</div>
              <div><span className="text-gray-500">Phone:</span> {lead.phone || '—'}</div>
              <div><span className="text-gray-500">Company:</span> {lead.company || '—'}</div>
              <div><span className="text-gray-500">Source:</span> {lead.source || '—'}</div>
              <div><span className="text-gray-500">Score:</span> {lead.score ?? '—'}</div>
              <div><span className="text-gray-500">Created:</span> {formatDate(lead.createdAt)}</div>
            </div>
          </div>
          {lead.notes && (
            <div className="card p-6">
              <h2 className="font-semibold mb-2">Notes</h2>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{lead.notes}</p>
            </div>
          )}
        </div>
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold mb-4">Assignment</h2>
            <p className="text-sm text-gray-500">Assigned to: {lead.assignedTo?.name || 'Unassigned'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
