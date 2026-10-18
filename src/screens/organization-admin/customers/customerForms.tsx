import { useEffect, useState } from "react";
import {
  useCreateCustomerMutation,
  useCreateCustomerContactMutation,
  useCreateCustomerSiteMutation,
  useUpdateCustomerContactMutation,
  useUpdateCustomerMutation,
  useUpdateCustomerSiteMutation,
  type Customer,
  type CustomerContact,
  type CustomerSite,
} from "@services/tenantadmin";
import {
  ErrorState,
  Field,
  Modal,
  apiErrorMessage,
  buttonPrimary,
  buttonSecondary,
  inputClass,
} from "./ui";

function SectionGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

// ---------------------------------------------------------------------------
// Customer form (create + edit)
// ---------------------------------------------------------------------------

interface CustomerFormState {
  name: string;
  code: string;
  type: "COMPANY" | "INDIVIDUAL";
  status: "ACTIVE" | "INACTIVE" | "PROSPECT";
  industry: string;
  website: string;
  phone: string;
  email: string;
  description: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  timezone: string;
  isDataCenter: boolean;
}

const EMPTY_CUSTOMER: CustomerFormState = {
  name: "",
  code: "",
  type: "COMPANY",
  status: "ACTIVE",
  industry: "",
  website: "",
  phone: "",
  email: "",
  description: "",
  addressLine1: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  timezone: "",
  isDataCenter: false,
};

function stateFromCustomer(customer: Customer): CustomerFormState {
  return {
    name: customer.name,
    code: customer.code ?? "",
    type: customer.type,
    status: customer.status,
    industry: customer.industry ?? "",
    website: customer.website ?? "",
    phone: customer.phone ?? "",
    email: customer.email ?? "",
    description: customer.description ?? "",
    addressLine1: customer.addressLine1 ?? "",
    city: customer.city ?? "",
    state: customer.state ?? "",
    postalCode: customer.postalCode ?? "",
    country: customer.country ?? "",
    timezone: customer.timezone ?? "",
    isDataCenter: customer.isDataCenter,
  };
}

function toWriteBody(form: CustomerFormState) {
  return {
    name: form.name.trim(),
    code: form.code.trim() || undefined,
    type: form.type,
    status: form.status,
    industry: form.industry.trim() || undefined,
    website: form.website.trim() || undefined,
    phone: form.phone.trim() || undefined,
    email: form.email.trim() || undefined,
    description: form.description.trim() || undefined,
    addressLine1: form.addressLine1.trim() || undefined,
    city: form.city.trim() || undefined,
    state: form.state.trim() || undefined,
    postalCode: form.postalCode.trim() || undefined,
    country: form.country.trim() || undefined,
    timezone: form.timezone.trim() || undefined,
    isDataCenter: form.isDataCenter,
  };
}

