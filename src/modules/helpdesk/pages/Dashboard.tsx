import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import api from '@shared/lib/api';
import { useAuth } from '@core/auth/useAuth';
import { formatRelativeTime } from '@shared/lib/format';
import {
  TicketIcon, AlertTriangle, CheckCircle,
  ArrowUpRight, Plus,
} from 'lucide-react';

interface Stats {
  open: number;
  assigned: number;
  overdue: number;
  closed: number;
  mine: number;
  today: number;
  total: number;
}

interface RecentTicket {
  _id: string;
  number: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
  user?: { name: string };
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({ open: 0, assigned: 0, overdue: 0, closed: 0, mine: 0, today: 0, total: 0 });
  const [recent, setRecent] = useState<RecentTicket[]>([]);
  const [loading, setLoading] = useState(true);

  // Platform admin goes to superadmin dashboard
  if (user?.role === 'superadmin') {
    return <Navigate to="/superadmin" replace />;
  }

  // Admin users go to setup wizard
  if (user?.role === 'admin' || user?.isAdmin) {
    return <Navigate to="/setup" replace />;
  }

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, ticketsRes] = await Promise.all([
          api.get('/agent/dashboard'),
          api.get('/agent/tickets?limit=5'),
        ]);
        setStats(dashRes.data.stats || dashRes.data);
        setRecent(ticketsRes.data.tickets || []);
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  const statCards = [
    { label: 'Open', value: stats.open, icon: TicketIcon, color: 'bg-blue-500' },
    { label: 'Assigned', value: stats.assigned, icon: ArrowUpRight, color: 'bg-yellow-500' },
    { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'bg-red-500' },
    { label: 'Closed', value: stats.closed, icon: CheckCircle, color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link to="/tickets/new" className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700">
          <Plus className="h-4 w-4" /> New Ticket
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border p-4">
              <div className="flex items-center gap-3">
                <div className={`${card.color} p-2 rounded-lg`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-xs text-gray-500">{card.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border">
        <div className="px-5 py-4 border-b">
          <h2 className="font-semibold">Recent Tickets</h2>
        </div>
        <div className="divide-y">
          {recent.length === 0 ? (
            <div className="px-5 py-8 text-center text-gray-400 text-sm">No tickets yet</div>
          ) : recent.map((t) => (
            <Link key={t._id} to={`/tickets/${t._id}`} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
              <div>
                <p className="font-medium text-sm">{t.title}</p>
                <p className="text-xs text-gray-500">#{t.number} &middot; {t.user?.name || 'Unknown'}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  t.status === 'open' ? 'bg-blue-100 text-blue-700' :
                  t.status === 'assigned' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>{t.status}</span>
                <span className="text-xs text-gray-400">{formatRelativeTime(t.createdAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
