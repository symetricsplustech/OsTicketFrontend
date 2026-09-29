import { useState } from "react";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { Button } from "@shared/components/Button";
import { ApprovalInbox } from "@shared/components/ApprovalInbox";
import { useAppSelector } from "@shared/store/hooks";

interface ApprovalItem {
  id: string; sourceRecord: string; sourceType: string; requester: string; reason: string; status: "pending" | "approved" | "rejected"; createdAt: string;
}

export function ApprovalInbox() {
  const [activeTab, setActiveTab] = useState("Pending");
  const permissions = useAppSelector((s) => s.auth.permissions);

  const items: ApprovalItem[] = [
    { id: "1", sourceRecord: "REQ002204", sourceType: "Request", requester: "Maya Shah", reason: "Purchase new laptop", status: "pending", createdAt: "2024-01-15T10:00:00" },
    { id: "2", sourceRecord: "CHG000882", sourceType: "Change", requester: "Kabir Rao", reason: "Upgrade identity gateway", status: "pending", createdAt: "2024-01-15T09:00:00" },
    { id: "3", sourceRecord: "INC001040", sourceType: "Incident", requester: "Priya Patel", reason: "Hardware replacement", status: "approved", createdAt: "2024-01-14T16:00:00" },
  ];

  const pendingItems = items.filter((i) => i.status === "pending");
  const approvedItems = items.filter((i) => i.status === "approved");
  const rejectedItems = items.filter((i) => i.status === "rejected");

  const displayItems = activeTab === "Pending" ? pendingItems : activeTab === "Approved" ? approvedItems : rejectedItems;

  const handleApprove = (id: string) => { console.log("Approved", id); };
  const handleReject = (id: string, reason: string) => { console.log("Rejected", id, reason); };
  const handleRequestInfo = (id: string) => { console.log("Request info", id); };

  return (
    <div className="space-y-6">
      <PageHeader title="Approval Inbox" description="Review and manage pending approvals." actions={<Button>Delegate</Button>} />
      <div className="flex gap-1">
        {["Pending", "Approved", "Rejected"].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-lg px-4 py-2 text-sm font-semibold ${activeTab === tab ? "bg-cyan-700 text-white" : "bg-slate-100 text-slate-600"}`}>{tab}</button>
        ))}
      </div>
      <Card><CardBody>
        <ApprovalInbox items={displayItems} loading={false} onApprove={handleApprove} onReject={handleReject} onRequestInfo={handleRequestInfo} />
      </CardBody></Card>
    </div>
  );
}
