import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { taskApi } from "@modules/tasks/services/taskApi";
import type { Task } from "@shared/types/task";

const STATE_COLORS: Record<string, string> = {
  new: "bg-gray-100 text-gray-700",
  open: "bg-blue-100 text-blue-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  pending_customer: "bg-orange-100 text-orange-700",
  pending_vendor: "bg-orange-100 text-orange-700",
  pending_approval: "bg-purple-100 text-purple-700",
  on_hold: "bg-gray-100 text-gray-600",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-200 text-gray-500",
  cancelled: "bg-red-100 text-red-700",
};

export default function GroupQueues() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 25;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = { page, limit };
        if (stateFilter) params.state = stateFilter;
        if (search) params.search = search;
        params.assignmentGroup = "current";
        const res = await taskApi.list(params);
        setTasks(res.data.tasks);
        setTotal(res.data.total);
      } catch {
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [stateFilter, search, page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Group Queues</h1>
        <div className="text-sm text-gray-500">
          {total} task{total !== 1 ? "s" : ""} in group queues
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search group tasks..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <select
          value={stateFilter}
          onChange={(e) => {
            setStateFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">All States</option>
          {[
            "new",
            "open",
            "in_progress",
            "pending_customer",
            "pending_approval",
            "on_hold",
            "resolved",
            "closed",
          ].map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No tasks in group queues
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Number
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Title
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  State
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Priority
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Assigned To
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.map((task) => (
                <tr key={task._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      to={`/tasks/${task._id}`}
                      className="text-brand-600 font-medium hover:underline"
                    >
                      {task.number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-900 max-w-xs truncate">
                    {task.title}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${STATE_COLORS[task.state] || "bg-gray-100"}`}
                    >
                      {task.state.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{task.priority}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {task.assignedTo?.name || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded text-sm disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
