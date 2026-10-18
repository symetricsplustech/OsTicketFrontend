import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AUTH_PUBLIC_PATHS } from "@/navigation/authNavigation";
import { postAuthDestination } from "@app/auth/postAuthDestination";
import { useAppSelector } from "@store/hooks";
import { selectAuth } from "@services/auth/authSlice";

const PUBLIC_PATHS = new Set<string>(AUTH_PUBLIC_PATHS);

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.has(pathname);
}

export interface RequireSessionProps {
  children: ReactNode;
}

/**
 * Session gate for the product surface. Signed-out visitors are only ever shown
 * the authentication screens; a signed-in visitor asking for one of them is
 * bounced back into the first area they are entitled to (the SaaS admin
 * control plane when they hold any `admin.*` capability).
 */
export function RequireSession({ children }: RequireSessionProps) {
  const auth = useAppSelector(selectAuth);
  const location = useLocation();
  const instanceId = auth.selectedInstance?._id ?? "demo";

  if (!auth.token) {
    if (isPublicPath(location.pathname)) {
      return <>{children}</>;
    }
    return (
      <Navigate
        to="/login"
        state={{ returnTo: `${location.pathname}${location.search}` }}
        replace
      />
    );
  }

  if (isPublicPath(location.pathname)) {
    const target = postAuthDestination(auth.permissions, instanceId);
    return <Navigate to={target} replace />;
  }

  return <>{children}</>;
}