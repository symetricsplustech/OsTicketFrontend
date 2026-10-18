import { Lock } from "lucide-react";
import { Button } from "@components/common/ui";

export function Unauthorized() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-lg text-center">
        <Lock className="mx-auto h-12 w-12 text-slate-400" />
        <h2 className="mt-4 text-center text-xl font-bold text-slate-900">Access Denied</h2>
        <p className="mt-2 text-center text-sm text-slate-500">You do not have permission to access this page.</p>
        <Button variant="outline" className="mt-6" onClick={() => window.history.back()}>Go Back</Button>
      </div>
    </div>
  );
}
