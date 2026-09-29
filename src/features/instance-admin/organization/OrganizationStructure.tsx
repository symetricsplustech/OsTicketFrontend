import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Building2, Users, MapPin, ChevronRight, Plus, Search } from "lucide-react";
import { HierarchyExplorerPage } from "@page-shells/HierarchyExplorerPage";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody, CardHeader, Input, Button } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { useOrganizationUnitsQuery } from "@shared/api/instanceApi";
import { useDebounce } from "@shared/hooks/useDebounce";
import { useAppSelector } from "@shared/store/hooks";
import { selectPermissions } from "@shared/auth/authSlice";
import { PERMISSIONS } from "@shared/authorization/permissions";
import { cn } from "@shared/lib/cn";
import type { OrgUnitSummary } from "@shared/types";

export function OrganizationStructure() {
  const { instanceId = "" } = useParams<{ instanceId: string }>();
  const { data, isLoading, isError } = useOrganizationUnitsQuery(instanceId, { skip: !instanceId });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const permissions = useAppSelector(selectPermissions);
  const canCreate = permissions.includes(PERMISSIONS.tenantPermissionGrant) || permissions.includes("*");

  const nodes = (data?.items ?? []).map((unit: OrgUnitSummary) => ({
    id: unit.id,
    name: unit.name,
    type: unit.type as "company" | "businessUnit" | "department" | "location" | "team",
    parentId: unit.parent_id ?? undefined,
  }));

  return (
    <div>
      <PageHeader
        title="Organization Structure"
        description="Explore the hierarchy of companies, business units, departments, and locations."
        breadcrumbs={<Link to={`/instances/${instanceId}`} className="hover:text-brand-600">Instance</Link>}
        actions={
          canCreate ? (
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add Company
            </Button>
          ) : undefined
        }
      />
      {isLoading ? (
        <Card><CardBody><p className="py-12 text-center text-sm text-slate-500">Loading organization structure…</p></CardBody></Card>
      ) : isError ? (
        <Card><CardBody><p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Could not load organization structure.</p></CardBody></Card>
      ) : (
        <HierarchyExplorerPage
          title="Hierarchy Explorer"
          instanceId={instanceId}
          nodes={nodes}
          loading={isLoading}
          onNodeSelect={(node) => {}}
          onNodeCreate={canCreate ? (parentId, type) => {} : undefined}
        />
      )}
    </div>
  );
}
