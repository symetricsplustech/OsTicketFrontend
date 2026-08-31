import { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import ConfirmModal from '@shared/components/ConfirmModal';
import {
  FileCheck,
  CheckCircle,
  Clock,
  Search,
  X,
  AlertCircle,
  FileText,
  User,
  Calendar,
} from 'lucide-react';

type PolicyStatus = 'pending' | 'acknowledged' | 'overdue';

interface Policy {
  id: number;
  title: string;
  description: string;
  version: string;
  effective_date: string;
  due_date: string;
  department?: string;
}

interface PolicyAcknowledgement {
  id: number;
  policy: Policy;
  employee_name: string;
  employee_email: string;
  status: PolicyStatus;
  acknowledged_at?: string;
  due_date: string;
}

interface PolicyStats {
  total: number;
  acknowledged: number;
  pending: number;
  overdue: number;
}

const STATUS_CONFIG: Record<PolicyStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  pending: {
    label: 'Pending',
    color: 'text-yellow-700',
    bg: 'bg-yellow-100',
    icon: Clock,
  },
  acknowledged: {
    label: 'Acknowledged',
    color: 'text-green-700',
    bg: 'bg-green-100',
    icon: CheckCircle,
  },
  overdue: {
    label: 'Overdue',
    color: 'text-red-700',
    bg: 'bg-red-100',
    icon: AlertCircle,
  },
};

export default function PolicyAcknowledgement() {
  const [acknowledgements, setAcknowledgements] = useState<PolicyAcknowledgement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PolicyStatus | 'all'>('all');
  const [stats, setStats] = useState<PolicyStats>({
    total: 0,
    acknowledged: 0,
    pending: 0,
    overdue: 0,
  });
  const [modal, setModal] = useState<{open: boolean; title: string; message: string}>({open: false, title: '', message: ''});

  useEffect(() => {
    fetchAcknowledgements();
  }, []);

  const fetchAcknowledgements = async () => {
    try {
      setLoading(true);
      const response = await api.get('/extra/policy-acknowledgements');
      const data = response.data as PolicyAcknowledgement[];
      setAcknowledgements(data);

      setStats({
        total: data.length,
        acknowledged: data.filter((a) => a.status === 'acknowledged').length,
        pending: data.filter((a) => a.status === 'pending').length,
        overdue: data.filter((a) => a.status === 'overdue').length,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch policy acknowledgements');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id: number) => {
    try {
      await api.post(`/extra/policy-acknowledgements/${id}/acknowledge`);
      fetchAcknowledgements();
    } catch (err: any) {
      setError(err.message || 'Failed to acknowledge policy');
    }
  };

  const handleRemind = async (id: number) => {
    try {
      await api.post(`/extra/policy-acknowledgements/${id}/remind`);
       setModal({open: true, title: 'Success', message: 'Reminder sent successfully'});
    } catch (err: any) {
      setError(err.message || 'Failed to send reminder');
    }
  };

  const filteredAcknowledgements = acknowledgements.filter((ack) => {
    const matchesSearch =
      ack.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ack.policy.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ack.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileCheck className="h-6 w-6" />
            Policy Acknowledgement
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track policy acknowledgements across the organization
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button onClick={() => setError(null)} className="float-right">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <FileText className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Acknowledged</p>
              <p className="text-2xl font-bold">{stats.acknowledged}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Overdue</p>
              <p className="text-2xl font-bold">{stats.overdue}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by employee or policy..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PolicyStatus | 'all')}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Status</option>
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>
              {config.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading acknowledgements...</p>
        </div>
      ) : filteredAcknowledgements.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FileCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {searchQuery || statusFilter !== 'all'
              ? 'No acknowledgements match your filters'
              : 'No policy acknowledgements found'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Policy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Acknowledged
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAcknowledgements.map((ack) => {
                const statusConfig = STATUS_CONFIG[ack.status];
                const StatusIcon = statusConfig.icon;
                return (
                  <tr key={ack.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium">{ack.policy.title}</div>
                      <div className="text-xs text-gray-500">
                        v{ack.policy.version}
                        {ack.policy.department && ` • ${ack.policy.department}`}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">{ack.employee_name}</div>
                          <div className="text-xs text-gray-500">{ack.employee_email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        {new Date(ack.due_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full inline-flex items-center gap-1 ${statusConfig.bg} ${statusConfig.color}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {ack.acknowledged_at
                        ? new Date(ack.acknowledged_at).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {ack.status === 'pending' || ack.status === 'overdue' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRemind(ack.id)}
                            className="text-yellow-600 hover:text-yellow-800 text-sm"
                            title="Send reminder"
                          >
                            <AlertCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleAcknowledge(ack.id)}
                            className="text-green-600 hover:text-green-800 text-sm flex items-center gap-1"
                            title="Mark as acknowledged"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-green-600 flex items-center gap-1 justify-end">
                          <CheckCircle className="h-4 w-4" />
                          Done
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
       )}
     </div>
     <ConfirmModal open={modal.open} onClose={() => setModal({...modal, open: false})} title={modal.title} message={modal.message} />
    </>
   );
 }
