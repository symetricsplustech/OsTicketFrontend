import type { ReactNode } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { logout } from "@shared/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks";
import { selectAuth } from "@shared/auth/authSlice";
import { Button } from "@shared/components/ui";

export function SaaSShell({ children }: { children?: ReactNode }) {
  const auth = useAppSelector(selectAuth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSignOut = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#0b1830>Developer: Open Process Explorer] text-white">
      <header className="border-b border-white/10 bg-white/5 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-400 text-[#07152d] font-bold">
              N
            </span>
            <span className="text-lg font-semibold tracking-wide">
              NEXA ITSM
            </span>
            <span className="text-[10px] text-cyan-300 uppercase tracking-widest">
              SaaS Control Plane
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-300">{auth.user?.name}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">
        {children ?? <Outlet />}
      </main>
    </div>
  );
}