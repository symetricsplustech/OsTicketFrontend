import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  incidentApi,
  Incident,
  IncidentAssignmentHistory,
} from "@modules/helpdesk/services/incidents/incidentApi";
import { formatDate } from "@shared/lib/format";
import toast from "react-hot-toast";
import { useAuth } from "@core/auth/useAuth";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  on_hold_caller: "bg-orange-100 text-orange-800",
  on_hold_change: "bg-orange-100 text-orange-800",
  on_hold_problem: "bg-orange-100 text-orange-800",
  on_hold_vendor: "bg-orange-100 text-orange-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
  canceled: "bg-red-100 text-red-800",
  investigating: "bg-yellow-100 text-yellow-800",
  identified: "bg-purple-100 text-purple-800",
  monitoring: "bg-cyan-100 text-cyan-800",
};

const PRIORITY_COLORS: Record<string, string> = {
  Low: "bg-gray-100 text-gray-800",
  Normal: "bg-blue-100 text-blue-800",
  High: "bg-orange-100 text-orange-800",
  Emergency: "bg-red-100 text-red-800",
};

export default function IncidentRecord() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [history, setHistory] = useState<IncidentAssignmentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "details" | "timeline" | "assignment" | "cis" | "tasks"
  >("details");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!id) return;
    try {
      const [incRes, histRes] = await Promise.all([
        incidentApi.getById(id),
        incidentApi.getAssignmentHistory(id),
      ]);
      setIncident(incRes.data.data);
      setHistory(histRes.data.data || []);
    } catch {
      toast.error("Failed to load incident");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleTransition = async (status: string) => {
    if (!id || !hasPermission("incident.update")) return;
    setSubmitting(true);
    try {
      await incidentApi.transition(id, { status });
      toast.success(`Incident moved to ${status}`);
      load();
    } catch {
      toast.error("Failed to transition");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async () => {
    if (!id || !comment.trim()) return;
    setSubmitting(true);
    try {
      await incidentApi.addComment(id, { message: comment, type: "comment" });
      setComment("");
      toast.success("Comment added");
      load();
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async () => {
    if (!id) return;
    const resolutionCode = prompt(
      "Resolution code (fixed/workaround/duplicate/not_reproducible/not_a_bug/user_error/by_design/third_party/will_not_fix):",
    );
    if (!resolutionCode) return;
    setSubmitting(true);
    try {
      await incidentApi.resolve(id, {
        resolutionCode,
        notes: prompt("Resolution notes:") || "",
      });
      toast.success("Incident resolved");
      load();
    } catch {
      toast.error("Failed to resolve");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!incident)
    return <div className="p-6 text-red-600">Incident not found</div>;

  const allowedTransitions = getAllowedTransitions(incident.status);

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
            {incident.number}: {incident.title}
          </h1>
          <div className="flex gap-2 mt-2">
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[incident.status] || "bg-gray-100"}`}
            >
              {incident.status}
            </span>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${PRIORITY_COLORS[incident.priority] || "bg-gray-100"}`}
            >
              {incident.priority}
            </span>
            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100">
              {incident.severity}
            </span>
            {incident.isMajor && (
              <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                MAJOR
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {allowedTransitions.map((s) => (
            <button
              key={s}
              onClick={() => handleTransition(s)}
              disabled={submitting}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              {s.replace(/_/g, " ")}
            </button>
          ))}
          {incident.status === "resolved" &&
            hasPermission("incident.resolve") && (
              <button
                onClick={handleResolve}
                disabled={submitting}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                Resolve
              </button>
            )}
        </div>
      </div>

      <div className="flex gap-4 border-b">
        {(["details", "timeline", "assignment", "cis", "tasks"] as const).map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition ${activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ),
        )}
      </div>

      {activeTab === "details" && (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">Description</label>
              <p>{incident.description || incident.summary || "-"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Category</label>
              <p>
                {incident.category || "-"} / {incident.subcategory || "-"}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Caller</label>
              <p>{incident.caller?.name || "-"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Affected User</label>
              <p>{incident.affectedUser?.name || "-"}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">Impact</label>
              <p>{incident.impact || "-"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Urgency</label>
              <p>{incident.urgency || "-"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Assigned To</label>
              <p>{incident.assignedTo?.name || "-"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Assignment Group</label>
              <p>{incident.assignmentGroup?.name || "-"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">SLA Due</label>
              <p>{incident.slaDue ? formatDate(incident.slaDue) : "-"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Resolved At</label>
              <p>
                {incident.resolvedAt ? formatDate(incident.resolvedAt) : "-"}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "timeline" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 border rounded px-3 py-2 text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
            />
            <button
              onClick={handleAddComment}
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          <div className="space-y-3">
            {incident.timeline
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
        </div>
      )}

      {activeTab === "assignment" && (
        <div className="space-y-4">
          <h3 className="font-semibold">Assignment History</h3>
          <div className="space-y-2">
            {history.map((h) => (
              <div key={h._id} className="border rounded p-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">{h.assignmentType}</span>
                  <span className="text-gray-500">
                    {formatDate(h.assignedAt)}
                  </span>
                </div>
                <div className="text-gray-600 mt-1">
                  {h.fromAgent?.name || h.fromGroup?.name || "None"} &rarr;{" "}
                  {h.toAgent?.name || h.toGroup?.name || "None"}
                  {h.reason && (
                    <span className="ml-2 text-xs text-gray-400">
                      ({h.reason})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "cis" && <CIPanel incidentId={incident._id} />}
      {activeTab === "tasks" && <TasksPanel incidentId={incident._id} />}
    </div>
  );
}

function CIPanel({ incidentId }: { incidentId: string }) {
  const [cis, setCis] = useState<any[]>([]);
  useEffect(() => {
    incidentApi.listCIs(incidentId).then((res) => setCis(res.data.data || []));
  }, [incidentId]);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Related CIs</h3>
      {cis.length === 0 ? (
        <p className="text-gray-500 text-sm">No CIs linked</p>
      ) : (
        <div className="space-y-2">
          {cis.map((ci) => (
            <div
              key={ci._id}
              className="border rounded p-3 text-sm flex justify-between"
            >
              <span>{ci.ci?.name || ci.ci}</span>
              <span className="text-gray-500">{ci.role}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TasksPanel({ incidentId }: { incidentId: string }) {
  const [tasks, setTasks] = useState<any[]>([]);
  useEffect(() => {
    incidentApi
      .listTasks(incidentId)
      .then((res) => setTasks(res.data.data || []));
  }, [incidentId]);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Incident Tasks</h3>
      {tasks.length === 0 ? (
        <p className="text-gray-500 text-sm">No tasks</p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task._id} className="border rounded p-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">
                  {task.number}: {task.title}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-gray-100">
                  {task.status}
                </span>
              </div>
              <div className="text-gray-500 text-xs mt-1">
                Assigned: {task.assignedTo?.name || "Unassigned"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getAllowedTransitions(current: string): string[] {
  const map: Record<string, string[]> = {
    new: ["in_progress", "on_hold_caller", "canceled"],
    in_progress: [
      "on_hold_caller",
      "on_hold_change",
      "on_hold_problem",
      "on_hold_vendor",
      "resolved",
      "canceled",
    ],
    on_hold_caller: ["in_progress", "canceled"],
    on_hold_change: ["in_progress", "canceled"],
    on_hold_problem: ["in_progress", "canceled"],
    on_hold_vendor: ["in_progress", "canceled"],
    resolved: ["closed", "in_progress"],
    closed: ["in_progress"],
    canceled: ["new"],
    investigating: ["identified", "monitoring", "resolved"],
    identified: ["monitoring", "resolved", "investigating"],
    monitoring: ["resolved", "investigating"],
  };
  return map[current] || [];
}
