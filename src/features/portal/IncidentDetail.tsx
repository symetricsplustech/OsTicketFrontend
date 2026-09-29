import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Clock, AlertTriangle } from "lucide-react";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardHeader, CardBody } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { Spinner } from "@shared/components/ui";
import { EmptyState } from "@shared/components/ui";
import { ErrorState } from "@shared/components/ui";
import { DetailRow } from "@shared/components/ui";
import { ActivityStream } from "@shared/components/ActivityStream";
import { SlaPanel } from "@shared/components/SlaPanel";
import { showSuccess } from "@shared/components/Toast/ToastContainer";

interface IncidentDetailData {
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
  sla?: { responseTarget: string; resolutionTarget: string; startedAt: string; paused: boolean; breached: boolean; warningThreshold?: number };
  activity: Array<{ id: string; actor: string; action: string; timestamp: string; details?: string }>;
}

export function IncidentDetail() {
  const { instanceId = "", id = "" } = useParams();
  const [data, setData] = useState<IncidentDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/portal/incidents/${id}`);
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

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Spinner className="h-6 w-6" /><span className="ml-3 text-sm text-slate-500">Loading incident…</span></div>;
  }

  if (error || !data) {
    return <div className="max-w-5xl mx-auto"><ErrorState message={error ?? "Incident not found."} /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader title={`${data.number} — ${data.title}`} breadcrumbs={<Link to={`/instances/${instanceId}/portal/my-incidents`} className="text-brand-600 hover:underline">My Incidents</Link>} actions={
        <div className="flex gap-2">
          <Link to={`/instances/${instanceId}/portal/help`} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><AlertTriangle className="h-4 w-4 inline mr-1" /> Get Help</Link>
          <Link to={`/instances/${instanceId}/portal/my-incidents`} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Back</Link>
        </div>
      } />

      <div className="flex items-center gap-3">
        <Badge variant={data.status === "open" ? "warning" : data.status === "resolved" ? "success" : data.status === "closed" ? "info" : "muted"}>{data.status}</Badge>
        <Badge variant={data.priority === "critical" ? "danger" : data.priority === "high" ? "warning" : "muted"}>{data.priority}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {data.sla && <SlaPanel sla={data.sla} />}

          <Card>
            <CardHeader title="Incident Details" />
            <CardBody className="space-y-4">
              <DetailRow label="Title"><span className="font-medium">{data.title}</span></DetailRow>
              <DetailRow label="Category"><span className="text-slate-600">{data.category}</span></DetailRow>
              <DetailRow label="Status"><span className="text-slate-600">{data.status}</span></DetailRow>
              <DetailRow label="Created"><span className="text-slate-600">{new Date(data.createdAt).toLocaleString()}</span></DetailRow>
              <DetailRow label="Updated"><span className="text-slate-600">{new Date(data.updatedAt).toLocaleString()}</span></DetailRow>
              {data.resolvedAt ? <DetailRow label="Resolved"><span className="text-slate-600">{new Date(data.resolvedAt).toLocaleString()}</span></DetailRow> : null}
              <DetailRow label="Description"><p className="text-slate-700">{data.description}</p></DetailRow>
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
