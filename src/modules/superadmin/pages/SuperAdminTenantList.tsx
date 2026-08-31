import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetTenantsQuery, useDeleteTenantMutation, useSetTenantStatusMutation } from '@shared/store/apiEndpoints';
import { Plus, Search, Building2, Users, Ticket, MoreVertical, Trash2, Power, Eye } from 'lucide-react';

export default function SuperAdminTenantList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { data, isLoading } = useGetTenantsQuery({ page, limit: 20, search: search || undefined, status: statusFilter || undefined });
  const [deleteTenant] = useDeleteTenantMutation();
  const [setTenantStatus] = useSetTenantStatusMutation();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const tenants = data?.data || [];
  const meta = data?.meta || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tenant Management</h1>
        <Link to="/superadmin/tenants/new" className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium">
          <Plus className="h-4 w-4" /> New Tenant
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search tenants..." className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:border-brand-300 outline-none" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="trial">Trial</option>
          <option value="suspended">Suspended</option>
          <option value="expired">Expired</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Tenant</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Plan</th>
              <th className="text-center px-5 py-3 font-medium text-gray-600">Users</th>
              <th className="text-center px-5 py-3 font-medium text-gray-600">Agents</th>
              <th className="text-center px-5 py-3 font-medium text-gray-600">Tickets</th>
              <th className="text-center px-5 py-3 font-medium text-gray-600">Open</th>
              <th className="text-right px-5 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={8} className="text-center py-10 text-gray-400">Loading...</td></tr>
            ) : tenants.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-10 text-gray-400">No tenants found</td></tr>
            ) : tenants.map((t: any) => (
              <tr key={t._id} className="hover:bg-gray-50">
                <td className="px-5 py-3">
                  <Link to={`/superadmin/tenants/${t._id}`} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center text-brand-700 font-semibold text-xs">
                      {t.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-medium">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.email || t.domain || '-'}</p>
                    </div>
                  </Link>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    t.status === 'active' ? 'bg-green-100 text-green-700' :
                    t.status === 'trial' ? 'bg-blue-100 text-blue-700' :
                    t.status === 'suspended' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{t.status}</span>
                </td>
                <td className="px-5 py-3 text-sm">{t.plan?.name || '-'}</td>
                <td className="px-5 py-3 text-center">{t.users || 0}</td>
                <td className="px-5 py-3 text-center">{t.agents || 0}</td>
                <td className="px-5 py-3 text-center">{t.tickets || 0}</td>
                <td className="px-5 py-3 text-center">{t.openTickets || 0}</td>
                <td className="px-5 py-3 text-right">
                  <div className="relative inline-block">
                    <button onClick={() => setOpenMenu(openMenu === t._id ? null : t._id)} className="p-1 hover:bg-gray-100 rounded">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {openMenu === t._id && (
                      <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg z-10 w-40">
                        <Link to={`/superadmin/tenants/${t._id}`} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50">
                          <Eye className="h-4 w-4" /> View Details
                        </Link>
                        <button onClick={() => { setTenantStatus({ id: t._id, status: t.status === 'active' ? 'suspended' : 'active' }); setOpenMenu(null); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50">
                          <Power className="h-4 w-4" /> {t.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                        <button onClick={() => { if (confirm('Delete this tenant?')) { deleteTenant(t._id); setOpenMenu(null); } }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <p>Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}</p>
          <div className="flex gap-1">
            <button disabled={meta.page <= 1} onClick={() => setPage(meta.page - 1)} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
            <button disabled={meta.page >= meta.totalPages} onClick={() => setPage(meta.page + 1)} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
