import type { PublicProfile } from "./types";
import type { LoginSuccess } from "./types";
import { TENANT_READ_PERMISSIONS } from "@/navigation/organizationAdminNavigation";

export interface DemoAccount {
  key: string;
  label: string;
  description: string;
  email: string;
  password: string;
  role: string;
  roles: string[];
  permissions: string[];
  accessibleAreas: string[];
  profile: PublicProfile;
}

function profile(
  overrides: Pick<
    PublicProfile,
    "id" | "email" | "firstName" | "lastName" | "displayName" | "jobTitle" | "userType"
  >,
): PublicProfile {
  return {
    phone: null,
    avatarUrl: null,
    timezone: "UTC",
    locale: "en-US",
    status: "ACTIVE",
    mfaEnabled: false,
    emailVerifiedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastLoginAt: null,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  };
}

/**
 * Local demo sign-in accounts.
 *
 * These credentials bypass the API so both surfaces (SaaS Admin and
 * Organization Admin) can be exercised without a running backend. They are
 * matched before the real login request and never sent over the network.
 */
export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    key: "saas-admin",
    label: "SaaS Admin",
    description: "Platform control plane — tenants, staff, global configuration",
    email: "saasadmin@nexa.io",
    password: "SaasAdmin@123",
    role: "Platform Owner",
    roles: ["Platform Owner"],
    permissions: ["*"],
    accessibleAreas: ["*"],
    profile: profile({
      id: "demo-saas-admin",
      email: "saasadmin@nexa.io",
      firstName: "Sam",
      lastName: "Iyer",
      displayName: "Sam Iyer",
      jobTitle: "Platform Owner",
      userType: "PLATFORM_STAFF",
    }),
  },
  {
    key: "organization-admin",
    label: "Organization Admin",
    description: "ACME Technologies organization workspace — users, ITSM config, security",
    email: "admin@acmetech.io",
    password: "OrgAdmin@123",
    role: "Organization Admin",
    roles: ["Organization Admin", "org-admin"],
    permissions: TENANT_READ_PERMISSIONS,
    accessibleAreas: ["organization"],
    profile: profile({
      id: "demo-org-admin",
      email: "admin@acmetech.io",
      firstName: "Ava",
      lastName: "Mehta",
      displayName: "Ava Mehta",
      jobTitle: "Organization Administrator",
      userType: "TENANT_USER",
    }),
  },
];

export function findDemoAccount(email: string, password: string): DemoAccount | null {
  const normalized = email.trim().toLowerCase();
  return (
    DEMO_ACCOUNTS.find(
      (account) => account.email === normalized && account.password === password,
    ) ?? null
  );
}

/** Shapes a demo account as a successful login session. */
export function demoLoginSuccess(account: DemoAccount): LoginSuccess {
  return {
    user: account.profile,
    accessToken: `demo.${account.key}.${Date.now()}`,
    refreshToken: `demo-refresh.${account.key}`,
    expiresIn: 60 * 60 * 12,
    roles: account.roles,
    permissions: account.permissions,
    accessibleAreas: account.accessibleAreas,
    mfaRequired: false,
  };
}
