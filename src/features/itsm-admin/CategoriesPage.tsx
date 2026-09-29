import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { PageHeader } from "@shared/components/PageHeader";
import { Badge } from "@shared/components/Badge";
import { Button } from "@shared/components/ui";
import { Card, CardBody, CardHeader } from "@shared/components/ui";
import { DataTable } from "@shared/components/DataTable";
import { EmptyState, Spinner } from "@shared/components/ui";
import { showSuccess } from "@shared/components/Toast/ToastContainer";
import { FolderDown, Plus, Edit, Trash2 } from "lucide-react";

export function CategoriesPage() {
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: "1", name: "Infrastructure", type: "Incident", count: 45, active: true },
    { id: "2", name: "Application", type: "Incident", count: 32, active: true },
    { id: "3", name: "Network", type: "Incident", count: 28, active: true },
    { id: "4", name: "Security", type: "Incident", count: 19, active: true },
    { id: "5", name: "Hardware", type: "Problem", count: 12, active: false },
  ];

  const filtered = searchValue ? categories.filter((c) => c.name.toLowerCase().includes(searchValue.toLowerCase())) : categories;

  return (
    <div className="space-y-6">
      <PageHeader title="Category Management" description="Manage ITSM categories across incidents, problems, and changes" actions={<Button onClick={() => showSuccess("Categories", "Saved")}>Save All</Button>} />
      <Card>
        <CardBody>
          <div className="mb-4">
            <input value={searchValue} onChange={(e) => setSearchValue(e.target.value)} placeholder="Search categories…" className="focus-ring w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          {filtered.length === 0 ? (
            <EmptyState title="No categories found" description="Try a different search term" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead><tr className="bg-slate-50"><th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Name</th><th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Type</th><th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Count</th><th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Status</th><th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Actions</th></tr></thead>
                <tbody>{filtered.map((cat) => (
                  <tr key={cat.id} className="border-t hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{cat.name}</td>
                    <td className="px-4 py-3"><Badge variant="info">{cat.type}</Badge></td>
                    <td className="px-4 py-3">{cat.count}</td>
                    <td className="px-4 py-3"><Badge variant={cat.active ? "success" : "muted"}>{cat.active ? "Active" : "Inactive"}</Badge></td>
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
