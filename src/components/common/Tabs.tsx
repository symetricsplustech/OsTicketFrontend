import type { ReactNode } from "react";
import { cn } from "@utils/cn";

interface Tab {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  children?: ReactNode;
}

export function Tabs({ tabs, active, onChange, children }: TabsProps) {
  return (
    <div>
      <div className="flex flex-wrap gap-1 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-t-md px-3 py-2 text-sm font-medium transition-colors",
              active === tab.id
                ? "border-b-2 border-brand-600 text-brand-700"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      {children}
    </div>
  );
}
