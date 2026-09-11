import React, { useState, useEffect } from 'react';
import { problemApi, Problem } from '@modules/helpdesk/services/problems/problemApi';
import { formatDate } from '@shared/lib/format';
import { useNavigate } from 'react-router-dom';

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  assess: 'bg-yellow-100 text-yellow-800',
  root_cause_analysis: 'bg-purple-100 text-purple-800',
  fix_in_progress: 'bg-orange-100 text-orange-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
  canceled: 'bg-red-100 text-red-800',
  risk_accepted: 'bg-cyan-100 text-cyan-800',
};

export default function ProblemDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, open: 0, analyzing: 0, fixed: 0, knownErrors: 0 });
  const [recentProblems, setRecentProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await problemApi.list({ limit: 10 });
        const items = res.data.items || [];
        setRecentProblems(items);
        setStats({
          total: res.data.total || 0,
          open: items.filter((p: Problem) => ['new', 'assess'].includes(p.status)).length,
          analyzing: items.filter((p: Problem) => p.status === 'root_cause_analysis').length,
          fixed: items.filter((p: Problem) => ['resolved', 'closed'].includes(p.status)).length,
          knownErrors: items.filter((p: Problem) => p.knownError).length,
        });
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="p-6">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Problem Dashboard</h1>
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-gray-900' },
          { label: 'Open', value: stats.open, color: 'text-blue-600' },
          { label: 'Analyzing', value: stats.analyzing, color: 'text-purple-600' },
          { label: 'Fixed', value: stats.fixed, color: 'text-green-600' },
          { label: 'Known Errors', value: stats.knownErrors, color: 'text-red-600' },
        ].map(card => (
          <div key={card.label} className="card p-4 text-center">
            <div className={`text-3xl font-bold ${card.color}`}>{card.value}</div>
            <div className="text-sm text-gray-500 mt-1">{card.label}</div>
          </div>
        ))}
      </div>
      <div className="card p-6">
        <h2 className="font-semibold mb-4">Recent Problems</h2>
        <div className="space-y-2">
          {recentProblems.map(prob => (
            <div key={prob._id} className="flex items-center justify-between border rounded p-3 hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate(`/problems/${prob._id}`)}>
              <div>
                <span className="font-medium">{prob.number}: {prob.title}</span>
                <span className="ml-2 text-xs text-gray-500">{formatDate(prob.createdAt)}</span>
              </div>
              <div className="flex gap-2">
                <span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLORS[prob.status] || 'bg-gray-100'}`}>{prob.status?.replace(/_/g, ' ')}</span>
                <span className="text-xs text-gray-500">{prob.priority}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
