import React from "react";
import { ScreenHeader } from "@shared/ui-contract/screen-header";
import { LoadingEmptyError } from "@shared/ui-contract/loading-empty-error";
import { cn } from "@shared/lib/cn";

export function GroupsScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <ScreenHeader contract={{
          screenId: "00.5",
          canonicalRoute: "/instances/:instanceId/itsm-admin/phase00/00.5",
          owningModule: "00.5 - Groups",
          owningSubmodule: "Module 00.5",
          pageTitle: "Groups",
          pageContext: "Group management for assignment and routing",
          primaryAction: {
            label: "Create Group",
            onClick: () => {},
          },
        }}>
          <div className="space-y-4">
            <p className="text-slate-500">
              Groups module is under development. This screen will handle group management
              for assignment and routing operations.
            </p>
            <LoadingEmptyError loading={false} skeleton={false} />
          </div>
        </ScreenHeader>
      </div>
    </div>
  );
}