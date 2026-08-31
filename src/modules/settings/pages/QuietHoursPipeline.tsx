import { useState } from 'react';
import { useGetRecordsQuery } from '@shared/store/crudApi';
import { EntityPage, StatusBadge } from '@shared/components/EntityPage';
import { Clock, CheckCircle, XCircle, } from 'lucide-react';

export default function QuietHoursPipeline() {
  const { data: rules } = useGetRecordsQuery({ entity: 'notification_rule', limit: 30 });
  const [activeRules, setActiveRules] = useState<any[]>([]);
  const [sentThisPeriod, setSentThisPeriod] = useState<number>(0);

  const notificationRules = rules?.records || [];

  // Filter to quiet-hours active rules
  const quietHoursRules = notificationRules.filter((r: any) => r.quietHoursEnabled);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Clock className="h-6 w-6" /> Quiet Hours Pipeline</h1>
      <p className="text-sm text-gray-500">Notification send-gating during quiet hours windows — hold in queue, deliver after reactivation</p>

      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Quiet Hours Rules</h3>
        {quietHoursRules.length > 0 ? (
          quietHoursRules.map((r: any) => (
            <div
              key={r._id}
              className="px-3 py-2 border-b last:border-0 text-sm hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <StatusBadge status={r.enabled ? 'active' : 'inactive'} />
                <span className="font-medium truncate">{r.channel}</span>
              </div>
              <div className="text-xs text-gray-500">
                Curfew: {r.curfewStart} - {r.curfewEnd} · Queue: {r.queueBehavior}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400">No quiet hours rules configured</p>
        )}
      </div>

      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Send Pipeline Status</h3>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <p className="text-xs text-gray-500">Messages Held</p>
            <p className="text-2xl font-bold text-yellow-500">{sentThisPeriod}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Messages Sent</p>
            <p className="text-2xl font-bold text-green-500">—</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Active Quiet Hours</p>
            <p className="text-2xl font-bold text-blue-500">—</p>
          </div>
        </div>
        <p className="text-sm text-gray-400">During quiet hours, outgoing notifications are buffered and delivered post-curfew per rule configuration.</p>
      </div>

      <div className="mt-4">
        <button className="btn-primary text-sm">Run Pipeline Test</button>
        <button className="btn-secondary text-sm ms-2">Refresh Status</button>
      </div>
    </div>
  );
}