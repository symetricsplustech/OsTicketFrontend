import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, AlertTriangle, RefreshCw } from "lucide-react";
import { Button, Field, Input, Select } from "@components/common/ui";
import { StatusBadge } from "@/screens/saas-admin/components/ui/StatusBadge";
import { toast } from "react-hot-toast";
import {
  useListSlaInstancesQuery,
  useListSlaClockEventsQuery,
  usePauseSlaClockMutation,
  useResumeSlaClockMutation,
  useCompleteResponseSlaMutation,
  useDetectSlaBreachesMutation,
} from "@services/tenantadmin";
import { SaasAdminScreen } from "@/screens/saas-admin/components/SaasAdminScreen";
import { apiErrorMessage } from "@services/http";

const MILESTONE_LABELS: Record<string, string> = {
  response: "First Response",
  resolution: "Resolution",
  fulfillment: "Fulfillment",
  restoration: "Restoration",
};

const STATUS_LABELS: Record<string, string> = {
  RUNNING: "Running",
  PAUSED: "Paused",
  MET: "Met",
  BREACHED: "Breached",
  EXEMPT: "Exempt",
};

export function SlaMonitorScreen() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMilestone, setFilterMilestone] = useState("");

  const [triggerPause] = usePauseSlaClockMutation();
  const [triggerResume] = useResumeSlaClockMutation();
  const [triggerComplete] = useCompleteResponseSlaMutation();
  const [triggerBreaches] = useDetectSlaBreachesMutation();

  const { data: instances, isLoading } = useListSlaInstancesQuery(
    { status: filterStatus || undefined, milestone: filterMilestone || undefined },
  );
  const rows = instances ?? [];

  const handlePause = async (instanceId: string, milestone: string) => {
    // Find the incident id from the instance
    const row = rows.find((r) => r.id === instanceId);
    if (!row?.incidentId) return;
    try {
      await triggerPause({
        incidentId: row.incidentId,
        milestone,
        reason: "Paused from SLA monitor",
      }).unwrap();
      toast.success("SLA clock paused");
    } catch (cause) {
      toast.error(apiErrorMessage((cause as { data?: unknown } | undefined)?.data));
    }
  };

  const handleResume = async (instanceId: string, milestone: string) => {
    const row = rows.find((r) => r.id === instanceId);
    if (!row?.incidentId) return;
    try {
      await triggerResume({
        incidentId: row.incidentId,
        milestone,
        reason: "Resumed from SLA monitor",
      }).unwrap();
      toast.success("SLA clock resumed");
    } catch (cause) {
      toast.error(apiErrorMessage((cause as { data?: unknown } | undefined)?.data));
    }
  };

  const handleComplete = async (instanceId: string) => {
    const row = rows.find((r) => r.id === instanceId);
    if (!row?.incidentId) return;
    try {
      await triggerComplete({ incidentId: row.incidentId }).unwrap();
      toast.success("Response SLA marked complete");
    } catch (cause) {
      toast.error(apiErrorMessage((cause as { data?: unknown } | undefined)?.data));
    }
  };

  const handleDetectBreaches = async () => {
    try {
      await triggerBreaches().unwrap();
      toast.success("SLA breach detection complete");
    } catch (cause) {
      toast.error(apiErrorMessage((cause as { data?: unknown } | undefined)?.data));
    }
  };

  return (
    <SaasAdminScreen
      title="SLA Monitor"
      description="Track per-ticket SLA clocks, deadlines, and breaches across response and resolution milestones."
      breadcrumbs={[
        { label: "SLA & Service Performance", href: "/organization" },
        { label: "SLA Monitor" },
      ]}
      backTo="/organization/sla-service-performance/sla-policies"
      backLabel="Back to SLA policies"
      actions={
        <div className="flex gap-2">
          <Button onClick={handleDetectBreaches} size="sm">
            <AlertTriangle className="h-4 w-4 mr-1" />
            Detect Breaches
          </Button>
          <Button variant="outline" onClick={() => navigate(0)} size="sm">
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-end">
          <Field label="Filter by status">
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All statuses</option>
              <option value="RUNNING">Running</option>
              <option value="PAUSED">Paused</option>
              <option value="MET">Met</option>
              <option value="BREACHED">Breached</option>
              <option value="EXEMPT">Exempt</option>
            </Select>
          </Field>
          <Field label="Filter by milestone">
            <Select
              value={filterMilestone}
              onChange={(e) => setFilterMilestone(e.target.value)}
            >
              <option value="">All milestones</option>
              <option value="response">First Response</option>
              <option value="resolution">Resolution</option>
            </Select>
          </Field>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Ticket
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Milestone
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Priority
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Deadline
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-sm">
                    No SLA instances found.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs">{row.incident?.number ?? "—"}</span>
                      <br />
                      <span className="text-xs text-slate-500">
                        {row.incident?.title ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {MILESTONE_LABELS[row.milestone] ?? row.milestone}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {row.priorityKey?.toUpperCase() ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {row.deadlineAt ? new Date(row.deadlineAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center gap-1">
                        {row.status === "RUNNING" && row.milestone === "response" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePause(row.id, "response")}
                            className="px-2"
                          >
                            <Clock className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {row.status === "PAUSED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResume(row.id, row.milestone)}
                            className="px-2"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {row.status === "RUNNING" && row.milestone === "response" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleComplete(row.id)}
                            className="px-2"
                          >
                            <AlertTriangle className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
            Summary
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {rows.length}
              </p>
              <p className="text-xs text-slate-500">Total SLA instances</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {rows.filter((r) => r.status === "BREACHED").length}
              </p>
              <p className="text-xs text-slate-500">Breached</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {rows.filter((r) => r.status === "RUNNING").length}
              </p>
              <p className="text-xs text-slate-500">Running</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {rows.filter((r) => r.status === "MET").length}
              </p>
              <p className="text-xs text-slate-500">Met</p>
            </div>
          </div>
        </div>
      </div>
    </SaasAdminScreen>
  );
}
