import { useState } from "react";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { Tabs } from "@shared/components/Tabs";
import { DataTable } from "@shared/components/DataTable";
import { Pagination } from "@shared/components/Pagination";
import { Search } from "lucide-react";

export function KnowledgeList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const articles = [
    { id: "1", number: "KB001018", title: "How to reset VPN credentials", category: "VPN", status: "Published", updated: "2024-01-10" },
    { id: "2", number: "KB001019", title: "Printer troubleshooting guide", category: "Hardware", status: "Draft", updated: "2024-01-12" },
    { id: "3", number: "KB001020", title: "Email forwarding configuration", category: "Email", status: "Published", updated: "2024-01-08" },
  ];

  const filtered = articles.filter((a) => `${a.title} ${a.category}`.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    { key: "number", header: "Article ID", render: (row: typeof articles[0]) => <span className="font-bold text-cyan-700">{row.number}</span> },
    { key: "title", header: "Title", render: (row: typeof articles[0]) => <span className="font-medium">{row.title}</span> },
    { key: "category", header: "Category", render: (row: typeof articles[0]) => <span>{row.category}</span> },
    { key: "status", header: "Status", render: (row: typeof articles[0]) => <Badge variant={row.status === "Published" ? "success" : "warning"}>{row.status}</Badge> },
    { key: "updated", header: "Updated", render: (row: typeof articles[0]) => <span>{row.updated}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Knowledge Base" description="Browse, search, and manage knowledge articles." actions={<Button>Create Article</Button>} />
      <Card>
        <CardHeader title="Articles" actions={<div className="relative"><Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search knowledge…" className="focus-ring w-56 rounded-md border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-sm" /></div>} />
        <CardBody className="p-0">
          <DataTable columns={columns} rows={filtered} rowKey={(r) => r.id} loading={false} emptyTitle="No articles found" />
          <Pagination page={page} totalPages={Math.ceil(filtered.length / 10) || 1} totalItems={filtered.length} onPageChange={setPage} />
        </CardBody>
      </Card>
    </div>
  );
}

export function KnowledgeArticle() {
  const [activeTab, setActiveTab] = useState("Overview");
  const tabs = ["Overview", "Content", "Related Articles", "Activity", "Audit"];

  return (
    <div className="space-y-5">
      <PageHeader title="KB001018 — Knowledge Article" description="Article content and metadata." actions={<Button>Edit</Button>} />
      <div className="flex items-center gap-3"><Badge variant="success">Published</Badge></div>
      <Tabs tabs={tabs.map((t) => ({ id: t, label: t }))} active={activeTab} onChange={setActiveTab} />
      <Card><CardBody><div className="py-8 text-center text-sm text-slate-500">{activeTab} — Article content goes here</div></CardBody></Card>
    </div>
  );
}
