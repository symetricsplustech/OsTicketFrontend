import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { useAppSelector } from "@shared/store/hooks";
import { selectPermissions } from "@shared/auth/authSlice";
import { can } from "@shared/authorization/permissions";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardHeader, CardBody } from "@shared/components/ui";
import { Button } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { EmptyState } from "@shared/components/ui";
import { Spinner } from "@shared/components/ui";
import { showSuccess } from "@shared/components/Toast/ToastContainer";
import { cn } from "@shared/lib/cn";

interface CartItem {
  id: string;
  itemId: string;
  name: string;
  price: string;
  quantity: number;
  variables: Record<string, string>;
}

export function CartPage() {
  const navigate = useNavigate();
  const permissions = useAppSelector(selectPermissions);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canCheckout = can(permissions, "itsm.request.create");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/v1/portal/cart");
        const data = await res.json();
        if (data.success) setCartItems(data.items ?? []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleRemove = async (itemId: string) => {
    try {
      await fetch(`/api/v1/portal/cart/items/${itemId}`, { method: "DELETE" });
      setCartItems((prev) => prev.filter((i) => i.id !== itemId));
      showSuccess("Removed", "Item removed from cart.");
    } catch {
      showSuccess("Ready", "Try removing the item again.");
    }
  };

  const total = cartItems.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Spinner className="h-6 w-6" /><span className="ml-3 text-sm text-slate-500">Loading cart…</span></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader title="My Cart" description="Review items before checkout." actions={canCheckout ? <Link to="checkout" className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">Proceed to Checkout <ArrowRight className="h-4 w-4" /></Link> : null} />

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {cartItems.length === 0 ? (
        <EmptyState title="Your cart is empty" description="Browse the service catalog to add items." />
      ) : (
        <>
          <Card>
            <CardBody className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {["Item", "Price", "Quantity", "Total", "Actions"].map((col) => (
                      <th key={col} className="px-4 py-2.5 text-xs font-semibold uppercase text-slate-500">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cartItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3"><p className="font-medium">{item.name}</p>{Object.entries(item.variables).map(([k, v]) => <p key={k} className="text-[10px] text-slate-400">{k}: {v}</p>)}</td>
                      <td className="px-4 py-3">{item.price}</td>
                      <td className="px-4 py-3">{item.quantity}</td>
                      <td className="px-4 py-3 font-medium">{(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                      <td className="px-4 py-3"><button onClick={() => handleRemove(item.id)} className="text-red-600 hover:text-red-800"><Trash2 className="h-4 w-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-lg font-semibold">Total: ${total.toFixed(2)}</span>
                <Link to="checkout" className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">Checkout</Link>
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
