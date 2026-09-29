import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAppSelector } from "@shared/store/hooks";
import { selectIsAuthenticated, selectAuth } from "@shared/auth/authSlice";

interface ProtectedRouteProps {
  children: ReactNode;
  /** Require an instance to be selected (instance-scoped routes). */
  requireInstance?: boolean;
}

/**
 * Requires a valid session (token in the auth slice). Redirects to /login
 * when signed out. When `requireInstance` is set, the user is sent to the
 * platform home to pick an instance first.
 */
export function ProtectedRoute({ children, requireInstance = false }: ProtectedRouteProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const auth = useAppSelector(selectAuth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (requireInstance && !auth.selectedInstance) {
    return <Navigate to="/platform" replace />;
  }
  return <>{children}</>;
}
