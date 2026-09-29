import * as React from "react";
import type { ReactNode } from "react";
import { Tabs } from "@shared/components/Tabs";
import { Card } from "@shared/components/ui";
import { PageHeader } from "@shared/components/PageHeader";
import { ErrorState } from "@shared/components/ui";
import { PageLoader } from "@shared/components/ui";
import { StatusBadge } from "@shared/components/Badge";

export interface AccessTabDescriptor {
  id: string;
  label: string;
  icon?: ReactNode;
  render: () => ReactNode;
}

export interface UserAccessWorkspaceProps {
  title: string;
  email?: string;
  role?: string | null;
  accessStatus?: string;
  breadcrumbs?: ReactNode;
  actions?: ReactNode;
  loading: boolean;
  error?: string | null;
  tabs: AccessTabDescriptor[];
}

/**
 * The User Access Workspace shell. Owns the tab chrome, the user header and
 * the shared loading/error states; each tab's content is supplied by the
 * feature layer through the `tabs` descriptor.
 */
export function UserAccessWorkspace({
  title,
  email,
  role,
  accessStatus,
  breadcrumbs,
  actions,
  loading,
  error,
  tabs,
}: UserAccessWorkspaceProps) {
  if (error) {
    return (
      <div>
        <PageHeader title={title} breadcrumbs={breadcrumbs} />
        <ErrorState message={error} />
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <PageHeader title={title} breadcrumbs={breadcrumbs} />
        <Card>
          <PageLoader label="Loading user workspace…" />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={title} breadcrumbs={breadcrumbs} actions={actions} />
      <Card className="mb-4 px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <span className="text-slate-600">{email}</span>
          {role ? (
            <span className="text-slate-600">
              Member role: <span className="font-medium text-slate-800">{role}</span>
            </span>
          ) : null}
          {accessStatus ? <StatusBadge status={accessStatus} /> : null}
        </div>
      </Card>
      <UserAccessTabs tabs={tabs} />
    </div>
  );
}

function UserAccessTabs({ tabs }: { tabs: AccessTabDescriptor[] }) {
  const [active, setActive] = React.useState(tabs[0]?.id ?? "");
  const activeTab = tabs.find((tab) => tab.id === active) ?? tabs[0];

  return (
    <div>
      <Tabs
        tabs={tabs.map((tab) => ({ id: tab.id, label: tab.label, icon: tab.icon }))}
        active={activeTab?.id ?? ""}
        onChange={setActive}
      />
      <div className="mt-4">{activeTab?.render()}</div>
    </div>
  );
}