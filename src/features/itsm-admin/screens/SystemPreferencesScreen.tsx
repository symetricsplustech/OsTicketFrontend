import React from "react";
import { ScreenHeader } from "@shared/ui-contract/screen-header";
import { LoadingEmptyError } from "@shared/ui-contract/loading-empty-error";
import { cn } from "@shared/lib/cn";

export function SystemPreferencesScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <ScreenHeader contract={{
          screenId: "00.9",
          canonicalRoute: "/instances/:instanceId/itsm-admin/phase00/00.9",
          owningModule: "00.9 - System Preferences",
          owningSubmodule: "Module 00.9",
          pageTitle: "System Preferences",
          pageContext: "Global system configuration and preferences",
          primaryAction: {
            label: "Save Preferences",
            onClick: () => {},
          },
        }}>
          <div className="space-y-4">
            <p className="text-slate-500">
              System Preferences module handles global system configuration including
              notification settings, default behaviors, and platform preferences.
            </p>
            <LoadingEmptyError loading={false} skeleton={false} />
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-4 border rounded border-dashed hover:bg-slate-50 transition-colors">
                <h4 className="font-medium text-sm">General</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>Time zone configuration</li>
                  <li>Date format settings</li>
                  <li>Language preferences</li>
                </ul>
              </div>
              <div className="p-4 border rounded border-dashed hover:bg-slate-50 transition-colors">
                <h4 className="font-medium text-sm">Security</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>Session timeout settings</li>
                  <li>Password policy</li>
                  <li>Failed login attempts</li>
                </ul>
              </div>
            </div>
          </div>
        </ScreenHeader>
      </div>
    </div>
  );
}