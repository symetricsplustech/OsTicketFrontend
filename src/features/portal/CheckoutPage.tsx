import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CreditCard, Check, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks";
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
import { DynamicFormRenderer, FieldConfig } from "@shared/components/DynamicFormRenderer";
import { showSuccess } from "@shared/components/Toast/ToastContainer";
import { cn } from "@shared/lib/cn";

interface CheckoutItem {
  id: string;
  itemId: string;
  name: string;
  price: string;
  quantity: number;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const permissions = useAppSelector(selectPermissions);
  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canCheckout = can(permissions, "itsm.request.create");

  const billingFields: FieldConfig[] = [
    { name: "name", label: "Full Name", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "department", label: "Department", type: "text", required: false },
    { name: "comments", label: "Additional Comments", type: "textarea", required: false },
  ];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/v1/portal/cart");
        const data = await res.json();
        if (data.success) {
          setItems(data.items ?? []);
          setTotal(data.items.reduce((sum: number, i: CheckoutItem) => sum + parseFloat(i.price) * i.quantity, 0));
        }
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (_event: React.FormEvent) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/portal/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items }) });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        showSuccess("Order Submitted", "Your request has been submitted successfully.");
      }
    } catch {
      showSuccess("Error", "Checkout failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Spinner className="h-6 w-6" /><span className="ml-3 text-sm text-slate-500">Loading checkout…</span></div>;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto"><PageHeader title="Checkout" description="Review and submit your request." />
        <EmptyState title="Your cart is empty" description="Add items to proceed with checkout." />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-4xl mx-auto"><PageHeader title="Checkout" description="Review and submit your request." />
        <Card><CardBody><div className="text-center py-12"><Check className="mx-auto h-12 w-12 text-emerald-500" /><h2 className="mt-4 text-xl font-bold text-slate-900">Submitted!</h2><p className="mt-2 text-sm text-slate-500">Your request has been submitted. You'll be notified when it's processed.</p><Link to="/instances/portal/home" className="mt-4 inline-block text-brand-600 hover:underline">Return to Portal</Link></div></CardBody></Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader title="Checkout" description="Review items and submit your request." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Order Summary" />
          <CardBody className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <div><p className="text-sm font-medium">{item.name}</p><p className="text-[10px] text-slate-500">Qty: {item.quantity}</p></div>
                <span className="text-sm font-medium">${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-3 flex items-center justify-between">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-lg font-bold">${total.toFixed(2)}</span>
            </div>
          </CardBody>
        </Card>

        {canCheckout && (
          <Card>
            <CardHeader title="Billing Information" description="Provide your details for the order." />
            <CardBody>
              <form onSubmit={handleSubmit} className="space-y-5">
                {billingFields.map((field) => (
                  <div key={field.name}>
                    <Label htmlFor={field.name}>{field.label}{field.required ? " *" : ""}</Label>
                    {field.type === "textarea" ? <textarea id={field.name} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" rows={3} required={field.required} /> : <Input id={field.name} type={field.type} required={field.required} className="w-full" />}
                  </div>
                ))}
                <Button type="submit" loading={submitting} className="w-full">
                  <CreditCard className="h-4 w-4" /> Submit Order
                </Button>
              </form>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
