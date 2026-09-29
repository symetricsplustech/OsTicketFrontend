import type { ReactNode } from "react";
import { useState } from "react";
import { PageHeader } from "@shared/components/PageHeader";
import { Tabs } from "@shared/components/Tabs";
import { Card, CardBody } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { ActivityStream } from "@shared/components/ActivityStream";
import { SlaPanel } from "@shared/components/SlaPanel";
import { AssignmentPanel } from "@shared/components/AssignmentPanel";
import type { ActivityEntry, SlaInfo, AssignmentInfo } from "@shared/components";

interface RecordWorkspaceProps {
  title: string;
  recordNumber: string;
  status: string;
  priority?: string;
  breadcrumbs?: ReactNode;
  actions?: ReactNode;
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  activityEntries: ActivityEntry[];
  sla?: SlaInfo;
  assignment?: AssignmentInfo;
  children: ReactNode;
  loading?: boolean;
}

export function RecordWorkspacePage({
  title, recordNumber, status, priority, breadcrumbs, actions,
  tabs, activeTab, onTabChange, activityEntries, sla, assignment,
  children, loading,
}: RecordWorkspaceProps) {
  return (
    <div className="space-y-5">
      <PageHeader title={`${recordNumber} — ${title}`} breadcrumbs={breadcrumbs} actions={actions} />
      <div className="flex items-center gap-3">
        <Badge variant={status === "resolved" || status === "closed" ? "success" : status === "new" ? "warning" : "info"}>{status}</Badge>
        {priority ? <Badge variant="danger">{priority}</Badge> : null}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-5">
          <Card>{children}</Card>
          <Card><CardBody><ActivityStream entries={activityEntries} /></CardBody></Card>
        </div>
        <div className="space-y-5">
          {sla ? <SlaPanel sla={sla} /> : null}
          {assignment ? <AssignmentPanel assignment={assignment} onAssignToMe={() => {}} onAssign={() => {}} onReassign={() => {}} /> : null}
        </div>
      </div>
      <Card><CardBody><Tabs tabs={tabs.map((t) => ({ id: t, label: t }))} active={activeTab} onChange={onTabChange} /></CardBody></Card>
    </div>
  );
}
