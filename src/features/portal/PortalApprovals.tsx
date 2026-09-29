import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { useAppSelector } from "@shared/store/hooks";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardHeader, CardBody } from "@shared/components/ui";
import { Button } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { Spinner } from "@shared/components/ui";
import { EmptyState } from "@shared/components/ui";
import { ApprovalInbox } from "@shared/components/ApprovalInbox";
import { showSuccess } from "@shared/components/Toast/ToastContainer";

interface ApprovalRequest {
  id: string;
  sourceRecord: string;
  sourceType: string;
  requester: string;
  reason: string;
  status: "pending" | "approved" | "rejected" | "information_requested";
  createdAt: string;
}

export function PortalApprovals() {
  const [items, setItems] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/v1/portal/approvals");
        const data = await res.json();
        if (data.success) setItems(data.items ?? []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await fetch(`/api/v1/portal/approvals/${id}/approve`, { method: "POST" });
      setItems((prev) => prev.map((item) => item.id === id ? { ...item, status: "approved" as const } : item));
      showSuccess("Approved", "Your approval has been recorded.");
    } catch {
      showSuccess("Error", "Failed to approve.");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await fetch(`/api/v1/portal/approvals/${id}/reject`, { method: "POST" });
      setItems((prev) => prev.map((item) => item.id === id ? { ...item, status: "rejected" as const } : item));
      showSuccess("Rejected", "Your rejection has been recorded.");
    } catch {
      showSuccess("Error", "Failed to reject.");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Spinner className="h-6 w-6" /><span className="ml-3 text-sm text-slate-500">Loading approvals…</span></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader title="My Approvals" description="Requests awaiting your approval or review." />

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center py-20"><Spinner className="h-6 w-6" /><span className="ml-3 text-sm text-slate-500">Loading approvals…</span></div>
      ) : (
        <Card>
          <CardBody>
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-brand-600" />
              <h3 className="text-sm font-bold">Pending Approvals</h3>
              <Badge variant="warning">{items.filter((i) => i.status === "pending").length}</Badge>
            </div>
            {items.length === 0 ? (
              <EmptyState title="No approval requests" description="You have no pending approvals." />
            ) : (
              <ApprovalInbox
                items={items}
                loading={loading}
                onApprove={handleApprove}
                onReject={handleReject}
                onRequestInfo={(id) => showSuccess("Info", `Requesting info for approval ${id}`)}
              />
            )}
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader title="Approval History" description="Previously approved or rejected requests." />
        <CardBody>
          {items.filter((i) => i.status !== "pending").length === 0 ? (
            <EmptyState title="No history" />
          ) : (
            <div className="space-y-3">
              {items.filter((i) => i.status !== "pending").map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                  <div>
                    <p className="text-sm font-medium">{item.sourceRecord}</p>
                    <p className="text-[10px] text-slate-500">{item.sourceType} · {item.requester} · {new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={item.status === "approved" ? "success" : "danger"}>{item.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
