import { useState } from "react";
import { UserPlus, Clock3, AlertTriangle, History, ArrowRightLeft, CalendarCheck, Shield } from "lucide-react";
import { Card, CardBody, CardHeader } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { EngineerPicker, type Engineer } from "@shared/components/EngineerPicker";
import { Button } from "@shared/components/ui";
import { cn } from "@shared/lib/cn";
import type { AuditEvent } from "@shared/types";

export interface AssignmentInfo {
  group: string;
  assignedTo: string;
  assignedBy: string;
  assignedAt: string;
  method: string;
  previousGroup?: string;
  reason?: string;
}

export interface AssignmentHistoryEntry {
  id: string;
  engineer: string;
  group: string;
  method: string;
  reason: string;
  assignedBy: string;
  assignedAt: string;
}

interface AssignmentPanelProps {
  assignment: AssignmentInfo | null;
  history?: AssignmentHistoryEntry[];
  onAssign: (engineer: Engineer, reason: string) => void;
  onReassign: (engineer: Engineer, reason: string) => void;
  onAssignToMe: () => void;
  loading?: boolean;
}

const methodIcons = {
  manual: UserPlus,
  auto: Shield,
  schedule: CalendarCheck,
  escalate: AlertTriangle,
  reassign: ArrowRightLeft,
};

export function AssignmentPanel({ assignment, history, onAssign, onReassign, onAssignToMe, loading }: AssignmentPanelProps) {
  const MethodIcon = assignment ? methodIcons[assignment.method as keyof typeof methodIcons] ?? UserPlus : UserPlus;

  return (
    <Card>
      <CardHeader title="Assignment" description="Assignment details and history" />
      <CardBody>
        {loading ? (
          <div className="py-4 text-center text-sm text-slate-500">Loading assignment…</div>
        ) : (
          <>
            {assignment ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100">
                    <MethodIcon className="h-5 w-5 text-brand-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">{assignment.assignedTo}</p>
                    <p className="text-xs text-slate-500">{assignment.group}</p>
                  </div>
                  <Badge variant="info">{assignment.method}</Badge>
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Assigned To</span><span className="font-medium">{assignment.assignedTo}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Group</span><span className="font-medium">{assignment.group}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Assigned By</span><span className="font-medium">{assignment.assignedBy}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Method</span><span className="font-medium capitalize">{assignment.method}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Assigned At</span><span className="font-medium">{new Date(assignment.assignedAt).toLocaleString()}</span></div>
                  {assignment.previousGroup ? <div className="flex justify-between"><span className="text-slate-500">Previous Group</span><span className="font-medium">{assignment.previousGroup}</span></div> : null}
                  {assignment.reason ? <div className="flex justify-between"><span className="text-slate-500">Reason</span><span className="font-medium">{assignment.reason}</span></div> : null}
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-sm text-slate-500">Not assigned</div>
            )}

            {history && history.length > 0 && (
              <div className="mt-4 border-t border-slate-200 pt-4">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                  <History className="h-4 w-4" /> Assignment History
                </h4>
                <div className="space-y-2">
                  {history.map((entry) => (
                    <div key={entry.id} className="rounded-lg border border-slate-200 bg-white p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{entry.engineer}</span>
                        <Badge variant="muted">{entry.method}</Badge>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                        <span>{entry.group}</span>
                        <span>{new Date(entry.assignedAt).toLocaleString()}</span>
                      </div>
                      {entry.reason ? <p className="mt-1 text-xs text-slate-600">Reason: {entry.reason}</p> : null}
                      <p className="mt-0.5 text-[10px] text-slate-400">by {entry.assignedBy}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 space-y-2">
              <button onClick={onAssignToMe} className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-brand-50">
                <UserPlus className="h-4 w-4" /> Assign to Me
              </button>
              <EngineerPicker
                engineers={[]}
                onSelect={() => {}}
                onAssign={onAssign}
                placeholder="Search engineers to assign…"
              />
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}
