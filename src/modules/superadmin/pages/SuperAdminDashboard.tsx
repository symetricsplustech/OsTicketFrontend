import React from 'react';
import { Link } from 'react-router-dom';
import { useGetSaDashboardQuery, useGetSaStatsQuery, useGetTenantsQuery, useGetSaPlansQuery } from '@shared/store/apiEndpoints';
import { Building2, Users, Ticket, DollarSign, CreditCard, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <div className="bg-white rounded-xl border p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function SuperAdminDashboard() {
  const { data: dashboard, isLoading: dashLoading } = useGetSaDashboardQuery();
  const { data: tenants, isLoading: tenantsLoading } = useGetTenantsQuery({ limit: 5 });
  const { data: plans } = useGetSaPlansQuery();

  const counts = dashboard?.data?.counts || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Platform Dashboard</h1>
        <Link to="/superadmin/tenants" className="text-sm text-brand-600 hover:text-brand-800 flex items-center gap-1">
          View all tenants <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tenants" value={counts.companies || 0} icon={Building2} color="bg-blue-100 text-blue-600" />
        <StatCard label="Active Tenants" value={counts.activeCompanies || 0} icon={Building2} color="bg-green-100 text-green-600" />
        <StatCard label="Total Users" value={counts.users || 0} icon={Users} color="bg-purple-100 text-purple-600" />
        <StatCard label="Total Agents" value={counts.agents || 0} icon={Users} color="bg-orange-100 text-orange-600" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tickets" value={counts.tickets || 0} icon={Ticket} color="bg-red-100 text-red-600" />
        <StatCard label="Revenue" value={`$${(counts.totalRevenue || 0).toLocaleString()}`} icon={DollarSign} color="bg-emerald-100 text-emerald-600" />
        <StatCard label="Pending Invoices" value={counts.pendingInvoices || 0} icon={CreditCard} color="bg-amber-100 text-amber-600" />
        <StatCard label="Active Plans" value={counts.plans || 0} icon={TrendingUp} color="bg-indigo-100 text-indigo-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tenants */}
        <div className="bg-white rounded-xl border">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Recent Tenants</h2>
            <Link to="/superadmin/tenants" className="text-xs text-brand-600 hover:text-brand-800">View all</Link>
          </div>
          <div className="divide-y">
            {tenantsLoading ? (
              <div className="p-5 text-center text-sm text-gray-400">Loading...</div>
            ) : (tenants?.data || []).length === 0 ? (
              <div className="p-5 text-center text-sm text-gray-400">No tenants yet</div>
            ) : (tenants?.data || []).map((t: any) => (
              <Link key={t._id} to={`/superadmin/tenants/${t._id}`} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                <div>
                  <p className="font-medium text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.email || t.domain || '-'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${t.status === 'active' ? 'bg-green-100 text-green-700' : t.status === 'trial' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                    {t.status}
                  </span>
                  <div className="text-right text-xs text-gray-500">
                    <p>{t.agents || 0} agents</p>
                    <p>{t.tickets || 0} tickets</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Plans Overview */}
        <div className="bg-white rounded-xl border">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Plans</h2>
            <Link to="/superadmin/plans" className="text-xs text-brand-600 hover:text-brand-800">Manage</Link>
          </div>
          <div className="divide-y">
            {(!plans || plans.length === 0) ? (
              <div className="p-5 text-center text-sm text-gray-400">No plans configured</div>
            ) : plans.map((p: any) => (
              <div key={p._id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="font-medium text-sm">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.code || '-'}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">${p.priceMonthly || 0}/mo</p>
                  <p className="text-xs text-gray-500">${p.priceYearly || 0}/yr</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Company Distribution */}
      {dashboard?.data?.companyDistribution?.length > 0 && (
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold mb-4">Tenant Distribution by Plan</h2>
          <div className="flex items-end gap-3 h-40">
            {dashboard.data.companyDistribution.map((d: any) => {
              const maxCount = Math.max(...dashboard.data.companyDistribution.map((x: any) => x.count), 1);
              const height = (d.count / maxCount) * 100;
              return (
                <div key={d.plan} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-medium">{d.count}</span>
                  <div className="w-full bg-brand-500 rounded-t" style={{ height: `${Math.max(height, 4)}%` }} />
                  <span className="text-[10px] text-gray-500 truncate w-full text-center">{d.plan}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
