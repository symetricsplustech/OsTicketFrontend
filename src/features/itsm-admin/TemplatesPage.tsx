import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { PageHeader } from "@shared/components/PageHeader";
import { Badge } from "@shared/components/Badge";
import { Button } from "@shared/components/ui";
import { Card, CardBody, CardHeader } from "@shared/components/ui";
import { DataTable } from "@shared/components/DataTable";
import { EmptyState } from "@shared/components/ui";
import { showSuccess, showError } from "@shared/components/Toast/ToastContainer";
import { FileText, Plus, Edit, Trash2, Mail, MessageSquare } from "lucide-react";

export function TemplatesPage() {
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(true);

  const templates = [
    { id: "1", name: "Incident Created", type: "Email", channel: "Email", active: true },
    { id: "2", name: "Status Update", type: "Email", channel: "Email", active: true },
    { id: "3", name: "Escalation Alert", type: "SMS", channel: "SMS", active: true },
    { id: "4", name: "New Ticket", type: "Email", channel: "Email", active: false },
    { id: "5", name: "Assignment Notification", type: "Push", channel: "Push", active: true },
  ];

  const filtered = searchValue ? templates.filter((t) => t.name.toLowerCase().includes(searchValue.toLowerCase())) : templates;

  return (
    <div className="space-y-6">
      <PageHeader title="Notification Templates" description="Manage email, SMS, and push notification templates" actions={<Button onClick={() => showSuccess("Templates", "Saved")}>Save All</Button>} />
      <Card>
        <CardBody>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <input value={searchValue} onChange={(e) => setSearchValue(e.target.value)} placeholder="Search templates…" className="focus-ring rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <Button onClick={() => showSuccess("Template", "Created")}><Plus className="inline h-4 w-4 mr-1" />New Template</Button>
          </div>
          {filtered.length === 0 ? (
            <EmptyState title="No templates found" description="Try a different search term" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead><tr className="bg-slate-50"><th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Template</th><th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Type</th><th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Channel</th><th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Status</th><th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Actions</th></tr></thead>
                <tbody>{filtered.map((t) => (
                  <tr key={t.id} className="border-t hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{t.name}</td>
                    <td className="px-4 py-3"><Badge variant="info">{t.type}</Badge></td>
                    <td className="px-4 py-3">{t.channel}</td>
                    <td className="px-4 py-3"><Badge variant={t.active ? "success" : "muted"}>{t.active ? "Active" : "Inactive"}</Badge></td>
                    <td className="px-4 py-3"><div className="flex gap-2"><Button variant="outline" size="sm">Edit</Button><Button variant="ghost" size="sm">Delete</Button></div></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
