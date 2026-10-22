import type { ReactNode } from "react";
import { useCan } from "@services/authorization/permissions";

interface PermissionGateProps {
  permission: string;
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Renders children only when the current session holds the given permission.
 * A generic "insufficient permissions" note is shown otherwise (customizable
 * via `fallback`).
 */
export function PermissionGate({
  permission,
  fallback,
  children,
}: PermissionGateProps) {
  const allowed = useCan(permission);
  if (allowed) return <>{children}</>;
  if (fallback !== undefined) return <>{fallback}</>;
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-6 text-center text-sm text-amber-700">
      You do not have the <code className="font-mono">{permission}</code>{" "}
      permission to view this section.
    </div>
  );
}
