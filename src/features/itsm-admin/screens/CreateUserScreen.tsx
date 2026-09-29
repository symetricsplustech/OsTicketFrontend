import React from "react";
import { ScreenHeader } from "@shared/ui-contract/screen-header";
import { LoadingEmptyError } from "@shared/ui-contract/loading-empty-error";
import { FieldWithRules } from "@shared/ui-contract/field-with-rules";
import { cn } from "@shared/lib/cn";

export function CreateUserScreen() {
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    role: "agent",
    status: "active",
    organization: "",
  });
  
  const handleSubmit = () => {
    // Handle user creation
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
        <ScreenHeader contract={{
          screenId: "00.4.2",
          canonicalRoute: "/instances/:instanceId/itsm-admin/phase00/00.4.2",
          owningModule: "00.4 - Users",
          owningSubmodule: "Module 00.4",
          parentRoute: "/instances/:instanceId/itsm-admin/phase00/00.4.1",
          breadcrumb: "Phase 00 > 00.4 Users > User Directory > Create User",
          persona: ["User Administrator"],
          pageTitle: "Create User",
          pageContext: "Create a new user in the instance",
          primaryAction: {
            label: "Create User",
            onClick: handleSubmit,
          },
        }}>
          <form className="space-y-6" onSubmit={e => {
            e.preventDefault();
            handleSubmit();
          }}>
            <FieldWithRules
              name="name"
              label="Full Name"
              type="text"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              required
            />
            <FieldWithRules
              name="email"
              label="Email Address"
              type="text"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              required
              placeholder="user@example.com"
            />
            <FieldWithRules
              name="role"
              label="Role"
              type="select"
              value={form.role}
              onChange={(v) => setForm({ ...form, role: v })}
              required
            >
              <option value="admin">Administrator</option>
              <option value="agent">Agent</option>
              <option value="viewer">Viewer</option>
            </FieldWithRules>
            <FieldWithRules
              name="status"
              label="Status"
              type="select"
              value={form.status}
              onChange={(v) => setForm({ ...form, status: v })}
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </FieldWithRules>
            <FieldWithRules
              name="organization"
              label="Organization"
              type="text"
              value={form.organization}
              onChange={(v) => setForm({ ...form, organization: v })}
            />
            <button
              type="submit"
              className={cn(
                "w-full px-4 py-2 font-medium text-white bg-brand-600 rounded hover:bg-brand-500 transition-colors",
                "mt-4"
              )}
            >
              Create User
            </button>
          </form>
        </ScreenHeader>
      </div>
    </div>
  );
}