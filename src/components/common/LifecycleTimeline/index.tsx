import { Clock3, CheckCircle2, ArrowRight, AlertTriangle, Loader2, Plus, X } from "lucide-react";
import { Card, CardBody, CardHeader } from "@components/common/ui";
import { Badge } from "@components/common/Badge";
import { Button } from "@components/common/ui";
import { cn } from "@utils/cn";

export interface LifecycleStep {
  id: string;
  label: string;
  state: string;
  timestamp?: string;
  actor?: string;
  isActive: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
  isFuture: boolean;
  description?: string;
  metadata?: Record<string, unknown>;
}

const stateColors = {
  completed: "bg-emerald-500",
  current: "bg-brand-500",
  active: "bg-brand-400",
  future: "bg-slate-300",
  blocked: "bg-red-400",
};

interface LifecycleTimelineProps {
  steps: LifecycleStep[];
  loading?: boolean;
  onAddStep?: (step: Omit<LifecycleStep, "id" | "isActive" | "isCompleted" | "isCurrent" | "isFuture">) => void;
  onRemoveStep?: (stepId: string) => void;
  canEdit?: boolean;
}

export function LifecycleTimeline({ steps, loading, onAddStep, onRemoveStep, canEdit = false }: LifecycleTimelineProps) {
  if (loading) {
    return (
      <Card><CardBody className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></CardBody></Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Lifecycle"
        description="Visual state machine timeline"
        actions={
          canEdit && onAddStep ? (
            <Button variant="outline" size="sm" onClick={() => onAddStep({ label: "New Step", state: "pending", isActive: false, isCompleted: false, isCurrent: false, isFuture: true })}>
              <Plus className="h-3.5 w-3.5" /> Add Step
            </Button>
          ) : null
        }
      />
      <CardBody>
        <div className="relative">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            const colorClass = step.isCompleted ? stateColors.completed : step.isCurrent ? stateColors.current : step.isFuture ? stateColors.future : stateColors.active;

            return (
              <div key={step.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-full border-2", colorClass, step.isCurrent ? "ring-4 ring-brand-200" : "border-slate-200")}>
                    {step.isCompleted ? <CheckCircle2 className="h-4 w-4 text-white" /> : step.isCurrent ? <Clock3 className="h-4 w-4 text-white" /> : <div className="h-2 w-2 rounded-full bg-current" />}
                  </div>
                  {!isLast ? <div className={cn("w-px flex-1 bg-slate-200", step.isCompleted ? "bg-emerald-300" : "")} /> : null}
                </div>
                <div className={cn("pb-4 flex-1 rounded-lg border p-3", step.isCurrent ? "border-brand-300 bg-brand-50" : "border-slate-200 bg-white")}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p className={cn("text-sm font-semibold", step.isCurrent ? "text-brand-700" : step.isCompleted ? "text-emerald-700" : "text-slate-600")}>
                        {step.label}
                      </p>
                      <Badge variant={step.isCompleted ? "success" : step.isCurrent ? "info" : step.isFuture ? "muted" : "warning"}>
                        {step.state}
                      </Badge>
                    </div>
                    {canEdit && onRemoveStep && step.isFuture ? (
                      <button onClick={() => onRemoveStep(step.id)} className="rounded p-1 text-red-500 hover:bg-red-50"><X className="h-3.5 w-3.5" /></button>
                    ) : null}
                  </div>
                  {step.description ? <p className="mt-1 text-xs text-slate-500">{step.description}</p> : null}
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                    {step.timestamp ? <span>{new Date(step.timestamp).toLocaleString()}</span> : null}
                    {step.actor ? <span>· {step.actor}</span> : null}
                    {step.metadata && Object.entries(step.metadata).map(([key, value]) => (
                      <span key={key} className="rounded bg-slate-100 px-1 py-0.5">{key}: {String(value)}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {canEdit && onAddStep && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-slate-300 p-3">
            <Plus className="h-4 w-4 text-slate-400" />
            <span className="text-xs text-slate-500">Add a new lifecycle step</span>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
