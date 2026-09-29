import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Clock, User, FileText } from "lucide-react";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardHeader, CardBody } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { Spinner } from "@shared/components/ui";
import { EmptyState } from "@shared/components/ui";
import { ErrorState } from "@shared/components/ui";
import { DetailRow } from "@shared/components/ui";
import { ActivityStream } from "@shared/components/ActivityStream";
import { showSuccess } from "@shared/components/Toast/ToastContainer";

interface RequestDetailData {
  id: string;
  number: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  requester: { name: string; email: string };
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  variables?: Record<string, string>;
  activity: Array<{ id: string; actor: string; action: string; timestamp: string; details?: string }>;
}

export function RequestDetail() {
  const { instanceId = "", id = "" } = useParams();
  const [data, setData] = useState<RequestDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/portal/requests/${id}`);
        const result = await res.json();
        if (result.success) setData(result.data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleReopen = async () => {
    try {
      await fetch(`/api/v1/portal/requests/${id}/reopen`, { method: "PUT" });
      setData((prev) => prev ? { ...prev, status: "open" } : prev);
      showSuccess("Reopened", "Request has been reopened.");
    } catch {
      showSuccess("Error", "Failed to reopen.");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Spinner className="h-6 w-6" /><span className="ml-3 text-sm text-slate-500">Loading request…</span></div>;
  }

  if (error || !data) {
    return <div className="max-w-5xl mx-auto"><ErrorState message={error ?? "Request not found."} /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader title={`${data.number} — ${data.title}`} breadcrumbs={<Link to={`/instances/${instanceId}/portal/requests`} className="text-brand-600 hover:underline">My Requests</Link>} actions={
        <div className="flex gap-2">
          {data.status !== "closed" && data.status !== "resolved" ? <button onClick={handleReopen} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Reopen</button> : null}
          <Link to={`/instances/${instanceId}/portal/requests`} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Back</Link>
        </div>
      } />

      <div className="flex items-center gap-3">
        <Badge variant={data.status === "open" ? "warning" : data.status === "resolved" ? "success" : data.status === "closed" ? "info" : "muted"}>{data.status}</Badge>
        <Badge variant={data.priority === "critical" ? "danger" : data.priority === "high" ? "warning" : "muted"}>{data.priority}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Request Details" />
            <CardBody className="space-y-4">
              <DetailRow label="Title"><span className="font-medium">{data.title}</span></DetailRow>
              <DetailRow label="Category"><span className="text-slate-600">{data.category}</span></DetailRow>
              <DetailRow label="Status"><span className="text-slate-600">{data.status}</span></DetailRow>
              <DetailRow label="Created"><span className="text-slate-600">{new Date(data.createdAt).toLocaleString()}</span></DetailRow>
              <DetailRow label="Updated"><span className="text-slate-600">{new Date(data.updatedAt).toLocaleString()}</span></DetailRow>
              {data.resolvedAt ? <DetailRow label="Resolved"><span className="text-slate-600">{new Date(data.resolvedAt).toLocaleString()}</span></DetailRow> : null}
              <DetailRow label="Description"><p className="text-slate-700">{data.description}</p></DetailRow>
              {data.variables ? (
                <DetailRow label="Variables">
                  <ul className="space-y-1">
                    {Object.entries(data.variables).map(([k, v]) => (
                      <li key={k} className="text-sm"><span className="text-slate-500">{k}:</span> {v}</li>
                    ))}
                  </ul>
                </DetailRow>
              ) : null}
              <DetailRow label="Requester"><span>{data.requester.name}</span></DetailRow>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Activity" />
            <CardBody><ActivityStream entries={data.activity} /></CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
