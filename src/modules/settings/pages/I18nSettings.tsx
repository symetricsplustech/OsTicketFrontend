import { useState } from 'react';
import { useGetRecordsQuery } from '@shared/store/crudApi';
import { EntityPage, StatusBadge } from '@shared/components/EntityPage';
import { Languages, Globe, Calendar, } from 'lucide-react';

export default function I18nSettings() {
  const { data: locales } = useGetRecordsQuery({ entity: 'locale', limit: 50 });
  const [selectedLocale, setSelectedLocale] = useState<string>('en');
  const [timezone, setTimezone] = useState<string>('UTC');

  const localeData = locales?.records || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Globe className="h-6 w-6" /> Internationalization</h1>
      <p className="text-sm text-gray-500">Multi-language support, timezone formatting, and locale-specific number/currency formatting</p>

      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Available Locales</h3>
        {localeData.slice(0, 20).map((l: any) => (
          <div
            key={l._id}
            onClick={() => setSelectedLocale(l.code)}
            className="px-3 py-2 border-b last:border-0 text-sm hover:bg-gray-50 cursor-pointer"
            style={{ fontFamily: `"${l.fontFamily || 'sans-serif'}"` }}
          >
            <span className="font-medium truncate">{l.name} ({l.code})</span>
            <span className="text-xs text-gray-400">{l.nativeName}</span>
          </div>
        ))}
      </div>

      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Timezone Configuration</h3>
        <select
          value={timezone}
          onChange={e => setTimezone(e.target.value)}
          className="input-field p-2 border rounded w-full"
        >
          <option value="UTC">UTC</option>
          {['America/New_York', 'Europe/London', 'Asia/Kolkata', 'Asia/Dubai', 'Australia/Sydney'].map(tz => (
            <option key={tz} value={tz}>{tz}</option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-2">Used for date/time formatting across the application</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Default Language</label>
          <select
            value={selectedLocale}
            onChange={e => setSelectedLocale(e.target.value)}
            className="input-field w-full p-2 border rounded"
          >
            {localeData.map((l: any) => (
              <option key={l.code} value={l.code}>{l.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Number Format</label>
          <select className="input-field w-full p-2 border rounded">
            <option value="en-US">en-US (1,234.56)</option>
            <option value="de-DE">de-DE (1.234,56)</option>
            <option value="fr-FR">fr-FR (1 234,56)</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button className="flex-1 bg-brand-600 text-white py-2 rounded text-sm">Save i18n Settings</button>
        <button className="flex-1 bg-gray-200 py-2 rounded text-sm">Cancel</button>
      </div>
    </div>
  );
}