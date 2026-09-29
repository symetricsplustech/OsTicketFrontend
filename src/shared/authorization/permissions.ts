import { useAppSelector } from "@shared/store/hooks";
import { selectPermissions } from "@shared/auth/authSlice";

/**
 * Permission-aware hook. Wildcard `*` (SaaS owner) grants everything.
 */
export function useCan(permission: string): boolean {
  const permissions = useAppSelector(selectPermissions);
  return permissions.includes("*") || permissions.includes(permission);
}

export function can(permissions: string[], permission: string): boolean {
  return permissions.includes("*") || permissions.includes(permission);
}

export const PERMISSIONS = {
  tenantUserRead: "tenant.user.read",
  tenantUserUpdate: "tenant.user.update",
  tenantPermissionRead: "tenant.permission.read",
  tenantPermissionGrant: "tenant.permission.grant",
  tenantPermissionRevoke: "tenant.permission.revoke",
  auditRead: "itsm.core.audit_read",
} as const;