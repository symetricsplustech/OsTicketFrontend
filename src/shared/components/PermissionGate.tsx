import { useAppSelector } from "@shared/store/hooks";
import { selectPermissions } from "@shared/auth/authSlice";
import { can } from "@shared/authorization/permissions";
import { type ReactNode } from "react";

interface PermissionGateProps {
  permissions: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({ permissions, children, fallback = null }: PermissionGateProps) {
  const perms = useAppSelector(selectPermissions);
  const permArray = Array.isArray(permissions) ? permissions : [permissions];
  const hasPermission = permArray.every((p) => can(perms, p));
  return hasPermission ? <>{children}</> : <>{fallback}</>;
}
