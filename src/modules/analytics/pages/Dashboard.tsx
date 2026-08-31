import React, { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Link } from 'react-router-dom';

interface DashboardData {
  stats: { open: number; assigned: number; overdue: number; closed: number; total: number };
  realtime: { open: number; critical: number; atRisk: number; breached: number; agentsOnline: number };
  byPriority: Record<string, number>;
  byStatus: Record<string, number>;
}

const COLORS = ['#3b82f6', '#eab308', '#ef4444', '#22c55e', '#a855f7'];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, realtimeRes] = await Promise.all([
          api.get('/enterprise/reports/overview'),
          api.get('/enterprise/realtime'),
        ]);
        setData({
          stats: dashRes.data,
          realtime: realtimeRes.data,
          byPriority: dashRes.data.byPriority || {},
          byStatus: dashRes.data.byStatus || {},
        });
      } catch {} finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" /></div>;

  const priorityData = Object.entries(data?.byPriority || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Open', value: data?.realtime?.open || 0, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Critical', value: data?.realtime?.critical || 0, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'At Risk', value: data?.realtime?.atRisk || 0, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Breached', value: data?.realtime?.breached || 0, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Agents Online', value: data?.realtime?.agentsOnline || 0, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total', value: data?.stats?.total || 0, color: 'text-gray-900', bg: 'bg-gray-50' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold mb-4">SLA Compliance</h3>
          {priorityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={priorityData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                  {priorityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-8">No data available</p>}
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/tickets" className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors">
              <p className="text-sm font-medium text-blue-700">View Tickets</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{data?.stats?.open || 0}</p>
            </Link>
            <Link to="/reports" className="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition-colors">
              <p className="text-sm font-medium text-purple-700">Detailed Reports</p>
              <p className="text-xs text-purple-500 mt-1">Charts & Analytics</p>
            </Link>
            <Link to="/incidents" className="p-4 bg-red-50 rounded-lg text-center hover:bg-red-100 transition-colors">
              <p className="text-sm font-medium text-red-700">Incidents</p>
              <p className="text-xs text-red-500 mt-1">Active monitoring</p>
            </Link>
            <Link to="/assets" className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors">
              <p className="text-sm font-medium text-green-700">Assets</p>
              <p className="text-xs text-green-500 mt-1">IT inventory</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
