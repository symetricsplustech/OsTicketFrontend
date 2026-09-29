import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { Users, MapPin, ChevronDown, ChevronRight, Search, Loader2 } from "lucide-react";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody, CardHeader, Input, Button } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { StatusBadge } from "@shared/components/Badge";
import { useDirectoryQuery } from "@shared/api/instanceApi";
import { useMyEffectiveAccessQuery } from "@shared/api/instanceApi";
import { formatDate } from "@shared/lib/format";
import type { DirectoryUser, ReportingLine } from "@shared/types";

export function ReportingLines() {
  const { instanceId = "" } = useParams<{ instanceId: string }>();
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const effective = useMyEffectiveAccessQuery(instanceId, { skip: !instanceId });
  const { data: directory, isLoading, isError } = useDirectoryQuery(
    { instanceId, limit: 100 },
    { skip: !instanceId },
  );

  const users = (directory?.items ?? []).filter((u) =>
    `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Reporting Lines"
        description="Manager and team-lead reporting relationships across this instance."
        breadcrumbs={<Link to={`/instances/${instanceId}`} className="hover:text-brand-600">Instance</Link>}
      />
      {isLoading ? (
        <Card><CardBody><p className="py-12 text-center text-sm text-slate-500">Loading reporting lines…</p></CardBody></Card>
      ) : isError ? (
        <Card><CardBody><p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Could not load reporting lines.</p></CardBody></Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title="My reporting chain" description="Ancestors above the signed-in user." />
            <CardBody>
              {effective.isLoading ? <p className="py-4 text-center text-sm text-slate-500">Loading chain…</p> : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm">ME</div>
                    <div><p className="text-sm font-medium">{effective.data?.name}</p><p className="text-xs text-slate-500">{effective.data?.email}</p></div>
                  </div>
                  {users.filter((u) => u.managerName).slice(0, 5).map((user) => (
                    <div key={user._id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-sm">{user.name.charAt(0)}</div>
                      <div><p className="text-sm font-medium">{user.name}</p><p className="text-xs text-slate-500">Reports to {user.managerName}</p></div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Directory users" description={`${directory?.total ?? 0} members`} />
            <CardBody>
              <div className="mb-3"><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users…" className="w-full" /></div>
              <div className="space-y-1">
                {users.slice(0, 20).map((user) => (
                  <div key={user._id} className="flex items-center justify-between py-2.5 border-b border-slate-100">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.managerName ? `Reports to ${user.managerName}` : user.teamLeadName ? `Team lead ${user.teamLeadName}` : "No manager"}</p>
                    </div>
                    <Link to={`/instances/${instanceId}/people/users/${user._id}/access`} className="text-xs font-medium text-brand-600 hover:underline">Workspace →</Link>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
