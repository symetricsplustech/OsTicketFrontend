import api from '@shared/lib/api';
import React, { useCallback, useEffect, useState } from 'react';
import { Ticket as TicketIcon } from 'lucide-react';

interface Ticket {
  _id: string;
  number: string;
  subject?: string;
  title?: string;
  status: string;
  priority: string;
}

const COLUMNS = ['new', 'open', 'pending', 'resolved', 'closed'] as const;

const STATUS_TO_COLUMN: Record<string, (typeof COLUMNS)[number]> = {
  new: 'new',
  open: 'open',
  assigned: 'open',
  active: 'open',
  in_progress: 'open',
  pending: 'pending',
  on_hold: 'pending',
  waiting: 'pending',
  resolved: 'resolved',
  closed: 'closed',
  archived: 'closed',
};

function nearestColumn(status: string): (typeof COLUMNS)[number] {
  return STATUS_TO_COLUMN[status?.toLowerCase?.() ?? ''] ?? 'open';
}

export default function TicketBoard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/tickets');
      const data = res.data;
      setTickets(Array.isArray(data) ? data : data.tickets || []);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDrop = async (column: string, event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(null);
    const id = event.dataTransfer.getData('text/plain');
    if (!id) return;
    setMovingId(id);
    try {
      await api.post('/bulk/status', { ticketIds: [id], status: column });
      await load();
    } catch {
      await load();
    } finally {
      setMovingId(null);
    }
  };

  const columns: Record<string, Ticket[]> = {};
  COLUMNS.forEach((col) => { columns[col] = []; });
  tickets.forEach((t) => { columns[nearestColumn(t.status)].push(t); });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TicketIcon className="h-6 w-6 text-brand-600" />
          <h1 className="text-2xl font-bold text-gray-900">Ticket Board</h1>
        </div>
        <span className="text-sm text-gray-500">{tickets.length} tickets</span>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {COLUMNS.map((col) => (
            <div
              key={col}
              onDragOver={(e) => { e.preventDefault(); setDragOver(col); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(col, e)}
              className={`rounded-xl border p-3 min-h-[300px] transition-colors ${
                dragOver === col ? 'border-brand-400 bg-brand-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700 capitalize">{col}</span>
                <span className="px-2 py-0.5 text-xs font-medium bg-white border border-gray-200 rounded-full text-gray-600">
                  {columns[col].length}
                </span>
              </div>
              <div className="space-y-2">
                {columns[col].map((ticket) => (
                  <div
                    key={ticket._id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', ticket._id)}
                    className={`bg-white rounded-lg border border-gray-200 shadow-sm p-3 cursor-grab active:cursor-grabbing hover:shadow-md ${
                      movingId === ticket._id ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-gray-500">#{ticket.number}</span>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          ticket.priority === 'urgent' || ticket.priority === 'high' || ticket.priority === 'emergency'
                            ? 'bg-red-100 text-red-700'
                            : ticket.priority === 'normal' || ticket.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {ticket.priority}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate">{ticket.subject || ticket.title}</p>
                    <p className="mt-1 text-xs text-gray-400 capitalize">{ticket.status}</p>
                  </div>
                ))}
                {columns[col].length === 0 && (
                  <div className="text-center py-8 text-xs text-gray-400">Drop tickets here</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
