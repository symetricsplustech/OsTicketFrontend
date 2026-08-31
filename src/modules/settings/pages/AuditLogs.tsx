import React, { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import { formatDateTime } from '@shared/lib/format';

interface AuditEntry {
  _id: string;
  actor?: { name: string; email: string };
  action: string;
  entity: string;
  entityId: string;
  ip: string;
  userAgent?: string;
  createdAt: string;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/enterprise/audit', { params: { page, limit: 50 } });
        setLogs(res.data.logs || []);
        setTotal(res.data.total || 0);
      } catch {
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Loading...</td></tr> :
              logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{log.actor?.name || 'System'}</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{log.action}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{log.entity} {log.entityId && <span className="text-xs">({log.entityId.slice(-6)})</span>}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">{log.ip}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(log.createdAt)}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
        {total > 50 && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between text-sm">
            <span className="text-gray-500">Page {page} of {Math.ceil(total / 50)}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page * 50 >= total} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
