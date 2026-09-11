import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, Pause } from 'lucide-react';
import api from '@shared/lib/api';

interface SlaItem {
  _id: string;
  name: string;
  type: string;
  status: string;
  dueAt: string;
  startedAt?: string;
  breachedAt?: string;
  completedAt?: string;
  pauseCount: number;
}

interface Props {
  taskId: string;
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  active: <Clock className="h-4 w-4 text-blue-500" />,
  paused: <Pause className="h-4 w-4 text-yellow-500" />,
  achieved: <CheckCircle className="h-4 w-4 text-green-500" />,
  breached: <AlertTriangle className="h-4 w-4 text-red-500" />,
  cancelled: <Clock className="h-4 w-4 text-gray-400" />,
  pending: <Clock className="h-4 w-4 text-gray-400" />,
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-blue-50 text-blue-700',
  paused: 'bg-yellow-50 text-yellow-700',
  achieved: 'bg-green-50 text-green-700',
  breached: 'bg-red-50 text-red-700',
  cancelled: 'bg-gray-50 text-gray-500',
  pending: 'bg-gray-50 text-gray-500',
};

function getTimeRemaining(dueAt: string): string {
  const now = new Date();
  const due = new Date(dueAt);
  const diff = due.getTime() - now.getTime();
  if (diff <= 0) return 'Breached';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  return `${hours}h ${minutes}m`;
}

export default function SlaPanel({ taskId }: Props) {
  const [slas, setSlas] = useState<SlaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/core/tasks/${taskId}`);
        setSlas(res.data.slas || []);
      } catch {
        setSlas([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [taskId]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="font-semibold text-gray-900 mb-4">SLA ({slas.length})</h2>

      {loading ? (
        <div className="text-sm text-gray-400">Loading...</div>
      ) : slas.length === 0 ? (
        <div className="text-sm text-gray-400">No SLAs</div>
      ) : (
        <div className="space-y-3">
          {slas.map((sla) => (
            <div key={sla._id} className="p-3 rounded-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {STATUS_ICONS[sla.status]}
                  <span className="text-sm font-medium text-gray-900">{sla.name}</span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[sla.status]}`}>
                    {sla.status}
                  </span>
                </div>
                <span className="text-xs text-gray-500 capitalize">{sla.type}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span>Due: {new Date(sla.dueAt).toLocaleString()}</span>
                <span className={sla.status === 'breached' ? 'text-red-600 font-medium' : ''}>
                  {sla.status === 'active' ? getTimeRemaining(sla.dueAt) : sla.status === 'breached' ? 'Breached' : sla.status}
                </span>
              </div>
              {sla.pauseCount > 0 && (
                <div className="mt-1 text-xs text-gray-400">Paused {sla.pauseCount} time{sla.pauseCount !== 1 ? 's' : ''}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
