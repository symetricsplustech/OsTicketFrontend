import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useAppSelector } from "@shared/store/hooks";
import { selectPermissions } from "@shared/auth/authSlice";
import { can } from "@shared/authorization/permissions";
import { PageHeader } from "@shared/components/PageHeader";
import { Badge } from "@shared/components/Badge";
import { Button } from "@shared/components/ui";
import { Card, CardBody, CardHeader } from "@shared/components/ui";
import { Tabs } from "@shared/components/Tabs";
import { DataTable } from "@shared/components/DataTable";
import { DynamicFormRenderer } from "@shared/components/DynamicFormRenderer";
import { EmptyState, Spinner } from "@shared/components/ui";
import { showSuccess } from "@shared/components/Toast/ToastContainer";
import { ClipboardList, Settings, FileText, Plus, Code, Database } from "lucide-react";
import type { FieldConfig } from "@shared/components/DynamicFormRenderer";

type TabId = "forms" | "fields" | "validation" | "layouts" | "templates" | "permissions" | "audit";

const tabs = [
  { id: "forms", label: "Forms", icon: ClipboardList },
  { id: "fields", label: "Fields", icon: Database },
  { id: "validation", label: "Validation", icon: Code },
  { id: "layouts", label: "Layouts", icon: Settings },
  { id: "templates", label: "Templates", icon: FileText },
  { id: "permissions", label: "Permissions", icon: ClipboardList },
  { id: "audit", label: "Audit", icon: FileText },
];

export function FormsFields() {
  const [activeTab, setActiveTab] = useState<TabId>("forms");
  const [loading, setLoading] = useState(true);
  const permissions = useAppSelector(selectPermissions);

  return (
    <div className="space-y-6">
      <PageHeader title="Forms & Fields Configuration" description="Configure form layouts, fields, validation rules, and templates" actions={<Button onClick={() => showSuccess("Forms", "Saved")}>Save All</Button>} />
      <Tabs tabs={tabs.map((t) => ({ id: t.id, label: t.label, icon: t.icon }))} active={activeTab} onChange={(id) => setActiveTab(id as TabId)} />
      <div className="mt-4">
        {activeTab === "forms" ? (
          <DataTable columns={[{ key: "name", header: "Form", render: () => <span className="font-medium">Incident Form</span> }, { key: "fields", header: "Fields", render: () => <Badge variant="info">24</Badge> }, { key: "version", header: "Version", render: () => <Badge variant="success">v2.1</Badge> }, { key: "actions", header: "Actions", render: () => <Button variant="outline" size="sm">Edit</Button> }]} rows={[{ id: "1" }]} rowKey={(r) => r.id} page={1} totalPages={1} loading={loading} />
        ) : activeTab === "fields" ? (
          <DynamicFormRenderer fields={[{ name: "fieldName", label: "Field Name", type: "text", required: true }, { name: "fieldType", label: "Field Type", type: "select", options: [{ value: "text", label: "Text" }, { value: "number", label: "Number" }, { value: "date", label: "Date" }] }, { name: "required", label: "Required", type: "checkbox" }]} values={{}} onChange={() => {}} onSubmit={() => showSuccess("Field", "Saved")} />
        ) : (
          <Card><CardBody><div className="flex items-center justify-center py-12"><p className="text-sm text-slate-500">{activeTab.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} configuration</p></div></CardBody></Card>
        )}
      </div>
    </div>
  );
}
