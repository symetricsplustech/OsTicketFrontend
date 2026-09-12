import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  changeApi,
  Change,
  ChangeTask,
} from "@modules/helpdesk/services/changes/changeApi";
import { formatDate } from "@shared/lib/format";
import toast from "react-hot-toast";
import { useAuth } from "@core/auth/useAuth";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  assess: "bg-yellow-100 text-yellow-800",
  authorize: "bg-purple-100 text-purple-800",
  scheduled: "bg-cyan-100 text-cyan-800",
  implement: "bg-orange-100 text-orange-800",
  review: "bg-indigo-100 text-indigo-800",
  closed: "bg-gray-100 text-gray-800",
  canceled: "bg-red-100 text-red-800",
};

function getAllowedTransitions(current: string): string[] {
  const map: Record<string, string[]> = {
    new: ["assess", "canceled"],
    assess: ["authorize", "canceled"],
    authorize: ["scheduled", "assess", "canceled"],
    scheduled: ["implement", "authorize", "canceled"],
    implement: ["review", "scheduled"],
    review: ["closed", "implement"],
    closed: [],
    canceled: ["new"],
  };
  return map[current] || [];
}

export default function ChangeRecord() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [change, setChange] = useState<Change | null>(null);
  const [tasks, setTasks] = useState<ChangeTask[]>([]);
  const [cis, setCis] = useState<any[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "details" | "timeline" | "tasks" | "cis" | "conflicts" | "risk"
  >("details");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!id) return;
    try {
      const [cRes, tRes, ciRes, cfRes] = await Promise.all([
        changeApi.getById(id),
        changeApi.listTasks(id),
        changeApi.listCIs(id),
        changeApi.listConflicts(id),
      ]);
      setChange(cRes.data.data);
      setTasks(tRes.data.data || []);
      setCis(ciRes.data.data || []);
      setConflicts(cfRes.data.data || []);
    } catch {
      toast.error("Failed to load change");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleTransition = async (status: string) => {
    if (!id || !hasPermission("change.update")) return;
    setSubmitting(true);
    try {
      await changeApi.transition(id, { status });
      toast.success(`Change moved to ${status}`);
      load();
    } catch {
      toast.error("Failed to transition");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!change) return <div className="p-6 text-red-600">Change not found</div>;

  const allowed = getAllowedTransitions(change.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            &larr; Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {change.number}: {change.title}
          </h1>
          <div className="flex gap-2 mt-2">
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[change.status] || "bg-gray-100"}`}
            >
              {change.status}
            </span>
            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100">
              {change.type}
            </span>
            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100">
              {change.risk}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {allowed.map((s) => (
            <button
              key={s}
              onClick={() => handleTransition(s)}
              disabled={submitting}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              {s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4 border-b">
        {(
          ["details", "timeline", "tasks", "cis", "conflicts", "risk"] as const
        ).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition ${activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "details" && (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">Description</label>
              <p>{change.description || "-"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Justification</label>
              <p>{change.justification || "-"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">
                Implementation Plan
              </label>
              <p>{change.implementationPlan || "-"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Rollback Plan</label>
              <p>{change.rollbackPlan || "-"}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">Window Start</label>
              <p>{change.windowStart ? formatDate(change.windowStart) : "-"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Window End</label>
              <p>{change.windowEnd ? formatDate(change.windowEnd) : "-"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Assigned To</label>
              <p>{change.assignedTo?.name || "-"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Assignment Group</label>
              <p>{change.assignmentGroup?.name || "-"}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "timeline" && (
        <div className="space-y-3">
          {change.timeline
            ?.slice()
            .reverse()
            .map((entry, i) => (
              <div key={i} className="border-l-2 border-blue-200 pl-4 py-2">
                <div className="text-xs text-gray-500">
                  {formatDate(entry.at)} by {entry.by}
                </div>
                <div className="text-sm">{entry.message}</div>
              </div>
            ))}
        </div>
      )}

      {activeTab === "tasks" && (
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <p className="text-gray-500 text-sm">No tasks</p>
          ) : (
            tasks.map((task) => (
              <div
                key={task._id}
                className="border rounded p-3 text-sm flex justify-between"
              >
                <div>
                  <span className="font-medium">
                    {task.number}: {task.title}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    Order: {task.order}
                  </span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-gray-100">
                  {task.status}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "cis" && (
        <div className="space-y-2">
          {cis.length === 0 ? (
            <p className="text-gray-500 text-sm">No CIs linked</p>
          ) : (
            cis.map((ci: any) => (
              <div
                key={ci._id}
                className="border rounded p-3 text-sm flex justify-between"
              >
                <span>{ci.ci?.name || ci.ci}</span>
                <span className="text-gray-500">{ci.role}</span>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "conflicts" && (
        <div className="space-y-2">
          {conflicts.length === 0 ? (
            <p className="text-gray-500 text-sm">No conflicts detected</p>
          ) : (
            conflicts.map((cf: any) => (
              <div key={cf._id} className="border rounded p-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">{cf.conflictType}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${cf.isResolved ? "bg-green-100" : "bg-red-100"}`}
                  >
                    {cf.isResolved ? "Resolved" : "Open"}
                  </span>
                </div>
                <div className="text-gray-500 text-xs mt-1">
                  {cf.description}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "risk" && (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500">Risk Level</label>
            <p className="font-medium">{change.risk}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Risk Score</label>
            <p>{change.riskScore || 0}</p>
          </div>
        </div>
      )}
    </div>
  );
}
