import { useMyApprovalsQuery } from '@shared/store/apiEndpoints';
import { CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ApprovalInbox() {
  const { data: approvals = [], isLoading } = useMyApprovalsQuery();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Approvals</h1>
      <p className="text-gray-500 text-sm">Everything across all modules that's waiting for your decision.</p>

      {isLoading && <p className="text-gray-400 animate-pulse">Checking for pending approvals…</p>}

      {!isLoading && !approvals.length && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <p className="text-lg font-medium text-green-700">All caught up!</p>
          <p className="text-sm text-green-600 mt-1">No pending approvals right now.</p>
        </div>
      )}

      <div className="space-y-3">
        {(approvals as any[]).map((a, i) => (
          <div key={i} className="bg-white border rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">{a.label || `${a.source} approval`}</p>
                {a.count && <p className="text-xs text-gray-500">{a.count} item{a.count > 1 ? 's' : ''} pending</p>}
                {a.type && <p className="text-xs text-gray-400">{String(a.type)} · {String(a.mode)}</p>}
              </div>
            </div>
            <Link to={a.source === 'change' ? '/changes-crud' : a.source === 'quote' ? '/quote-versions' : a.source === 'finance_case' ? '/finance-cases-crud' : '#'}
              className="text-xs px-3 py-1.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700">
              Review →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
