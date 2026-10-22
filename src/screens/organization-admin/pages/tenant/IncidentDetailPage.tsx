import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, LifeBuoy, User, MessageCircle, RefreshCw, AlertTriangle } from "lucide-react";
import { Button, Field, Input, Select, Textarea } from "@components/common/ui";
import { StatusBadge } from "@/screens/saas-admin/components/ui/StatusBadge";
import { toast } from "react-hot-toast";
import {
  useGetIncidentQuery,
  useAssignIncidentMutation,
  useResolveIncidentMutation,
  useReopenIncidentMutation,
  useEscalateIncidentMutation,
  useCreateIncidentCommentMutation,
  useListIncidentCommentsQuery,
  useListUsersQuery,
} from "@services/tenantadmin";
import { SaasAdminScreen } from "@/screens/saas-admin/components/SaasAdminScreen";
import { apiErrorMessage } from "@services/http";

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  "in-progress": "In Progress",
  pending: "Pending",
  resolved: "Resolved",
  closed: "Closed",
  reopened: "Reopened",
};

export function IncidentDetailPage() {
  const { incidentId } = useParams();
  const navigate = useNavigate();

  const { data: incidentData, isLoading: incidentLoading } = useGetIncidentQuery(
    incidentId ?? "",
    { skip: !incidentId },
  );

  const { data: usersData } = useListUsersQuery({ limit: 50 });
  const users = usersData?.data ?? [];

  const {
    data: commentsData,
    isLoading: commentsLoading,
  } = useListIncidentCommentsQuery(
    { incidentId: incidentId ?? "" },
    { skip: !incidentId },
  );
  const comments = commentsData?.data ?? [];

  const incident = incidentData?.data;
  const [triggerAssign] = useAssignIncidentMutation();
  const [triggerResolve] = useResolveIncidentMutation();
  const [triggerReopen] = useReopenIncidentMutation();
  const [triggerEscalate] = useEscalateIncidentMutation();
  const [triggerComment] = useCreateIncidentCommentMutation();

  const [assignForm, setAssignForm] = useState({ teamId: "", userId: "" });
  const [commentForm, setCommentForm] = useState({ body: "", isInternal: false });
  const [resolveForm, setResolveForm] = useState({ resolutionCode: "", resolutionNotes: "" });

  const [openAssign, setOpenAssign] = useState(false);
  const [openComment, setOpenComment] = useState(false);
  const [openResolve, setOpenResolve] = useState(false);

  const canAssign = incident?.statusKey !== "closed" && incident?.statusKey !== "resolved";
  const canResolve = incident?.statusKey === "in-progress" || incident?.statusKey === "pending" || incident?.statusKey === "assigned";
  const canReopen = incident?.statusKey === "resolved" || incident?.statusKey === "closed";

  if (incidentLoading || !incident || !incidentId) {
    return (
      <div className="p-6 text-slate-500">Loading ticket…</div>
    );
  }

  const statusLabel = STATUS_LABELS[incident.statusKey] ?? incident.statusKey;

  const handleAssign = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await triggerAssign({
        id: incident.id,
        body: {
          assigneeId: assignForm.userId || null,
          teamId: assignForm.teamId || null,
        },
      }).unwrap();
      toast.success("Ticket assigned");
      setOpenAssign(false);
      navigate(0);
    } catch (cause) {
      toast.error(apiErrorMessage((cause as { data?: unknown } | undefined)?.data));
    }
  };

  const handleComment = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await triggerComment({
        incidentId: incident.id,
        body: { body: commentForm.body, isInternal: commentForm.isInternal },
      }).unwrap();
      toast.success("Comment added");
      setOpenComment(false);
      setCommentForm({ body: "", isInternal: false });
      navigate(0);
    } catch (cause) {
      toast.error(apiErrorMessage((cause as { data?: unknown } | undefined)?.data));
    }
  };

  const handleResolve = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await triggerResolve({
        id: incident.id,
        body: {
          resolutionCode: resolveForm.resolutionCode || null,
          resolutionNotes: resolveForm.resolutionNotes,
        },
      }).unwrap();
      toast.success("Ticket resolved");
      setOpenResolve(false);
      navigate(0);
    } catch (cause) {
      toast.error(apiErrorMessage((cause as { data?: unknown } | undefined)?.data));
    }
  };

  const handleReopen = async () => {
    try {
      await triggerReopen({
        id: incident.id,
        body: { reason: "Reopened from ticket detail" },
      }).unwrap();
      toast.success("Ticket reopened");
      navigate(0);
    } catch (cause) {
      toast.error(apiErrorMessage((cause as { data?: unknown } | undefined)?.data));
    }
  };

  const handleEscalate = async () => {
    try {
      await triggerEscalate({
        id: incident.id,
        body: { priorityKey: incident.priorityKey, reason: "Escalated from ticket detail" },
      }).unwrap();
      toast.success("Ticket escalated");
      navigate(0);
    } catch (cause) {
      toast.error(apiErrorMessage((cause as { data?: unknown } | undefined)?.data));
    }
  };

  return (
    <SaasAdminScreen
      title={`Ticket ${incident.number}`}
      description={incident.description ?? undefined}
      breadcrumbs={[
        { label: "Service Desk", href: "/organization" },
        { label: "All Service Desk Tickets", href: "/organization/service-desk/all-service-desk-tickets" },
        { label: incident.number },
      ]}
      backTo="/organization/service-desk/all-service-desk-tickets"
      backLabel="Back to tickets"
      actions={
        <div className="flex gap-2">
          {canReopen && (
            <Button variant="outline" onClick={handleReopen} size="sm">
              <RefreshCw className="h-4 w-4 mr-1" />
              Reopen
            </Button>
          )}
          <Button variant="outline" onClick={handleEscalate} size="sm">
            <AlertTriangle className="h-4 w-4 mr-1" />
            Escalate
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket header */}
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Ticket Number
            </span>
            <span className="text-lg font-mono font-bold text-slate-900">
              {incident.number}
            </span>
            <StatusBadge status={incident.statusKey} />
            <span className="ml-auto text-xs font-semibold text-slate-500">
              {incident.source ?? "PORTAL"}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              {incident.title}
            </h2>
            <p className="text-slate-600 mb-4">{incident.description || "No description provided."}</p>

            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </dt>
                <dd className="mt-1">{statusLabel}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Priority
                </dt>
                <dd className="mt-1">{incident.priorityKey?.toUpperCase() ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Impact
                </dt>
                <dd className="mt-1">{incident.impact ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Urgency
                </dt>
                <dd className="mt-1">{incident.urgency ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Category
                </dt>
                <dd className="mt-1">{incident.categoryId ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Assignee
                </dt>
                <dd className="mt-1">
                  {incident.assignee ? (
                    <>
                      {incident.assignee.firstName} {incident.assignee.lastName} ({incident.assignee.email})
                    </>
                  ) : (
                    <span className="text-slate-400">Unassigned</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Team
                </dt>
                <dd className="mt-1">{incident.team?.name ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Created
                </dt>
                <dd className="mt-1">
                  {new Date(incident.createdAt).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Actions sidebar */}
        <div className="lg:col-span-1">
          <div className="space-y-3">
            <Button
              onClick={() => setOpenAssign(true)}
              disabled={!canAssign}
              variant={canAssign ? "primary" : "outline"}
              className="w-full"
            >
              <User className="h-4 w-4 mr-1" />
              {canAssign ? "Assign to Team / User" : "Cannot assign (closed)"}
            </Button>

            <Button
              onClick={() => setOpenResolve(true)}
              disabled={!canResolve}
              variant={canResolve ? "primary" : "outline"}
              className="w-full"
            >
              <LifeBuoy className="h-4 w-4 mr-1" />
              {canResolve ? "Resolve Ticket" : "Cannot resolve"}
            </Button>

            <Button
              onClick={() => setOpenComment(true)}
              variant="secondary"
              className="w-full"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Add Comment
            </Button>

            <Button
              onClick={handleEscalate}
              variant="outline"
              className="w-full text-sm"
            >
              <AlertTriangle className="h-4 w-4 mr-1" />
              Escalate
            </Button>
          </div>

          {/* Assign form */}
          {openAssign && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 mt-3">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Assign Ticket</h3>
              <form onSubmit={handleAssign} className="space-y-3">
                <Field label="Team">
                  <Select
                    value={assignForm.teamId}
                    onChange={(e) => setAssignForm({ ...assignForm, teamId: e.target.value })}
                  >
                    <option value="">No team</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.displayName}
                      </option>
                    ))}
                  </Select>
                </Field>
                <div className="flex gap-2">
                  <Button type="submit" size="sm">Assign</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setOpenAssign(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Resolve form */}
          {openResolve && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 mt-3">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Resolve Ticket</h3>
              <form onSubmit={handleResolve} className="space-y-3">
                <Field label="Resolution Code">
                  <Input
                    value={resolveForm.resolutionCode}
                    onChange={(e) => setResolveForm({ ...resolveForm, resolutionCode: e.target.value })}
                    placeholder="e.g. Hardware replaced"
                  />
                </Field>
                <Field label="Resolution Notes">
                  <Textarea
                    value={resolveForm.resolutionNotes}
                    onChange={(e) => setResolveForm({ ...resolveForm, resolutionNotes: e.target.value })}
                    rows={3}
                    required
                  />
                </Field>
                <div className="flex gap-2">
                  <Button type="submit" size="sm">Resolve</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setOpenResolve(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Comment form */}
          {openComment && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 mt-3">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Add Comment</h3>
              <form onSubmit={handleComment} className="space-y-3">
                <Field label="Comment">
                  <Textarea
                    value={commentForm.body}
                    onChange={(e) => setCommentForm({ ...commentForm, body: e.target.value })}
                    rows={3}
                    required
                  />
                </Field>
                <div className="flex items-center gap-2">
                  <input
                    id="isInternal"
                    type="checkbox"
                    checked={commentForm.isInternal}
                    onChange={(e) =>
                      setCommentForm({ ...commentForm, isInternal: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <label htmlFor="isInternal" className="text-sm text-slate-600">
                    Internal note (customer cannot see)
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm">Add Comment</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setOpenComment(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Comments timeline */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Activity & Comments
            </h3>
            {commentsLoading && <span className="text-xs text-slate-400">Loading…</span>}
          </div>
          <div className="rounded-xl border border-slate-200 bg-white">
            {comments.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">
                No comments yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-700">
                        {comment.author ? `${comment.author.firstName} ${comment.author.lastName}` : comment.authorId ?? "System"}
                      </span>
                      {comment.isInternal && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                          Internal
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700">{comment.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </SaasAdminScreen>
  );
}
