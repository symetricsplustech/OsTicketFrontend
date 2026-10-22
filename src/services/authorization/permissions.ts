import { useAppSelector } from "@store/hooks";
import { selectPermissions } from "@services/auth/authSlice";

/**
 * Permission-aware hook. Wildcard `*` (SaaS owner) grants everything.
 */
export function useCan(permission: string): boolean {
  const permissions = useAppSelector(selectPermissions);
  return matchesGrant(permissions, permission);
}

export function can(permissions: string[], permission: string): boolean {
  return matchesGrant(permissions, permission);
}

/**
 * Mirrors the backend grant matcher (`authorization.service.js` `matches`):
 * a grant satisfies a permission when it is `*`, when it is the exact key, or
 * when it is a namespace wildcard such as `itsm.incident.*`.
 */
export function matchesGrant(
  grants: readonly string[],
  permission: string,
): boolean {
  for (const grant of grants) {
    if (grant === "*" || grant === permission) return true;
    if (grant.endsWith(".*") && permission.startsWith(grant.slice(0, -1)))
      return true;
  }
  return false;
}

/**
 * Any-of matching for navigation and gating. A requirement may itself be a
 * namespace wildcard (`itsm.sla.*`), which is satisfied by any grant inside
 * that namespace — the mirror image of a wildcard grant held by the session.
 *
 * An empty requirement list is an explicit "always visible" opt-in (used by
 * e.g. the org-admin "My Account" section, which every organization member
 * must see). New navigation items should always declare real permission
 * requirements unless visibility for every session in the surface is intended.
 */
export function canAny(
  permissions: readonly string[],
  required: readonly string[],
): boolean {
  if (required.length === 0) return true;
  return required.some((requirement) => {
    if (matchesGrant(permissions, requirement)) return true;
    if (!requirement.endsWith(".*")) return false;
    const namespace = requirement.slice(0, -1);
    return permissions.some(
      (grant) =>
        grant === "*" || grant === requirement || grant.startsWith(namespace),
    );
  });
}

export const PERMISSIONS = {
  tenantUserRead: "tenant.user.read",
  tenantUserUpdate: "tenant.user.update",
  tenantPermissionRead: "tenant.permission.read",
  tenantPermissionGrant: "tenant.permission.grant",
  tenantPermissionRevoke: "tenant.permission.revoke",
  auditRead: "itsm.core.audit_read",
} as const;

export * from "./roles/index.ts";
