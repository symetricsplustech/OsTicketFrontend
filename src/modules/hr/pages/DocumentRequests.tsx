import { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import {
  Plus,
  FileText,
  Edit2,
  Trash2,
  Search,
  Save,
  X,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  Upload,
} from 'lucide-react';

type DocumentStatus = 'pending' | 'processing' | 'ready' | 'rejected';
type DocumentType = 'experience_letter' | 'salary_slip' | 'noc' | 'relieving_letter' | 'other';

interface DocumentRequest {
  id: number;
  employee_name: string;
  employee_id: number;
  document_type: DocumentType;
  custom_type?: string;
  purpose: string;
  status: DocumentStatus;
  notes?: string;
  file_url?: string;
  requested_date: string;
  processed_date?: string;
  processed_by?: string;
}

interface DocumentRequestFormData {
  employee_name: string;
  employee_id: number;
  document_type: DocumentType;
  custom_type: string;
  purpose: string;
  notes: string;
}

const DOC_TYPE_CONFIG: Record<DocumentType, { label: string; color: string; bg: string }> = {
  experience_letter: {
    label: 'Experience Letter',
    color: 'text-blue-700',
    bg: 'bg-blue-100',
  },
  salary_slip: { label: 'Salary Slip', color: 'text-green-700', bg: 'bg-green-100' },
  noc: { label: 'NOC', color: 'text-purple-700', bg: 'bg-purple-100' },
  relieving_letter: {
    label: 'Relieving Letter',
    color: 'text-yellow-700',
    bg: 'bg-yellow-100',
  },
  other: { label: 'Other', color: 'text-gray-700', bg: 'bg-gray-100' },
};

const STATUS_CONFIG: Record<DocumentStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  pending: { label: 'Pending', color: 'text-yellow-700', bg: 'bg-yellow-100', icon: Clock },
  processing: {
    label: 'Processing',
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    icon: AlertCircle,
  },
  ready: {
    label: 'Ready',
    color: 'text-green-700',
    bg: 'bg-green-100',
    icon: CheckCircle,
  },
  rejected: { label: 'Rejected', color: 'text-red-700', bg: 'bg-red-100', icon: X },
};

export default function DocumentRequests() {
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'all'>('all');

  const [form, setForm] = useState<DocumentRequestFormData>({
    employee_name: '',
    employee_id: 0,
    document_type: 'experience_letter',
    custom_type: '',
    purpose: '',
    notes: '',
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/extra/document-requests');
      setRequests(response.data as DocumentRequest[]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch document requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/extra/document-requests/${editingId}`, form);
      } else {
        await api.post('/extra/document-requests', form);
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchRequests();
    } catch (err: any) {
      setError(err.message || 'Failed to save document request');
    }
  };

  const handleEdit = (request: DocumentRequest) => {
    setForm({
      employee_name: request.employee_name,
      employee_id: request.employee_id,
      document_type: request.document_type,
      custom_type: request.custom_type || '',
      purpose: request.purpose,
      notes: request.notes || '',
    });
    setEditingId(request.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this request?')) return;
    try {
      await api.delete(`/extra/document-requests/${id}`);
      fetchRequests();
    } catch (err: any) {
      setError(err.message || 'Failed to delete document request');
    }
  };

  const handleProcess = async (id: number) => {
    try {
      await api.put(`/extra/document-requests/${id}/process`);
      fetchRequests();
    } catch (err: any) {
      setError(err.message || 'Failed to process document request');
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await api.put(`/extra/document-requests/${id}/approve`);
      fetchRequests();
    } catch (err: any) {
      setError(err.message || 'Failed to approve document request');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await api.put(`/extra/document-requests/${id}/reject`);
      fetchRequests();
    } catch (err: any) {
      setError(err.message || 'Failed to reject document request');
    }
  };

  const resetForm = () => {
    setForm({
      employee_name: '',
      employee_id: 0,
      document_type: 'experience_letter',
      custom_type: '',
      purpose: '',
      notes: '',
    });
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.purpose.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Document Requests
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage employee document requests
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingId(null);
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Request
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button onClick={() => setError(null)} className="float-right">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as DocumentStatus | 'all')}
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

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {editingId ? 'Edit Request' : 'New Document Request'}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                resetForm();
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee Name
                </label>
                <input
                  type="text"
                  required
                  value={form.employee_name}
                  onChange={(e) => setForm({ ...form, employee_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Employee name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Type
                </label>
                <select
                  value={form.document_type}
                  onChange={(e) =>
                    setForm({ ...form, document_type: e.target.value as DocumentType })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Object.entries(DOC_TYPE_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>
              {form.document_type === 'other' && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Document Type
                  </label>
                  <input
                    type="text"
                    value={form.custom_type}
                    onChange={(e) => setForm({ ...form, custom_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Specify document type"
                  />
                </div>
              )}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                <input
                  type="text"
                  required
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Purpose of document"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional notes"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  resetForm();
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {editingId ? 'Update' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading document requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {searchQuery || statusFilter !== 'all'
              ? 'No requests match your filters'
              : 'No document requests found'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Document Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Purpose
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Requested
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRequests.map((request) => {
                const docConfig = DOC_TYPE_CONFIG[request.document_type];
                const statusConfig = STATUS_CONFIG[request.status];
                const StatusIcon = statusConfig.icon;
                return (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium">{request.employee_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${docConfig.bg} ${docConfig.color}`}
                      >
                        {docConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{request.purpose}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full inline-flex items-center gap-1 ${statusConfig.bg} ${statusConfig.color}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(request.requested_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleProcess(request.id)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                              title="Process"
                            >
                              <Upload className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleReject(request.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                              title="Reject"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {request.status === 'processing' && (
                          <button
                            onClick={() => handleApprove(request.id)}
                            className="text-green-600 hover:text-green-800 text-sm"
                            title="Mark Ready"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        {request.status === 'ready' && request.file_url && (
                          <a
                            href={request.file_url}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleEdit(request)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(request.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
