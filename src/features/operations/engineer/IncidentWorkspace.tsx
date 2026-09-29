import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Activity, CheckCircle2, Clock3, FileText,
  FolderGit2, LayoutGrid, Lock, Paperclip,
  Search, ShieldCheck, TaskHorizontal, UserPlus,
} from "lucide-react";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody, CardHeader } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { Button } from "@shared/components/Button";
import { Tabs } from "@shared/components/Tabs";
import { ActivityStream } from "@shared/components/ActivityStream";
import { AttachmentPanel } from "@shared/components/AttachmentPanel";
import { AssignmentPanel } from "@shared/components/AssignmentPanel";
import { SlaPanel } from "@shared/components/SlaPanel";
import { EngineerPicker } from "@shared/components/EngineerPicker";
import { RelationshipManager } from "@shared/components/RelationshipManager";
import { AuditExplorer } from "@shared/components/AuditExplorer";
import { LifecycleTimeline } from "@shared/components/LifecycleTimeline";
import { PermissionGate } from "@shared/components/PermissionGate";
import { useAppSelector } from "@shared/store/hooks";
import { selectPermissions } from "@shared/auth/authSlice";
import { can } from "@shared/authorization/permissions";

const tabs = ["Activity", "Related Records", "Tasks", "Assignment History", "Dispatch", "SLA", "Approvals", "Attachments", "Audit"];

interface ActivityEntry {
  id: string; actor: string; action: string; resource?: string; timestamp: string; details?: string;
}

