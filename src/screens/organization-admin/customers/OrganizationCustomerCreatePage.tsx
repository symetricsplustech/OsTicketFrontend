import { useNavigate } from "react-router-dom";
import { CustomerFormModal } from "./customerForms";

/** Create-customer destination: opens the shared customer form. */
export function OrganizationCustomerCreatePage() {
  const navigate = useNavigate();
  return (
    <div>
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Customers & Customer Contacts</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">Create Customer</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-500">
          Register a new customer for your organization. Contacts, sites and service details can be added from the
          customer record afterwards.
        </p>
      </header>
      <CustomerFormModal
        open
        onClose={() => navigate("/organization/customers/customer-directory")}
        onSaved={(customer) => navigate(`/organization/customers/${customer.id}`)}
      />
    </div>
  );
}
