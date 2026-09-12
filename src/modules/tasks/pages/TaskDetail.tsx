import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  Eye,
  EyeOff,
  Trash2,
  RotateCcw,
  Link as LinkIcon,
  UserPlus,
} from "lucide-react";
import { taskApi } from "@modules/tasks/services/taskApi";
import type {
  Task,
  TaskActivity,
  TaskWatcher,
  TaskRelationship,
} from "@shared/types/task";
import AttachmentPanel from "./AttachmentPanel";
import SlaPanel from "./SlaPanel";
import ApprovalPanel from "./ApprovalPanel";

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

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [activities, setActivities] = useState<TaskActivity[]>([]);
  const [watchers, setWatchers] = useState<TaskWatcher[]>([]);
  const [relationships, setRelationships] = useState<{
    outgoing: TaskRelationship[];
    incoming: TaskRelationship[];
  }>({ outgoing: [], incoming: [] });
  const [allowedTransitions, setAllowedTransitions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [transitionComment, setTransitionComment] = useState("");
  const [showTransitionModal, setShowTransitionModal] = useState(false);
  const [pendingState, setPendingState] = useState("");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Task>>({});

  const loadTask = useCallback(async () => {
    if (!id) return;
    try {
      const [taskRes, transRes] = await Promise.all([
        taskApi.getById(id),
        taskApi.getAllowedTransitions(id),
      ]);
      setTask(taskRes.data);
      setWatchers((taskRes.data as any).watchers || []);
      setRelationships(
        (taskRes.data as any).relationships || { outgoing: [], incoming: [] },
      );
      setAllowedTransitions(transRes.data.allowed);
      setEditForm({
        title: taskRes.data.title,
        description: taskRes.data.description,
        priority: taskRes.data.priority,
        category: taskRes.data.category,
        dueDate: taskRes.data.dueDate,
      });
    } catch {
      navigate("/tasks");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  const handleComment = async () => {
    if (!id || !comment.trim()) return;
    await taskApi.addComment(id, comment, isPublic);
    setComment("");
    loadTask();
  };

  const handleTransition = async () => {
    if (!id || !pendingState) return;
    await taskApi.transition(id, pendingState, transitionComment || undefined);
    setShowTransitionModal(false);
    setPendingState("");
    setTransitionComment("");
    loadTask();
  };

  const handleUpdate = async () => {
    if (!id) return;
    await taskApi.update(id, editForm);
    setEditing(false);
    loadTask();
  };

  const handleDelete = async () => {
    if (!id || !confirm("Delete this task?")) return;
    await taskApi.delete(id);
    navigate("/tasks");
  };

  const handleRestore = async () => {
    if (!id) return;
    await taskApi.restore(id);
    loadTask();
  };

  const handleRemoveWatcher = async (userId: string) => {
    if (!id) return;
    await taskApi.removeWatcher(id, userId);
    loadTask();
  };

  if (loading)
    return <div className="text-center py-12 text-gray-400">Loading...</div>;
  if (!task)
    return (
      <div className="text-center py-12 text-gray-400">Task not found</div>
    );

  const isTerminal = ["closed", "cancelled"].includes(task.state);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/tasks")}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{task.number}</h1>
            <p className="text-gray-500 text-sm">{task.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {task.deletedAt && (
            <button
              onClick={handleRestore}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm hover:bg-green-100"
            >
              <RotateCcw className="h-4 w-4" /> Restore
            </button>
          )}
          {!task.deletedAt && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          )}
          {!isTerminal && allowedTransitions.length > 0 && (
            <button
              onClick={() => setShowTransitionModal(true)}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700"
            >
              Transition
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Details</h2>
              <button
                onClick={() => setEditing(!editing)}
                className="text-sm text-brand-600 hover:underline"
              >
                {editing ? "Cancel" : "Edit"}
              </button>
            </div>
            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    value={editForm.title || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editForm.description || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={editForm.priority || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          priority: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    >
                      {["critical", "high", "medium", "low", "planning"].map(
                        (p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <input
                      type="datetime-local"
                      value={
                        editForm.dueDate
                          ? new Date(editForm.dueDate)
                              .toISOString()
                              .slice(0, 16)
                          : ""
                      }
                      onChange={(e) =>
                        setEditForm({ ...editForm, dueDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-500">State:</span>{" "}
                    <span
                      className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${STATE_COLORS[task.state]}`}
                    >
                      {task.state.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Type:</span>{" "}
                    <span className="ml-2">{task.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Priority:</span>{" "}
                    <span className="ml-2">{task.priority}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Category:</span>{" "}
                    <span className="ml-2">{task.category || "-"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Assigned To:</span>{" "}
                    <span className="ml-2">{task.assignedTo?.name || "-"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Assignment Group:</span>{" "}
                    <span className="ml-2">
                      {task.assignmentGroup?.name || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Requested By:</span>{" "}
                    <span className="ml-2">{task.requestedBy?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Due Date:</span>{" "}
                    <span className="ml-2">
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleString()
                        : "-"}
                    </span>
                  </div>
                </div>
                {task.description && (
                  <div className="mt-4">
                    <span className="text-gray-500">Description:</span>
                    <p className="mt-1 text-gray-800 whitespace-pre-wrap">
                      {task.description}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Activity</h2>
            <div className="space-y-4">
              {activities.length === 0 && (
                <p className="text-sm text-gray-400">No activity yet</p>
              )}
              {activities.map((a) => (
                <div key={a._id} className="border-l-2 border-gray-200 pl-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-medium text-gray-700">{a.type}</span>
                    <span>{new Date(a.createdAt).toLocaleString()}</span>
                    {!a.isPublic && (
                      <span className="text-orange-500">(internal)</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">
                    {a.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Add Comment</h2>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg text-sm mb-2"
              placeholder="Write a comment..."
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded"
                />
                Public
              </label>
              <button
                onClick={handleComment}
                disabled={!comment.trim()}
                className="flex items-center gap-1 px-3 py-1.5 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700 disabled:opacity-50"
              >
                <Send className="h-3 w-3" /> Send
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              Watchers ({watchers.length})
            </h2>
            <div className="space-y-2">
              {watchers.map((w) => (
                <div
                  key={w._id}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{w.userId?.name || "Unknown"}</span>
                  <button
                    onClick={() => handleRemoveWatcher(w.userId?._id)}
                    className="text-red-500 hover:underline text-xs"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {watchers.length === 0 && (
                <p className="text-sm text-gray-400">No watchers</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Relationships</h2>
            {relationships.outgoing.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">Outgoing:</p>
                {relationships.outgoing.map((r) => (
                  <div
                    key={r._id}
                    className="text-sm text-brand-600 hover:underline cursor-pointer"
                    onClick={() => navigate(`/tasks/${r.targetTaskId._id}`)}
                  >
                    {r.relationshipType} {r.targetTaskId?.number}
                  </div>
                ))}
              </div>
            )}
            {relationships.incoming.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Incoming:</p>
                {relationships.incoming.map((r) => (
                  <div
                    key={r._id}
                    className="text-sm text-brand-600 hover:underline cursor-pointer"
                    onClick={() => navigate(`/tasks/${r.sourceTaskId._id}`)}
                  >
                    {r.relationshipType} {r.sourceTaskId?.number}
                  </div>
                ))}
              </div>
            )}
            {relationships.outgoing.length === 0 &&
              relationships.incoming.length === 0 && (
                <p className="text-sm text-gray-400">No relationships</p>
              )}
          </div>

          {task.tags && task.tags.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-2">Tags</h2>
              <div className="flex flex-wrap gap-1">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <AttachmentPanel taskId={task._id} isTerminal={isTerminal} />
          <SlaPanel taskId={task._id} />
          <ApprovalPanel
            taskId={task._id}
            isTerminal={isTerminal}
            onRefresh={loadTask}
          />
        </div>
      </div>

      {showTransitionModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 space-y-4">
            <h3 className="font-semibold text-gray-900">
              Transition from {task.state.replace(/_/g, " ")}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {allowedTransitions.map((s) => (
                <button
                  key={s}
                  onClick={() => setPendingState(s)}
                  className={`px-3 py-2 rounded-lg text-sm border ${pendingState === s ? "bg-brand-50 border-brand-500 text-brand-700" : "hover:bg-gray-50"}`}
                >
                  {s.replace(/_/g, " ")}
                </button>
              ))}
            </div>
            <textarea
              value={transitionComment}
              onChange={(e) => setTransitionComment(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              placeholder="Comment (optional)"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowTransitionModal(false);
                  setPendingState("");
                  setTransitionComment("");
                }}
                className="px-3 py-1.5 border rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleTransition}
                disabled={!pendingState}
                className="px-4 py-1.5 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700 disabled:opacity-50"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
