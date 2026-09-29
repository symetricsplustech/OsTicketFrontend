import React from "react";
import { ScreenHeader } from "@shared/ui-contract/screen-header";
import { LoadingEmptyError } from "@shared/ui-contract/loading-empty-error";
import { DataTable } from "@shared/components/DataTable";
import { cn } from "@shared/lib/cn";
import { useParams } from "react-router-dom";

interface AuditEvent {
  id: string;
  timestamp: string;
  user: {
    name: string;
  };
  action: string;
  details?: string;
  category: "security" | "configuration" | "data" | "access";
}

export function AuditScreen() {
  const { instanceId } = useParams<{ instanceId: string }>();
  
  const [events, setEvents] = React.useState<AuditEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    const fetchAudit = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setEvents([
          { id: "audit-1", timestamp: "2024-09-20 10:30:00", user: { name: "Admin User" }, action: "User created", details: "Created new user john.doe", category: "data" },
          { id: "audit-2", timestamp: "2024-09-19 14:15:00", user: { name: "Admin User" }, action: "Role assigned", details: "Assigned administrator role to jane.smith", category: "access" },
          { id: "audit-3", timestamp: "2024-09-18 09:45:00", user: { name: "System" }, action: "Login", details: "Successful login from 192.168.1.100", category: "security" },
        ]);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    
    fetchAudit();
  }, [instanceId]);
  
  return (
    <div className="space-y-6">
      <ScreenHeader contract={{
        screenId: "00.10",
        canonicalRoute: "/instances/:instanceId/itsm-admin/phase00/00.10",
        owningModule: "00.10 - Audit",
        owningSubmodule: "Module 00.10",
        parentRoute: "/instances/:instanceId/itsm-admin/phase00",
        breadcrumb: "Phase 00 > 00.10 Audit",
        persona: ["Platform Administrator", "Security Auditor"],
        pageTitle: "Audit",
        pageContext: "Audit trail and activity log for the instance",
        primaryAction: {
          label: "Export Audit Log",
          onClick: () => {},
        },
        loading,
        skeleton: loading,
      }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-slate-900">Audit</h1>
          <button
            className="px-4 py-2 font-medium text-brand-600 bg-brand-50 rounded hover:bg-brand-100 transition-colors"
            onClick={() => {}}
          >
            Export Audit Log
          </button>
        </div>
        
        <LoadingEmptyError
          loading={loading}
          skeleton={loading}
          empty={!loading && events.length === 0}
          emptyTitle="No Audit Events"
          emptyDescription="No audit events have been recorded yet."
        />
        
        {!loading && events.length > 0 && (
          <DataTable<AuditEvent>
            columns={[
              { key: "timestamp", header: "Timestamp", render: (row) => row.timestamp },
              { key: "user", header: "User", render: (row) => row.user.name },
              { key: "action", header: "Action", render: (row) => row.action },
              { key: "details", header: "Details", render: (row) => row.details || "-" },
              { key: "category", header: "Category", render: (row) => row.category },
            ]}
            rows={events}
            rowKey={(row) => row.id}
          />
        )}
      </ScreenHeader>
    </div>
  );
}