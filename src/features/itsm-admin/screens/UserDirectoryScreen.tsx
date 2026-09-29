import React from "react";
import { ScreenHeader } from "@shared/ui-contract/screen-header";
import { LoadingEmptyError } from "@shared/ui-contract/loading-empty-error";
import { DataTable } from "@shared/components/DataTable";
import { cn } from "@shared/lib/cn";
import { useParams } from "react-router-dom";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "suspended";
  lastLogin: string;
  created: string;
  organizationId: string;
}

export function UserDirectoryScreen() {
  const { instanceId } = useParams<{ instanceId: string }>();
  
  const [records, setRecords] = React.useState<UserRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRecords([
          { id: "user-1", name: "John Doe", email: "john.doe@example.com", role: "admin", status: "active", lastLogin: "2024-09-20", created: "2024-01-15", organizationId: "org-1" },
          { id: "user-2", name: "Jane Smith", email: "jane.smith@example.com", role: "agent", status: "active", lastLogin: "2024-09-18", created: "2024-02-20", organizationId: "org-1" },
          { id: "user-3", name: "Bob Wilson", email: "bob.wilson@example.com", role: "viewer", status: "suspended", lastLogin: "2024-08-30", created: "2024-03-10", organizationId: "org-2" },
        ]);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [instanceId]);
  
  return (
    <div className="space-y-6">
      <ScreenHeader contract={{
        screenId: "00.4.1",
        canonicalRoute: "/instances/:instanceId/itsm-admin/phase00/00.4.1",
        owningModule: "00.4 - Users",
        owningSubmodule: "Module 00.4",
        parentRoute: "/instances/:instanceId/itsm-admin/phase00",
        breadcrumb: "Phase 00 > 00.4 Users > User Directory",
        persona: ["User Administrator", "Platform Administrator"],
        pageTitle: "User Directory",
        pageContext: "Search and manage all users in the instance",
        primaryAction: {
          label: "Create User",
          onClick: () => {},
        },
        loading,
        skeleton: loading,
      }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-slate-900">User Directory</h1>
          <button
            className="px-4 py-2 font-medium text-brand-600 bg-brand-50 rounded hover:bg-brand-100 transition-colors"
            onClick={() => {}}
          >
            Create User
          </button>
        </div>
        
        <LoadingEmptyError
          loading={loading}
          skeleton={loading}
          empty={!loading && records.length === 0}
          emptyTitle="No Users Found"
          emptyDescription="No users have been added yet. Click 'Create User' to add a new user to the instance."
        />
        
        {!loading && records.length > 0 && (
          <DataTable<UserRecord>
            columns={[
              { key: "id", header: "ID", render: (row) => row.id },
              { key: "name", header: "Name", render: (row) => row.name },
              { key: "email", header: "Email", render: (row) => row.email },
              { key: "role", header: "Role", render: (row) => row.role },
              { key: "status", header: "Status", render: (row) => row.status },
              { key: "lastLogin", header: "Last Login", render: (row) => row.lastLogin },
              { key: "created", header: "Created", render: (row) => row.created },
            ]}
            rows={records}
            rowKey={(row) => row.id}
          />
        )}
      </ScreenHeader>
    </div>
  );
}