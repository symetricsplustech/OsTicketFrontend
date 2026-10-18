import { CustomerContactsView } from "./CustomerContactsView";

export function OrganizationCustomerContactsPage() {
  return (
    <CustomerContactsView
      title="Customer Contacts"
      description="Primary, technical, billing and authorized contacts across every customer in your organization."
    />
  );
}

export function OrganizationCustomerPortalAccessPage() {
  return (
    <CustomerContactsView
      portalFocus
      title="Customer Portal Access"
      description="Invite customer contacts to the portal, resend pending invitations and revoke access when it is no longer authorized."
    />
  );
}