export function CustomerFormModal({
  open,
  onClose,
  customer,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  customer?: Customer;
  onSaved?: (customer: Customer) => void;
}) {
  const [form, setForm] = useState<CustomerFormState>(EMPTY_CUSTOMER);
  const [error, setError] = useState<string | null>(null);
  const [createCustomer, createState] = useCreateCustomerMutation();
  const [updateCustomer, updateState] = useUpdateCustomerMutation();

  useEffect(() => {
    if (!open) return;
    setForm(customer ? stateFromCustomer(customer) : EMPTY_CUSTOMER);
    setError(null);
  }, [open, customer]);

  const set = <K extends keyof CustomerFormState>(key: K, value: CustomerFormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submitting = createState.isLoading || updateState.isLoading;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Customer name is required.");
      return;
    }
    setError(null);
    try {
      const body = toWriteBody(form);
      const result = customer
        ? await updateCustomer({ customerId: customer.id, body }).unwrap()
        : await createCustomer(body).unwrap();
      onSaved?.(result.data);
      onClose();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={customer ? `Edit ${customer.name}` : "Create customer"} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? <ErrorState message={error} /> : null}
        <SectionGrid>
          <Field label="Customer name">
            <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} required />
          </Field>
          <Field label="Customer code">
            <input className={inputClass} value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="e.g. NDC-001" />
          </Field>
          <Field label="Type">
            <select className={inputClass} value={form.type} onChange={(e) => set("type", e.target.value as CustomerFormState["type"])}>
              <option value="COMPANY">Company</option>
              <option value="INDIVIDUAL">Individual</option>
            </select>
          </Field>
          <Field label="Status">
            <select className={inputClass} value={form.status} onChange={(e) => set("status", e.target.value as CustomerFormState["status"])}>
              <option value="ACTIVE">Active</option>
              <option value="PROSPECT">Prospect</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </Field>
          <Field label="Industry">
            <input className={inputClass} value={form.industry} onChange={(e) => set("industry", e.target.value)} />
          </Field>
          <Field label="Website">
            <input className={inputClass} value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" />
          </Field>
          <Field label="Email">
            <input type="email" className={inputClass} value={form.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label="Phone">
            <input className={inputClass} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field label="City">
            <input className={inputClass} value={form.city} onChange={(e) => set("city", e.target.value)} />
          </Field>
          <Field label="Country">
            <input className={inputClass} value={form.country} onChange={(e) => set("country", e.target.value)} />
          </Field>
          <Field label="Address">
            <input className={inputClass} value={form.addressLine1} onChange={(e) => set("addressLine1", e.target.value)} />
          </Field>
          <Field label="Timezone">
            <input className={inputClass} value={form.timezone} onChange={(e) => set("timezone", e.target.value)} placeholder="e.g. Europe/Dublin" />
          </Field>
        </SectionGrid>
        <Field label="Description">
          <textarea className={inputClass} rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </Field>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={form.isDataCenter} onChange={(e) => set("isDataCenter", e.target.checked)} />
          Operates data center locations
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className={buttonSecondary} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={buttonPrimary} disabled={submitting}>
            {submitting ? "Saving…" : customer ? "Save changes" : "Create customer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Contact form (create + edit)
// ---------------------------------------------------------------------------

interface ContactFormState {
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  role: "PRIMARY" | "TECHNICAL" | "BILLING" | "AUTHORIZED";
  isPrimary: boolean;
  notes: string;
}

export function ContactFormModal({
  open,
  onClose,
  customers,
  fixedCustomerId,
  contact,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  customers: Pick<Customer, "id" | "name">[];
  fixedCustomerId?: string;
  contact?: CustomerContact;
  onSaved?: () => void;
}) {
  const [form, setForm] = useState<ContactFormState>({
    customerId: fixedCustomerId ?? "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    jobTitle: "",
    role: "AUTHORIZED",
    isPrimary: false,
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [createContact, createState] = useCreateCustomerContactMutation();
  const [updateContact, updateState] = useUpdateCustomerContactMutation();

  useEffect(() => {
    if (!open) return;
    setError(null);
    setForm({
      customerId: contact?.customerId ?? fixedCustomerId ?? "",
      firstName: contact?.firstName ?? "",
      lastName: contact?.lastName ?? "",
      email: contact?.email ?? "",
      phone: contact?.phone ?? "",
      jobTitle: contact?.jobTitle ?? "",
      role: contact?.role ?? "AUTHORIZED",
      isPrimary: contact?.isPrimary ?? false,
      notes: contact?.notes ?? "",
    });
  }, [open, contact, fixedCustomerId]);

  const set = <K extends keyof ContactFormState>(key: K, value: ContactFormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submitting = createState.isLoading || updateState.isLoading;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.customerId) {
      setError("Select the customer this contact belongs to.");
      return;
    }
    setError(null);
    try {
      const body = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        jobTitle: form.jobTitle.trim() || undefined,
        role: form.role,
        isPrimary: form.isPrimary,
        notes: form.notes.trim() || undefined,
      };
      if (contact) {
        await updateContact({ customerId: contact.customerId, contactId: contact.id, body }).unwrap();
      } else {
        await createContact({ customerId: form.customerId, body }).unwrap();
      }
      onSaved?.();
      onClose();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={contact ? "Edit contact" : "Add customer contact"} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? <ErrorState message={error} /> : null}
        <SectionGrid>
          {!contact && !fixedCustomerId ? (
            <div className="sm:col-span-2">
              <Field label="Customer">
                <select className={inputClass} value={form.customerId} onChange={(e) => set("customerId", e.target.value)} required>
                  <option value="">Select a customer…</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          ) : null}
          <Field label="First name">
            <input className={inputClass} value={form.firstName} onChange={(e) => set("firstName", e.target.value)} required />
          </Field>
          <Field label="Last name">
            <input className={inputClass} value={form.lastName} onChange={(e) => set("lastName", e.target.value)} required />
          </Field>
          <Field label="Email">
            <input type="email" className={inputClass} value={form.email} onChange={(e) => set("email", e.target.value)} required />
          </Field>
          <Field label="Phone">
            <input className={inputClass} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field label="Job title">
            <input className={inputClass} value={form.jobTitle} onChange={(e) => set("jobTitle", e.target.value)} />
          </Field>
          <Field label="Role">
            <select className={inputClass} value={form.role} onChange={(e) => set("role", e.target.value as ContactFormState["role"])}>
              <option value="PRIMARY">Primary</option>
              <option value="TECHNICAL">Technical</option>
              <option value="BILLING">Billing</option>
              <option value="AUTHORIZED">Authorized</option>
            </select>
          </Field>
        </SectionGrid>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={form.isPrimary} onChange={(e) => set("isPrimary", e.target.checked)} />
          Primary contact for this customer
        </label>
        <Field label="Notes">
          <textarea className={inputClass} rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className={buttonSecondary} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={buttonPrimary} disabled={submitting}>
            {submitting ? "Saving…" : contact ? "Save contact" : "Add contact"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Site form (create + edit)
// ---------------------------------------------------------------------------

interface SiteFormState {
  customerId: string;
  name: string;
  code: string;
  siteType: string;
  isDataCenter: boolean;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  timezone: string;
  status: "ACTIVE" | "INACTIVE";
  notes: string;
}

export function SiteFormModal({
  open,
  onClose,
  customers,
  fixedCustomerId,
  site,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  customers: Pick<Customer, "id" | "name">[];
  fixedCustomerId?: string;
  site?: CustomerSite;
  onSaved?: () => void;
}) {
  const [form, setForm] = useState<SiteFormState>({
    customerId: fixedCustomerId ?? "",
    name: "",
    code: "",
    siteType: "SITE",
    isDataCenter: false,
    addressLine1: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    timezone: "",
    status: "ACTIVE",
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [createSite, createState] = useCreateCustomerSiteMutation();
  const [updateSite, updateState] = useUpdateCustomerSiteMutation();

  useEffect(() => {
    if (!open) return;
    setError(null);
    setForm({
      customerId: site?.customerId ?? fixedCustomerId ?? "",
      name: site?.name ?? "",
      code: site?.code ?? "",
      siteType: site?.siteType ?? "SITE",
      isDataCenter: site?.isDataCenter ?? false,
      addressLine1: site?.addressLine1 ?? "",
      city: site?.city ?? "",
      state: site?.state ?? "",
      postalCode: site?.postalCode ?? "",
      country: site?.country ?? "",
      timezone: site?.timezone ?? "",
      status: (site?.status as "ACTIVE" | "INACTIVE") ?? "ACTIVE",
      notes: site?.notes ?? "",
    });
  }, [open, site, fixedCustomerId]);

  const set = <K extends keyof SiteFormState>(key: K, value: SiteFormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submitting = createState.isLoading || updateState.isLoading;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.customerId) {
      setError("Select the customer this site belongs to.");
      return;
    }
    setError(null);
    try {
      const body = {
        name: form.name.trim(),
        code: form.code.trim() || undefined,
        siteType: form.siteType,
        isDataCenter: form.isDataCenter,
        addressLine1: form.addressLine1.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        postalCode: form.postalCode.trim() || undefined,
        country: form.country.trim() || undefined,
        timezone: form.timezone.trim() || undefined,
        status: form.status,
        notes: form.notes.trim() || undefined,
      };
      if (site) {
        await updateSite({ customerId: site.customerId, siteId: site.id, body }).unwrap();
      } else {
        await createSite({ customerId: form.customerId, body }).unwrap();
      }
      onSaved?.();
      onClose();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={site ? `Edit ${site.name}` : "Add customer site"} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? <ErrorState message={error} /> : null}
        <SectionGrid>
          {!site && !fixedCustomerId ? (
            <div className="sm:col-span-2">
              <Field label="Customer">
                <select className={inputClass} value={form.customerId} onChange={(e) => set("customerId", e.target.value)} required>
                  <option value="">Select a customer…</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          ) : null}
          <Field label="Site name">
            <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} required />
          </Field>
          <Field label="Site code">
            <input className={inputClass} value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="e.g. NDC-IAD1" />
          </Field>
          <Field label="Site type">
            <select className={inputClass} value={form.siteType} onChange={(e) => set("siteType", e.target.value)}>
              <option value="SITE">Site</option>
              <option value="DATA_CENTER">Data center</option>
              <option value="OFFICE">Office</option>
              <option value="WAREHOUSE">Warehouse</option>
              <option value="REMOTE">Remote</option>
            </select>
          </Field>
          <Field label="Status">
            <select className={inputClass} value={form.status} onChange={(e) => set("status", e.target.value as SiteFormState["status"])}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </Field>
          <Field label="Address">
            <input className={inputClass} value={form.addressLine1} onChange={(e) => set("addressLine1", e.target.value)} />
          </Field>
          <Field label="City">
            <input className={inputClass} value={form.city} onChange={(e) => set("city", e.target.value)} />
          </Field>
          <Field label="State / region">
            <input className={inputClass} value={form.state} onChange={(e) => set("state", e.target.value)} />
          </Field>
          <Field label="Postal code">
            <input className={inputClass} value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} />
          </Field>
          <Field label="Country">
            <input className={inputClass} value={form.country} onChange={(e) => set("country", e.target.value)} />
          </Field>
          <Field label="Timezone">
            <input className={inputClass} value={form.timezone} onChange={(e) => set("timezone", e.target.value)} />
          </Field>
        </SectionGrid>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={form.isDataCenter} onChange={(e) => set("isDataCenter", e.target.checked)} />
          Data center location
        </label>
        <Field label="Notes">
          <textarea className={inputClass} rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className={buttonSecondary} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={buttonPrimary} disabled={submitting}>
            {submitting ? "Saving…" : site ? "Save site" : "Add site"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
