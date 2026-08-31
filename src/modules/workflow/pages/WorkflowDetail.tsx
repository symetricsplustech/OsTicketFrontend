import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@shared/lib/api';
import { formatDateTime } from '@shared/lib/format';

interface Workflow {
  _id: string;
  name: string;
  description?: string;
  event: string;
  status: string;
  conditions: Array<{ field: string; operator: string; value: string }>;
  actions: Array<{ type: string; config: Record<string, unknown> }>;
  createdBy?: { name: string };
  createdAt: string;
  updatedAt: string;
}

export default function WorkflowDetail() {
  const { id } = useParams();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/enterprise/workflows/${id}`);
        setWorkflow(res.data.workflow || res.data);
      } catch {} finally { setLoading(false); }
    };
    load();
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" /></div>;
  if (!workflow) return <div className="text-center py-12 text-gray-500">Workflow not found</div>;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/workflows" className="text-sm text-gray-500 hover:text-gray-700">&larr; Back to Workflows</Link>
        <div className="flex items-center justify-between mt-1">
          <h1 className="text-2xl font-bold text-gray-900">{workflow.name}</h1>
          <span className={`px-3 py-1 text-sm rounded-full ${workflow.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{workflow.status}</span>
        </div>
        {workflow.description && <p className="text-gray-500 mt-1">{workflow.description}</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold mb-3">Trigger</h2>
          <p className="text-sm text-gray-600">{workflow.event}</p>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold mb-3">Info</h2>
          <div className="space-y-2 text-sm">
            <div><span className="text-gray-500">Created by:</span> {workflow.createdBy?.name || '—'}</div>
            <div><span className="text-gray-500">Created:</span> {formatDateTime(workflow.createdAt)}</div>
            <div><span className="text-gray-500">Updated:</span> {formatDateTime(workflow.updatedAt)}</div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold mb-3">Conditions ({workflow.conditions?.length || 0})</h2>
          {workflow.conditions?.length > 0 ? (
            <div className="space-y-2">
              {workflow.conditions.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-3 py-2">
                  <span className="font-medium">{c.field}</span>
                  <span className="text-gray-400">{c.operator}</span>
                  <span className="text-gray-600">{c.value}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400">No conditions</p>}
        </div>

        <div className="card p-6">
          <h2 className="font-semibold mb-3">Actions ({workflow.actions?.length || 0})</h2>
          {workflow.actions?.length > 0 ? (
            <div className="space-y-2">
              {workflow.actions.map((a, i) => (
                <div key={i} className="bg-gray-50 rounded-lg px-3 py-2 text-sm">
                  <span className="font-medium">{a.type}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400">No actions</p>}
        </div>
      </div>
    </div>
  );
}
