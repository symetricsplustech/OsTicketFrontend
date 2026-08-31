import { useState } from 'react';
import { useGetRecordsQuery } from '@shared/store/crudApi';
import { EntityPage } from '@shared/components/EntityPage';
import { Palette, Folder, Settings, } from 'lucide-react';

export default function BrandingVariants() {
  const { data: themes } = useGetRecordsQuery({ entity: 'theme', limit: 50 });
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const themesData = themes?.records || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Palette className="h-6 w-6" /> Branding Variants</h1>
      <p className="text-sm text-gray-500">Logo, favicon, color schemes, and theme customization</p>

      {/* Theme list */}
      <div className="bg-white border rounded-lg p-4 h-80 overflow-y-auto">
        <h3 className="font-semibold mb-3">Available Themes</h3>
        {themesData.slice(0, 15).map((t: any) => (
          <div
            key={t._id}
            onClick={() => setActiveTheme(t._id)}
            className="flex items-center justify-between py-2 px-3 border-b last:border-0 text-sm hover:bg-gray-50 cursor-pointer"
            style={{ background: t.primaryColor ? `linear-gradient(135deg, ${t.primaryColor}, ${t.accentColor || '#6366f1'})` : undefined }}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ background: t.primaryColor || '#6366f1' }} />
              <span className="font-medium truncate">{t.name}</span>
            </div>
            <div className="text-xs text-gray-400">{t.code}</div>
          </div>
        ))}
      </div>

      {/* Preview & customization */}
      {activeTheme && (
        <div className="bg-white border rounded-lg p-6 mt-4">
          <h3 className="font-semibold mb-3">Preview</h3>
          <div className="h-64 bg-gray-100 rounded-lg d-flex items-center justify-center text-gray-400">
            <span>Preview for {activeTheme}</span>
          </div>
          <p className="text-sm text-gray-500 mb-3">Configure your branding elements:</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Logo URL</label>
              <input type="text" className="input-field w-full p-2 border rounded" placeholder="https://example.com/logo.png" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Favicon</label>
              <input type="file" className="input-field w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Primary Color</label>
              <input type="color" className="input-field w-full p-2" defaultValue="#6366f1" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="flex-1 bg-brand-600 text-white py-2 rounded text-sm">Save Branding</button>
            <button className="flex-1 bg-gray-200 py-2 rounded text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="bg-white border rounded-lg p-3 hover:shadow-md transition-shadow">
          <Settings className="h-5 w-5 text-gray-400 mb-2" /> New Theme
        </div>
        <div className="bg-white border rounded-lg p-3 hover:shadow-md transition-shadow">
          <Folder className="h-5 w-5 text-gray-400 mb-2" /> Import Theme
        </div>
        <div className="bg-white border rounded-lg p-3 hover:shadow-md transition-shadow">
          <Palette className="h-5 w-5 text-gray-400 mb-2" /> Reset to Default
        </div>
      </div>
    </div>
  );
}