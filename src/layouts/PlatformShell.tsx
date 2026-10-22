import type { ReactNode } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { logout } from "@services/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { selectAuth } from "@services/auth/authSlice";
import { Button } from "@components/common/Button";

/**
 * Platform shell — the neutral pre-instance landing where a signed-in user
 * selects an instance or manages profile. Contains no business/tenant chrome.
 */
export interface PlatformShellProps {
  children?: ReactNode;
}

export function PlatformShell({ children }: PlatformShellProps) {
  const auth = useAppSelector(selectAuth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSignOut = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <span className="text-lg font-semibold text-brand-700">
            osTicket ITSM
          </span>
          <div className="flex items-center gap-3">
            {auth.user ? (
              <span className="text-sm text-slate-600">
                {auth.user.name} <span className="text-slate-400">·</span>{" "}
                {auth.user.email}
              </span>
            ) : null}
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        {children ?? <Outlet />}
      </main>
    </div>
  );
}
