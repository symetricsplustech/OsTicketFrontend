import React from "react";
import { ScreenHeader } from "@shared/ui-contract/screen-header";
import { LoadingEmptyError } from "@shared/ui-contract/loading-empty-error";
import { DataTable } from "@shared/components/DataTable";
import { cn } from "@shared/lib/cn";
import { useParams } from "react-router-dom";

interface InstanceRecord {
  id: string;
  name: string;
  type: string;
  status: "active" | "maintenance" | "planned";
  created: string;
  modified: string;
}

export function InstanceHomeScreen() {
  const { instanceId } = useParams<{ instanceId: string }>();
  
  const [records, setRecords] = React.useState<InstanceRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    const fetchInstance = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRecords([
          { id: "instance-1", name: "Main Instance", type: "Production", status: "active", created: "2024-01-15", modified: "2024-09-20" },
          { id: "instance-2", name: "Demo Instance", type: "Sandbox", status: "active", created: "2024-03-10", modified: "2024-09-18" },
        ]);
        setLoading(false);
      } catch (err) {
        setError("Failed to load instance records");
        setLoading(false);
      }
    };
    
    fetchInstance();
  }, [instanceId]);
  
  return (
    <div className="space-y-6">
      <ScreenHeader contract={{
        screenId: "00.1.1",
        canonicalRoute: "/instances/:instanceId/itsm-admin/phase00/00.1.1",
        owningModule: "00.1 - Tenant / Instance Administration",
        owningSubmodule: "Module 00.1",
        parentRoute: "/instances/:instanceId/itsm-admin/phase00",
        breadcrumb: "Phase 00 > 00.1 Instance Administration > Instance Home",
        persona: ["Instance Administrator", "Platform Administrator"],
        pageTitle: "Instance Home",
        pageContext: "Central dashboard for instance configuration and monitoring",
        primaryAction: {
          label: "Add Instance",
          onClick: () => {},
        },
        loading,
        skeleton: loading,
      }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-slate-900">Instance Home</h1>
          <button
            className="px-4 py-2 font-medium text-brand-600 bg-brand-50 rounded hover:bg-brand-100 transition-colors"
            onClick={() => {}}
          >
            Add Instance
          </button>
        </div>
        
        <LoadingEmptyError
          loading={loading}
          skeleton={loading}
          empty={!loading && records.length === 0}
          emptyTitle="No Instances Found"
          emptyDescription="No instances have been configured yet. Click 'Add Instance' to create a new instance."
        />
        
        {!loading && records.length > 0 && (
          <DataTable<InstanceRecord>
            columns={[
              { key: "id", header: "ID", render: (row) => row.id },
              { key: "name", header: "Name", render: (row) => row.name },
              { key: "type", header: "Type", render: (row) => row.type },
              { key: "status", header: "Status", render: (row) => row.status },
              { key: "created", header: "Created", render: (row) => row.created },
              { key: "modified", header: "Modified", render: (row) => row.modified },
            ]}
            rows={records}
            rowKey={(row) => row.id}
          />
        )}
      </ScreenHeader>
    </div>
  );
}