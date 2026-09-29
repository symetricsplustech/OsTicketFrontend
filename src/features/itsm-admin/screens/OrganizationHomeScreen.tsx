import React from "react";
import { ScreenHeader } from "@shared/ui-contract/screen-header";
import { LoadingEmptyError } from "@shared/ui-contract/loading-empty-error";
import { DataTable } from "@shared/components/DataTable";
import { cn } from "@shared/lib/cn";
import { useParams } from "react-router-dom";

interface CompanyRecord {
  id: string;
  name: string;
  type: "company" | "business_unit" | "department";
  status: "active" | "inactive";
  parentId?: string;
  created: string;
}

export function OrganizationHomeScreen() {
  const { instanceId } = useParams<{ instanceId: string }>();
  
  const [records, setRecords] = React.useState<CompanyRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRecords([
          { id: "org-1", name: "Global Corp", type: "company", status: "active", parentId: undefined, created: "2023-01-15" },
          { id: "org-2", name: "North America", type: "business_unit", status: "active", parentId: "org-1", created: "2023-03-20" },
          { id: "org-3", name: "Engineering", type: "department", status: "active", parentId: "org-2", created: "2023-06-10" },
        ]);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    
    fetchOrganizations();
  }, [instanceId]);
  
  return (
    <div className="space-y-6">
      <ScreenHeader contract={{
        screenId: "00.3.1",
        canonicalRoute: "/instances/:instanceId/itsm-admin/phase00/00.3.1",
        owningModule: "00.3 - Organization",
        owningSubmodule: "Module 00.3",
        parentRoute: "/instances/:instanceId/itsm-admin/phase00",
        breadcrumb: "Phase 00 > 00.3 Organization > Organization Home",
        persona: ["Organization Administrator", "Platform Administrator"],
        pageTitle: "Organization Home",
        pageContext: "Hierarchical view of companies, business units, and departments",
        primaryAction: {
          label: "Create Company",
          onClick: () => {},
        },
        loading,
        skeleton: loading,
      }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-slate-900">Organization Home</h1>
          <button
            className="px-4 py-2 font-medium text-brand-600 bg-brand-50 rounded hover:bg-brand-100 transition-colors"
            onClick={() => {}}
          >
            Create Company
          </button>
        </div>
        
        <LoadingEmptyError
          loading={loading}
          skeleton={loading}
          empty={!loading && records.length === 0}
          emptyTitle="No Organizations Found"
          emptyDescription="No organizations have been created yet. Click 'Create Company' to add a new organization."
        />
        
        {!loading && records.length > 0 && (
          <DataTable<CompanyRecord>
            columns={[
              { key: "id", header: "ID", render: (row) => row.id },
              { key: "name", header: "Name", render: (row) => row.name },
              { key: "type", header: "Type", render: (row) => row.type },
              { key: "status", header: "Status", render: (row) => row.status },
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