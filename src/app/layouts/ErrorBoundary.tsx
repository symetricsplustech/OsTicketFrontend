import React, { type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props { children?: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) { super(props); this.state = { hasError: false }; }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="rounded-xl border border-red-200 bg-white p-8 shadow-lg">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-center text-xl font-bold text-slate-900">Something went wrong</h2>
            <p className="mt-2 text-center text-sm text-slate-500">{this.state.error?.message ?? "An unexpected error occurred."}</p>
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={() => window.location.reload()} className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800">Refresh</button>
              <button onClick={() => this.setState({ hasError: false })} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Try Again</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
