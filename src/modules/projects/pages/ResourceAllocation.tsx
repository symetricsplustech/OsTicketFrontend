import api from '@shared/lib/api';
import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';

interface Agent {
  _id: string;
  name: string;
}

interface ProjectRow {
  _id: string;
  name?: string;
  title?: string;
}

interface RawUser {
  _id: string;
  name?: string;
  fullName?: string;
  username?: string;
  email?: string;
}

interface RawTask {
  assignee?: string | { _id?: string };
  assignedTo?: string | { _id?: string };
  agentId?: string;
  owner?: string | { _id?: string };
  estimatedHours?: number;
}

interface Allocation {
  projects: Set<string>;
  taskCount: number;
  hours: number;
}

const resolveAgentId = (t: RawTask): string | null => {
  const cand = t.assignee ?? t.assignedTo ?? t.agentId ?? t.owner;
  if (!cand) return null;
  const id = typeof cand === 'string' ? cand : cand._id;
  return id ? String(id) : null;
};

export default function ResourceAllocation() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [allocations, setAllocations] = useState<Record<string, Allocation>>({});
  const [projectNames, setProjectNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      let projects: ProjectRow[] = [];
      try {
        const res = await api.get('/projects');
        const data = res.data;
        projects = (Array.isArray(data) ? data : data?.projects || data?.rows || []) as ProjectRow[];
      } catch {
        projects = [];
      }

      let rawUsers: RawUser[] = [];
      try {
        const res = await api.get('/admin/users');
        const data = res.data;
        rawUsers = (Array.isArray(data) ? data : data?.users || data?.agents || []) as RawUser[];
      } catch {
        try {
          const res = await api.get('/agents');
          const data = res.data;
        rawUsers = (Array.isArray(data) ? data : data?.items || data?.users || data?.agents || []) as RawUser[];
        } catch {
          rawUsers = [];
        }
      }
      const normalizedAgents: Agent[] = rawUsers
        .filter((u) => u && u._id)
        .map((u) => ({
          _id: String(u._id),
          name: u.name || u.fullName || u.username || u.email || 'Unnamed',
        }));

      const names: Record<string, string> = {};
      projects.forEach((p) => {
        names[p._id] = p.name || p.title || 'Untitled project';
      });

      const allocs: Record<string, Allocation> = {};
      for (const project of projects) {
        let tasks: RawTask[] = [];
        try {
          const res = await api.get(`/projects/${project._id}/tasks`);
          const data = res.data;
          tasks = (Array.isArray(data) ? data : data?.tasks || data?.rows || []) as RawTask[];
        } catch {
          tasks = [];
        }
        tasks.forEach((t) => {
          const agentId = resolveAgentId(t);
          if (!agentId) return;
          if (!allocs[agentId]) allocs[agentId] = { projects: new Set(), taskCount: 0, hours: 0 };
          allocs[agentId].projects.add(project._id);
          allocs[agentId].taskCount += 1;
          allocs[agentId].hours += Number(t.estimatedHours) || 0;
        });
      }

      setProjectNames(names);
      setAgents(normalizedAgents);
      setAllocations(allocs);
      setLoading(false);
    };
    load();
  }, []);

  const allocatedCount = agents.filter((a) => allocations[a._id]).length;
  const overAllocated = agents.filter((a) => (allocations[a._id]?.taskCount || 0) > 8).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Users className="h-6 w-6 text-blue-600" />
        Resource Allocation
      </h1>

      {loading ? (
        <div className="card p-6 space-y-3 animate-pulse">
          <p className="text-sm text-gray-400">Loading resource allocation…</p>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-4 rounded bg-gray-100 w-full max-w-md" />
          ))}
        </div>
      ) : agents.length === 0 ? (
        <p className="card px-6 py-12 text-center text-sm text-gray-500">No agents found to allocate.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card p-4">
              <p className="text-xs text-gray-500">Total Agents</p>
              <p className="text-2xl font-bold mt-1">{agents.length}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-gray-500">Allocated</p>
              <p className="text-2xl font-bold mt-1">{allocatedCount}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-gray-500">Over-allocated (&gt;8 tasks)</p>
              <p className={`text-2xl font-bold mt-1 ${overAllocated > 0 ? 'text-red-600' : ''}`}>{overAllocated}</p>
            </div>
          </div>

          <div className="card overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Projects</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Tasks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Est Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {agents.map((a) => {
                  const alloc = allocations[a._id];
                  const totalTasks = alloc?.taskCount || 0;
                  const overAllocatedRow = totalTasks > 8;
                  return (
                    <tr
                      key={a._id}
                      className={`hover:bg-gray-50 ${overAllocatedRow ? 'border-l-4 border-l-red-500 bg-red-50/60' : ''}`}
                    >
                      <td className={`px-6 py-4 ${overAllocatedRow ? 'pl-[18px]' : ''}`}>
                        <span className="text-sm font-medium text-gray-900">{a.name}</span>
                        {overAllocatedRow && (
                          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">Over-allocated</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {alloc && alloc.projects.size > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {[...alloc.projects].map((pid) => (
                              <span
                                key={pid}
                                className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700"
                              >
                                {projectNames[pid] || pid}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Unallocated</span>
                        )}
                      </td>
                      <td className={`px-6 py-4 text-sm font-medium ${overAllocatedRow ? 'text-red-600' : 'text-gray-900'}`}>
                        {totalTasks}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{alloc ? alloc.hours : 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
