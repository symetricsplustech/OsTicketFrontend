import { useState } from 'react';
import { useGetRecordsQuery } from '@shared/store/crudApi';
import { EntityPage, StatusBadge } from '@shared/components/EntityPage';
import { BellOff, Shield, } from 'lucide-react';

export default function QuietHoursSettings() {
  const { data: prefs } = useGetRecordsQuery({ entity: 'notification_preference', limit: 50 });
  const [enabled, setEnabled] = useState<boolean>(false);
  const [curfewTime, setCurfewTime] = useState<string>('22:00');

  const preferences = prefs?.records || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><BellOff className="h-6 w-6" /> Quiet Hours</h1>
      <p className="text-sm text-gray-500">Notification preferences — suppress deliveries during configured curfew window</p>

      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Quiet Hours Enabled</h3>
          <StatusBadge status={enabled ? 'active' : 'inactive'} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <input
                type="checkbox"
                checked={enabled}
                onChange={e => setEnabled(e.target.checked)}
                className="checkbox-input bg-brand-600 cursor-pointer"
              />
              Suppress notifications
            </label>
            <p className="text-xs text-gray-500 mt-2">During curfew window, in-app and email notifications are held in queue and delivered after reactivation.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Curfew Start</label>
            <input
              type="time"
              value={curfewTime}
              onChange={e => setCurfewTime(e.target.value)}
              className="input-field"
            />
            <span className="text-xs text-gray-400 ml-2">Local time</span>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">Notification types during quiet hours:</p>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="checkbox-input" checked disabled />
              <span>In-app messages</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="checkbox-input" checked disabled />
              <span>Email digests</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="checkbox-input" checked disabled />
              <span>WhatsApp messages</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="checkbox-input" checked disabled />
              <span>Push notifications</span>
            </label>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button className="flex-1 bg-brand-600 text-white py-2 rounded text-sm">Save Quiet Hours</button>
          <button className="flex-1 bg-gray-200 py-2 rounded text-sm">Cancel</button>
        </div>
      </div>

      {/* Existing preferences list */}
      {enabled && (
        <div className="bg-white border rounded-lg p-4 mt-4">
          <h3 className="font-semibold mb-3">Active Quiet Hours</h3>
          <p className="text-sm text-gray-500">Until {curfewTime} daily — {new Date().toLocaleTimeString()} local time</p>
          <p className="text-sm text-gray-400">{preferences.length} preference rules active</p>
        </div>
      )}
    </div>
  );
}