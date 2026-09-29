import { useState } from "react";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody, CardHeader } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { Button } from "@shared/components/Button";
import { Tabs } from "@shared/components/Tabs";
import { ActivityStream } from "@shared/components/ActivityStream";
import { AttachmentPanel } from "@shared/components/AttachmentPanel";
import { EngineerPicker } from "@shared/components/EngineerPicker";
import { DynamicFormRenderer } from "@shared/components/DynamicFormRenderer";
import { PermissionGate } from "@shared/components/PermissionGate";

const tabs = ["Overview", "Work Log", "Parts", "Time", "Evidence", "Complete", "Audit"];

export function FieldJobDetail() {
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <div className="space-y-5">
      <PageHeader title="FJ00002 — Field Job Detail" description="Job details, customer info, and work log." actions={
        <div className="flex gap-2">
          <PermissionGate permissions={["itsm.field.update"]}>
            <Button>Complete Job</Button>
          </PermissionGate>
          <Button variant="outline">Refresh</Button>
        </div>
      } />
      <div className="flex items-center gap-3"><Badge variant="warning">In Progress</Badge><Badge variant="info">P1</Badge></div>
      <Tabs tabs={tabs.map((t) => ({ id: t, label: t }))} active={activeTab} onChange={setActiveTab} />
      <Card>
        <CardBody>
          {activeTab === "Overview" && <div className="grid gap-4 md:grid-cols-2"><div><p className="text-xs font-bold uppercase text-slate-400">Customer</p><p className="mt-1 font-semibold">TechStart Inc</p></div><div><p className="text-xs font-bold uppercase text-slate-400">Site</p><p className="mt-1 font-semibold">456 Tech Ave</p></div></div>}
          {activeTab === "Work Log" && <ActivityStream entries={[{ id: "1", actor: "Field Engineer", action: "Arrived at site", timestamp: "2024-01-15T09:00:00" }]} />}
          {activeTab === "Evidence" && <AttachmentPanel attachments={[{ id: "1", name: "photo.jpg", type: "image", size: "245 KB", uploadedAt: "2024-01-15", uploadedBy: "Field Engineer" }]} onUpload={() => {}} onRemove={() => {}} />}
          {activeTab === "Audit" && <div className="py-4 text-center text-sm text-slate-500">No audit entries</div>}
        </CardBody>
      </Card>
    </div>
  );
}

export function FieldAvailability() {
  return (
    <div className="space-y-6">
      <PageHeader title="Field Availability" description="Manage your availability and schedule." />
      <Card><CardBody><div className="grid gap-4 md:grid-cols-2">
        {[
          { day: "Monday", status: "Available", slots: "8:00 - 17:00" },
          { day: "Tuesday", status: "On-Site", slots: "08:00 - 16:00" },
          { day: "Wednesday", status: "Available", slots: "8:00 - 17:00" },
          { day: "Thursday", status: "Leave", slots: "—" },
        ].map((item) => (
          <Card key={item.day}><CardBody className="p-5"><div className="flex items-center justify-between"><h3 className="font-semibold">{item.day}</h3><Badge variant={item.status === "Available" ? "success" : item.status === "On-Site" ? "info" : "muted"}>{item.status}</Badge></div><p className="mt-2 text-sm text-slate-500">{item.slots}</p></CardBody></Card>
        ))}
      </div></CardBody></Card>
    </div>
  );
}
