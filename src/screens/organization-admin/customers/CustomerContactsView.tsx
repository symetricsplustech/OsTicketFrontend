import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useAppSelector } from "@store/hooks";
import { selectPermissions } from "@services/auth/authSlice";
import { can } from "@services/authorization/permissions";
import {
  useListCustomerContactsQuery,
  useListCustomersQuery,
  type CustomerPortalStatus,
} from "@services/tenantadmin";
import { ContactFormModal } from "./customerForms";
import { CustomerContactsTable } from "./customerTables";
import { inputClass, buttonPrimary } from "./ui";

/**
 * Shared contacts workspace used by both the Contacts and the Portal Access
 * destinations. Portal mode defaults the status filter to invited contacts and
 * explains the portal workflow.
 */
export function CustomerContactsView({
  portalFocus = false,
  title,
  description,
}: {
  portalFocus?: boolean;
  title: string;
  description: string;
}) {
  const permissions = useAppSelector(selectPermissions);
  const canManageContacts = can(permissions, "customers.contacts.manage");
  const canManagePortal = can(permissions, "customers.portal.manage");

  const [search, setSearch] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [portalStatus, setPortalStatus] = useState<CustomerPortalStatus | "">(
    portalFocus ? "INVITED" : "",
  );
  const [adding, setAdding] = useState(false);

  const customersQuery = useListCustomersQuery({ limit: 100 });
  const contactsQuery = useListCustomerContactsQuery({
    search: search || undefined,
    customerId: customerId || undefined,
    portalStatus: portalStatus || undefined,
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
            {title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">{description}</p>
        </div>
        {canManageContacts ? (
          <button
            type="button"
            className={buttonPrimary}
            onClick={() => setAdding(true)}
          >
            <Plus className="h-4 w-4" /> Add contact
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
              placeholder="Search contacts…"
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
            value={portalStatus}
            onChange={(event) =>
              setPortalStatus(event.target.value as CustomerPortalStatus | "")
            }
          >
            <option value="">All portal states</option>
            <option value="INVITED">Invited</option>
            <option value="ACTIVE">Active</option>
            <option value="REVOKED">Revoked</option>
            <option value="NONE">No access</option>
          </select>
        </div>

        <div className="px-4 pb-4 pt-2">
          <CustomerContactsTable
            contacts={contactsQuery.data?.data ?? []}
            customers={customers}
            isLoading={contactsQuery.isLoading}
            error={contactsQuery.error}
            canManageContacts={canManageContacts}
            canManagePortal={canManagePortal}
            emptyLabel={
              portalFocus
                ? "No contacts currently match this portal status."
                : "No contacts yet — add the first customer contact."
            }
          />
        </div>
      </div>

      <ContactFormModal
        open={adding}
        onClose={() => setAdding(false)}
        customers={customers}
      />
    </div>
  );
}
