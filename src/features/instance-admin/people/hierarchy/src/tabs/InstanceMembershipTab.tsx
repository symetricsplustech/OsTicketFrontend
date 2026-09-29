import { Card, CardBody, DetailRow, EmptyState } from "@shared/components/ui";
import type { DirectoryUser } from "@shared/types";

export function InstanceMembershipTab({ user }: { user: DirectoryUser }) {
  return (
    <Card>
      <CardBody>
        {!user.membershipStatus ? (
          <EmptyState title="No instance membership found" />
        ) : (
          <dl className="divide-y divide-slate-100">
            <DetailRow label="Membership status">{user.membershipStatus}</DetailRow>
            <DetailRow label="Member role">{user.role ?? "—"}</DetailRow>
            <DetailRow label="Organization unit">{user.organizationUnit ?? "—"}</DetailRow>
          </dl>
        )}
      </CardBody>
    </Card>
  );
}