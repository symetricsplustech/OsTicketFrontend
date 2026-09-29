import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Search, Shield, AlertTriangle, Lock, ChevronRight } from "lucide-react";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody, CardHeader, Input, Button, Badge, Label } from "@shared/components/ui";
import { PermissionGate } from "@shared/components/PermissionGate";
import { useDebounce } from "@shared/hooks/useDebounce";
import { useAppSelector } from "@shared/store/hooks";
import { selectPermissions } from "@shared/auth/authSlice";
import { PERMISSIONS } from "@shared/authorization/permissions";
import { cn } from "@shared/lib/cn";

export function PermissionsPage() {
  const { instanceId = "" } = useParams<{ instanceId: string }>();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [activeFilter, setActiveFilter] = useState("all");
  const permissions = useAppSelector(selectPermissions);
  const canManage = permissions.includes(PERMISSIONS.tenantPermissionGrant) || permissions.includes("*");

  const allPermissions = [
    { id: "itsm.incident.read", name: "Incident Read", category: "Incident", risk: "low" },
    { id: "itsm.incident.create", name: "Incident Create", category: "Incident", risk: "low" },
    { id: "itsm.incident.update", name: "Incident Update", category: "Incident", risk: "low" },
    { id: "itsm.incident.resolve", name: "Incident Resolve", category: "Incident", risk: "medium" },
    { id: "itsm.incident.close", name: "Incident Close", category: "Incident", risk: "medium" },
    { id: "itsm.change.read", name: "Change Read", category: "Change", risk: "low" },
    { id: "itsm.change.approve", name: "Change Approve", category: "Change", risk: "high" },
    { id: "itsm.change.implement", name: "Change Implement", category: "Change", risk: "high" },
    { id: "itsm.problem.read", name: "Problem Read", category: "Problem", risk: "low" },
    { id: "itsm.sla.read", name: "SLA Read", category: "SLA", risk: "low" },
    { id: "itsm.admin.read", name: "Admin Read", category: "Admin", risk: "high" },
    { id: "tenant.user.read", name: "Tenant User Read", category: "Tenant", risk: "medium" },
    { id: "tenant.permission.grant", name: "Permission Grant", category: "Tenant", risk: "critical" },
    { id: "tenant.permission.revoke", name: "Permission Revoke", category: "Tenant", risk: "critical" },
    { id: "itsm.core.audit_read", name: "Audit Read", category: "Audit", risk: "high" },
  ];

  const filtered = allPermissions.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || p.id.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesFilter = activeFilter === "all" || p.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const categories = [...new Set(allPermissions.map((p) => p.category))];

  const riskVariant = (risk: string) => {
    if (risk === "high" || risk === "critical") return "danger" as const;
    if (risk === "medium") return "warning" as const;
    return "success" as const;
  };

  return (
    <div>
      <PageHeader
        title="Permissions"
        description="Permission catalog, high-risk permissions, and legacy mappings."
        breadcrumbs={<Link to={`/instances/${instanceId}`} className="hover:text-brand-600">Instance</Link>}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Permission Catalog" description={`${filtered.length} permissions`} />
          <CardBody>
            <div className="mb-4 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setActiveFilter(cat)} className={cn("rounded-full px-3 py-1 text-xs font-medium border", activeFilter === cat ? "bg-brand-600 text-white border-brand-600" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>{cat}</button>
              ))}
              <button onClick={() => setActiveFilter("all")} className={cn("rounded-full px-3 py-1 text-xs font-medium border", activeFilter === "all" ? "bg-brand-600 text-white border-brand-600" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>All</button>
            </div>
            <div className="relative w-full max-w-xs mb-4">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search permissions…" className="focus-ring w-full rounded-md border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm" />
            </div>
            <div className="space-y-2">
              {filtered.map((perm) => (
                <div key={perm.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 hover:bg-slate-50">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{perm.name}</p>
                    <p className="text-xs text-slate-500">{perm.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={riskVariant(perm.risk)}>{perm.risk}</Badge>
                    <Badge variant="info">{perm.category}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardHeader title="High-Risk Permissions" icon={<AlertTriangle className="h-4 w-4 text-red-500" />} />
            <CardBody>
              <div className="space-y-2">
                {allPermissions.filter((p) => p.risk === "high" || p.risk === "critical").map((perm) => (
                  <div key={perm.id} className="flex items-center gap-2 text-sm">
                    <Lock className="h-3 w-3 text-red-500" />
                    <span>{perm.name}</span>
                    <Badge variant="danger">{perm.risk}</Badge>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Legacy Mapping" icon={<ChevronRight className="h-4 w-4 text-slate-500" />} />
            <CardBody>
              <div className="space-y-2">
                <p className="text-sm text-slate-600">Legacy role permissions are mapped to the current permission model.</p>
                {["Service Desk L1", "Service Desk L2", "Change Approver"].map((role) => (
                  <div key={role} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2 text-sm">
                    <span>{role}</span>
                    <Badge variant="info">Mapped</Badge>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
          <PermissionGate permissions={["itsm.admin.read"]}>
            <Card>
              <CardHeader title="Admin Only" />
              <CardBody><p className="text-sm text-slate-600">Only admins can see this content.</p></CardBody>
            </Card>
          </PermissionGate>
        </div>
      </div>
    </div>
  );
}
