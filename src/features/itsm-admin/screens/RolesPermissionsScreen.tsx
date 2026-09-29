import React from "react";
import { ScreenHeader } from "@shared/ui-contract/screen-header";
import { LoadingEmptyError } from "@shared/ui-contract/loading-empty-error";
import { cn } from "@shared/lib/cn";

export function RolesPermissionsScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <ScreenHeader contract={{
          screenId: "00.7",
          canonicalRoute: "/instances/:instanceId/itsm-admin/phase00/00.7",
          owningModule: "00.7 - Roles & Permissions",
          owningSubmodule: "Module 00.7",
          pageTitle: "Roles & Permissions",
          pageContext: "Role-based access control and permission management",
          primaryAction: {
            label: "Create Role",
            onClick: () => {},
          },
        }}>
          <div className="space-y-4">
            <p className="text-slate-500">
              Roles & Permissions module handles role-based access control. Define roles,
              assign permissions, and manage access control for the ITSM platform.
            </p>
            <LoadingEmptyError loading={false} skeleton={false} />
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-4 border rounded hover:bg-slate-50 transition-colors">
                <h4 className="font-medium">Roles</h4>
                <p className="text-sm text-slate-500 mt-1">Administrator, Agent, Viewer roles</p>
              </div>
              <div className="p-4 border rounded hover:bg-slate-50 transition-colors">
                <h4 className="font-medium">Permissions</h4>
                <p className="text-sm text-slate-500 mt-1">Create, read, update, delete actions</p>
              </div>
            </div>
          </div>
        </ScreenHeader>
      </div>
    </div>
  );
}