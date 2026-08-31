import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useGetTenantQuery, useGetTenantStructureQuery, useImpersonateTenantMutation, useSetTenantStatusMutation, useDeleteTenantMutation, useUpdateTenantModulesMutation } from '@shared/store/apiEndpoints';
import ConfirmModal from '@shared/components/ConfirmModal';
import { ArrowLeft, Building2, Users, Ticket, Edit, Trash2, Power, LogIn, ChevronDown, ChevronRight, Layers, CheckCircle, XCircle, Save } from 'lucide-react';

const ALL_MODULE_LABELS: Record<string, string> = {
  helpdesk: 'Helpdesk', crm: 'CRM', itam: 'IT Asset Mgmt', itom: 'IT Operations', cmdb: 'CMDB',
  projects: 'Projects', hr: 'HR', 'field-service': 'Field Service', workflow: 'Workflows',
  analytics: 'Analytics', ai: 'AI / Otto', csm: 'Customer Service', secops: 'Security Ops',
  grc: 'GRC', workplace: 'Workplace', legal: 'Legal', procurement: 'Procurement',
  finance: 'Finance', esg: 'ESG', settings: 'Settings',
};

export default function SuperAdminTenantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: tenant, isLoading } = useGetTenantQuery(id!);
  const { data: structure, isLoading: structLoading, refetch: refetchStructure } = useGetTenantStructureQuery(id!);
  const [impersonate] = useImpersonateTenantMutation();
  const [setTenantStatus] = useSetTenantStatusMutation();
  const [deleteTenant] = useDeleteTenantMutation();
   const [updateTenantModules, { isLoading: updatingModules }] = useUpdateTenantModulesMutation();
   const [expandedSection, setExpandedSection] = useState<string | null>('overview');
   const [modal, setModal] = useState<{open: boolean; title: string; message: string}>({open: false, title: '', message: ''});
  const [editingModules, setEditingModules] = useState(false);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);

  const d = tenant?.data;
  const s = structure?.data;

  useEffect(() => {
    if (s?.activeModules) {
      setSelectedModules(s.activeModules);
    }
  }, [s?.activeModules]);

  if (isLoading) return <div className="p-10 text-center text-gray-400">Loading tenant details...</div>;
  if (!d) return <div className="p-10 text-center text-gray-400">Tenant not found</div>;

  const toggle = (section: string) => setExpandedSection(expandedSection === section ? null : section);

  const toggleModule = (key: string) => {
    setSelectedModules(prev => prev.includes(key) ? prev.filter(m => m !== key) : [...prev, key]);
  };

  const handleSaveModules = async () => {
    try {
      await updateTenantModules({ id: id!, modules: selectedModules }).unwrap();
      setEditingModules(false);
      refetchStructure();
    } catch (err: any) {
       setModal({open: true, title: 'Error', message: err?.data?.message || 'Failed to update modules'});
    }
  };

  return (
    <>
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/superadmin/tenants" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="h-5 w-5" /></Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{d.name}</h1>
          <p className="text-sm text-gray-500">{d.email || d.domain || '-'}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => impersonate({ companyId: d._id })} className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200">
            <LogIn className="h-4 w-4" /> Impersonate
          </button>
          <button onClick={() => setTenantStatus({ id: d._id, status: d.status === 'active' ? 'suspended' : 'active' })}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${d.status === 'active' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
            <Power className="h-4 w-4" /> {d.status === 'active' ? 'Suspend' : 'Activate'}
          </button>
          <button onClick={() => { if (confirm('Delete this tenant? This cannot be undone.')) { deleteTenant(d._id); navigate('/superadmin/tenants'); } }}
            className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200">
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500">Users</p>
          <p className="text-2xl font-bold">{d.users || 0}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500">Agents</p>
          <p className="text-2xl font-bold">{d.agents || 0}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500">Total Tickets</p>
          <p className="text-2xl font-bold">{d.tickets || 0}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500">Open Tickets</p>
          <p className="text-2xl font-bold">{d.openTickets || 0}</p>
        </div>
      </div>

      {/* Plan & Subscription */}
      <div className="bg-white rounded-xl border">
        <button onClick={() => toggle('plan')} className="w-full flex items-center justify-between px-5 py-4">
          <h2 className="font-semibold">Plan & Subscription</h2>
          {expandedSection === 'plan' ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
        {expandedSection === 'plan' && (
          <div className="px-5 pb-5 border-t">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              <div>
                <p className="text-xs text-gray-500">Current Plan</p>
                <p className="font-medium">{d.plan?.name || 'No plan'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Billing Cycle</p>
                <p className="font-medium">{d.billingCycle || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <span className={`text-xs px-2 py-1 rounded-full ${d.status === 'active' ? 'bg-green-100 text-green-700' : d.status === 'trial' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{d.status}</span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Plan Started</p>
                <p className="font-medium">{d.planStartedAt ? new Date(d.planStartedAt).toLocaleDateString() : '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Plan Expires</p>
                <p className="font-medium">{d.planExpiresAt ? new Date(d.planExpiresAt).toLocaleDateString() : '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Trial Ends</p>
                <p className="font-medium">{d.trialEndsAt ? new Date(d.trialEndsAt).toLocaleDateString() : '-'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Activated Modules */}
      <div className="bg-white rounded-xl border">
        <div className="flex items-center justify-between px-5 py-4">
          <button onClick={() => toggle('modules')} className="flex items-center gap-2 flex-1">
            <Layers className="h-4 w-4 text-brand-600" />
            <h2 className="font-semibold">Activated Modules</h2>
            <span className="text-xs text-gray-400">({(s?.activeModules || []).length} active)</span>
            {expandedSection === 'modules' ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
          {expandedSection === 'modules' && (
            <div className="flex gap-2">
              {editingModules ? (
                <>
                  <button onClick={() => { setEditingModules(false); setSelectedModules(s?.activeModules || []); }}
                    className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                  <button onClick={handleSaveModules} disabled={updatingModules}
                    className="flex items-center gap-1 px-3 py-1.5 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700 disabled:opacity-50">
                    <Save className="h-3.5 w-3.5" /> {updatingModules ? 'Saving...' : 'Save'}
                  </button>
                </>
              ) : (
                <button onClick={() => setEditingModules(true)}
                  className="flex items-center gap-1 px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50">
                  <Edit className="h-3.5 w-3.5" /> Edit
                </button>
              )}
            </div>
          )}
        </div>
        {expandedSection === 'modules' && (
          <div className="px-5 pb-5 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {Object.entries(ALL_MODULE_LABELS).map(([key, label]) => {
                const active = editingModules ? selectedModules.includes(key) : (s?.activeModules || []).includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => editingModules && toggleModule(key)}
                    disabled={!editingModules}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                      editingModules ? 'cursor-pointer hover:shadow-sm' : ''
                    } ${
                      active ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'
                    }`}
                  >
                    {active ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-gray-300" />}
                    {label}
                  </button>
                );
              })}
            </div>
            {editingModules && (
              <p className="text-xs text-gray-500 mt-3">Click modules to toggle. Changes take effect immediately for tenant users on next page load.</p>
            )}
          </div>
        )}
      </div>

      {/* Structure - Departments, Teams, Agents */}
      {s && (
        <>
          <div className="bg-white rounded-xl border">
            <button onClick={() => toggle('structure')} className="w-full flex items-center justify-between px-5 py-4">
              <h2 className="font-semibold">Organization Structure</h2>
              {expandedSection === 'structure' ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </button>
            {expandedSection === 'structure' && (
              <div className="px-5 pb-5 border-t">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-600 font-medium">Departments</p>
                    <p className="text-xl font-bold">{s.counts?.departments || 0}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-green-600 font-medium">Teams</p>
                    <p className="text-xl font-bold">{s.counts?.teams || 0}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-xs text-purple-600 font-medium">Roles</p>
                    <p className="text-xl font-bold">{s.counts?.roles || 0}</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3">
                    <p className="text-xs text-amber-600 font-medium">Organizations</p>
                    <p className="text-xl font-bold">{s.counts?.organizations || 0}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Agents List */}
          <div className="bg-white rounded-xl border">
            <button onClick={() => toggle('agents')} className="w-full flex items-center justify-between px-5 py-4">
              <h2 className="font-semibold">Agents ({s.agents?.length || 0})</h2>
              {expandedSection === 'agents' ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </button>
             {expandedSection === 'agents' && (
               <div className="border-t">
                 <table className="w-full text-sm">
                   <thead className="bg-gray-50">
                     <tr>
                      <th className="text-left px-5 py-2 font-medium text-gray-600">Name</th>
                      <th className="text-left px-5 py-2 font-medium text-gray-600">Email</th>
                      <th className="text-left px-5 py-2 font-medium text-gray-600">Role</th>
                      <th className="text-center px-5 py-2 font-medium text-gray-600">Tickets</th>
                      <th className="text-center px-5 py-2 font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(s.agents || []).map((a: any) => (
                      <tr key={a._id} className="hover:bg-gray-50">
                        <td className="px-5 py-2">{a.name}</td>
                        <td className="px-5 py-2 text-gray-500">{a.email}</td>
                        <td className="px-5 py-2">
                          {a.isAdmin ? <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Admin</span> : a.role?.name || '-'}
                        </td>
                        <td className="px-5 py-2 text-center">{a.tickets || 0}</td>
                        <td className="px-5 py-2 text-center">
                          <span className={`text-xs ${a.isActive ? 'text-green-600' : 'text-red-600'}`}>{a.isActive ? 'Active' : 'Inactive'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Users/Customers List */}
          <div className="bg-white rounded-xl border">
            <button onClick={() => toggle('users')} className="w-full flex items-center justify-between px-5 py-4">
              <h2 className="font-semibold">Customers ({s.users?.length || 0})</h2>
              {expandedSection === 'users' ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </button>
            {expandedSection === 'users' && (
              <div className="border-t">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-5 py-2 font-medium text-gray-600">Name</th>
                      <th className="text-left px-5 py-2 font-medium text-gray-600">Email</th>
                      <th className="text-left px-5 py-2 font-medium text-gray-600">Organization</th>
                      <th className="text-center px-5 py-2 font-medium text-gray-600">Tickets</th>
                      <th className="text-center px-5 py-2 font-medium text-gray-600">Open</th>
                      <th className="text-center px-5 py-2 font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(s.users || []).map((u: any) => (
                      <tr key={u._id} className="hover:bg-gray-50">
                        <td className="px-5 py-2">{u.name}</td>
                        <td className="px-5 py-2 text-gray-500">{u.email}</td>
                        <td className="px-5 py-2">{u.organization?.name || '-'}</td>
                        <td className="px-5 py-2 text-center">{u.tickets || 0}</td>
                        <td className="px-5 py-2 text-center">{u.openTickets || 0}</td>
                        <td className="px-5 py-2 text-center">
                          <span className={`text-xs ${u.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>{u.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Departments List */}
          <div className="bg-white rounded-xl border">
            <button onClick={() => toggle('departments')} className="w-full flex items-center justify-between px-5 py-4">
              <h2 className="font-semibold">Departments ({s.departments?.length || 0})</h2>
              {expandedSection === 'departments' ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </button>
            {expandedSection === 'departments' && (
              <div className="border-t">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-5 py-2 font-medium text-gray-600">Name</th>
                      <th className="text-left px-5 py-2 font-medium text-gray-600">Manager</th>
                      <th className="text-center px-5 py-2 font-medium text-gray-600">Public</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(s.departments || []).map((dep: any) => (
                      <tr key={dep._id} className="hover:bg-gray-50">
                        <td className="px-5 py-2">{dep.name}</td>
                        <td className="px-5 py-2">{dep.manager?.name || '-'}</td>
                        <td className="px-5 py-2 text-center">{dep.isPublic ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Roles List */}
          <div className="bg-white rounded-xl border">
            <button onClick={() => toggle('roles')} className="w-full flex items-center justify-between px-5 py-4">
              <h2 className="font-semibold">Roles ({s.roles?.length || 0})</h2>
              {expandedSection === 'roles' ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </button>
            {expandedSection === 'roles' && (
              <div className="border-t">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-5 py-2 font-medium text-gray-600">Name</th>
                      <th className="text-center px-5 py-2 font-medium text-gray-600">Admin</th>
                      <th className="text-center px-5 py-2 font-medium text-gray-600">Permissions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(s.roles || []).map((r: any) => (
                      <tr key={r._id} className="hover:bg-gray-50">
                        <td className="px-5 py-2">{r.name}</td>
                        <td className="px-5 py-2 text-center">{r.isAdmin ? <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Yes</span> : 'No'}</td>
                        <td className="px-5 py-2 text-center">{r.permissionCount || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
     </div>
     <ConfirmModal open={modal.open} onClose={() => setModal({...modal, open: false})} title={modal.title} message={modal.message} />
    </>
   );
 }
