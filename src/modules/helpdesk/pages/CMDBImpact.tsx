import React, { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import toast from 'react-hot-toast';
import { ModuleGuard } from '@core/permissions/ModuleGuard';
import { Search, Activity, AlertTriangle } from 'lucide-react';

interface ImpactResult {
  ciId: string;
  impactedCIs: Array<{
    _id: string;
    name: string;
    ciClass: string;
    criticality: string;
    status: string;
  }>;
  totalImpacted: number;
}

interface HealthData {
  total: number;
  stale: number;
  uncertified: number;
  noOwner: number;
  healthScore: number;
}

const CRITICALITY_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  moderate: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
};

function healthScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}

function healthScoreBg(score: number): string {
  if (score >= 80) return 'bg-green-100 border-green-300';
  if (score >= 60) return 'bg-yellow-100 border-yellow-300';
  if (score >= 40) return 'bg-orange-100 border-orange-300';
  return 'bg-red-100 border-red-300';
}

function CMDBImpactPage() {
  const [ciId, setCiId] = useState('');
  const [results, setResults] = useState<ImpactResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [health, setHealth] = useState<HealthData | null>(null);

  useEffect(() => {
    const loadHealth = async () => {
      try {
        const res = await api.get('/enterprise/cmdb/health');
        setHealth(res.data);
      } catch {
        setHealth(null);
      }
    };
    loadHealth();
  }, []);

  const analyzeImpact = async () => {
    if (!ciId.trim()) {
      toast.error('Enter a CI ID');
      return;
    }
    setAnalyzing(true);
    try {
      const res = await api.get(`/enterprise/cmdb/cis/${ciId.trim()}/impact`);
      setResults(res.data);
    } catch {
      toast.error('Failed to analyze impact');
      setResults(null);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">CMDB Impact Analysis</h1>

      {/* ── Health Card ── */}
      {health && (
        <div className={`card p-6 border-2 ${healthScoreBg(health.healthScore)}`}>
          <div className="flex items-center gap-3 mb-4">
            <Activity size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">CMDB Health</h2>
          </div>
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{health.total}</p>
              <p className="text-xs text-gray-500 mt-1">Total CIs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{health.stale}</p>
              <p className="text-xs text-gray-500 mt-1">Stale</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{health.uncertified}</p>
              <p className="text-xs text-gray-500 mt-1">Uncertified</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{health.noOwner}</p>
              <p className="text-xs text-gray-500 mt-1">No Owner</p>
            </div>
            <div className="text-center">
              <p className={`text-3xl font-bold ${healthScoreColor(health.healthScore)}`}>{health.healthScore}</p>
              <p className="text-xs text-gray-500 mt-1">Health Score</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Impact Search ── */}
      <div className="card p-6">
        <h2 className="font-semibold mb-4">Analyze CI Impact</h2>
        <div className="flex items-center gap-3">
          <input
            value={ciId}
            onChange={e => setCiId(e.target.value)}
            placeholder="Enter CI ID"
            className="input-field flex-1 max-w-xs"
            onKeyDown={e => { if (e.key === 'Enter') analyzeImpact(); }}
          />
          <button onClick={analyzeImpact} disabled={analyzing} className="btn-primary flex items-center gap-2">
            <Search size={16} />
            {analyzing ? 'Analyzing...' : 'Analyze Impact'}
          </button>
        </div>
      </div>

      {/* ── Results ── */}
      {results && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
            <AlertTriangle size={18} className="text-orange-500" />
            <h2 className="text-lg font-semibold">Impacted CIs: {results.totalImpacted}</h2>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Criticality</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {results.impactedCIs.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No impacted CIs found</td></tr>
              ) : results.impactedCIs.map(ci => (
                <tr key={ci._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{ci.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{ci.ciClass}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${CRITICALITY_COLORS[ci.criticality] || 'bg-gray-100 text-gray-700'}`}>{ci.criticality}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{ci.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function CMDBImpact() {
  return (
    <ModuleGuard module="itam">
      <CMDBImpactPage />
    </ModuleGuard>
  );
}
