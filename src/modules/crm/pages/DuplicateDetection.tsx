import { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import {
  Copy,
  Check,
  X,
  Search,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Eye,
  Trash2,
} from 'lucide-react';

interface DuplicateRecord {
  id: number;
  type: 'contact' | 'company';
  records: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    created: string;
  }[];
  match_field: string;
  confidence: number;
  status: 'pending' | 'merged' | 'dismissed';
  created: string;
}

interface DuplicateGroup {
  id: number;
  type: 'contact' | 'company';
  records: any[];
  match_field: string;
  confidence: number;
  status: string;
  created: string;
}

export default function DuplicateDetection() {
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'merged' | 'dismissed'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<DuplicateGroup | null>(null);
  const [mergingId, setMergingId] = useState<number | null>(null);

  useEffect(() => {
    fetchDuplicates();
  }, [filter]);

  const fetchDuplicates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/extra/duplicates', {
        params: { status: filter !== 'all' ? filter : undefined },
      });
      setDuplicates(response.data as DuplicateGroup[]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch duplicates');
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    try {
      setScanning(true);
      await api.post('/extra/duplicates/scan');
      fetchDuplicates();
    } catch (err: any) {
      setError(err.message || 'Failed to scan for duplicates');
    } finally {
      setScanning(false);
    }
  };

  const handleMerge = async (groupId: number, primaryId: number) => {
    try {
      setMergingId(groupId);
      await api.post(`/extra/duplicates/${groupId}/merge`, { primary_id: primaryId });
      setSelectedGroup(null);
      fetchDuplicates();
    } catch (err: any) {
      setError(err.message || 'Failed to merge records');
    } finally {
      setMergingId(null);
    }
  };

  const handleDismiss = async (groupId: number) => {
    try {
      await api.post(`/extra/duplicates/${groupId}/dismiss`);
      setSelectedGroup(null);
      fetchDuplicates();
    } catch (err: any) {
      setError(err.message || 'Failed to dismiss duplicate');
    }
  };

  const filteredDuplicates = duplicates.filter((d) => {
    if (searchQuery) {
      return d.records.some(
        (r) =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-red-600 bg-red-50';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Copy className="h-6 w-6" />
            Duplicate Detection
          </h1>
          <p className="text-sm text-gray-500 mt-1">Find and merge duplicate records</p>
        </div>
        <button
          onClick={handleScan}
          disabled={scanning}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${scanning ? 'animate-spin' : ''}`} />
          {scanning ? 'Scanning...' : 'Scan for Duplicates'}
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

      <div className="flex items-center gap-4 mb-4">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['pending', 'merged', 'dismissed', 'all'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 text-sm rounded-md capitalize ${
                filter === status
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="flex-1">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search duplicates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading duplicates...</p>
            </div>
          ) : filteredDuplicates.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Copy className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {searchQuery
                  ? 'No duplicates match your search'
                  : filter === 'pending'
                    ? 'No pending duplicates found'
                    : 'No duplicates found'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDuplicates.map((group) => (
                <div
                  key={group.id}
                  onClick={() => setSelectedGroup(group)}
                  className={`bg-white border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${
                    selectedGroup?.id === group.id
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium capitalize">{group.type} Duplicates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${getConfidenceColor(group.confidence)}`}
                      >
                        {group.confidence}% match
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          group.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : group.status === 'merged'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {group.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Match on: {group.match_field}</span>
                    <span>-</span>
                    <span>{group.records.length} records</span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <span className="text-xs">
                      {new Date(group.created).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {group.records.slice(0, 3).map((record, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                      >
                        {record.name}
                      </span>
                    ))}
                    {group.records.length > 3 && (
                      <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded">
                        +{group.records.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedGroup && (
          <div className="w-96 bg-white border border-gray-200 rounded-lg p-4 h-fit sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Duplicate Details</h3>
              <button
                onClick={() => setSelectedGroup(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="text-sm">
                <span className="text-gray-500">Type:</span>{' '}
                <span className="font-medium capitalize">{selectedGroup.type}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">Match Field:</span>{' '}
                <span className="font-medium">{selectedGroup.match_field}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">Confidence:</span>{' '}
                <span className={`font-medium ${getConfidenceColor(selectedGroup.confidence).split(' ')[0]}`}>
                  {selectedGroup.confidence}%
                </span>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Records</h4>
              <div className="space-y-2">
                {selectedGroup.records.map((record) => (
                  <div key={record.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="font-medium text-sm">{record.name}</div>
                    {record.email && (
                      <div className="text-xs text-gray-500">{record.email}</div>
                    )}
                    {record.phone && (
                      <div className="text-xs text-gray-500">{record.phone}</div>
                    )}
                    {selectedGroup.status === 'pending' && (
                      <button
                        onClick={() => handleMerge(selectedGroup.id, record.id)}
                        disabled={mergingId === selectedGroup.id}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Check className="h-3 w-3" />
                        Keep as primary
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {selectedGroup.status === 'pending' && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleDismiss(selectedGroup.id)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center justify-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Dismiss
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
