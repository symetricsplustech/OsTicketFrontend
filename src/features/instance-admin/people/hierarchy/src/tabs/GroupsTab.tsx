import { Card, CardBody, EmptyState } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import type { GroupSummary } from "@shared/types";

export function GroupsTab({
  groups,
  assignment = false,
}: {
  groups: GroupSummary[];
  assignment?: boolean;
}) {
  return (
    <Card>
      <CardBody>
        {groups.length === 0 ? (
          <EmptyState title={assignment ? "No assignment group membership" : "No group membership"} />
        ) : (
          <ul className="divide-y divide-slate-100">
            {groups.map((group) => (
              <li key={group.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-medium text-slate-800">{group.name}</p>
                  {group.role ? <p className="text-xs text-slate-500">Role: {group.role}</p> : null}
                </div>
                <Badge variant={assignment ? "info" : "default"}>
                  {assignment ? "Assignment Group" : "Group"}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}