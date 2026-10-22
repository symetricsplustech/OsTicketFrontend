import { useMemo, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { ArrowLeft, Building2, Pencil, Plus } from "lucide-react";
import { useAppSelector } from "@store/hooks";
import { selectPermissions } from "@services/auth/authSlice";
import { can } from "@services/authorization/permissions";
import {
  useGetCustomerQuery,
  useListIncidentsQuery,
  useUpdateCustomerMutation,
  type Customer,
} from "@services/tenantadmin";
import {
  CustomerFormModal,
  ContactFormModal,
  SiteFormModal,
} from "./customerForms";
import {
  CustomerContactsTable,
  CustomerSitesTable,
  CustomerTicketsTable,
} from "./customerTables";
import {
  Card,
  CustomerStatusBadge,
  ErrorState,
  LoadingState,
  apiErrorMessage,
  buttonPrimary,
  buttonSecondary,
} from "./ui";

const CUSTOMERS_BASE = "/organization/customers";

type TabKey = "overview" | "contacts" | "sites" | "tickets";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "contacts", label: "Contacts & Access" },
  { key: "sites", label: "Sites & Services" },
  { key: "tickets", label: "Tickets" },
];

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-slate-700">{value || "—"}</dd>
    </div>
  );
}

export function OrganizationCustomerDetailPage() {
  const { customerId = "" } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const permissions = useAppSelector(selectPermissions);

  const canManage = can(permissions, "customers.manage");
  const canManageContacts = can(permissions, "customers.contacts.manage");
  const canManageSites = can(permissions, "customers.sites.manage");
  const canManagePortal = can(permissions, "customers.portal.manage");

  const initialTab = (searchParams.get("tab") as TabKey) || "overview";
  const [tab, setTab] = useState<TabKey>(
    TABS.some((entry) => entry.key === initialTab) ? initialTab : "overview",
  );
  const [editingCustomer, setEditingCustomer] = useState(false);
  const [addingContact, setAddingContact] = useState(false);
  const [addingSite, setAddingSite] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const customerQuery = useGetCustomerQuery(customerId, { skip: !customerId });
  const incidentsQuery = useListIncidentsQuery(
    { customerId, limit: 100 },
    { skip: !customerId || tab !== "tickets" },
  );
  const [updateCustomer] = useUpdateCustomerMutation();

  const customer = customerQuery.data?.data as Customer | undefined;

  const customerOptions = useMemo(
    () => (customer ? [{ id: customer.id, name: customer.name }] : []),
    [customer],
  );

  const toggleStatus = async () => {
    if (!customer) return;
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

  if (customerQuery.isLoading)
    return <LoadingState label="Loading customer…" />;
  if (customerQuery.error)
    return <ErrorState message={apiErrorMessage(customerQuery.error)} />;
  if (!customer) return <ErrorState message="Customer not found." />;

  return (
    <div>
      <Link
        to={`${CUSTOMERS_BASE}/customer-directory`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" /> Back to customer directory
      </Link>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-1 grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">
                {customer.name}
              </h1>
              <CustomerStatusBadge status={customer.status} />
              {customer.isDataCenter ? (
                <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                  Data center operator
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {[
                customer.code,
                customer.industry,
                [customer.city, customer.country].filter(Boolean).join(", "),
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>
        {canManage ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={buttonSecondary}
              onClick={() => setEditingCustomer(true)}
            >
              <Pencil className="h-4 w-4" /> Edit
            </button>
            <button
              type="button"
              className={buttonPrimary}
              onClick={toggleStatus}
            >
              {customer.status === "ACTIVE" ? "Deactivate" : "Activate"}
            </button>
          </div>
        ) : null}
      </header>

      {actionError ? (
        <div className="mb-4">
          <ErrorState message={actionError} />
        </div>
      ) : null}

      <nav className="mb-5 flex flex-wrap gap-1 border-b border-slate-200">
        {TABS.map((entry) => (
          <button
            key={entry.key}
            type="button"
            onClick={() => setTab(entry.key)}
            className={
              tab === entry.key
                ? "border-b-2 border-brand-600 px-3.5 py-2 text-sm font-semibold text-brand-700"
                : "border-b-2 border-transparent px-3.5 py-2 text-sm text-slate-500 hover:text-slate-800"
            }
          >
            {entry.label}
          </button>
        ))}
      </nav>

      {tab === "overview" ? (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Contacts
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-800">
                {customer._count?.contacts ?? customer.contacts?.length ?? 0}
              </p>
            </Card>
            <Card>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Sites
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-800">
                {customer._count?.sites ?? customer.sites?.length ?? 0}
              </p>
            </Card>
            <Card>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Tickets
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-800">
                {customer._count?.incidents ?? 0}
              </p>
            </Card>
          </div>
          <Card>
            <h2 className="mb-4 text-sm font-semibold text-slate-800">
              Customer details
            </h2>
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <DetailRow label="Type" value={customer.type} />
              <DetailRow label="Email" value={customer.email} />
              <DetailRow label="Phone" value={customer.phone} />
              <DetailRow label="Website" value={customer.website} />
              <DetailRow label="Address" value={customer.addressLine1} />
              <DetailRow label="Timezone" value={customer.timezone} />
              <DetailRow
                label="Created"
                value={new Date(customer.createdAt).toLocaleDateString(
                  undefined,
                  { year: "numeric", month: "long", day: "numeric" },
                )}
              />
            </dl>
            {customer.description ? (
              <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
                {customer.description}
              </p>
            ) : null}
          </Card>
        </div>
      ) : null}

      {tab === "contacts" ? (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">
              Contacts & portal access
            </h2>
            {canManageContacts ? (
              <button
                type="button"
                className={buttonPrimary}
                onClick={() => setAddingContact(true)}
              >
                <Plus className="h-4 w-4" /> Add contact
              </button>
            ) : null}
          </div>
          <CustomerContactsTable
            contacts={customer.contacts ?? []}
            customers={customerOptions}
            isLoading={false}
            error={null}
            fixedCustomerId={customer.id}
            showCustomerColumn={false}
            canManageContacts={canManageContacts}
            canManagePortal={canManagePortal}
          />
        </Card>
      ) : null}

      {tab === "sites" ? (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">
              Sites & data center locations
            </h2>
            {canManageSites ? (
              <button
                type="button"
                className={buttonPrimary}
                onClick={() => setAddingSite(true)}
              >
                <Plus className="h-4 w-4" /> Add site
              </button>
            ) : null}
          </div>
          <CustomerSitesTable
            sites={customer.sites ?? []}
            customers={customerOptions}
            isLoading={false}
            error={null}
            fixedCustomerId={customer.id}
            showCustomerColumn={false}
            canManage={canManageSites}
          />
        </Card>
      ) : null}

      {tab === "tickets" ? (
        <Card>
          <h2 className="mb-4 text-sm font-semibold text-slate-800">
            Customer ticket history
          </h2>
          <CustomerTicketsTable
            incidents={incidentsQuery.data?.data ?? []}
            isLoading={incidentsQuery.isLoading}
            error={incidentsQuery.error}
            emptyLabel="No tickets recorded for this customer yet."
          />
        </Card>
      ) : null}

      <CustomerFormModal
        open={editingCustomer}
        onClose={() => setEditingCustomer(false)}
        customer={customer}
      />
      <ContactFormModal
        open={addingContact}
        onClose={() => setAddingContact(false)}
        customers={customerOptions}
        fixedCustomerId={customer.id}
      />
      <SiteFormModal
        open={addingSite}
        onClose={() => setAddingSite(false)}
        customers={customerOptions}
        fixedCustomerId={customer.id}
      />
      <button
        type="button"
        className="hidden"
        onClick={() => navigate(`${CUSTOMERS_BASE}/${customer.id}`)}
      />
    </div>
  );
}
