import { useState } from 'react';
import { BarChart3, ChevronRight, XCircle } from 'lucide-react';
import api from '@shared/lib/api';

interface Group {
  _id: string;
  count: number;
  totalValue?: number;
}

type Dataset = 'tickets' | 'leads' | 'opportunities';

const GROUP_FIELDS: Record<Dataset, string[]> = {
  tickets: ['status', 'priority', 'category'],
  leads: ['status', 'source'],
  opportunities: ['stage'],
};

const ALLOWED_COLUMNS = ['number', 'subject', 'title', 'name', 'status', 'priority', 'stage', 'source', 'value', 'createdAt'];

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function DrillDownReport() {
  const [dataset, setDataset] = useState<Dataset>('tickets');
  const [groupBy, setGroupBy] = useState('status');
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const selectDataset = (d: Dataset) => {
    setDataset(d);
    setGroupBy(GROUP_FIELDS[d][0]);
    setGroups([]);
    setSelectedGroup(null);
  };

  const run = async () => {
    try {
      setSelectedGroup(null);
      const { data } = await api.post('/ops/drilldown', { dataset, groupBy });
      setGroups(data.groups || []);
    } catch {}
  };

  const openGroup = async (group: Group) => {
    setSelectedGroup(group);
    setLoadingDetail(true);
    try {
      const { data } = await api.post('/ops/drilldown/detail', { dataset, groupBy, value: group._id });
      const list: Record<string, unknown>[] = Array.isArray(data) ? data : data.rows || [];
      setRows(list);
      if (list.length > 0) {
        setColumns(Object.keys(list[0]).filter(k => k !== '_id' && k !== '__v' && ALLOWED_COLUMNS.includes(k)));
      } else {
        setColumns([]);
      }
    } catch {}
    finally { setLoadingDetail(false); }
  };

  const maxCount = Math.max(...groups.map(g => g.count), 1);

  const renderCell = (row: Record<string, unknown>, col: string) => {
    const v = row[col];
    if (v === null || v === undefined) return '—';
    if (col === 'createdAt') return formatDate(String(v));
    return String(v);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="h-6 w-6" /> Drill-Down Report</h1>

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className={selectedGroup ? 'font-medium' : 'font-medium text-gray-900'}>{dataset}</span>
        <ChevronRight className="h-4 w-4" />
        <span className={selectedGroup ? 'font-medium' : 'font-medium text-gray-900'}>{groupBy}</span>
        {selectedGroup && (
          <>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-gray-900">{String(selectedGroup._id)}</span>
          </>
        )}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-2">1. Choose dataset</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['tickets', 'leads', 'opportunities'] as Dataset[]).map(d => (
            <button
              key={d}
              onClick={() => selectDataset(d)}
              className={`p-4 rounded-lg border text-left capitalize transition ${dataset === d ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200' : 'bg-white hover:border-gray-400'}`}
            >
              <BarChart3 className={`h-5 w-5 mb-2 ${dataset === d ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className="font-medium">{d}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-end gap-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">2. Group by</label>
          <select value={groupBy} onChange={e => setGroupBy(e.target.value)} className="border rounded-lg px-3 py-2 capitalize">
            {GROUP_FIELDS[dataset].map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
        <button onClick={run} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Run</button>
      </div>

      {groups.length > 0 && (
        <div className="bg-white border rounded-lg p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">3. Groups — click a bar to drill down</h2>
          {groups.map(g => (
            <button key={g._id} onClick={() => openGroup(g)} className="w-full flex items-center gap-3 group text-left">
              <span className="w-40 shrink-0 text-sm font-medium truncate capitalize">{String(g._id)}</span>
              <div className="flex-1 h-7 bg-gray-100 rounded overflow-hidden">
                <div
                  className="h-full bg-blue-600 group-hover:bg-blue-700 transition-all"
                  style={{ width: `${(g.count / maxCount) * 100}%` }}
                />
              </div>
              <span className="w-12 shrink-0 text-sm text-right font-medium">{g.count}</span>
            </button>
          ))}
        </div>
      )}

      {selectedGroup && (
        <div className="bg-white border rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <h2 className="font-semibold capitalize">
              {String(selectedGroup._id)} ({selectedGroup.count})
            </h2>
            <button onClick={() => setSelectedGroup(null)} className="text-gray-400 hover:text-red-600">
              <XCircle className="h-5 w-5" />
            </button>
          </div>
          {loadingDetail ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : rows.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-gray-500">No records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {columns.map(col => (
                      <th key={col} className="text-left px-4 py-3 font-medium capitalize">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      {columns.map(col => (
                        <td key={col} className="px-4 py-3">{renderCell(row, col)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
