import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@utils/cn";

const HIGHLIGHTS = [
  {
    title: "One workspace for every record",
    body: "Service desk, incidents, problems, changes, requests, knowledge and CMDB in a single governed platform.",
  },
  {
    title: "You only see what you own",
    body: "Navigation, actions and data are scoped to the roles, groups and delegations assigned to you.",
  },
  {
    title: "Audit-ready by default",
    body: "Every lifecycle action is recorded against the actor, the record and the time it happened.",
  },
];

export interface AuthLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  /** Links rendered under the form. */
  footer?: ReactNode;
  className?: string;
}

/** Split-screen shell for the unauthenticated screens. */
export function AuthLayout({
  title,
  description,
  children,
  footer,
  className,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-slate-900 px-10 py-12 lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-600/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-brand-500/10 blur-3xl"
        />
        <Link to="/" className="relative flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-base font-bold text-white">
            T
          </span>
          <span className="text-left">
            <strong className="block text-sm font-semibold text-white">
              TicketX
            </strong>
            <span className="block text-xs text-slate-400">
              ITSM &amp; service management
            </span>
          </span>
        </Link>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-bold leading-tight text-white">
            Run every service operation from one place.
          </h2>
          <ul className="mt-8 space-y-5">
            {HIGHLIGHTS.map((item) => (
              <li key={item.title} className="flex gap-3">
                <span
                  aria-hidden
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400"
                />
                <span>
                  <strong className="block text-sm font-semibold text-slate-100">
                    {item.title}
                  </strong>
                  <span className="mt-0.5 block text-sm text-slate-400">
                    {item.body}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-slate-500">
          &copy; {new Date().getFullYear()} TicketX. All rights reserved.
        </p>
      </aside>

      <main className="flex w-full flex-col justify-center px-5 py-12 sm:px-8 lg:w-[54%]">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white">
          T
        </span>
        <span className="text-sm font-semibold text-slate-900">
          TicketX
        </span>
          </Link>

          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {description ? (
            <p className="mt-2 text-sm text-slate-500">{description}</p>
          ) : null}

          <div className={cn("mt-8", className)}>{children}</div>

          {footer ? (
            <div className="mt-6 text-sm text-slate-500">{footer}</div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
