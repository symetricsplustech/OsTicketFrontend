import React from "react";
import { ScreenHeader } from "@shared/ui-contract/screen-header";
import { LoadingEmptyError } from "@shared/ui-contract/loading-empty-error";
import { cn } from "@shared/lib/cn";

export function AssignmentGroupsScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <ScreenHeader contract={{
          screenId: "00.6",
          canonicalRoute: "/instances/:instanceId/itsm-admin/phase00/00.6",
          owningModule: "00.6 - Assignment Groups",
          owningSubmodule: "Module 00.6",
          pageTitle: "Assignment Groups",
          pageContext: "Assignment group configuration for incident and change routing",
          primaryAction: {
            label: "Create Assignment Group",
            onClick: () => {},
          },
        }}>
          <div className="space-y-4">
            <p className="text-slate-500">
              Assignment Groups module is under development. This screen will handle
              assignment group configuration for incident and change routing.
            </p>
            <LoadingEmptyError loading={false} skeleton={false} />
          </div>
        </ScreenHeader>
      </div>
    </div>
  );
}