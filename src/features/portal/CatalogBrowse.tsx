import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Search, ShoppingCart, ArrowRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks";
import { selectPermissions } from "@shared/auth/authSlice";
import { can } from "@shared/authorization/permissions";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardHeader, CardBody } from "@shared/components/ui";
import { Button } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { Input } from "@shared/components/ui";
import { Spinner } from "@shared/components/ui";
import { EmptyState } from "@shared/components/ui";
import { ErrorState } from "@shared/components/ui";
import { DataTable } from "@shared/components/DataTable";
import { Pagination } from "@shared/components/Pagination";
import { showSuccess } from "@shared/components/Toast/ToastContainer";
import { cn } from "@shared/lib/cn";

interface CatalogCategory {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  icon: string;
}

interface CatalogItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: string;
  status: string;
  isEligible: boolean;
  variables: Array<{ name: string; type: string; required: boolean; options?: string[] }>;
}

export function CatalogBrowse() {
  const { instanceId = "" } = useParams();
  const dispatch = useAppDispatch();
  const permissions = useAppSelector(selectPermissions);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [eligibleOnly, setEligibleOnly] = useState(false);

  const canCatalog = can(permissions, "itsm.catalog.read");
  const canCreate = can(permissions, "itsm.request.create");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [catRes, itemsRes] = await Promise.allSettled([
          fetch(`/api/v1/portal/catalog/categories`).then((r) => r.json()),
          fetch(`/api/v1/portal/catalog?page=${page}&limit=20&search=${encodeURIComponent(search)}${selectedCategory ? `&category=${selectedCategory}` : ""}${eligibleOnly ? "&eligibleOnly=true" : ""}`).then((r) => r.json()),
        ]);
        if (catRes.status === "fulfilled") setCategories(catRes.value.categories ?? []);
        if (itemsRes.status === "fulfilled") {
          setItems(itemsRes.value.items ?? []);
          setTotalItems(itemsRes.value.total ?? 0);
          setTotalPages(itemsRes.value.totalPages ?? 1);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, search, selectedCategory, eligibleOnly]);

  const handleAddToCart = async (itemId: string) => {
    try {
      const res = await fetch(`/api/v1/portal/cart/items`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemId }) });
      const data = await res.json();
      if (data.success) {
        showSuccess("Added to Cart", "Item has been added to your cart.");
      }
    } catch {
      showSuccess("Ready", "Add items from the cart page.");
    }
  };

  const columns = [
    { key: "name", header: "Name", render: (row: CatalogItem) => <Link to={`catalog/${row.id}`} className="font-medium text-brand-700 hover:underline">{row.name}</Link> },
    { key: "category", header: "Category", render: (row: CatalogItem) => <span className="text-slate-600">{row.category}</span> },
    { key: "price", header: "Price", render: (row: CatalogItem) => <span className="text-slate-900">{row.price}</span> },
    { key: "status", header: "Status", render: (row: CatalogItem) => <Badge variant={row.status === "active" ? "success" : "muted"}>{row.status}</Badge> },
    { key: "eligible", header: "Eligible", render: (row: CatalogItem) => row.isEligible ? <Badge variant="success">Yes</Badge> : <Badge variant="muted">No</Badge> },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader title="Service Catalog" description="Browse and request service items from the catalog." actions={canCreate ? <Link to={`/instances/${instanceId}/portal/cart`} className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"><ShoppingCart className="h-4 w-4" /> View Cart</Link> : null} />

      {error && <ErrorState message={error} />}

      {loading ? (
        <div className="flex items-center justify-center py-20"><Spinner className="h-6 w-6" /><span className="ml-3 text-sm text-slate-500">Loading catalog…</span></div>
      ) : (
        <>
          <Card>
            <CardBody className="overflow-x-auto">
              <div className="flex flex-wrap gap-2">
                <button onClick={() => { setSelectedCategory(null); setPage(1); }} className={cn("rounded-full px-3 py-1.5 text-xs font-semibold", !selectedCategory ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>All Categories</button>
                {categories.map((cat) => (
                  <button key={cat.id} onClick={() => { setSelectedCategory(cat.id); setPage(1); }} className={cn("rounded-full px-3 py-1.5 text-xs font-semibold", selectedCategory === cat.id ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>{cat.name}</button>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-3">
              <div className="relative flex-1 max-w-md">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search catalog items…" className="pl-8" />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={eligibleOnly} onChange={(e) => { setEligibleOnly(e.target.checked); setPage(1); }} className="rounded" />
                Eligible only
              </label>
            </div>
            <DataTable columns={columns} rows={items} rowKey={(r) => r.id} loading={loading} emptyDescription="No catalog items found." />
            <Pagination page={page} totalPages={totalPages} totalItems={totalItems} onPageChange={setPage} />
          </Card>
        </>
      )}
    </div>
  );
}
