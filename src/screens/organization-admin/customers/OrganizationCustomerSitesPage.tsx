import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useAppSelector } from "@store/hooks";
import { selectPermissions } from "@services/auth/authSlice";
import { can } from "@services/authorization/permissions";
import {
  useListCustomersQuery,
  useListCustomerSitesQuery,
} from "@services/tenantadmin";
import { SiteFormModal } from "./customerForms";
import { CustomerSitesTable } from "./customerTables";
import { buttonPrimary, inputClass } from "./ui";

export function OrganizationCustomerSitesPage() {
  const permissions = useAppSelector(selectPermissions);
  const canManageSites = can(permissions, "customers.sites.manage");

  const [search, setSearch] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [dataCentersOnly, setDataCentersOnly] = useState(false);
  const [adding, setAdding] = useState(false);

  const customersQuery = useListCustomersQuery({ limit: 100 });
  const sitesQuery = useListCustomerSitesQuery({
    search: search || undefined,
    customerId: customerId || undefined,
    isDataCenter: dataCentersOnly ? true : undefined,
  });

  const customers = customersQuery.data?.data ?? [];

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            Customers & Customer Contacts
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
            Service Locations
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">
            Customer sites, offices and data center locations where support is
            delivered.
          </p>
        </div>
        {canManageSites ? (
          <button
            type="button"
            className={buttonPrimary}
            onClick={() => setAdding(true)}
          >
            <Plus className="h-4 w-4" /> Add site
          </button>
        ) : null}
      </header>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3">
          <label className="flex min-w-56 flex-1 items-center gap-2 rounded-md border border-slate-200 px-2.5 py-1.5 focus-within:border-brand-400 focus-within:ring-1 focus-within:ring-brand-200">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search sites…"
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
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={dataCentersOnly}
              onChange={(event) => setDataCentersOnly(event.target.checked)}
            />
            Data centers only
          </label>
        </div>

        <div className="px-4 pb-4 pt-2">
          <CustomerSitesTable
            sites={sitesQuery.data?.data ?? []}
            customers={customers}
            isLoading={sitesQuery.isLoading}
            error={sitesQuery.error}
            canManage={canManageSites}
          />
        </div>
      </div>

      <SiteFormModal
        open={adding}
        onClose={() => setAdding(false)}
        customers={customers}
      />
    </div>
  );
}
