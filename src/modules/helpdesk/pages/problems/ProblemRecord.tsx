import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  problemApi,
  Problem,
  ProblemAssignmentHistory,
  KnownError,
  RootCauseRecord,
} from "@modules/helpdesk/services/problems/problemApi";
import { formatDate } from "@shared/lib/format";
import toast from "react-hot-toast";
import { useAuth } from "@core/auth/useAuth";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  assess: "bg-yellow-100 text-yellow-800",
  root_cause_analysis: "bg-purple-100 text-purple-800",
  fix_in_progress: "bg-orange-100 text-orange-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
  canceled: "bg-red-100 text-red-800",
  risk_accepted: "bg-cyan-100 text-cyan-800",
};

function getAllowedTransitions(current: string): string[] {
  const map: Record<string, string[]> = {
    new: ["assess", "canceled"],
    assess: [
      "root_cause_analysis",
      "fix_in_progress",
      "resolved",
      "canceled",
      "risk_accepted",
    ],
    root_cause_analysis: [
      "fix_in_progress",
      "assess",
      "canceled",
      "risk_accepted",
    ],
    fix_in_progress: ["resolved", "root_cause_analysis", "assess", "canceled"],
    resolved: ["closed", "fix_in_progress", "assess"],
    closed: ["assess"],
    canceled: ["new"],
    risk_accepted: ["assess", "canceled"],
  };
  return map[current] || [];
}

export default function ProblemRecord() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [history, setHistory] = useState<ProblemAssignmentHistory[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [cis, setCis] = useState<any[]>([]);
  const [knownErrors, setKnownErrors] = useState<KnownError[]>([]);
  const [rootCauses, setRootCauses] = useState<RootCauseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    | "details"
    | "timeline"
    | "incidents"
    | "cis"
    | "tasks"
    | "known-errors"
    | "root-cause"
  >("details");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!id) return;
    try {
      const [pRes, hRes, incRes, tRes, ciRes, keRes, rcRes] = await Promise.all(
        [
          problemApi.getById(id),
          problemApi.getAssignmentHistory(id),
          problemApi.listIncidents(id),
          problemApi.listTasks(id),
          problemApi.listCIs(id),
          problemApi.listKnownErrors({ problem: id }),
          problemApi.listRootCauseRecords(id),
        ],
      );
      setProblem(pRes.data.data);
      setHistory(hRes.data.data || []);
      setIncidents(incRes.data.data || []);
      setTasks(tRes.data.data || []);
      setCis(ciRes.data.data || []);
      setKnownErrors(keRes.data.items || []);
      setRootCauses(rcRes.data.data || []);
    } catch {
      toast.error("Failed to load problem");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleTransition = async (status: string) => {
    if (!id || !hasPermission("problem.update")) return;
    setSubmitting(true);
    try {
      await problemApi.transition(id, { status });
      toast.success(`Problem moved to ${status}`);
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
      await problemApi.addComment(id, { message: comment });
      setComment("");
      toast.success("Comment added");
      load();
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!problem)
    return <div className="p-6 text-red-600">Problem not found</div>;

  const allowedTransitions = getAllowedTransitions(problem.status);

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
            {problem.number}: {problem.title}
          </h1>
          <div className="flex gap-2 mt-2">
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[problem.status] || "bg-gray-100"}`}
            >
              {problem.status?.replace(/_/g, " ")}
            </span>
            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100">
              {problem.priority}
            </span>
            {problem.knownError && (
              <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                KNOWN ERROR
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
        </div>
      </div>

      <div className="flex gap-4 border-b">
        {(
          [
            "details",
            "timeline",
            "incidents",
            "cis",
            "tasks",
            "known-errors",
            "root-cause",
          ] as const
        ).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition ${activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            {tab.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      {activeTab === "details" && (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">Description</label>
              <p>{problem.description || "-"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Category</label>
              <p>
                {problem.category || "-"} / {problem.subcategory || "-"}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Root Cause</label>
              <p>{problem.rootCause || "-"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">
                Root Cause Category
              </label>
              <p>{problem.rootCauseCategory?.replace(/_/g, " ") || "-"}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">Workaround</label>
              <p>{problem.workaround || "-"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">
                Permanent Solution
              </label>
              <p>{problem.permanentSolution || "-"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Assigned To</label>
              <p>{problem.assignedTo?.name || "-"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Assignment Group</label>
              <p>{problem.assignmentGroup?.name || "-"}</p>
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
            {problem.timeline
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

      {activeTab === "incidents" && (
        <div className="space-y-2">
          {incidents.length === 0 ? (
            <p className="text-gray-500 text-sm">No linked incidents</p>
          ) : (
            incidents.map((inc: any) => (
              <div key={inc._id} className="border rounded p-3 text-sm">
                <span className="font-medium">
                  {inc.incident?.number || inc.incident}
                </span>
                <span className="ml-2 text-gray-500">
                  {inc.incident?.title}
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

      {activeTab === "tasks" && (
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <p className="text-gray-500 text-sm">No tasks</p>
          ) : (
            tasks.map((task: any) => (
              <div key={task._id} className="border rounded p-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">
                    {task.number}: {task.title}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-100">
                    {task.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "known-errors" && (
        <div className="space-y-2">
          {knownErrors.length === 0 ? (
            <p className="text-gray-500 text-sm">No known errors</p>
          ) : (
            knownErrors.map((ke) => (
              <div key={ke._id} className="border rounded p-3 text-sm">
                <div className="font-medium">
                  {ke.number}: {ke.title}
                </div>
                <div className="text-gray-500 text-xs mt-1">
                  Status: {ke.status} | Workaround: {ke.workaround || "None"}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "root-cause" && (
        <div className="space-y-2">
          {rootCauses.length === 0 ? (
            <p className="text-gray-500 text-sm">No root cause records</p>
          ) : (
            rootCauses.map((rc) => (
              <div key={rc._id} className="border rounded p-3 text-sm">
                <div className="font-medium">
                  {rc.category?.replace(/_/g, " ")}
                </div>
                <div className="text-gray-500 text-xs mt-1">
                  {rc.description}
                </div>
                <div className="text-xs mt-1">
                  Identified: {formatDate(rc.identifiedAt)} | Verified:{" "}
                  {rc.isVerified ? "Yes" : "No"}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
