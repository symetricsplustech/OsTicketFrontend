import { useState, useEffect } from 'react';
import { Clock, Play, RotateCcw, AlertTriangle, CheckCircle, XCircle, Filter } from 'lucide-react';
import api from '@shared/lib/api';

interface ExecutionLog {
  _id: string;
  workflow: { name: string };
  trigger: string;
  status: string;
  startedAt: string;
  completedAt: string;
  duration: number;
  steps: Array<{
    stepNumber: number;
    name: string;
    action: string;
    status: string;
    error: string;
    startedAt: string;
    completedAt: string;
  }>;
  error: string;
  retryOf: string;
}

export default function WorkflowLogs() {
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [selected, setSelected] = useState<ExecutionLog | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [triggerFilter, setTriggerFilter] = useState('');

  useEffect(() => { loadLogs(); }, [statusFilter, triggerFilter]);

  const loadLogs = async () => {
    try {
      const { data } = await api.get('/platform/workflow-logs', {
        params: { status: statusFilter || undefined, trigger: triggerFilter || undefined }
      });
      setLogs(data);
    } catch {}
  };

  const handleRetry = async (id: string) => {
    try {
      await api.post(`/platform/workflow-logs/${id}/retry`);
      loadLogs();
    } catch {}
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running': return <Play className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'retrying': return <RotateCcw className="h-4 w-4 text-yellow-500 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'failed': return 'bg-red-100 text-red-700';
      case 'running': return 'bg-blue-100 text-blue-700';
      case 'retrying': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  const stepStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'running': return 'text-blue-600';
      case 'skipped': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Clock className="h-6 w-6" /> Workflow Execution Logs</h1>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="running">Running</option>
            <option value="retrying">Retrying</option>
          </select>
        </div>
        <select value={triggerFilter} onChange={e => setTriggerFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">All Triggers</option>
          <option value="ticket_created">Ticket Created</option>
          <option value="ticket_updated">Ticket Updated</option>
          <option value="ticket_closed">Ticket Closed</option>
          <option value="time_based">Time Based</option>
          <option value="manual">Manual</option>
          <option value="alert_created">Alert Created</option>
        </select>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Workflow</th>
                <th className="text-left px-4 py-3 font-medium">Trigger</th>
                <th className="text-left px-4 py-3 font-medium">Started</th>
                <th className="text-left px-4 py-3 font-medium">Duration</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map(log => (
                <tr key={log._id} className={`hover:bg-gray-50 cursor-pointer ${selected?._id === log._id ? 'bg-blue-50' : ''}`} onClick={() => setSelected(log)}>
                  <td className="px-4 py-3"><div className="flex items-center gap-2">{statusIcon(log.status)}<span className={`px-2 py-1 text-xs rounded-full ${statusColor(log.status)}`}>{log.status}</span></div></td>
                  <td className="px-4 py-3 font-medium">{log.workflow?.name || 'Unknown'}</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-gray-100 rounded text-xs">{log.trigger}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(log.startedAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm">{log.duration ? `${log.duration}ms` : '—'}</td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    {log.status === 'failed' && (
                      <button onClick={() => handleRetry(log._id)} className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 bg-blue-50 rounded flex items-center gap-1">
                        <RotateCcw className="h-3 w-3" /> Retry
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No execution logs found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="w-96 bg-white rounded-lg border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Execution Details</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-500">Workflow:</span> <span className="font-medium">{selected.workflow?.name}</span></div>
              <div><span className="text-gray-500">Trigger:</span> <span>{selected.trigger}</span></div>
              <div><span className="text-gray-500">Status:</span> <span className={`px-2 py-1 text-xs rounded-full ${statusColor(selected.status)}`}>{selected.status}</span></div>
              <div><span className="text-gray-500">Started:</span> <span>{new Date(selected.startedAt).toLocaleString()}</span></div>
              {selected.completedAt && <div><span className="text-gray-500">Completed:</span> <span>{new Date(selected.completedAt).toLocaleString()}</span></div>}
              {selected.duration && <div><span className="text-gray-500">Duration:</span> <span>{selected.duration}ms</span></div>}
              {selected.error && <div className="bg-red-50 p-2 rounded text-red-700 text-xs">{selected.error}</div>}
            </div>

            <h4 className="font-medium text-sm border-t pt-3">Steps ({selected.steps?.length || 0})</h4>
            <div className="space-y-2">
              {selected.steps?.map((step, i) => (
                <div key={i} className="border rounded p-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">#{step.stepNumber} {step.name}</span>
                    <span className={stepStatusColor(step.status)}>{step.status}</span>
                  </div>
                  <div className="text-gray-500 mt-1">{step.action}</div>
                  {step.error && <div className="text-red-600 mt-1">{step.error}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
