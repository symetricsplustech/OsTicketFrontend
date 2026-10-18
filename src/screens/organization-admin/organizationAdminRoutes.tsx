import { Navigate, type RouteObject } from "react-router-dom";
import {
  ORGANIZATION_ADMIN_BASE_PATH,
  ORGANIZATION_ADMIN_HOME_PATH,
  ORGANIZATION_ADMIN_NAVIGATION,
} from "@/navigation/organizationAdminNavigation.tsx";
import { OrganizationAdminSurface } from "./OrganizationAdminSurface";
import { OrganizationAdminPage } from "./pages/OrganizationAdminPage";
import { RecordDetailPage } from "./pages/RecordDetailPage";
import { OrganizationCustomersDirectoryPage } from "./customers/OrganizationCustomersDirectoryPage";
import { OrganizationCustomerCreatePage } from "./customers/OrganizationCustomerCreatePage";
import { OrganizationCustomerDetailPage } from "./customers/OrganizationCustomerDetailPage";
import {
  OrganizationCustomerContactsPage,
  OrganizationCustomerPortalAccessPage,
} from "./customers/OrganizationCustomerContactsPage";
import { OrganizationCustomerSitesPage } from "./customers/OrganizationCustomerSitesPage";
import { OrganizationCustomerTicketsPage } from "./customers/OrganizationCustomerTicketsPage";

function relative(path: string): string {
  return path.startsWith(`${ORGANIZATION_ADMIN_BASE_PATH}/`)
    ? path.slice(ORGANIZATION_ADMIN_BASE_PATH.length + 1)
    : path.replace(/^\//, "");
}

interface LeafRoute {
  /** Relative path under /organization (also the routeKey for the page model). */
  path: string;
  sectionKey: string;
  section: string;
  title: string;
  description: string;
}

const leafRoutes: LeafRoute[] = [];
const groupRedirects: { path: string; to: string }[] = [];

for (const section of ORGANIZATION_ADMIN_NAVIGATION) {
  if (section.key === "customers") continue;
  for (const item of section.items) {
    if (item.children && item.children.length > 0) {
      const first = item.children[0];
      groupRedirects.push({ path: relative(`${ORGANIZATION_ADMIN_BASE_PATH}/${section.key}/${item.key}`), to: first.path });
      for (const child of item.children) {
        leafRoutes.push({
          path: relative(child.path),
          sectionKey: section.key,
          section: section.label,
          title: child.label,
          description: `${child.label} — ${section.label} for your organization.`,
        });
      }
      continue;
    }
    if (item.path) {
      leafRoutes.push({
        path: relative(item.path),
        sectionKey: section.key,
        section: section.label,
        title: item.label,
        description: `${item.label} — ${section.label} for your organization.`,
      });
    }
  }
}

/** Routable screens for the Organization Admin (Tenant Admin) workspace. */
export const ORGANIZATION_ADMIN_ROUTES: RouteObject[] = [
  {
    path: ORGANIZATION_ADMIN_BASE_PATH,
    element: <OrganizationAdminSurface />,
    children: [
      { index: true, element: <Navigate to={ORGANIZATION_ADMIN_HOME_PATH} replace /> },
      ...groupRedirects.map((redirect) => ({
        path: redirect.path,
        element: <Navigate to={redirect.to} replace />,
      })),
      // Customers & Customer Contacts — real, API-connected workspace.
      { path: "customers/customer-directory", element: <OrganizationCustomersDirectoryPage /> },
      { path: "customers/create-customer", element: <OrganizationCustomerCreatePage /> },
      { path: "customers/customer-contacts", element: <OrganizationCustomerContactsPage /> },
      { path: "customers/customer-portal-access", element: <OrganizationCustomerPortalAccessPage /> },
      { path: "customers/service-locations", element: <OrganizationCustomerSitesPage /> },
      { path: "customers/customer-ticket-history", element: <OrganizationCustomerTicketsPage /> },
      { path: "customers/:customerId", element: <OrganizationCustomerDetailPage /> },
      // Every other catalogued destination renders its full module page.
      ...leafRoutes.map((leaf) => ({
        path: leaf.path,
        element: (
          <OrganizationAdminPage
            sectionKey={leaf.sectionKey}
            section={leaf.section}
            title={leaf.title}
            description={leaf.description}
            routeKey={leaf.path}
          />
        ),
      })),
      // Nested record pages — list rows open into a full record workspace.
      ...leafRoutes.map((leaf) => ({
        path: `${leaf.path}/:recordId`,
        element: (
          <RecordDetailPage
            section={leaf.section}
            collectionTitle={leaf.title}
            routeKey={leaf.path}
          />
        ),
      })),
    ],
  },
];