export function IncidentWorkspace() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Activity");
  const permissions = useAppSelector(selectPermissions);

  const recordNumber = "INC001042";
  const status = "In Progress";
  const priority = "P1";

  const activityEntries: ActivityEntry[] = [
    { id: "1", actor: "Aarav Mehta", action: "Changed state from New to In Progress", timestamp: "2024-01-15T10:30:00", details: "Started investigating the issue" },
    { id: "2", actor: "System", action: "Assigned to Service Desk L2", timestamp: "2024-01-15T09:15:00" },
    { id: "3", actor: "Maya Shah", action: "Created the incident", timestamp: "2024-01-15T09:00:00", details: "VPN access fails after password reset" },
  ];

  const attachments = [
    { id: "1", name: "screenshot.png", type: "image", size: "245 KB", uploadedAt: "2024-01-15", uploadedBy: "Maya Shah" },
    { id: "2", name: "logs.txt", type: "pdf", size: "1.2 MB", uploadedAt: "2024-01-15", uploadedBy: "Aarav Mehta" },
  ];

  const slaInfo = {
    responseTarget: "15 minutes",
    resolutionTarget: "4 hours",
    startedAt: "2024-01-15T09:00:00",
    paused: false,
    breached: false,
    warningThreshold: 80,
    currentResponse: "10 minutes",
    currentResolution: "2 hours",
  };

  const assignment = { group: "Service Desk L2", assignedTo: "Aarav Mehta", assignedBy: "System", assignedAt: "2024-01-15T09:15:00", method: "Auto-assignment" };

  const lifecycleSteps = [
    { id: "1", label: "New", state: "new", timestamp: "2024-01-15T09:00:00", actor: "Maya Shah", isActive: false, isCompleted: true, isCurrent: false },
    { id: "2", label: "Assigned", state: "assigned", timestamp: "2024-01-15T09:15:00", actor: "System", isActive: false, isCompleted: true, isCurrent: false },
    { id: "3", label: "In Progress", state: "in_progress", timestamp: "2024-01-15T10:30:00", actor: "Aarav Mehta", isActive: true, isCompleted: true, isCurrent: true },
    { id: "4", label: "Resolved", state: "resolved", isActive: false, isCompleted: false, isCurrent: false },
    { id: "5", label: "Closed", state: "closed", isActive: false, isCompleted: false, isCurrent: false },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title={`${recordNumber} — Incident Workspace`}
        description="Full record context, activity, relationships, and permitted actions."
        breadcrumbs={<span className="text-xs text-slate-500">Incidents &gt; {recordNumber}</span>}
        actions={
          <div className="flex flex-wrap gap-2">
            <PermissionGate permissions={["itsm.incident.update"]}>
              <Button variant="outline">Edit</Button>
            </PermissionGate>
            <PermissionGate permissions={["itsm.incident.transition"]}>
              <Button>Transition</Button>
            </PermissionGate>
            <PermissionGate permissions={["itsm.approval.read"]}>
              <Button variant="outline">Approve</Button>
            </PermissionGate>
          </div>
        }
      />

      <div className="flex items-center gap-3">
        <Badge variant="info">{status}</Badge>
        <Badge variant="danger">{priority}</Badge>
        <Badge variant="warning">SLA On Track</Badge>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-5">
          <Card>
            <CardHeader title="Record Details">
              <dl className="mt-4 grid gap-4 border-t pt-4 text-sm sm:grid-cols-2">
                {[
                  { label: "Record", value: recordNumber },
                  { label: "Assigned to", value: assignment.assignedTo },
                  { label: "Assignment Group", value: assignment.group },
                  { label: "Service", value: "Workplace Technology" },
                  { label: "Opened for", value: "Maya Shah" },
                  { label: "SLA Due", value: "Today, 17:42" },
                ].map((item) => (
                  <div key={item.label}>
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</dt>
                    <dd className="mt-1 font-medium text-slate-800">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader title="Lifecycle" />
            <CardBody><LifecycleTimeline steps={lifecycleSteps} /></CardBody>
          </Card>

          <Tabs
            tabs={tabs.map((t) => ({ id: t, label: t }))}
            active={activeTab}
            onChange={setActiveTab}
          />

          <Card>
            <CardBody>
              {activeTab === "Activity" && <ActivityStream entries={activityEntries} />}
              {activeTab === "Related Records" && (
                <RelationshipManager
                  relationships={[{ id: "1", type: "related", sourceType: "incident", sourceId: recordNumber, targetType: "problem", targetId: "PRB000401", targetName: "Recurring authentication latency", direction: "related" }]}
                  sourceType="incident" sourceId={recordNumber} onAdd={() => {}} onRemove={() => {}} onSearch={() => {}} searchResults={[{ id: "PRB000402", name: "Authentication timeout issue", type: "problem" }]}
                />
              )}
              {activeTab === "Tasks" && <div className="py-4 text-center text-sm text-slate-500">No tasks associated with this record.</div>}
              {activeTab === "Assignment History" && <AuditExplorer entries={[{ id: "1", timestamp: "2024-01-15T09:15:00", actor: "System", action: "Assigned", resourceType: "incident", resourceId: recordNumber, before: "Unassigned", after: "Service Desk L2" }]} loading={false} onFilter={() => {}} />}
              {activeTab === "Dispatch" && <AssignmentPanel assignment={assignment} onAssign={() => {}} onReassign={() => {}} onAssignToMe={() => {}} />}
              {activeTab === "SLA" && <SlaPanel sla={slaInfo} />}
              {activeTab === "Approvals" && <div className="py-4 text-center text-sm text-slate-500">No pending approvals.</div>}
              {activeTab === "Attachments" && <AttachmentPanel attachments={attachments} onUpload={() => {}} onRemove={() => {}} />}
              {activeTab === "Audit" && <AuditExplorer entries={[{ id: "1", timestamp: "2024-01-15T09:00:00", actor: "Maya Shah", action: "Created", resourceType: "incident", resourceId: recordNumber, correlationId: "corr-001" }]} loading={false} onFilter={() => {}} />}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-5">
          <SlaPanel sla={slaInfo} />
          <AssignmentPanel assignment={assignment} onAssign={() => {}} onReassign={() => {}} onAssignToMe={() => {}} />
          <Card>
            <CardBody><EngineerPicker engineers={[{ id: "1", name: "Aarav Mehta", skills: ["Network", "VPN"], location: "Office", availability: "available", activeJobs: 3, slaRisk: 2, group: "Service Desk L2" }, { id: "2", name: "Neha Singh", skills: ["Hardware"], location: "Remote", availability: "busy", activeJobs: 5, slaRisk: 4, group: "Service Desk L1" }]} onSelect={() => {}} selected={{ id: "1", name: "Aarav Mehta", skills: [], location: "", availability: "available", activeJobs: 3, slaRisk: 2, group: "Service Desk L2" }} loading={false} /></CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
