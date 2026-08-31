import { useState } from 'react';
import { EntityPage, StatusBadge } from '@shared/components/EntityPage';
import { RecordDrawer } from '@shared/components/RecordDrawer';

export default function TransferAndAudit() {
  const [activeTab, setActiveTab] = useState<'transfers' | 'audits'>('transfers');

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Stockroom Operations</h1>
      <div className="flex gap-1 border-b">
        <button onClick={() => setActiveTab('transfers')} className={`px-3 py-2 text-sm ${activeTab === 'transfers' ? 'border-b-2 border-brand-600 font-medium' : 'text-gray-500'}`}>Transfer Orders</button>
        <button onClick={() => setActiveTab('audits')} className={`px-3 py-2 text-sm ${activeTab === 'audits' ? 'border-b-2 border-brand-600 font-medium' : 'text-gray-500'}`}>Physical Audits</button>
      </div>

      {activeTab === 'transfers' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">Ship assets between stockrooms. Reconciliation is tracked on the asset timeline.</p>
          <EntityPage entity="asset" title="Select Assets to Transfer" columns={[
            { key: 'name', label: 'Asset' },
            { key: 'type', label: 'Type' },
            { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
            { key: 'location', label: 'Location' },
          ]} />
        </div>
      )}

      {activeTab === 'audits' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">Scan barcodes to reconcile physical inventory against recorded stock. Scan → compare → approve variances.</p>
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold mb-2">Start a Physical Audit</h3>
            <p className="text-sm text-gray-400 mb-4">Use the Inventory Management stock count to begin. Variances are shown for approval.</p>
            <EntityPage entity="asset" title="Assets to Audit" columns={[
              { key: 'name', label: 'Asset' },
              { key: 'serialNumber', label: 'Serial' },
              { key: 'location', label: 'Location' },
              { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
            ]} />
          </div>
        </div>
      )}
    </div>
  );
}
