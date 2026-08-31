import { useState } from 'react';
import { useGetRecordsQuery } from '@shared/store/crudApi';
import { EntityPage, StatusBadge } from '@shared/components/EntityPage';
import { ShoppingCart, Search, TrendingUp, CheckCircle, XCircle } from 'lucide-react';

export default function GuidedBuying() {
  const { data: requests } = useGetRecordsQuery({ entity: 'pr_request', limit: 30 });
  const { data: vendors } = useGetRecordsQuery({ entity: 'vendor', limit: 50 });
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [bidComparison, setBidComparison] = useState<any[] | null>(null);

  const prRequests = requests?.records || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><ShoppingCart className="h-6 w-6" /> Guided Buying</h1>
      <p className="text-sm text-gray-500">Request-for-quote, bid comparison, and vendor selection workflow</p>

      {/* Active PR requests */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Open PR Requests</h3>
        {prRequests.length > 0 ? (
          prRequests.map((r: any) => (
            <div key={r._id} className="px-3 py-2 border-b last:border-0 text-sm hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full {r.status === 'pending_approval' && 'bg-yellow-500'} {r.status !== 'pending_approval' && 'bg-green-500'}" />
                <span className="font-medium">{r.title || r.description || 'PR #' + r._id}</span>
              </div>
              <div className="text-xs text-gray-400">{r.requested_by || '—'}</div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400">No open PR requests</p>
        )}
      </div>

      {/* Vendor selection */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Vendor Directory</h3>
        <div className="grid grid-cols-2 gap-3">
          {vendors?.records?.map((v: any) => (
            <div key={v._id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer">
              <div>
                <span className="font-medium text-sm">{v.name}</span>
                <span className="text-xs text-gray-400">{v.contact_email || '—'}</span>
              </div>
              <CheckCircle className="text-green-500 text-xs" />
            </div>
          ))}
        </div>
        {vendors?.records?.length === 0 && <p className="text-sm text-gray-400">No vendors configured</p>}
      </div>

      {/* Bid comparison */}
      {selectedVendor && bidComparison && (
        <div className="bg-white border rounded-lg p-6 mt-4">
          <h3 className="font-semibold mb-3">Bid Comparison — {selectedVendor}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-2 font-medium">Item</th>
                  <th className="p-2 font-medium">Qty</th>
                  <th className="p-2 font-medium">Bid A</th>
                  <th className="p-2 font-medium">Bid B</th>
                  <th className="p-2 font-medium">Bid C</th>
                  <th className="p-2 font-medium">Select</th>
                </tr>
              </thead>
              <tbody>
                {bidComparison.map((b: any, i) => (
                  <tr key={i} className="border-b border-gray-200">
                    <td className="p-2">{b.item}</td>
                    <td className="p-2">{b.qty}</td>
                    <td className="p-2">${b.bidA}</td>
                    <td className="p-2">${b.bidB}</td>
                    <td className="p-2">${b.bidC}</td>
                    <td className="p-2">
                      <button className="text-brand-600 underline hover:text-brand-800">Choose</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add new PR */}
      <div className="mt-4">
        <button className="btn-primary text-sm">Create New PR Request</button>
        <button className="btn-secondary text-sm ms-2">Import RFQ Template</button>
      </div>
    </div>
  );
}