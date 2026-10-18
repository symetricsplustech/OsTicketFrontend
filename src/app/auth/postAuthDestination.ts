import { firstAccessibleSaasAdminPath } from "@/navigation/saasAdminNavigation";
import { firstAccessibleOrganizationAdminPath } from "@/navigation/organizationAdminNavigation";

/**
 * Destination after a successful sign-in / MFA step.
 *
 * Prefers the first SaaS admin area the session may actually open, then the
 * organization workspace (Tenant Admin), and finally the generic tenant
 * workspace. Mirrors `RequireSession` so the login redirect and the route guard
 * can never disagree.
 */
export function postAuthDestination(
  permissions: readonly string[],
  instanceId?: string | null,
): string {
  return (
    firstAccessibleSaasAdminPath(permissions) ??
    firstAccessibleOrganizationAdminPath(permissions) ??
    `/instances/${instanceId ?? "demo"}/work`
  );
}
