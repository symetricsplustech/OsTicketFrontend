import { Clock3, AlertTriangle, Shield, Loader2 } from "lucide-react";
import { Card, CardBody, CardHeader } from "@components/common/ui";
import { Badge } from "@components/common/Badge";
import { Button } from "@components/common/ui";
import { cn } from "@utils/cn";

export interface SlaInfo {
  responseTarget: string;
  resolutionTarget: string;
  startedAt: string;
  paused: boolean;
  breached: boolean;
  warningThreshold?: number;
  currentResponse?: string;
  currentResolution?: string;
  escalationLevel?: number;
  escalationInfo?: string;
  businessHoursOnly?: boolean;
}

interface SlaPanelProps {
  sla: SlaInfo | null;
  loading?: boolean;
  onEscalate?: () => void;
}

export function SlaPanel({ sla, loading, onEscalate }: SlaPanelProps) {
  if (loading) {
    return (
      <Card>
        <CardBody className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></CardBody>
      </Card>
    );
  }

  if (!sla) {
    return (
      <Card>
        <CardBody><p className="py-4 text-center text-sm text-slate-500">No SLA defined</p></CardBody>
      </Card>
    );
  }

  const statusVariant = sla.breached ? "danger" : sla.warningThreshold ? "warning" : "success";
  const statusLabel = sla.breached ? "Breached" : sla.warningThreshold ? "At Risk" : "On Track";

  const progressPercent = sla.warningThreshold ? Math.max(0, 100 - sla.warningThreshold) : 0;

  return (
    <Card className={cn(sla.breached ? "border-red-300 bg-red-50" : sla.warningThreshold ? "border-amber-300 bg-amber-50" : "border-slate-200")}>
      <CardHeader
        title="SLA"
        description="Service level agreement status"
        actions={
          sla.breached && onEscalate ? (
            <Button variant="danger" size="sm" onClick={onEscalate}><AlertTriangle className="h-3.5 w-3.5" /> Escalate</Button>
          ) : null
        }
      />
      <CardBody>
        <div className="mb-3 flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-brand-600" />
          <h3 className="text-sm font-bold">{statusLabel}</h3>
          <Badge variant={statusVariant}>{statusLabel}</Badge>
        </div>

        {sla.warningThreshold ? (
          <div className="mb-4">
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-slate-500">Time remaining</span>
              <span className={cn(sla.warningThreshold > 70 ? "text-red-600" : sla.warningThreshold > 40 ? "text-amber-600" : "text-emerald-600")}>{sla.warningThreshold}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div className={cn("h-full rounded-full transition-all", sla.warningThreshold > 70 ? "bg-red-500" : sla.warningThreshold > 40 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        ) : null}

        <div className="grid gap-2 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">Response Target</span><span className="font-medium">{sla.responseTarget}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Resolution Target</span><span className="font-medium">{sla.resolutionTarget}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Started</span><span className="font-medium">{new Date(sla.startedAt).toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Status</span><span className="font-medium">{sla.paused ? "Paused" : "Running"}</span></div>
          {sla.currentResponse ? <div className="flex justify-between"><span className="text-slate-500">Current Response</span><span className="font-medium">{sla.currentResponse}</span></div> : null}
          {sla.currentResolution ? <div className="flex justify-between"><span className="text-slate-500">Current Resolution</span><span className="font-medium">{sla.currentResolution}</span></div> : null}
          {sla.businessHoursOnly ? <div className="flex justify-between"><span className="text-slate-500">Mode</span><span className="font-medium">Business Hours</span></div> : null}
        </div>

        {sla.escalationLevel && sla.escalationInfo ? (
          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Shield className="h-3.5 w-3.5" /> Escalation Level {sla.escalationLevel}
            </div>
            <p className="mt-1 text-xs text-slate-500">{sla.escalationInfo}</p>
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}
