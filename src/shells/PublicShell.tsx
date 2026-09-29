import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";

/**
 * Public shell — the unauthenticated landing area (sign in / register /
 * confirm / reset). Kept intentionally minimal; navigation to auth routes is
 * handled by the router.
 */
export interface PublicShellProps {
  children?: ReactNode;
}

export function PublicShell({ children }: PublicShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <span className="text-lg font-semibold text-brand-700">osTicket ITSM</span>
          <span className="text-xs text-slate-400">Public Portal</span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children ?? <Outlet />}</main>
    </div>
  );
}