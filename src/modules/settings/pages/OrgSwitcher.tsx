import { useGetMyOrgsQuery, useSelectOrganizationMutation } from '@shared/store/apiEndpoints';
import { useState } from 'react';
import ConfirmModal from '@shared/components/ConfirmModal';
import { Building2, CheckCircle, XCircle } from 'lucide-react';

interface Membership {
  _id: string;
  organizationId?: string;
  name: string;
  role: string;
  isActiveTenant?: boolean;
}

export default function OrgSwitcher() {
  const { data: orgs, isLoading, error } = useGetMyOrgsQuery();
  const [selectOrganization, { isLoading: switching }] = useSelectOrganizationMutation();
   const [err, setErr] = useState<string | null>(null);
   const [modal, setModal] = useState<{open: boolean; title: string; message: string}>({open: false, title: '', message: ''});

  const handleSelect = async (m: Membership) => {
    setErr(null);
    try {
      const res = await selectOrganization({ organizationId: (m.organizationId || m._id) as any }).unwrap();
       const count = res?.modules?.length ?? res?.modulesCount ?? 0;
       setModal({open: true, title: 'Organization Switched', message: `Organization selected — ${count} modules enabled.`});
       setTimeout(() => window.location.reload(), 1500);
    } catch (e: any) {
      setErr(e?.data?.message || 'Failed to switch organization');
    }
  };

  if (isLoading) return <div className="p-6 text-gray-500">Loading organizations...</div>;

  return (
    <>
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Building2 className="h-6 w-6" /> My Organizations</h1>
        <p className="text-sm text-gray-500 mt-1">Switch your active tenant across memberships.</p>
      </div>

      {(error || err) && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-center gap-2">
          <XCircle className="h-4 w-4" /> {err || 'Failed to load organizations'}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(orgs || []).map((m) => (
          <div key={m._id} className={`card p-5 ${m.isActiveTenant ? 'ring-2 ring-indigo-500' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{m.name}</p>
                  <p className="text-xs uppercase tracking-wide text-gray-500">{m.role}</p>
                </div>
              </div>
              {m.isActiveTenant && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs font-medium">
                  <CheckCircle className="h-3 w-3" /> current
                </span>
              )}
            </div>
            <button
              onClick={() => handleSelect(m)}
              disabled={switching}
              className="mt-4 w-full btn-primary disabled:opacity-50"
            >
              {switching ? 'Switching...' : m.isActiveTenant ? 'Reload Tenant' : 'Switch to this Org'}
            </button>
          </div>
        ))}
      </div>

      {orgs && orgs.length === 0 && (
        <div className="card p-8 text-center text-gray-500">No organization memberships found.</div>
      )}
     </div>
     <ConfirmModal open={modal.open} onClose={() => setModal({...modal, open: false})} title={modal.title} message={modal.message} />
    </>
   );
 }
