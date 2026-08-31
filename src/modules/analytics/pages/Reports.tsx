import React, { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

interface OverviewData {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  avgFirstResponseTime?: string;
  avgResolutionTime?: string;
  slaCompliance?: number;
  csatScore?: number;
  byPriority?: Record<string, number>;
  byStatus?: Record<string, number>;
  byDay?: Array<{ date: string; count: number }>;
  byDept?: Array<{ name: string; count: number }>;
}

const COLORS = ['#3b82f6', '#eab308', '#ef4444', '#22c55e', '#a855f7', '#f97316'];

export default function Reports() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/enterprise/reports/overview', { params: { range: dateRange } });
        setData(res.data);
      } catch {} finally { setLoading(false); }
    };
    load();
  }, [dateRange]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" /></div>;

  const priorityData = data?.byPriority ? Object.entries(data.byPriority).map(([name, value]) => ({ name, value })) : [];
  const statusData = data?.byStatus ? Object.entries(data.byStatus).map(([name, value]) => ({ name, value })) : [];
  const trendData = data?.byDay || [];
  const deptData = data?.byDept || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="input-field w-40">
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Tickets', value: data?.totalTickets || 0, color: 'text-blue-600' },
          { label: 'Open', value: data?.openTickets || 0, color: 'text-yellow-600' },
          { label: 'Resolved', value: data?.resolvedTickets || 0, color: 'text-green-600' },
          { label: 'SLA Compliance', value: `${data?.slaCompliance || 0}%`, color: 'text-purple-600' },
        ].map((stat) => (
          <div key={stat.label} className="card p-5">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Tickets by Priority</h3>
          {priorityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={priorityData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                  {priorityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-8">No data</p>}
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-4">Tickets by Status</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-8">No data</p>}
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-4">Ticket Trend</h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-8">No data</p>}
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-4">By Department</h3>
          {deptData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={deptData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#22c55e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-8">No data</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Response Times</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Avg First Response</span><span className="font-medium">{data?.avgFirstResponseTime || '—'}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Avg Resolution</span><span className="font-medium">{data?.avgResolutionTime || '—'}</span></div>
          </div>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Satisfaction</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-gray-500">CSAT Score</span><span className="font-medium">{data?.csatScore || 0}%</span></div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-green-500 h-3 rounded-full" style={{ width: `${data?.csatScore || 0}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
