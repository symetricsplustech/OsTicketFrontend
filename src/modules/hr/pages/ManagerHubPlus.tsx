import { useState } from 'react';
import { useGetRecordsQuery } from '@shared/store/crudApi';
import { EntityPage, StatusBadge } from '@shared/components/EntityPage';
import { RecordDrawer } from '@shared/components/RecordDrawer';
import { Users2, Briefcase, HeartPulse, Stethoscope, ClipboardCheck } from 'lucide-react';

export default function ManagerHubPlus() {
  const [activeTab, setActiveTab] = useState<'team' | 'er' | 'journeys'>('team');
  const { data: teamData } = useGetRecordsQuery({ entity: 'user', limit: 50 });
  const { data: hrData } = useGetRecordsQuery({ entity: 'hr_case', limit: 50 });

  const team = teamData?.records || [];
  const cases = hrData?.records || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Users2 className="h-6 w-6" /> Manager Hub</h1>
      <p className="text-sm text-gray-500">Team health, employee relations, and lifecycle journeys.</p>

      <div className="flex gap-1 border-b mb-4">
        {(['team', 'er', 'journeys'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t as any)} className={`px-3 py-2 text-sm capitalize ${activeTab === t ? 'border-b-2 border-brand-600 font-medium' : 'text-gray-500'}`}>
            {t === 'team' ? 'My Team' : t === 'er' ? 'Employee Relations' : 'Journeys'}
          </button>
        ))}
      </div>

      {activeTab === 'team' && (
        <div className="space-y-4">
          <h3 className="font-semibold">Direct Reports</h3>
          <div className="grid grid-cols-4 gap-4">
            {team.slice(0, 8).map((u: any) => (
              <div key={u._id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-semibold">
                    {u.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.role || 'Agent'}</p>
                  </div>
                </div>
                <div className="flex gap-2 text-xs text-gray-500">
                  <span>Open: {Math.floor(Math.random() * 5)}</span>
                  <span className="text-green-600">● Online</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'er' && (
        <div className="space-y-4">
          <h3 className="font-semibold">Employee Relations Cases</h3>
          <div className="space-y-2">
            {cases.slice(0, 5).map((c: any) => (
              <div key={c._id} className="bg-white border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="font-medium">{c.title}</p>
                  <p className="text-xs text-gray-500">{c.category} · {new Date(c.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={c.status} />
                  <button className="text-xs px-2 py-1 bg-brand-600 text-white rounded hover:bg-brand-700">View</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'journeys' && (
        <div className="space-y-3">
          <h3 className="font-semibold">Lifecycle Journeys</h3>
          <div className="grid grid-cols-3 gap-3">
            {['Onboarding', 'Offboarding', 'Promotion', 'Transfer', 'Leave', 'Performance'].map(j => (
              <div key={j} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-semibold">{j.charAt(0)}</div>
                  <div>
                    <p className="font-medium">{j}</p>
                    <p className="text-xs text-gray-500">Click to launch journey wizard</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}