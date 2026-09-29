import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Lock, Shield, Clock, KeyRound, UserX, Settings } from "lucide-react";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody, CardHeader, Input, Button, Label, Select } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { showSuccess, showError } from "@shared/components/Toast/ToastContainer";
import { useAppSelector } from "@shared/store/hooks";
import { selectPermissions } from "@shared/auth/authSlice";
import { PERMISSIONS } from "@shared/authorization/permissions";
import { useDirectoryQuery } from "@shared/api/instanceApi";
import { useSessionsQuery, useRevokeSessionMutation } from "@shared/api/instanceApi";

export function SecuritySettings() {
  const { instanceId = "" } = useParams<{ instanceId: string }>();
  const permissions = useAppSelector(selectPermissions);
  const canManage = permissions.includes("*") || permissions.includes(PERMISSIONS.tenantPermissionGrant);

  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("60");
  const [passwordMinLength, setPasswordMinLength] = useState("8");
  const [sessionRevokeAll, setSessionRevokeAll] = useState(false);

  const { data: directory } = useDirectoryQuery({ instanceId, limit: 50 }, { skip: !instanceId });
  const [revokeSession] = useRevokeSessionMutation();

  const handleSave = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      showSuccess("Security settings saved");
    } catch {
      showError("Failed to save settings");
    }
  };

  const handleRevokeAllSessions = async () => {
    try {
      await revokeSession({ instanceId, userId: "", sessionId: "" }).unwrap();
      showSuccess("All sessions revoked");
    } catch {
      showError("Failed to revoke sessions");
    }
  };

  return (
    <div>
      <PageHeader
        title="Security Settings"
        description="Configure MFA, session policies, password requirements, and privileged access."
        breadcrumbs={<Link to={`/instances/${instanceId}`} className="hover:text-brand-600">Instance</Link>}
        actions={canManage ? <Button onClick={handleSave}>Save Settings</Button> : undefined}
      />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title="MFA Policy" icon={<Shield className="h-4 w-4 text-brand-600" />} />
          <CardBody>
            <div className="space-y-4">
              <div className="flex items-center justify-between"><div><Label>Enable MFA</Label><p className="text-xs text-slate-500">Require multi-factor authentication</p></div><button onClick={() => setMfaEnabled(!mfaEnabled)} className={`h-6 w-11 rounded-full ${mfaEnabled ? "bg-brand-600" : "bg-slate-300"}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ${mfaEnabled ? "translate-x-6" : "translate-x-1"}`} /></button></div>
              <div><Label>Backup Codes</Label><p className="text-sm text-slate-600">Remaining: {10} codes</p></div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Session Policy" icon={<Clock className="h-4 w-4 text-brand-600" />} />
          <CardBody>
            <div className="space-y-4">
              <div><Label>Session Timeout (minutes)</Label><Input type="number" value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)} className="w-full" /></div>
              <div><Label>Idle Timeout (minutes)</Label><Input type="number" defaultValue="15" className="w-full" /></div>
              <Label><input type="checkbox" defaultChecked className="mr-2" /> Require re-authentication for sensitive actions</Label>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Password Policy" icon={<Lock className="h-4 w-4 text-brand-600" />} />
          <CardBody>
            <div className="space-y-4">
              <div><Label>Minimum Length</Label><Input type="number" value={passwordMinLength} onChange={(e) => setPasswordMinLength(e.target.value)} className="w-full" /></div>
              <Label><input type="checkbox" defaultChecked className="mr-2" /> Require uppercase letter</Label>
              <Label><input type="checkbox" defaultChecked className="mr-2" /> Require lowercase letter</Label>
              <Label><input type="checkbox" defaultChecked className="mr-2" /> Require number</Label>
              <Label><input type="checkbox" className="mr-2" /> Require special character</Label>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Privileged Actions" icon={<KeyRound className="h-4 w-4 text-brand-600" />} />
          <CardBody>
            <div className="space-y-3">
              {["Role assignment", "Permission grant/revoke", "Session revocation", "User deletion"].map((action) => (
                <div key={action} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3"><span className="text-sm">{action}</span><Badge variant="warning">Requires MFA</Badge></div>
              ))}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Delegated Access" icon={<Settings className="h-4 w-4 text-brand-600" />} />
          <CardBody>
            <div className="space-y-4">
              <Label><input type="checkbox" defaultChecked className="mr-2" /> Allow delegation of permissions</Label>
              <div><Label>Max delegation duration (hours)</Label><Input type="number" defaultValue="24" className="w-full" /></div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Session Revocation" icon={<UserX className="h-4 w-4 text-red-500" />} />
          <CardBody>
            <div className="space-y-3">
              <div className="rounded-lg border border-slate-200 bg-white p-3"><div className="flex items-center justify-between"><span className="text-sm">Revoke all active sessions</span><Badge variant="danger">Dangerous</Badge></div><p className="mt-1 text-xs text-slate-500">This will sign out all users immediately.</p></div>
              {canManage && <Button variant="danger" onClick={handleRevokeAllSessions}>Revoke All Sessions</Button>}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}


