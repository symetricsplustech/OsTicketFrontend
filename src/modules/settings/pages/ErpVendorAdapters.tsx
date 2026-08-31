import { useState } from 'react';
import { useGetRecordsQuery } from '@shared/store/crudApi';
import { EntityPage, StatusBadge } from '@shared/components/EntityPage';
import { Building2, Link, Shield, } from 'lucide-react';

export default function ErpVendorAdapters() {
  const { data: connectors } = useGetRecordsQuery({ entity: 'erp_connector', limit: 30 });
  const [selected, setSelected] = useState<any | null>(null);
  const { data: accounts } = useGetRecordsQuery({ entity: 'account', limit: 20 });

  const connectorData = connectors?.records || [];
  const accountData = accounts?.records || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Link className="h-6 w-6" /> ERP Vendor Adapters</h1>
      <p className="text-sm text-gray-500">M365/Slack/Jira/GitHub adapters environment-gated; connector UI pending</p>

      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-3">ERP Connectors</h3>
        {connectorData.length > 0 ? (
          connectorData.map((c: any) => (
            <div
              key={c._id}
              onClick={() => setSelected(c)}
              className="px-3 py-2 border-b last:border-0 text-sm hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <StatusBadge status={c.status} />
                <span className="font-medium truncate">{c.name}</span>
              </div>
              <div className="text-xs text-gray-500">
                {c.type}: {c.environment || '—'} • {c.lastSync ? new Date(c.lastSync).toLocaleDateString() : 'Never'}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400">No ERP connectors configured</p>
        )}
      </div>

      {/* Selected connector detail */}
      {selected && accountData.length > 0 && (
        <div className="bg-white border rounded-lg p-6 mt-4">
          <h3 className="font-semibold mb-3">Connector Detail</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Name</p>
              <p className="font-medium">{selected.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500">Type</p>
              <p className="font-medium">{selected.type || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">Environment</p>
              <p className="font-medium text-gray-400">{selected.environment || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">Last Sync</p>
              <p className="font-medium">{selected.lastSync ? new Date(selected.lastSync).toLocaleString() : 'Never'}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="flex-1 bg-brand-600 text-white py-2 rounded text-sm">Test Connection</button>
            <button className="flex-1 bg-gray-200 py-2 rounded text-sm">Configure</button>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            <strong>BE Note:</strong> Adapter implementations (M365/Slack/Jira/GitHub) are environment-gated; connector UI pending per checklist 20.4.
          </p>
        </div>
      )}

      <div className="mt-4">
        <button className="btn-primary text-sm">Add New Connector</button>
        <button className="btn-secondary text-sm ms-2">Import from Manifest</button>
      </div>
    </div>
  );
}