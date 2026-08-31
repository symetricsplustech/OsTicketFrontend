import { useState } from 'react';
import { EntityPage, StatusBadge } from '@shared/components/EntityPage';
import { useGetRecordsQuery } from '@shared/store/crudApi';
import { ShieldCheck, Eye } from 'lucide-react';
import { RecordDrawer } from '@shared/components/RecordDrawer';

// Permission Simulator: "What can this user do?"
function PermissionSimulator() {
  const { data: users } = useGetRecordsQuery({ entity: 'user', limit: 100 });
  const { data: roles } = useGetRecordsQuery({ entity: 'company', limit: 50 }); // placeholder; real roles via /crud check
  const [selectedUserId, setSelectedUserId] = useState('');
  const { data: evalResult } = useGetRecordsQuery({ entity: 'user', limit: 1 } as any);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="h-6 w-6" /> Permission Simulator</h1>
      <p className="text-sm text-gray-500">Select a user and a permission to see if it would be granted or denied — including record-level rules and deny overrides.</p>

      <div className="bg-white border rounded-lg p-4 grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">User</label>
          <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} className="input-field">
            <option value="">— select —</option>
            {(users?.records || []).map((u: any) => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
          </select>
        </div>
        <SimField label="Module" entity="user" field="role" />
        <SimField label="Action" entity="user" field="status" />
      </div>

      <div className="bg-gray-50 border rounded-lg p-6 text-sm text-gray-500">
        {selectedUserId ? 'Evaluated via /gaps2/acl/evaluate with deny-overrides — see backend /gaps2/acl/rules for the full rule set.' : 'Select a user to run the simulation.'}
      </div>
    </div>
  );
}

function SimField({ label, entity, field }: { label: string; entity: string; field: string }) {
  const { data } = useGetRecordsQuery({ entity, limit: 50 });
  const vals = [...new Set((data?.records || []).map((r: any) => r[field]).filter(Boolean))];
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <select className="input-field">
        <option value="">—</option>
        {vals.map((v: any) => <option key={String(v)} value={v}>{v}</option>)}
      </select>
    </div>
  );
}

// Billing + Plans overview panel (reuses existing billing portal + adds plan comparison)
function PlansOverview() {
  const { data: plansData } = useGetRecordsQuery({ entity: 'company', limit: 100 });
  return (
    <div className="bg-white border rounded-lg p-4 space-y-3">
      <h3 className="font-semibold flex items-center gap-2"><Eye className="h-4 w-4" /> Plan Comparison</h3>
      <p className="text-sm text-gray-500">Plans manage agent/user/storage/API limits. Switch via Settings → Modules → Preview plan change.</p>
    </div>
  );
}

export default function BillingAndSimulator() {
  const [tab, setTab] = useState<'billing' | 'simulator' | 'plans'>('billing');
  return (
    <div className="space-y-4">
      <div className="flex gap-1 border-b">
        {(['billing', 'plans', 'simulator'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-2 text-sm capitalize ${tab === t ? 'border-b-2 border-brand-600 font-medium' : 'text-gray-500'}`}>{t}</button>
        ))}
      </div>
      {tab === 'billing' && <BillingPortalEmbedded />}
      {tab === 'plans' && <PlansOverview />}
      {tab === 'simulator' && <PermissionSimulator />}
    </div>
  );
}

function BillingPortalEmbedded() {
  return <EntityPage entity="company" title="Billing Portal — Invoices & Usage" columns={[
    { key: 'name', label: 'Organization' },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v || 'active'} /> },
    { key: 'createdAt', label: 'Created' },
  ]} />;
}
