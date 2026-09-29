import { useState } from "react";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { Button } from "@shared/components/Button";
import { Tabs } from "@shared/components/Tabs";

export function WalkUp() {
  return (
    <div className="space-y-6">
      <PageHeader title="Walk-up Queue" description="Quick-triage and assign walk-up requests." actions={<Button>New Walk-up</Button>} />
      <Card><CardBody><div className="grid gap-4 md:grid-cols-2">
        {[
          { id: "WALK001", title: "Password reset at reception desk", priority: "P3", status: "New" },
          { id: "WALK002", title: "Monitor not turning on", priority: "P4", status: "New" },
        ].map((item) => (
          <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between"><span className="font-bold text-cyan-700">{item.id}</span><Badge variant="info">{item.status}</Badge></div>
            <h3 className="mt-2 font-semibold">{item.title}</h3>
            <Badge variant="muted">{item.priority}</Badge>
          </div>
        ))}
      </div></CardBody></Card>
    </div>
  );
}
