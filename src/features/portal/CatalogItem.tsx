import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ShoppingCart, ArrowLeft, Loader2 } from "lucide-react";
import { useAppSelector } from "@shared/store/hooks";
import { selectPermissions } from "@shared/auth/authSlice";
import { can } from "@shared/authorization/permissions";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardHeader, CardBody } from "@shared/components/ui";
import { Button } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { Input } from "@shared/components/ui";
import { Label } from "@shared/components/ui";
import { Spinner } from "@shared/components/ui";
import { EmptyState } from "@shared/components/ui";
import { ErrorState } from "@shared/components/ui";
import { DynamicFormRenderer, FieldConfig } from "@shared/components/DynamicFormRenderer";
import { showSuccess } from "@shared/components/Toast/ToastContainer";
import { cn } from "@shared/lib/cn";

interface VariableDef {
  name: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface CatalogItemData {
  id: string;
  name: string;
  description: string;
  category: string;
  price: string;
  status: string;
  eligibility: { requiresGroup: string[]; requiresRole: string[] };
  variables: VariableDef[];
}

export function CatalogItem() {
  const { instanceId = "", itemId = "" } = useParams();
  const permissions = useAppSelector(selectPermissions);
  const [item, setItem] = useState<CatalogItemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const canRequest = can(permissions, "itsm.request.create");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/portal/catalog/${itemId}`);
        const data = await res.json();
        if (data.success && data.item) {
          setItem(data.item);
          const initialValues: Record<string, unknown> = {};
          data.item.variables?.forEach((v: VariableDef) => { initialValues[v.name] = ""; });
          setFormValues(initialValues);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [itemId]);

  const fields: FieldConfig[] = (item?.variables ?? []).map((v) => ({
    name: v.name,
    label: v.label,
    type: v.type === "select" ? "select" : v.type === "textarea" ? "textarea" : "text",
    required: v.required,
    options: v.options?.map((o) => ({ value: o, label: o })),
    placeholder: v.placeholder,
  }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormErrors({});
    const missing = (item?.variables ?? []).filter((v) => v.required && !formValues[v.name]);
    if (missing.length > 0) {
      setFormErrors({ [missing[0].name]: `${missing[0].label} is required` });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/portal/cart/items`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemId, variables: formValues }) });
      const data = await res.json();
      if (data.success) {
        showSuccess("Added to Cart", `${item?.name} has been added to your cart.`);
      }
    } catch {
      showError("Error", "Failed to add item to cart.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Spinner className="h-6 w-6" /><span className="ml-3 text-sm text-slate-500">Loading item…</span></div>;
  }

  if (error || !item) {
    return <div className="max-w-5xl mx-auto"><ErrorState message={error ?? "Item not found."} /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader title={item.name} description={item.description} breadcrumbs={<Link to={`/instances/${instanceId}/portal/catalog`} className="text-brand-600 hover:underline">Catalog</Link>} actions={<Link to={`/instances/${instanceId}/portal/cart`} className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"><ShoppingCart className="h-4 w-4" /> View Cart</Link>} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Item Details" />
            <CardBody className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900">{item.name}</h2>
                <Badge variant={item.status === "active" ? "success" : "muted"}>{item.status}</Badge>
              </div>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div><span className="text-slate-500">Category:</span> <span className="font-medium">{item.category}</span></div>
                <div><span className="text-slate-500">Price:</span> <span className="font-medium">{item.price}</span></div>
              </div>
              <p className="text-sm text-slate-600">{item.description}</p>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold">Eligibility</h3>
                <div className="mt-2 space-y-1 text-sm text-slate-600">
                  <p>Required groups: {item.eligibility.requiresGroup.join(", ") ?? "None"}</p>
                  <p>Required roles: {item.eligibility.requiresRole.join(", ") ?? "None"}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {item.variables.length > 0 ? (
            <Card>
              <CardHeader title="Required Information" description="Provide the requested details." />
              <CardBody>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {item.variables.map((v) => (
                    <div key={v.name}>
                      <Label htmlFor={v.name}>{v.label}{v.required ? " *" : ""}</Label>
                      {v.type === "select" ? (
                        <select id={v.name} value={String(formValues[v.name] ?? "")} onChange={(e) => setFormValues((prev) => ({ ...prev, [v.name]: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                          <option value="">Select…</option>
                          {v.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <Input id={v.name} type="text" value={String(formValues[v.name] ?? "")} onChange={(e) => setFormValues((prev) => ({ ...prev, [v.name]: e.target.value }))} placeholder={v.placeholder} required={v.required} className="w-full" />
                      )}
                      {formErrors[v.name] ? <p className="mt-1 text-xs text-red-600">{formErrors[v.name]}</p> : null}
                    </div>
                  ))}
                  <Button type="submit" loading={submitting} disabled={!canRequest}>
                    Add to Cart
                  </Button>
                </form>
              </CardBody>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

import { showError } from "@shared/components/Toast/ToastContainer";
