import React from 'react';
import { useGetSaSecurityRolesQuery, useForceLogoutMutation } from '@shared/store/apiEndpoints';
import { Shield, Users, LogOut, AlertTriangle } from 'lucide-react';

export default function SuperAdminSecurity() {
  const { data, isLoading } = useGetSaSecurityRolesQuery();
  const [forceLogout] = useForceLogoutMutation();
  const admins = data?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Security Management</h1>
        <p className="text-sm text-gray-500 mt-1">Review privileged roles, revoke sessions, and manage tenant security</p>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="font-semibold">Privileged Roles & Admins</h2>
          <p className="text-xs text-gray-500 mt-1">Agents with admin or elevated privileges across tenants</p>
        </div>
        {isLoading ? (
          <div className="p-10 text-center text-sm text-gray-400">Loading privileged roles...</div>
        ) : admins.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">No privileged accounts found</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Agent</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Role</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Tenant</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Last Login</th>
                <th className="text-right px-5 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {admins.map((admin: any) => (
                <tr key={admin._id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-semibold text-sm">
                        <Shield className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{admin.name}</p>
                        <p className="text-xs text-gray-500">{admin.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${admin.isAdmin ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {admin.role?.name || (admin.isAdmin ? 'Admin' : 'Agent')}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{admin.company || 'Platform'}</td>
                  <td className="px-5 py-3 text-gray-500">{admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : 'Never'}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => { if (confirm(`Force logout ${admin.name}?`)) forceLogout({ userId: admin._id, reason: 'Admin action' }); }}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-orange-600 hover:bg-orange-50 rounded">
                      <LogOut className="h-3.5 w-3.5" /> Force Logout
                    </button>
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
