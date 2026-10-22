import { FileX } from "lucide-react";
import { Button } from "@components/common/ui";

export function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-lg text-center">
        <FileX className="mx-auto h-12 w-12 text-slate-400" />
        <h2 className="mt-4 text-center text-xl font-bold text-slate-900">
          Page Not Found
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button className="mt-6" onClick={() => (window.location.href = "/")}>
          Go Home
        </Button>
      </div>
    </div>
  );
}
