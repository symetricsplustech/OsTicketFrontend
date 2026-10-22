import { useState } from "react";
import { Search } from "lucide-react";
import {
  useListCustomersQuery,
  useListIncidentsQuery,
} from "@services/tenantadmin";
import { CustomerTicketsTable } from "./customerTables";
import { inputClass } from "./ui";

const STATUS_OPTIONS = ["open", "in-progress", "pending", "resolved", "closed"];

export function OrganizationCustomerTicketsPage() {
  const [search, setSearch] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [statusKey, setStatusKey] = useState("");

  const customersQuery = useListCustomersQuery({ limit: 100 });
  const incidentsQuery = useListIncidentsQuery({
    search: search || undefined,
    customerId: customerId || undefined,
    statusKey: statusKey || undefined,
  });

  const customers = customersQuery.data?.data ?? [];

  return (
    <div>
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
          Customers & Customer Contacts
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
          Customer Ticket History
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-500">
          Every incident raised for your customers, filterable by customer and
          status. Full ticket handling lives in Incident Management.
        </p>
      </header>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3">
          <label className="flex min-w-56 flex-1 items-center gap-2 rounded-md border border-slate-200 px-2.5 py-1.5 focus-within:border-brand-400 focus-within:ring-1 focus-within:ring-brand-200">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tickets…"
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </label>
          <select
            className={`${inputClass} w-56`}
            value={customerId}
            onChange={(event) => setCustomerId(event.target.value)}
          >
            <option value="">All customers</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
          <select
            className={`${inputClass} w-44`}
            value={statusKey}
            onChange={(event) => setStatusKey(event.target.value)}
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="px-4 pb-4 pt-2">
          <CustomerTicketsTable
            incidents={incidentsQuery.data?.data ?? []}
            isLoading={incidentsQuery.isLoading}
            error={incidentsQuery.error}
            emptyLabel="No customer tickets match the current filters."
          />
        </div>
      </div>
    </div>
  );
}
