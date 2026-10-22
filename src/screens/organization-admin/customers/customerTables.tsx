import { useState } from "react";
import { Pencil, Send, ShieldOff } from "lucide-react";
import {
  useInviteCustomerContactPortalMutation,
  useRevokeCustomerContactPortalMutation,
  type Customer,
  type CustomerContact,
  type CustomerSite,
  type IncidentSummary,
} from "@services/tenantadmin";
import { ContactFormModal, SiteFormModal } from "./customerForms";
import {
  EmptyState,
  ErrorState,
  IncidentStatusBadge,
  LoadingState,
  PortalStatusBadge,
  PriorityBadge,
  apiErrorMessage,
  buttonDanger,
  buttonGhost,
} from "./ui";

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const thClass =
  "px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400";
const tdClass = "px-3 py-3 text-sm text-slate-600";

export function CustomerContactsTable({
  contacts,
  customers,
  isLoading,
  error,
  fixedCustomerId,
  showCustomerColumn = true,
  canManageContacts,
  canManagePortal,
  emptyLabel,
}: {
  contacts: CustomerContact[];
  customers: Pick<Customer, "id" | "name">[];
  isLoading: boolean;
  error: unknown;
  fixedCustomerId?: string;
  showCustomerColumn?: boolean;
  canManageContacts: boolean;
  canManagePortal: boolean;
  emptyLabel?: string;
}) {
  const [editing, setEditing] = useState<CustomerContact | null>(null);
  const [invitePortal, inviteState] = useInviteCustomerContactPortalMutation();
  const [revokePortal, revokeState] = useRevokeCustomerContactPortalMutation();
  const [actionError, setActionError] = useState<string | null>(null);

  const runAction = async (action: () => Promise<unknown>) => {
    setActionError(null);
    try {
      await action();
    } catch (err) {
      setActionError(apiErrorMessage(err));
    }
  };

  if (isLoading) return <LoadingState label="Loading contacts…" />;
  if (error) return <ErrorState message={apiErrorMessage(error)} />;
  if (contacts.length === 0)
    return <EmptyState label={emptyLabel ?? "No contacts yet."} />;

  return (
    <div>
      {actionError ? (
        <div className="mb-3">
          <ErrorState message={actionError} />
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50/60">
            <tr>
              {showCustomerColumn ? (
                <th className={thClass}>Customer</th>
              ) : null}
              <th className={thClass}>Name</th>
              <th className={thClass}>Email</th>
              <th className={thClass}>Role</th>
              <th className={thClass}>Portal access</th>
              <th className={thClass}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {contacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-slate-50/60">
                {showCustomerColumn ? (
                  <td className={tdClass}>{contact.customer?.name ?? "—"}</td>
                ) : null}
                <td className={tdClass}>
                  <span className="font-medium text-slate-800">
                    {contact.firstName} {contact.lastName}
                  </span>
                  {contact.isPrimary ? (
                    <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                      Primary
                    </span>
                  ) : null}
                  {contact.jobTitle ? (
                    <div className="text-xs text-slate-400">
                      {contact.jobTitle}
                    </div>
                  ) : null}
                </td>
                <td className={tdClass}>{contact.email}</td>
                <td className={tdClass}>{contact.role}</td>
                <td className={tdClass}>
                  <PortalStatusBadge status={contact.portalStatus} />
                </td>
                <td className={tdClass}>
                  <div className="flex flex-wrap items-center gap-1">
                    {canManageContacts ? (
                      <button
                        type="button"
                        className={buttonGhost}
                        onClick={() => setEditing(contact)}
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                    ) : null}
                    {canManagePortal && contact.portalStatus !== "ACTIVE" ? (
                      <button
                        type="button"
                        className={buttonGhost}
                        disabled={inviteState.isLoading}
                        onClick={() =>
                          runAction(() =>
                            invitePortal({
                              customerId: contact.customerId,
                              contactId: contact.id,
                            }).unwrap(),
                          )
                        }
                      >
                        <Send className="h-3.5 w-3.5" />
                        {contact.portalStatus === "INVITED"
                          ? "Resend invite"
                          : "Invite to portal"}
                      </button>
                    ) : null}
                    {canManagePortal &&
                    (contact.portalStatus === "INVITED" ||
                      contact.portalStatus === "ACTIVE") ? (
                      <button
                        type="button"
                        className={buttonDanger}
                        disabled={revokeState.isLoading}
                        onClick={() =>
                          runAction(() =>
                            revokePortal({
                              customerId: contact.customerId,
                              contactId: contact.id,
                            }).unwrap(),
                          )
                        }
                      >
                        <ShieldOff className="h-3.5 w-3.5" /> Revoke
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ContactFormModal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        customers={customers}
        fixedCustomerId={fixedCustomerId}
        contact={editing ?? undefined}
      />
    </div>
  );
}

export function CustomerSitesTable({
  sites,
  customers,
  isLoading,
  error,
  fixedCustomerId,
  showCustomerColumn = true,
  canManage,
}: {
  sites: CustomerSite[];
  customers: Pick<Customer, "id" | "name">[];
  isLoading: boolean;
  error: unknown;
  fixedCustomerId?: string;
  showCustomerColumn?: boolean;
  canManage: boolean;
}) {
  const [editing, setEditing] = useState<CustomerSite | null>(null);

  if (isLoading) return <LoadingState label="Loading sites…" />;
  if (error) return <ErrorState message={apiErrorMessage(error)} />;
  if (sites.length === 0)
    return <EmptyState label="No sites registered yet." />;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50/60">
            <tr>
              {showCustomerColumn ? (
                <th className={thClass}>Customer</th>
              ) : null}
              <th className={thClass}>Site</th>
              <th className={thClass}>Type</th>
              <th className={thClass}>Location</th>
              <th className={thClass}>Status</th>
              {canManage ? <th className={thClass}>Actions</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sites.map((site) => (
              <tr key={site.id} className="hover:bg-slate-50/60">
                {showCustomerColumn ? (
                  <td className={tdClass}>{site.customer?.name ?? "—"}</td>
                ) : null}
                <td className={tdClass}>
                  <span className="font-medium text-slate-800">
                    {site.name}
                  </span>
                  {site.code ? (
                    <span className="ml-2 text-xs text-slate-400">
                      {site.code}
                    </span>
                  ) : null}
                </td>
                <td className={tdClass}>
                  {site.isDataCenter ? (
                    <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                      Data center
                    </span>
                  ) : (
                    site.siteType
                  )}
                </td>
                <td className={tdClass}>
                  {[site.city, site.country].filter(Boolean).join(", ") || "—"}
                </td>
                <td className={tdClass}>{site.status}</td>
                {canManage ? (
                  <td className={tdClass}>
                    <button
                      type="button"
                      className={buttonGhost}
                      onClick={() => setEditing(site)}
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SiteFormModal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        customers={customers}
        fixedCustomerId={fixedCustomerId}
        site={editing ?? undefined}
      />
    </div>
  );
}

export function CustomerTicketsTable({
  incidents,
  isLoading,
  error,
  emptyLabel,
}: {
  incidents: IncidentSummary[];
  isLoading: boolean;
  error: unknown;
  emptyLabel?: string;
}) {
  if (isLoading) return <LoadingState label="Loading tickets…" />;
  if (error) return <ErrorState message={apiErrorMessage(error)} />;
  if (incidents.length === 0)
    return (
      <EmptyState label={emptyLabel ?? "No tickets for this customer yet."} />
    );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-50/60">
          <tr>
            <th className={thClass}>Number</th>
            <th className={thClass}>Title</th>
            <th className={thClass}>Status</th>
            <th className={thClass}>Priority</th>
            <th className={thClass}>Created</th>
            <th className={thClass}>SLA</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {incidents.map((incident) => (
            <tr key={incident.id} className="hover:bg-slate-50/60">
              <td className={`${tdClass} font-mono text-xs`}>
                {incident.number}
              </td>
              <td className={tdClass}>
                <span className="font-medium text-slate-800">
                  {incident.title}
                </span>
              </td>
              <td className={tdClass}>
                <IncidentStatusBadge status={incident.statusKey} />
              </td>
              <td className={tdClass}>
                <PriorityBadge priority={incident.priorityKey} />
              </td>
              <td className={tdClass}>{formatDate(incident.createdAt)}</td>
              <td className={tdClass}>
                {incident.slaBreached ? (
                  <span className="font-medium text-red-600">Breached</span>
                ) : (
                  <span className="text-slate-400">On track</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
