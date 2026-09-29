import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useAppSelector } from "@shared/store/hooks";
import { selectPermissions } from "@shared/auth/authSlice";
import { can } from "@shared/authorization/permissions";
import { cn } from "@shared/lib/cn";
import { PageHeader } from "@shared/components/PageHeader";
import { Badge } from "@shared/components/Badge";
import { Button } from "@shared/components/ui";
import { Card, CardBody, CardHeader } from "@shared/components/ui";
import { Tabs } from "@shared/components/Tabs";
import { DataTable } from "@shared/components/DataTable";
import { DynamicFormRenderer } from "@shared/components/DynamicFormRenderer";
import { EmptyState, Spinner } from "@shared/components/ui";
import { showSuccess, showError } from "@shared/components/Toast/ToastContainer";
import { BookOpen, ShoppingCart, Settings, Users, Shield, Bell, FileText, Zap } from "lucide-react";
import type { FieldConfig } from "@shared/components/DynamicFormRenderer";

type TabId = "categories" | "items" | "variables" | "variable-sets" | "eligibility" | "approvals" | "fulfillment" | "sla" | "notifications";

const tabs: { id: TabId; label: string; icon: typeof BookOpen }[] = [
  { id: "categories", label: "Categories", icon: BookOpen },
  { id: "items", label: "Catalog Items", icon: ShoppingCart },
  { id: "variables", label: "Variables", icon: Settings },
  { id: "variable-sets", label: "Variable Sets", icon: Settings },
  { id: "eligibility", label: "Eligibility", icon: Users },
  { id: "approvals", label: "Approvals", icon: Shield },
  { id: "fulfillment", label: "Fulfillment", icon: Zap },
  { id: "sla", label: "SLA", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
];

const catalogCategories = [
  { id: "1", name: "IT Services", items: 45, active: true },
  { id: "2", name: "Professional Services", items: 23, active: true },
  { id: "3", name: "Hardware", items: 12, active: false },
];

const catalogItems = [
  { id: "1", name: "New Laptop Request", category: "Hardware", cost: "$1200", active: true },
  { id: "2", name: "Software License", category: "IT Services", cost: "$200", active: true },
  { id: "3", name: "Consulting Hours", category: "Professional Services", cost: "$150/hr", active: true },
];

export function CatalogAdmin() {
  const { instanceId = "" } = useParams();
  const [activeTab, setActiveTab] = useState<TabId>("categories");
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(true);
  const permissions = useAppSelector(selectPermissions);

  const visibleTabs = useMemo(() => tabs.filter((t) => !t.id.startsWith("approvals") || can(permissions, "itsm.approval.read")), [permissions]);

  const filteredItems = useMemo(() => searchValue ? catalogItems.filter((i) => i.name.toLowerCase().includes(searchValue.toLowerCase())) : catalogItems, [searchValue]);

  return (
    <div className="space-y-6">
      <PageHeader title="Service Catalog Admin" description="Manage catalog categories, items, variables, and fulfillment" actions={<Button onClick={() => showSuccess("Catalog", "Saved")}>Save All</Button>} />
      <Tabs tabs={visibleTabs.map((t) => ({ id: t.id, label: t.label, icon: t.icon }))} active={activeTab} onChange={(id) => setActiveTab(id as TabId)} />
      <div className="mt-4">
        {activeTab === "categories" ? (
          <DataTable columns={[{ key: "name", header: "Category", render: (r: { name: string }) => <span className="font-medium">{r.name}</span> }, { key: "items", header: "Items", render: (r: { items: number }) => <Badge variant="info">{r.items}</Badge> }, { key: "active", header: "Status", render: (r: { active: boolean }) => <Badge variant={r.active ? "success" : "muted"}>{r.active ? "Active" : "Inactive"}</Badge> }, { key: "actions", header: "Actions", render: () => <Button variant="outline" size="sm">Edit</Button> }]} rows={catalogCategories} rowKey={(r) => r.id} searchValue={searchValue} onSearchChange={setSearchValue} page={1} totalPages={1} loading={loading} />
        ) : activeTab === "items" ? (
          <DataTable columns={[{ key: "name", header: "Item", render: (r: { name: string }) => <span className="font-medium">{r.name}</span> }, { key: "category", header: "Category", render: (r: { category: string }) => <Badge variant="default">{r.category}</Badge> }, { key: "cost", header: "Cost", render: (r: { cost: string }) => r.cost }, { key: "actions", header: "Actions", render: () => <Button variant="outline" size="sm">Edit</Button> }]} rows={filteredItems} rowKey={(r) => r.id} searchValue={searchValue} onSearchChange={setSearchValue} page={1} totalPages={1} loading={loading} />
        ) : activeTab === "variables" ? (
          <DynamicFormRenderer fields={[{ name: "name", label: "Variable Name", type: "text", required: true }, { name: "type", label: "Type", type: "select", options: [{ value: "text", label: "Text" }, { value: "number", label: "Number" }] }, { name: "required", label: "Required", type: "checkbox" }]} values={{}} onChange={() => {}} onSubmit={() => showSuccess("Variable", "Saved")} />
        ) : activeTab === "eligibility" ? (
          <Card><CardBody><p className="text-sm text-slate-500 mb-4">Configure who can request catalog items</p><div className="space-y-3"><label className="flex items-center gap-3"><input type="checkbox" defaultChecked className="h-4 w-4" /><span className="text-sm">All authenticated users</span></label><label className="flex items-center gap-3"><input type="checkbox" className="h-4 w-4" /><span className="text-sm">Specific departments only</span></label><label className="flex items-center gap-3"><input type="checkbox" className="h-4 w-4" /><span className="text-sm">Manager approval required</span></label></div><Button className="mt-4" onClick={() => showSuccess("Eligibility", "Saved")}>Save</Button></CardBody></Card>
        ) : (
          <Card><CardBody><div className="flex items-center justify-center py-12"><p className="text-sm text-slate-500">{activeTab.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} configuration</p></div></CardBody></Card>
        )}
      </div>
    </div>
  );
}
