import type { ReactNode } from "react";
import { cn } from "@utils/cn";
import { SaasAdminScreen } from "./SaasAdminScreen";

interface ScreenPlaceholderProps {
  screen: {
    title?: string;
    description?: string;
    phase?: number;
    module?: string;
    area?: string;
    path?: string;
  };
}

export function ScreenPlaceholder({ screen }: ScreenPlaceholderProps) {
  return (
    <SaasAdminScreen
      title={screen.title ?? "Screen"}
      description={screen.description}
      breadcrumbs={[
        { label: "SaaS Admin" },
        { label: screen.title ?? "Screen" },
      ]}
    >
      <div className="rounded-xl border border-slate-200 bg-white p-8">
        <p className="text-sm text-slate-500">
          {screen.title} - implementation pending
        </p>
        <div className="mt-4 text-xs text-slate-400">
          <p>Path: {screen.path ?? "unknown"}</p>
        </div>
      </div>
    </SaasAdminScreen>
  );
}