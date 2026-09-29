import React from "react";
import { ScreenHeader } from "@shared/ui-contract/screen-header";
import { LoadingEmptyError } from "@shared/ui-contract/loading-empty-error";
import { DataTable } from "@shared/components/DataTable";
import { cn } from "@shared/lib/cn";

interface InstanceAdminProps {
  instanceId: string;
}

export function Phase00Overview({ instanceId }: InstanceAdminProps) {
  const modules = [
    { id: "00.1", name: "Tenant / Instance Administration", screens: 9 },
    { id: "00.2", name: "Identity", screens: 8 },
    { id: "00.3", name: "Organization", screens: 10 },
    { id: "00.4", name: "Users", screens: 11 },
    { id: "00.5", name: "Groups", screens: 0 },
    { id: "00.6", name: "Assignment Groups", screens: 0 },
    { id: "00.7", name: "Roles & Permissions", screens: 0 },
    { id: "00.8", name: "Delegation", screens: 0 },
    { id: "00.9", name: "System Preferences", screens: 0 },
    { id: "00.10", name: "Audit", screens: 0 },
  ];

  return (
    <div className="space-y-6">
      <ScreenHeader contract={{
        screenId: "00.0",
        canonicalRoute: "/instances/:instanceId/itsm-admin/phase00",
        owningModule: "Core Platform & ITSM Administration",
        owningSubmodule: "Phase 00",
        pageTitle: "Phase 00: Core Platform & ITSM Administration",
        pageContext: "Core platform administration and ITSM foundation setup",
        primaryAction: {
          label: "Configure Instance",
          onClick: () => {},
        },
        loading: false,
      }}>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Phase 00: Core Platform & ITSM Administration</h2>
        <p className="text-slate-500 mb-6">
          Configuration of the core platform instance, identity management, organizational structure,
          user management, and audit configuration for the ITSM platform.
        </p>
      </ScreenHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module) => (
          <div
            key={module.id}
            className={cn(
              "rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors",
              "cursor-pointer hover:shadow-sm"
            )}
          >
            <div className="text-3xl font-bold text-slate-900">{module.id}</div>
            <h3 className="text-sm font-medium text-slate-600 mt-2">{module.name}</h3>
            <p className="text-slate-400 text-sm mt-1">{module.screens} screens</p>
          </div>
        ))}
      </div>
    </div>
  );
}