import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Search, LifeBuoy, ShoppingCart, BookOpen, ClipboardList, AlertTriangle, CalendarDays, ArrowRight } from "lucide-react";
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
import { useMyInstancesQuery } from "@shared/api/authApi";
import { showSuccess } from "@shared/components/Toast/ToastContainer";
import { cn } from "@shared/lib/cn";

interface Announcement {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

interface CatalogItemSummary {
  id: string;
  name: string;
  description: string;
  category: string;
  price: string;
  status: string;
}

interface RequestSummary {
  id: string;
  number: string;
  title: string;
  status: string;
  createdAt: string;
}

interface IncidentSummary {
  id: string;
  number: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
}

export function PortalHome() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const permissions = useAppSelector(selectPermissions);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItemSummary[]>([]);
  const [myRequests, setMyRequests] = useState<RequestSummary[]>([]);
  const [myIncidents, setMyIncidents] = useState<IncidentSummary[]>([]);

  const { data: instancesData, isLoading: instancesLoading } = useMyInstancesQuery(undefined, { skip: !permissions.includes("*") && !permissions.includes("itsm.request.read") });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [annRes, catRes, reqRes, incRes] = await Promise.allSettled([
          fetch("/api/v1/portal/announcements").then((r) => r.json()),
          fetch("/api/v1/portal/catalog/summary").then((r) => r.json()),
          fetch("/api/v1/portal/requests/summary").then((r) => r.json()),
          fetch("/api/v1/portal/incidents/summary").then((r) => r.json()),
        ]);
        if (annRes.status === "fulfilled") setAnnouncements(annRes.value.announcements ?? []);
        if (catRes.status === "fulfilled") setCatalogItems(catRes.value.items ?? []);
        if (reqRes.status === "fulfilled") setMyRequests(reqRes.value.items ?? []);
        if (incRes.status === "fulfilled") setMyIncidents(incRes.value.items ?? []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleQuickSubmit = async (type: "incident" | "request") => {
    try {
      const res = await fetch(`/api/v1/portal/${type}/create`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      const data = await res.json();
      if (data.success) {
        showSuccess("Created", `Your ${type} has been created.`);
        navigate(`/instances/${useParams()?.instanceId}/portal/${type === "incident" ? "my-incidents" : "requests"}`);
      }
    } catch {
      showSuccess("Ready", `Navigate to the ${type} form from the sidebar.`);
    }
  };

  const catalogItemsFiltered = catalogItems.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  );

  const canCatalog = can(permissions, "itsm.catalog.read");
  const canIncidents = can(permissions, "itsm.incident.read");
  const canKnowledge = can(permissions, "itsm.knowledge.read");
  const canRequests = can(permissions, "itsm.request.read");
  const canApprovals = can(permissions, "itsm.approval.read");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-6 w-6" />
        <span className="ml-3 text-sm text-slate-500">Loading portal…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <PageHeader title="Requester Portal" description="Self-service portal" />
        <ErrorState message={error} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Requester Portal"
        description="Self-service for requests, incidents, catalog, and knowledge."
        actions={
          <div className="flex gap-2">
            {canIncidents && (
              <Button onClick={() => handleQuickSubmit("incident")}>
                <AlertTriangle className="h-4 w-4" /> New Incident
              </Button>
            )}
            {canRequests && (
              <Button variant="outline" onClick={() => handleQuickSubmit("request")}>
                <ClipboardList className="h-4 w-4" /> New Request
              </Button>
            )}
          </div>
        }
      />

      {announcements.length > 0 && (
        <Card>
          <CardHeader title="Announcements" />
          <CardBody className="space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">{a.title}</p>
                <p className="mt-1 text-xs text-slate-600">{a.body}</p>
                <p className="mt-2 text-[10px] text-slate-400">{new Date(a.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {canIncidents && (
          <button onClick={() => handleQuickSubmit("incident")} className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <p className="mt-3 text-sm font-semibold text-slate-900">My Incidents</p>
            <p className="mt-1 text-xs text-slate-500">{myIncidents.length} open</p>
          </button>
        )}
        {canRequests && (
          <button onClick={() => handleQuickSubmit("request")} className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <ClipboardList className="h-8 w-8 text-brand-600" />
            <p className="mt-3 text-sm font-semibold text-slate-900">My Requests</p>
            <p className="mt-1 text-xs text-slate-500">{myRequests.length} open</p>
          </button>
        )}
        {canCatalog && (
          <Link to="catalog" className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <ShoppingCart className="h-8 w-8 text-emerald-600" />
            <p className="mt-3 text-sm font-semibold text-slate-900">Service Catalog</p>
            <p className="mt-1 text-xs text-slate-500">{catalogItems.length} items</p>
          </Link>
        )}
        {canKnowledge && (
          <Link to="knowledge" className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <BookOpen className="h-8 w-8 text-sky-600" />
            <p className="mt-3 text-sm font-semibold text-slate-900">Knowledge</p>
            <p className="mt-1 text-xs text-slate-500">Search articles</p>
          </Link>
        )}
      </div>

      {canCatalog && (
        <Card>
          <CardHeader title="Popular Catalog Items" description="Recently added or most requested service items." actions={<Link to="catalog" className="text-xs text-brand-600 hover:underline">View all →</Link>} />
          <CardBody className="overflow-x-auto">
            {catalogItemsFiltered.length === 0 ? (
              <EmptyState title="No catalog items" description="Browse the full catalog from the sidebar." />
            ) : (
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {["Name", "Category", "Price", "Status"].map((col) => (
                      <th key={col} className="px-4 py-2.5 text-xs font-semibold uppercase text-slate-500">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {catalogItemsFiltered.slice(0, 5).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3"><Link to={`catalog/${item.id}`} className="font-medium text-brand-700 hover:underline">{item.name}</Link></td>
                      <td className="px-4 py-3 text-slate-600">{item.category}</td>
                      <td className="px-4 py-3">{item.price}</td>
                      <td className="px-4 py-3"><Badge variant={item.status === "active" ? "success" : "muted"}>{item.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {canRequests && (
          <Card>
            <CardHeader title="My Open Requests" description="Requests submitted by you." actions={<Link to="requests" className="text-xs text-brand-600 hover:underline">View all →</Link>} />
            <CardBody>
              {myRequests.length === 0 ? <EmptyState title="No open requests" /> : (
                <ul className="space-y-2">
                  {myRequests.slice(0, 5).map((r) => (
                    <li key={r.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                      <div><p className="text-sm font-medium">{r.title}</p><p className="text-[10px] text-slate-400">{r.number} · {new Date(r.createdAt).toLocaleDateString()}</p></div>
                      <Badge variant={r.status === "open" ? "warning" : r.status === "resolved" ? "success" : "muted"}>{r.status}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        )}
        {canIncidents && (
          <Card>
            <CardHeader title="My Incidents" description="Incidents reported by you." actions={<Link to="my-incidents" className="text-xs text-brand-600 hover:underline">View all →</Link>} />
            <CardBody>
              {myIncidents.length === 0 ? <EmptyState title="No open incidents" /> : (
                <ul className="space-y-2">
                  {myIncidents.slice(0, 5).map((i) => (
                    <li key={i.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                      <div><p className="text-sm font-medium">{i.title}</p><p className="text-[10px] text-slate-400">{i.number} · {new Date(i.createdAt).toLocaleDateString()}</p></div>
                      <div className="flex gap-2">
                        <Badge variant={i.priority === "critical" ? "danger" : i.priority === "high" ? "warning" : "muted"}>{i.priority}</Badge>
                        <Badge variant={i.status === "open" ? "warning" : i.status === "resolved" ? "success" : "muted"}>{i.status}</Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}


