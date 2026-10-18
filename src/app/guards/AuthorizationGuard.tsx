import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "@store/hooks";
import {
  selectIsAuthenticated,
  selectPermissions,
} from "@services/auth/authSlice";
import { can } from "@services/authorization/permissions";

interface AuthorizationGuardProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requireInstance?: boolean;
}

export function AuthorizationGuard({
  children,
  requiredPermissions = [],
  requireInstance = false,
}: AuthorizationGuardProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const permissions = useAppSelector(selectPermissions);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (
    requiredPermissions.length > 0 &&
    !requiredPermissions.every((p) => can(permissions, p))
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
