import type { ReactNode } from "react";
import { useState } from "react";
import { Input } from "@shared/components/ui";
import { Select } from "@shared/components/ui";
import { Button } from "@shared/components/ui";
import { Tabs } from "@shared/components/Tabs";
import { Card } from "@shared/components/ui";
import { CardHeader } from "@shared/components/ui";
import { CardBody } from "@shared/components/ui";
import { useAppSelector } from "@shared/store/hooks";
import { selectPermissions } from "@shared/auth/authSlice";
import { PERMISSIONS } from "@shared/authorization/permissions";
import { cn } from "@shared/lib/cn";

interface PermissionItem {
  id: string;
  name: string;
  category?: string;
  description?: string;
}

interface RoleEditorRole {
  id: string;
  name: string;
  description?: string;
  isBuiltIn?: boolean;
  permissions: string[];
  scopes: string[];
  effectiveFrom?: string;
  effectiveUntil?: string;
  isActive: boolean;
  inheritsFrom?: string;
}

interface RoleEditorTab {
  id: string;
  label: string;
  icon?: ReactNode;
}

export function RoleEditorPage({
  role,
  onRoleSave,
  onRoleCancel,
}: {
  role: RoleEditorRole;
  onRoleSave: (role: RoleEditorRole) => void;
  onRoleCancel: () => void;
}) {
  const tabs: RoleEditorTab[] = [
    { id: "overview", label: "Overview" },
    { id: "permissions", label: "Permissions" },
    { id: "scopes", label: "Scopes" },
    { id: "recordConditions", label: "Record Conditions" },
    { id: "fieldPolicies", label: "Field Policies" },
    { id: "inheritance", label: "Inheritance" },
    { id: "members", label: "Members" },
    { id: "groups", label: "Groups" },
    { id: "delegation", label: "Delegation" },
    { id: "audit", label: "Audit" },
  ];

  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleSave = () => {
    onRoleSave(role);
  };

  const handleCancel = () => {
    onRoleCancel();
  };

  return (
    <Card>
      <CardHeader
        title={`Role: ${role.name}`}
        description={role.description || ""}
        actions={
          <>
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save
            </Button>
          </>
        }
      >
        <Tabs
          tabs={tabs.map((tab) => ({
            id: tab.id,
            label: tab.label,
            icon: tab.icon,
          }))}
          active={activeTab}
          onChange={handleTabChange}
        >
          <CardBody>
            {activeTab === "overview" && (
              <div className="space-y-4">
                <Input
                  placeholder="Role name"
                  defaultValue={role.name}
                  className="w-full mb-3"
                />
                <Input
                  placeholder="Description"
                  defaultValue={role.description || ""}
                  className="w-full mb-3"
                />
                <Select
                  defaultValue={role.effectiveFrom || ""}
                  className="w-full mb-3"
                >
                  <option value="">Effective from</option>
                  <option value="immediate">Immediate</option>
                  <option value="pending">Pending</option>
                </Select>
                <Select
                  defaultValue={role.effectiveUntil || ""}
                  className="w-full mb-3"
                >
                  <option value="">Effective until</option>
                  <option value="never">Never</option>
                </Select>
                <Input
                  defaultValue={role.isActive ? "active" : "inactive"}
                  disabled
                  className="w-full mb-3 text-slate-400"
                >
                  Status: {role.isActive ? "Active" : "Inactive"}
                </Input>
              </div>
            )}

            {activeTab === "permissions" && (
              <div className="space-y-4">
                <p className="text-slate-500 text-sm">
                  Select permissions for this role:
                </p>
                <Select
                  multiple
                  className="w-full h-64"
                >
                  {["itsm.incident.read", "itsm.incident.create", "itsm.incident.update", "itsm.incident.resolve", "itsm.incident.close", "itsm.change.read", "itsm.change.approve", "itsm.change.implement", "itsm.problem.read", "itsm.sla.read", "itsm.admin.read"].map((perm) => (
                    <option key={perm} value={perm}>
                      {perm}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {activeTab === "scopes" && (
              <div className="space-y-4">
                <p className="text-slate-500 text-sm">
                  Select scopes for this role:
                </p>
                <Select
                  multiple
                  className="w-full h-48"
                >
                  <option value="TENANT">TENANT</option>
                  <option value="ORGANIZATION">ORGANIZATION</option>
                  <option value="BUSINESS_UNIT">BUSINESS_UNIT</option>
                  <option value="DEPARTMENT">DEPARTMENT</option>
                  <option value="GROUP">GROUP</option>
                  <option value="ASSIGNMENT_GROUP">ASSIGNMENT_GROUP</option>
                  <option value="OWN">OWN</option>
                  <option value="ASSIGNED_TO_ME">ASSIGNED_TO_ME</option>
                </Select>
              </div>
            )}

            {activeTab === "recordConditions" && (
              <div className="space-y-4">
                <p className="text-slate-500 text-sm">
                  Record condition rules
                </p>
                <Input
                  placeholder="When field operator value…"
                  className="w-full mb-3 rounded-md border border-slate-300 p-2 text-sm"
                />
                <Select multiple className="w-full h-48">
                  <option value="created_by_me">CREATED_BY_ME</option>
                  <option value="requested_by_me">REQUESTED_BY_ME</option>
                  <option value="assigned_to_me">ASSIGNED_TO_ME</option>
                </Select>
              </div>
            )}

            {activeTab === "fieldPolicies" && (
              <div className="space-y-4">
                <p className="text-slate-500 text-sm">
                  Field policies
                </p>
                <Input
                  placeholder="Visibility condition (e.g. role: admin)"
                  className="w-full mb-3 rounded-md border border-slate-300 p-2 text-sm"
                />
                <Input
                  placeholder="Mask policy (e.g. mask ssn: '***-**-****')"
                  className="w-full mb-3 rounded-md border border-slate-300 p-2 text-sm"
                />
              </div>
            )}

            {activeTab === "inheritance" && (
              <div className="space-y-4">
                <p className="text-slate-500 text-sm">
                  Role inheritance
                </p>
                <Select
                  defaultValue={role.inheritsFrom || ""}
                  className="w-full mb-3"
                >
                  <option value="">Inherits from</option>
                  <option value="builtin:service-desk-l1">Service Desk L1</option>
                  <option value="builtin:service-desk-l2">Service Desk L2</option>
                  <option value="builtin:change-approver">Change Approver</option>
                </Select>
                <Input
                  placeholder="Custom inheritance path"
                  className="w-full mb-3 rounded-md border border-slate-300 p-2 text-sm"
                />
              </div>
            )}

            {activeTab === "members" && (
              <div className="space-y-4">
                <p className="text-slate-500 text-sm">
                  Role members
                </p>
                <Select multiple className="w-full h-48">
                  <option value="user-1">User 1</option>
                  <option value="user-2">User 2</option>
                  <option value="user-3">User 3</option>
                </Select>
              </div>
            )}

            {activeTab === "groups" && (
              <div className="space-y-4">
                <p className="text-slate-500 text-sm">
                  Group assignments
                </p>
                <Select multiple className="w-full h-48">
                  <option value="group-1">Assignment Group 1</option>
                  <option value="group-2">Assignment Group 2</option>
                  <option value="group-3">Assignment Group 3</option>
                </Select>
              </div>
            )}

            {activeTab === "delegation" && (
              <div className="space-y-4">
                <p className="text-slate-500 text-sm">
                  Delegation settings
                </p>
                <Input
                  placeholder="Starts at (date)"
                  className="w-full mb-3 rounded-md border border-slate-300 p-2 text-sm"
                />
                <Input
                  placeholder="Expires at (date)"
                  className="w-full mb-3 rounded-md border border-slate-300 p-2 text-sm"
                />
                <Select
                  defaultValue="active"
                  className="w-full mb-3"
                >
                  <option value="active">Active</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="revoked">Revoked</option>
                </Select>
              </div>
            )}

            {activeTab === "audit" && (
              <div className="space-y-4">
                <p className="text-slate-500 text-sm">
                  Audit settings
                </p>
                <Select
                  defaultValue="enabled"
                  className="w-full mb-3"
                >
                  <option value="enabled">Audit enabled</option>
                  <option value="disabled">Audit disabled</option>
                </Select>
                <p className="text-slate-400 text-xs">
                  Prevent saas.* assignment by Instance role admins: {" "}
                  <Input
                    disabled
                    defaultValue="blocked"
                    className="w-full rounded-md border border-slate-300 p-2 text-sm text-slate-400"
                  />
                </p>
              </div>
            )}
          </CardBody>
        </Tabs>
      </CardHeader>
    </Card>
  );
}
