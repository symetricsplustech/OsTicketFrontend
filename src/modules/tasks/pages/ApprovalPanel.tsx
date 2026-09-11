import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Users } from 'lucide-react';
import { approvalApi } from '@modules/tasks/services/taskApi';

interface Approval {
  _id: string;
  type: string;
  state: string;
  approver?: { name: string; email: string };
  approvalGroup?: { name: string };
  requestedBy?: { name: string };
  requestedAt: string;
  decidedAt?: string;
  decisionNote?: string;
  dueAt?: string;
  approvalsReceived?: string[];
  requiredApprovals: number;
}

interface Props {
  taskId: string;
  isTerminal?: boolean;
  onRefresh?: () => void;
}

const STATE_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4 text-yellow-500" />,
  approved: <CheckCircle className="h-4 w-4 text-green-500" />,
  rejected: <XCircle className="h-4 w-4 text-red-500" />,
  cancelled: <Clock className="h-4 w-4 text-gray-400" />,
};

const STATE_COLORS: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  approved: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
  cancelled: 'bg-gray-50 text-gray-500',
};

export default function ApprovalPanel({ taskId, isTerminal, onRefresh }: Props) {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [decideNote, setDecideNote] = useState('');
  const [deciding, setDeciding] = useState<string | null>(null);

  const loadApprovals = async () => {
    try {
      const res = await approvalApi.listForTask(taskId);
      setApprovals(res.data);
    } catch {
      setApprovals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadApprovals(); }, [taskId]);

  const handleDecide = async (approvalId: string, decision: string) => {
    setDeciding(approvalId);
    try {
      await approvalApi.decide(approvalId, decision, decideNote);
      setDecideNote('');
      loadApprovals();
      onRefresh?.();
    } catch {
      // error
    } finally {
      setDeciding(null);
    }
  };

  const pendingApprovals = approvals.filter((a) => a.state === 'pending');
  const decidedApprovals = approvals.filter((a) => a.state !== 'pending');

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="font-semibold text-gray-900 mb-4">Approvals ({approvals.length})</h2>

      {loading ? (
        <div className="text-sm text-gray-400">Loading...</div>
      ) : approvals.length === 0 ? (
        <div className="text-sm text-gray-400">No approvals</div>
      ) : (
        <div className="space-y-4">
          {pendingApprovals.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-2">Pending</p>
              {pendingApprovals.map((a) => (
                <div key={a._id} className="p-3 rounded-lg border border-yellow-200 bg-yellow-50 mb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {STATE_ICONS[a.state]}
                      <span className="text-sm font-medium">{a.type === 'group' || a.type === 'parallel' ? 'Group' : 'Individual'} Approval</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATE_COLORS[a.state]}`}>{a.state}</span>
                    </div>
                    <span className="text-xs text-gray-500">Requested by {a.requestedBy?.name}</span>
                  </div>
                  {a.approver && <div className="mt-1 text-xs text-gray-600">Approver: {a.approver.name}</div>}
                  {a.approvalGroup && <div className="mt-1 text-xs text-gray-600">Group: {a.approvalGroup.name}</div>}
                  {a.type === 'parallel' && (
                    <div className="mt-1 text-xs text-gray-500">
                      <Users className="inline h-3 w-3" /> {a.approvalsReceived?.length || 0}/{a.requiredApprovals} approvals received
                    </div>
                  )}
                  {!isTerminal && (
                    <div className="mt-3 flex items-center gap-2">
                      <input value={decideNote} onChange={(e) => setDecideNote(e.target.value)} placeholder="Note (optional)" className="flex-1 px-2 py-1 border rounded text-xs" />
                      <button onClick={() => handleDecide(a._id, 'approved')} disabled={deciding === a._id} className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50">
                        Approve
                      </button>
                      <button onClick={() => handleDecide(a._id, 'rejected')} disabled={deciding === a._id} className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50">
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {decidedApprovals.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-2">Decided</p>
              {decidedApprovals.map((a) => (
                <div key={a._id} className="p-2 rounded-lg border border-gray-100 mb-2">
                  <div className="flex items-center gap-2">
                    {STATE_ICONS[a.state]}
                    <span className="text-sm">{a.type} - {a.state}</span>
                    {a.decidedAt && <span className="text-xs text-gray-500">{new Date(a.decidedAt).toLocaleString()}</span>}
                  </div>
                  {a.decisionNote && <div className="mt-1 text-xs text-gray-500 italic">{a.decisionNote}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
