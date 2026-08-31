import React from 'react';
import { useGetSaOperationsHealthQuery, useGetSaOperationsJobsQuery } from '@shared/store/apiEndpoints';
import { Activity, Database, Cpu, MemoryStick, Server, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

function HealthCard({ name, status, detail, icon: Icon }: { name: string; status: string; detail?: string; icon: any }) {
  const isHealthy = status === 'healthy';
  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isHealthy ? 'bg-green-100' : 'bg-red-100'}`}>
          <Icon className={`h-5 w-5 ${isHealthy ? 'text-green-600' : 'text-red-600'}`} />
        </div>
        <div>
          <p className="font-medium text-sm">{name}</p>
          <p className={`text-xs ${isHealthy ? 'text-green-600' : 'text-red-600'}`}>{status}</p>
          {detail && <p className="text-xs text-gray-400 mt-0.5">{detail}</p>}
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminOperations() {
  const { data: health, isLoading: healthLoading } = useGetSaOperationsHealthQuery();
  const { data: jobs, isLoading: jobsLoading } = useGetSaOperationsJobsQuery({ page: 1, limit: 20 });

  const services = health?.data?.services || {};
  const jobList = jobs?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Operations</h1>
        <p className="text-sm text-gray-500 mt-1">Health monitoring, background jobs, and operational visibility</p>
      </div>

      <div className="bg-white rounded-xl border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">System Health</h2>
          <div className="flex items-center gap-2">
            {health?.data?.status === 'operational' ? (
              <span className="flex items-center gap-1 text-xs text-green-600 font-medium"><CheckCircle className="h-3.5 w-3.5" /> All Systems Operational</span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-red-600 font-medium"><AlertTriangle className="h-3.5 w-3.5" /> Degraded</span>
            )}
            {health?.data?.uptime && (
              <span className="text-xs text-gray-400">Uptime: {Math.floor(health.data.uptime / 3600)}h {Math.floor((health.data.uptime % 3600) / 60)}m</span>
            )}
          </div>
        </div>
        {healthLoading ? (
          <div className="text-center py-6 text-sm text-gray-400">Loading health data...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <HealthCard name="Database" status={services.database?.status || 'unknown'} detail={services.database?.state} icon={Database} />
            <HealthCard name="API Server" status={services.api?.status || 'unknown'} icon={Server} />
            <HealthCard name="Memory" status={services.memory?.status || 'unknown'} detail={services.memory ? `${Math.round(services.memory.heapUsed / 1024 / 1024)}MB / ${Math.round(services.memory.heapTotal / 1024 / 1024)}MB` : ''} icon={MemoryStick} />
            <HealthCard name="CPU" status={services.cpu?.status || 'unknown'} detail={services.cpu?.loadAverage ? `Load: ${services.cpu.loadAverage.map((l: number) => l.toFixed(2)).join(', ')}` : ''} icon={Cpu} />
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="font-semibold">Recent Audit Events (Jobs)</h2>
        </div>
        {jobsLoading ? (
          <div className="p-10 text-center text-sm text-gray-400">Loading jobs...</div>
        ) : jobList.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">No recent events</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Timestamp</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Action</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Entity</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Actor</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {jobList.map((j: any) => (
                <tr key={j._id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{new Date(j.createdAt).toLocaleString()}</td>
                  <td className="px-5 py-3"><span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{j.action}</span></td>
                  <td className="px-5 py-3">{j.entityType || '-'}</td>
                  <td className="px-5 py-3">{j.superAdmin?.name || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
