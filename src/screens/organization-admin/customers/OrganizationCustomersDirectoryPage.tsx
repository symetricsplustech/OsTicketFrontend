import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { useAppSelector } from "@store/hooks";
import { selectPermissions } from "@services/auth/authSlice";
import { can } from "@services/authorization/permissions";
import {
  useListCustomersQuery,
  useUpdateCustomerMutation,
  type Customer,
  type CustomerStatus,
} from "@services/tenantadmin";
import { CustomerFormModal } from "./customerForms";
import {
  CustomerStatusBadge,
  EmptyState,
  ErrorState,
  LoadingState,
  apiErrorMessage,
  buttonGhost,
  buttonPrimary,
  buttonSecondary,
  inputClass,
} from "./ui";

const CUSTOMERS_BASE = "/organization/customers";

export function OrganizationCustomersDirectoryPage() {
  const navigate = useNavigate();
  const permissions = useAppSelector(selectPermissions);
  const canManage = can(permissions, "customers.manage");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CustomerStatus | "">("");
  const [editing, setEditing] = useState<Customer | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading, error } = useListCustomersQuery({ search: search || undefined, status: status || undefined });
  const [updateCustomer] = useUpdateCustomerMutation();

  const customers = useMemo(() => data?.data ?? [], [data]);

  const toggleStatus = async (customer: Customer) => {
    setActionError(null);
    try {
      await updateCustomer({
        customerId: customer.id,
        body: { status: customer.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" },
      }).unwrap();
    } catch (err) {
      setActionError(apiErrorMessage(err));
    }
  };

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Customers & Customer Contacts</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">Customer Directory</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">
            Every customer belonging to your organization, with contacts, sites, portal access and ticket history.
          </p>
        </div>
        {canManage ? (
          <Link to={`${CUSTOMERS_BASE}/create-customer`} className={buttonPrimary}>
            <Plus className="h-4 w-4" /> Create customer
          </Link>
        ) : null}
      </header>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3">
          <label className="flex min-w-56 flex-1 items-center gap-2 rounded-md border border-slate-200 px-2.5 py-1.5 focus-within:border-brand-400 focus-within:ring-1 focus-within:ring-brand-200">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customers…"
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </label>
          <select className={`${inputClass} w-40`} value={status} onChange={(event) => setStatus(event.target.value as CustomerStatus | "")}>
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PROSPECT">Prospect</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        {actionError ? (
          <div className="px-4 pt-4">
            <ErrorState message={actionError} />
          </div>
        ) : null}

        {isLoading ? (
          <LoadingState label="Loading customers…" />
        ) : error ? (
          <div className="p-4">
            <ErrorState message={apiErrorMessage(error)} />
          </div>
        ) : customers.length === 0 ? (
          <EmptyState label="No customers match the current filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/60">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Customer</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Industry</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Status</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Contacts</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Sites</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Tickets</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => navigate(`${CUSTOMERS_BASE}/${customer.id}`)}
                        className="text-left text-sm font-medium text-brand-700 hover:underline"
                      >
                        {customer.name}
                      </button>
                      <div className="text-xs text-slate-400">
                        {[customer.code, customer.city, customer.country].filter(Boolean).join(" · ")}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{customer.industry ?? "—"}</td>
                    <td className="px-4 py-3">
                      <CustomerStatusBadge status={customer.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{customer._count?.contacts ?? 0}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{customer._count?.sites ?? 0}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{customer._count?.incidents ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1">
                        <Link to={`${CUSTOMERS_BASE}/${customer.id}`} className={buttonGhost}>
                          Open
                        </Link>
                        {canManage ? (
                          <button type="button" className={buttonGhost} onClick={() => setEditing(customer)}>
                            Edit
                          </button>
                        ) : null}
                        {canManage ? (
                          <button type="button" className={buttonSecondary} onClick={() => toggleStatus(customer)}>
                            {customer.status === "ACTIVE" ? "Deactivate" : "Activate"}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CustomerFormModal open={Boolean(editing)} onClose={() => setEditing(null)} customer={editing ?? undefined} />
    </div>
  );
}
