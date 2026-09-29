import { useState } from "react";
import { toast } from "react-hot-toast";
import {
  Card,
  CardHeader,
  CardBody,
  DetailRow,
  Select,
  Field,
  Button,
  ErrorState,
  PageLoader,
} from "@shared/components/ui";
import {
  useOrganizationUnitsQuery,
  usePlaceOrganizationUnitMutation,
  useDirectoryQuery,
} from "@shared/api/instanceApi";
import type { OrgUnitSummary } from "@shared/types";

interface OrganizationPlacementTabProps {
  instanceId: string;
  userId: string;
  user: {
    _id: string;
    organizationUnit: string | null;
  };
}

export function OrganizationPlacementTab({ instanceId, userId, user }: OrganizationPlacementTabProps) {
  const { data: unitsData, isLoading: unitsLoading, isError: unitsError } =
    useOrganizationUnitsQuery(instanceId);
  const [place, { isLoading: placing }] = usePlaceOrganizationUnitMutation();
  const [selected, setSelected] = useState<string>(user.organizationUnit ?? "");

  const units = unitsData?.items ?? [];

  const handleSave = async () => {
    try {
      await place({ instanceId, userId, organizationUnit: selected || null }).unwrap();
      toast.success("Organization placement updated");
    } catch {
      toast.error("Failed to update organization placement");
    }
  };

  return (
    <Card>
      <CardHeader
        title="Organization Placement"
        description="Company / business unit / department / location path resolved from the assigned organization unit."
      />
      <CardBody>
        <dl className="divide-y divide-slate-100">
          <DetailRow label="Component path">
            <UnitPath current={user.organizationUnit} />
          </DetailRow>
        </dl>
        {unitsLoading ? (
          <PageLoader label="Loading organization units…" />
        ) : unitsError ? (
          <ErrorState message="Could not load organization units (instance-admin permission required)." />
        ) : (
          <div className="mt-4 grid max-w-md gap-3">
            <Field label="Assign organization unit">
              <Select value={selected} onChange={(e) => setSelected(e.target.value)}>
                <option value="">— Unassigned —</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name} ({unit.type})
                  </option>
                ))}
              </Select>
            </Field>
            <div>
              <Button onClick={handleSave} loading={placing}>
                Save placement
              </Button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function UnitPath({ current }: { current: string | null }) {
  if (!current) return <>—</>;
  return <span className="font-mono text-xs">{current}</span>;
}

export type { OrgUnitSummary };