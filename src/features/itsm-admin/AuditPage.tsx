import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useAppSelector } from "@shared/store/hooks";
import { selectPermissions } from "@shared/auth/authSlice";
import { PageHeader } from "@shared/components/PageHeader";
import { Badge } from "@shared/components/Badge";
import { Button } from "@shared/components/ui";
import { Card, CardBody, CardHeader } from "@shared/components/ui";
import { DataTable } from "@shared/components/DataTable";
import { EmptyState, Spinner } from "@shared/components/ui";
import { showSuccess } from "@shared/components/Toast/ToastContainer";
import { useDebounce } from "@shared/hooks/useDebounce";
import { Wrench, Activity, Clock, Shield, CheckCircle } from "lucide-react";

export function AuditPage() {
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebounce(searchValue, 300);

  const auditEvents = [
    { id: "1", actor: "Admin", action: "Updated SLA policy", resourceType: "SLA", time: "2 hours ago" },
    { id: "2", actor: "System", action: "Created catalog category", resourceType: "Catalog", time: "1 day ago" },
    { id: "3", actor: "Admin", action: "Changed approval rule", resourceType: "Approvals", time: "2 days ago" },
    { id: "4", actor: "User", action: "Exported incident data", resourceType: "Incident", time: "3 days ago" },
  ];

  const filtered = debouncedSearch ? auditEvents.filter((e) => e.action.toLowerCase().includes(debouncedSearch.toLowerCase()) || e.actor.toLowerCase().includes(debouncedSearch.toLowerCase())) : auditEvents;

  return (
    <div className="space-y-6">
      <PageHeader title="ITSM Audit" description="View configuration change logs and compliance tracking" actions={<Button onClick={() => showSuccess("Audit", "Exported")}>Export</Button>} />
      <Card>
        <CardBody>
          <div className="mb-4">
            <input value={searchValue} onChange={(e) => setSearchValue(e.target.value)} placeholder="Search audit logs…" className="focus-ring w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          {filtered.length === 0 ? (
            <EmptyState title="No audit events found" description="Try a different search term" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead><tr className="bg-slate-50"><th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Actor</th><th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Action</th><th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Resource</th><th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Time</th></tr></thead>
                <tbody>{filtered.map((event) => (
                  <tr key={event.id} className="border-t hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{event.actor}</td>
                    <td className="px-4 py-3">{event.action}</td>
                    <td className="px-4 py-3"><Badge variant="info">{event.resourceType}</Badge></td>
                    <td className="px-4 py-3 text-slate-500">{event.time}</td>
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
