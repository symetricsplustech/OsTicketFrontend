import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@shared/lib/api';
import { formatRelativeTime } from '@shared/lib/format';
import { Plus } from 'lucide-react';

interface Ticket {
  _id: string;
  number: string;
  title: string;
  status: string;
  priority: string;
  department?: { name: string };
  agent?: { name: string };
  user?: { name: string };
  createdAt: string;
}

export default function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = { page, limit };
        if (statusFilter) params.status = statusFilter;
        if (searchQuery) params.search = searchQuery;
        const res = await api.get('/agent/tickets', { params });
        setTickets(res.data.tickets || []);
        setTotal(res.data.total || 0);
      } catch {
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [statusFilter, searchQuery, page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tickets {total > 0 && <span className="text-gray-400 text-lg font-normal">({total})</span>}</h1>
        <Link
          to="/tickets/new"
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          New Ticket
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search tickets..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
          className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="assigned">Assigned</option>
          <option value="overdue">Overdue</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dept</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-600 mx-auto" /></td></tr>
            ) : tickets.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No tickets found</td></tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/tickets/${ticket.number}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-gray-500">#{ticket.number}</span>
                      <span className="text-sm font-medium text-gray-900 truncate max-w-md">{ticket.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      ticket.status === 'open' ? 'bg-blue-100 text-blue-700' :
                      ticket.status === 'assigned' ? 'bg-yellow-100 text-yellow-700' :
                      ticket.status === 'overdue' ? 'bg-red-100 text-red-700' :
                      ticket.status === 'resolved' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{ticket.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      ticket.priority === 'high' || ticket.priority === 'emergency' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                    }`}>{ticket.priority}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{ticket.department?.name || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{ticket.agent?.name || 'Unassigned'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatRelativeTime(ticket.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between text-sm">
            <span className="text-gray-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
