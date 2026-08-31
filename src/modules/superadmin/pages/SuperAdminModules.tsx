import React from 'react';
import { useGetSaModulesQuery } from '@shared/store/apiEndpoints';
import { Layers, Users, CheckCircle, XCircle } from 'lucide-react';

export default function SuperAdminModules() {
  const { data, isLoading } = useGetSaModulesQuery();
  const modules = data?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Module Management</h1>
        <p className="text-sm text-gray-500 mt-1">Global module availability, activation status, and tenant usage</p>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-sm text-gray-400">Loading modules...</div>
        ) : modules.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">No modules found</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Module</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Key</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Total Tenants</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Active Tenants</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {modules.map((m: any) => (
                <tr key={m.key} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center text-brand-600">
                        <Layers className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500 font-mono text-xs">{m.key}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Users className="h-3.5 w-3.5" />
                      {m.totalTenants}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-3.5 w-3.5" />
                      {m.activeTenants}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${m.activeTenants > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {m.activeTenants > 0 ? 'In Use' : 'Unused'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
