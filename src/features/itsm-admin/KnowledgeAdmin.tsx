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
import { EmptyState } from "@shared/components/ui";
import { showSuccess } from "@shared/components/Toast/ToastContainer";
import { BookOpen, FolderDown, FileText, CheckCircle, Eye, ThumbsUp, RotateCcw, Shield } from "lucide-react";

type TabId = "bases" | "categories" | "templates" | "review" | "visibility" | "feedback" | "retirement";

const tabs = [
  { id: "bases", label: "Knowledge Bases", icon: BookOpen },
  { id: "categories", label: "Categories", icon: FolderDown },
  { id: "templates", label: "Article Templates", icon: FileText },
  { id: "review", label: "Review Policies", icon: CheckCircle },
  { id: "visibility", label: "Visibility", icon: Eye },
  { id: "feedback", label: "Feedback", icon: ThumbsUp },
  { id: "retirement", label: "Retirement", icon: RotateCcw },
];

export function KnowledgeAdmin() {
  const [activeTab, setActiveTab] = useState<TabId>("bases");
  const [loading, setLoading] = useState(true);

  return (
    <div className="space-y-6">
      <PageHeader title="Knowledge Base Admin" description="Manage knowledge bases, categories, article templates, and review policies" actions={<Button onClick={() => showSuccess("Knowledge", "Saved")}>Save All</Button>} />
      <Tabs tabs={tabs.map((t) => ({ id: t.id, label: t.label, icon: t.icon }))} active={activeTab} onChange={(id) => setActiveTab(id as TabId)} />
      <div className="mt-4">
        {activeTab === "bases" ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[["IT Knowledge Base", 234, "Active"], ["Onboarding Guide", 45, "Active"], ["API Reference", 89, "Active"]].map(([name, articles, status]) => (
              <Card key={name}><CardBody><div className="flex items-center justify-between"><div><h3 className="font-semibold">{name}</h3><p className="text-sm text-slate-500">{articles} articles</p></div><Badge variant={status === "Active" ? "success" : "muted"}>{status}</Badge></div></CardBody></Card>
            ))}
          </div>
        ) : activeTab === "templates" ? (
          <Card><CardBody><p className="text-sm text-slate-500 mb-4">Article template management</p><div className="space-y-3"><div className="flex items-center justify-between p-3 rounded-lg border"><span className="text-sm">Incident Article Template</span><div className="flex gap-2"><Button variant="outline" size="sm">Edit</Button><Button variant="ghost" size="sm">Delete</Button></div></div><div className="flex items-center justify-between p-3 rounded-lg border"><span className="text-sm">Problem Article Template</span><div className="flex gap-2"><Button variant="outline" size="sm">Edit</Button><Button variant="ghost" size="sm">Delete</Button></div></div></div><Button className="mt-4" onClick={() => showSuccess("Template", "Created")}>Add Template</Button></CardBody></Card>
        ) : (
          <Card><CardBody><div className="flex items-center justify-center py-12"><p className="text-sm text-slate-500">{activeTab.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} configuration</p></div></CardBody></Card>
        )}
      </div>
    </div>
  );
}
