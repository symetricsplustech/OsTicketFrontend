import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { PageHeader } from "@shared/components/PageHeader";
import { Badge } from "@shared/components/Badge";
import { Button } from "@shared/components/ui";
import { Card, CardBody, CardHeader } from "@shared/components/ui";
import { EmptyState } from "@shared/components/ui";
import { showSuccess } from "@shared/components/Toast/ToastContainer";
import { Scale, Plus, Edit, Trash2 } from "lucide-react";

export function PriorityMatrix() {
  const [loading, setLoading] = useState(true);

  const matrix = [
    { priority: "Critical", impact: "High", urgency: "High", sla: "1h", color: "danger" as const },
    { priority: "High", impact: "High", urgency: "Medium", sla: "4h", color: "warning" as const },
    { priority: "Medium", impact: "Medium", urgency: "Medium", sla: "24h", color: "info" as const },
    { priority: "Low", impact: "Low", urgency: "Low", sla: "72h", color: "muted" as const },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Priority Matrix Configuration" description="Define priority levels, impact/urgency combinations, and SLA targets" actions={<Button onClick={() => showSuccess("Priority Matrix", "Saved")}>Save All</Button>} />
      <Card>
        <CardHeader title="Priority Levels" description="Configure the priority matrix with impact and urgency" />
        <CardBody>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {matrix.map((p) => (
              <Card key={p.priority} className="border-l-4 border-l-red-500">
                <CardBody>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{p.priority}</h3>
                    <Badge variant={p.color}>{p.sla}</Badge>
                  </div>
                  <div className="mt-3 space-y-1 text-sm">
                    <p>Impact: <span className="font-medium">{p.impact}</span></p>
                    <p>Urgency: <span className="font-medium">{p.urgency}</span></p>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm">Delete</Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
          <Button className="mt-6" onClick={() => showSuccess("Priority", "Added")}><Plus className="inline h-4 w-4 mr-1" />Add Priority</Button>
        </CardBody>
      </Card>
    </div>
  );
}
