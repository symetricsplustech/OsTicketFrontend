import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { cn } from "@utils/cn";

/**
 * Minimal chrome for the remaining unauthenticated screens (MFA challenge,
 * password recovery, email confirmation). Sign-in and registration use
 * `AuthLayout`, which carries the full product presentation.
 */
export interface PublicShellProps {
  children?: ReactNode;
}

export function PublicShell({ children }: PublicShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <span className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white">
              T
            </span>
            <span className="text-sm font-semibold text-slate-900">
              TicketX
            </span>
          </span>
          <span className="text-xs text-slate-400">Secure access</span>
        </div>
      </header>
      <main className={cn("mx-auto w-full max-w-md flex-1 px-6 py-12")}>
        {children ?? <Outlet />}
      </main>
    </div>
  );
}
