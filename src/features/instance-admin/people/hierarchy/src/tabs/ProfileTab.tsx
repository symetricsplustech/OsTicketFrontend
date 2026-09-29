import { Card, CardBody, DetailRow } from "@shared/components/ui";
import { formatDateTime } from "@shared/lib/format";
import type { DirectoryUser } from "@shared/types";

export function ProfileTab({ user }: { user: DirectoryUser }) {
  return (
    <Card>
      <CardBody>
        <dl className="divide-y divide-slate-100">
          <DetailRow label="Name">{user.name}</DetailRow>
          <DetailRow label="Email">{user.email}</DetailRow>
          <DetailRow label="User ID">{user._id}</DetailRow>
          <DetailRow label="Last sign-in">{formatDateTime(user.lastSignIn)}</DetailRow>
          <DetailRow label="Access status">{user.accessStatus}</DetailRow>
          <DetailRow label="Member role">{user.role ?? "—"}</DetailRow>
        </dl>
      </CardBody>
    </Card>
  );
}