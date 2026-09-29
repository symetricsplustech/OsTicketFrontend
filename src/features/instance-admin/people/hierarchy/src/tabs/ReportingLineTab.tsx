import { useState } from "react";
import { toast } from "react-hot-toast";
import {
  Card,
  CardHeader,
  CardBody,
  DetailRow,
  Input,
  Textarea,
  Label,
  Field,
  Button,
  ErrorState,
  PageLoader,
  EmptyState,
} from "@shared/components/ui";
import { StatusBadge } from "@shared/components/Badge";
import {
  useReportingLineQuery,
  useSetReportingLineMutation,
  useClearReportingLineMutation,
  useEngineerProfileQuery,
  useUpsertEngineerProfileMutation,
} from "@shared/api/instanceApi";
import { formatDate } from "@shared/lib/format";
import type { ReportingLine } from "@shared/types";

interface ReportingLineTabProps {
  instanceId: string;
  userId: string;
}

export function ReportingLineTab({ instanceId, userId }: ReportingLineTabProps) {
  const { data, isLoading, isError, error } = useReportingLineQuery({ instanceId, userId });
  const [setLine, { isLoading: setting }] = useSetReportingLineMutation();
  const [clearLine, { isLoading: clearing }] = useClearReportingLineMutation();

  const [managerUserId, setManagerUserId] = useState("");
  const [teamLeadUserId, setTeamLeadUserId] = useState("");
  const [notes, setNotes] = useState("");

  if (isLoading) return <PageLoader label="Loading reporting line…" />;
  if (isError)
    return (
      <ErrorState
        message={`Could not load reporting line: ${(error as { data?: { message?: string } })?.data?.message ?? "unknown error"}`}
      />
    );

  const line = data?.reportingLine ?? null;

  const handleSet = async () => {
    try {
      await setLine({
        instanceId,
        userId,
        body: {
          managerUserId: managerUserId || null,
          teamLeadUserId: teamLeadUserId || null,
          notes: notes || null,
        },
      }).unwrap();
      toast.success("Reporting line saved");
    } catch {
      toast.error("Failed to save reporting line");
    }
  };

  const handleClear = async () => {
    try {
      await clearLine({ instanceId, userId }).unwrap();
      toast.success("Reporting line cleared");
    } catch {
      toast.error("Failed to clear reporting line");
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Current Reporting Line" />
        <CardBody>
          {!line ? (
            <EmptyState title="No active reporting line" description="Assign a manager and team lead below." />
          ) : (
            <dl className="divide-y divide-slate-100">
              <DetailRow label="Manager user ID">{line.managerUserId ?? "—"}</DetailRow>
              <DetailRow label="Team lead user ID">{line.teamLeadUserId ?? "—"}</DetailRow>
              <DetailRow label="Delegated manager">{line.delegatedManagerUserId ?? "—"}</DetailRow>
              <DetailRow label="Effective from">{formatDate(line.effectiveFrom)}</DetailRow>
              <DetailRow label="Effective to">{formatDate(line.effectiveTo)}</DetailRow>
              <DetailRow label="Status">
                <StatusBadge status={line.isActive ? "active" : "inactive"} />
              </DetailRow>
              {line.notes ? <DetailRow label="Notes">{line.notes}</DetailRow> : null}
            </dl>
          )}
        </CardBody>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Direct Reports" description={`Reporting rows where ${userId} is manager or team lead.`} />
          <CardBody>
            <DirectReportsList rows={data?.directReports ?? []} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Reporting Chain" description="Ancestors up the manager chain." />
          <CardBody>
            <ChainList chain={data?.chain ?? []} />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Update Reporting Line" />
        <CardBody>
          <div className="grid max-w-lg gap-3">
            <Field label="Manager user ID">
              <Input value={managerUserId} onChange={(e) => setManagerUserId(e.target.value)} placeholder="UUID" />
            </Field>
            <Field label="Team lead user ID">
              <Input value={teamLeadUserId} onChange={(e) => setTeamLeadUserId(e.target.value)} placeholder="UUID" />
            </Field>
            <Field label="Notes">
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </Field>
            <div className="flex gap-2">
              <Button onClick={handleSet} loading={setting}>
                Save reporting line
              </Button>
              <Button variant="danger" onClick={handleClear} loading={clearing}>
                Clear reporting line
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <EngineerProfileEditor instanceId={instanceId} userId={userId} />
    </div>
  );
}

function DirectReportsList({ rows }: { rows: ReportingLine[] }) {
  if (rows.length === 0) {
    return <EmptyState title="No direct reports" />;
  }
  return (
    <ul className="divide-y divide-slate-100">
      {rows.map((row) => (
        <li key={row.id} className="py-2 text-sm">
          <p className="font-medium text-slate-800">{row.memberUserId}</p>
          <p className="text-xs text-slate-500">
            Since {formatDate(row.effectiveFrom)}
            {row.teamLeadUserId ? " · as team lead" : ""}
          </p>
        </li>
      ))}
    </ul>
  );
}

function ChainList({ chain }: { chain: { userId: string; effectiveFrom: string | null; effectiveTo: string | null }[] }) {
  if (chain.length === 0) {
    return <EmptyState title="No managers above this user" />;
  }
  return (
    <ol className="space-y-2">
      {chain.map((item, index) => (
        <li key={`${item.userId}-${index}`} className="flex items-center gap-2 text-sm">
          <span className="text-slate-400">{index + 1}.</span>
          <span className="font-medium text-slate-800">{item.userId}</span>
          <span className="text-xs text-slate-500">since {formatDate(item.effectiveFrom)}</span>
        </li>
      ))}
    </ol>
  );
}

function EngineerProfileEditor({ instanceId, userId }: { instanceId: string; userId: string }) {
  const { data, isLoading } = useEngineerProfileQuery({ instanceId, userId });
  const [upsert, { isLoading: saving }] = useUpsertEngineerProfileMutation();

  const [skillsText, setSkillsText] = useState("");
  const [territoriesText, setTerritoriesText] = useState("");
  const [notes, setNotes] = useState("");

  const profile = data?.profile;

  const handleSave = async () => {
    try {
      await upsert({
        instanceId,
        userId,
        body: {
          skills: skillsText.split(",").map((s) => s.trim()).filter(Boolean),
          territories: territoriesText.split(",").map((s) => s.trim()).filter(Boolean),
          notes: notes || null,
        },
      }).unwrap();
      toast.success("Engineer profile saved");
    } catch {
      toast.error("Failed to save engineer profile");
    }
  };

  if (isLoading) return <PageLoader label="Loading engineer profile…" />;

  return (
    <Card>
      <CardHeader title="Engineer Profile" description="Availability, skills, territories and schedule for operational users." />
      <CardBody>
        <dl className="divide-y divide-slate-100">
          <DetailRow label="Skills">
            {profile?.skills?.length ? profile.skills.join(", ") : "—"}
          </DetailRow>
          <DetailRow label="Territories">
            {profile?.territories?.length ? profile.territories.join(", ") : "—"}
          </DetailRow>
          <DetailRow label="Notes">{profile?.notes ?? "—"}</DetailRow>
        </dl>
        <div className="mt-4 grid max-w-lg gap-3">
          <Field label="Skills (comma separated)">
            <Input
              defaultValue={profile?.skills?.join(", ") ?? ""}
              onChange={(e) => setSkillsText(e.target.value)}
            />
          </Field>
          <Field label="Territories (comma separated)">
            <Input
              defaultValue={profile?.territories?.join(", ") ?? ""}
              onChange={(e) => setTerritoriesText(e.target.value)}
            />
          </Field>
          <Field label="Notes">
            <Textarea
              defaultValue={profile?.notes ?? ""}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </Field>
          <div>
            <Button onClick={handleSave} loading={saving}>
              Save engineer profile
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}