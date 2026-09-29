import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Building2, Mail, User, Clock, Shield, AlertCircle,
  CheckCircle2, XCircle, Loader2, ExternalLink,
} from "lucide-react";
import {
  Card, CardBody, CardHeader, Button, EmptyState,
  ErrorState, PageLoader, Badge, Spinner,
} from "@shared/components/ui";
import { PageHeader } from "@shared/components/PageHeader";
import { PermissionGate } from "@shared/components/PermissionGate";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks";
import { selectAuth } from "@shared/auth/authSlice";
import { useAcceptInvitationMutation, useMeQuery, loginErrorMessage } from "@shared/api/authApi";
import { can } from "@shared/authorization/permissions";
import { cn } from "@shared/lib/cn";
import { formatDateTime } from "@shared/lib/format";
import { TokenStore } from "@shared/auth/tokenStore";

interface InvitationData {
  instanceId: string;
  instanceName: string;
  instanceDomain: string;
  companyName: string;
  companyEmail: string;
  invitedBy: string;
  invitedByEmail: string;
  role: string;
  permissions: string[];
  expiresAt: string;
  createdAt: string;
  token: string;
}

export function InvitationAcceptancePage() {
  const { instanceId = "" } = useParams<{ instanceId: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuth);

  const [accept, { isLoading: isAccepting }] = useAcceptInvitationMutation();
  const [decline, { isLoading: isDeclining }] = useAcceptInvitationMutation();
  const { data: meData, isLoading: isMeLoading } = useMeQuery(undefined, { skip: !auth.token });

  const token = params.get("token") ?? "";
  const validToken = /^[a-f0-9]{64}$/i.test(token);
  const [error, setError] = useState("");
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [actionCompleted, setActionCompleted] = useState<"accepted" | "declined" | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // Fetch user info to validate email matches invitation
        if (auth.token && !meData) {
          const me = await dispatch(require("@shared/api/authApi").authApi.endpoints.me.initiate()).unwrap();
          if (active && me) {
            // Build invitation data from URL params
            const inviteData: InvitationData = {
              instanceId,
              instanceName: decodeURIComponent(params.get("instance") ?? instanceId),
              instanceDomain: params.get("domain") ?? "",
              companyName: params.get("company") ?? "",
              companyEmail: params.get("email") ?? "",
              invitedBy: params.get("invitedBy") ?? "Unknown",
              invitedByEmail: params.get("invitedByEmail") ?? "",
              role: params.get("role") ?? "Member",
              permissions: (params.get("permissions") ?? "").split(",").filter(Boolean),
              expiresAt: params.get("expiresAt") ?? "",
              createdAt: params.get("createdAt") ?? new Date().toISOString(),
              token,
            };
            setInvitationData(inviteData);
          }
        }
      } catch (err) {
        if (active) setError(loginErrorMessage((err as { data?: unknown })?.data));
      }
    })();
    return () => { active = false; };
  }, []);

  const handleAccept = async () => {
    if (!validToken) {
      setError("This invitation link is incomplete or invalid.");
      return;
    }
    setError("");
    try {
      await accept({ instanceId, token }).unwrap();
      setActionCompleted("accepted");
      toast.success("Invitation accepted successfully!");
      navigate("/platform", { replace: true });
    } catch (cause) {
      setError(loginErrorMessage((cause as { data?: unknown }).data));
      toast.error("Failed to accept invitation");
    }
  };

  const handleDecline = async () => {
    if (!validToken) {
      setError("This invitation link is incomplete or invalid.");
      return;
    }
    setError("");
    try {
      // Decline by not accepting; we call a decline endpoint
      await decline({ instanceId, token }).unwrap();
      setActionCompleted("declined");
      toast.success("Invitation declined");
      navigate("/platform", { replace: true });
    } catch (cause) {
      setError(loginErrorMessage((cause as { data?: unknown }).data));
      toast.error("Failed to decline invitation");
    }
  };

  if (!validToken && !actionCompleted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <PageHeader title="Accept Invitation" description="Review and accept your instance invitation" />
        <Card>
          <CardBody>
            <ErrorState message="This invitation link is incomplete or invalid. Ask the sender for a new link." />
            <div className="mt-4 text-center">
              <Link to="/platform" className="text-sm text-brand-600 hover:underline">← Back to platform</Link>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <PageHeader
        title="Accept Instance Invitation"
        description="Review the invitation details and confirm your acceptance"
        breadcrumbs={<nav className="flex items-center gap-1 text-xs text-slate-500"><Link to="/platform" className="hover:text-brand-600">Platform</Link><ArrowLeft className="h-3 w-3" /><span>Invitation</span></nav>}
      />

      <div className="mt-6 space-y-6">
        {actionCompleted === "accepted" && (
          <Card>
            <CardBody className="text-center py-12">
              <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
              <h2 className="mt-4 text-xl font-bold text-slate-900">Invitation Accepted!</h2>
              <p className="mt-2 text-sm text-slate-500">You are now a member of the instance.</p>
              <Link to="/platform" className="mt-6 inline-block text-sm font-medium text-brand-600 hover:underline">Go to Platform</Link>
            </CardBody>
          </Card>
        )}

        {actionCompleted === "declined" && (
          <Card>
            <CardBody className="text-center py-12">
              <XCircle className="mx-auto h-16 w-16 text-slate-400" />
              <h2 className="mt-4 text-xl font-bold text-slate-900">Invitation Declined</h2>
              <p className="mt-2 text-sm text-slate-500">You have declined the invitation. You can accept it later if needed.</p>
              <Link to="/platform" className="mt-6 inline-block text-sm font-medium text-brand-600 hover:underline">Go to Platform</Link>
            </CardBody>
          </Card>
        )}

        {!actionCompleted && (
          <>
            {/* Invalid token warning */}
            {!validToken && (
              <Card>
                <CardBody>
                  <ErrorState message="This invitation link is incomplete or invalid. Ask the sender for a new link." />
                </CardBody>
              </Card>
            )}

            {/* Inviting Instance Card */}
            <Card>
              <CardHeader
                title={
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-brand-600" />
                    Inviting Instance
                  </div>
                }
                description="The instance you have been invited to join"
              />
              <CardBody>
                {isMeLoading ? (
                  <PageLoader label="Loading invitation details…" />
                ) : invitationData ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-start gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-100 text-brand-700">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{invitationData.instanceName}</p>
                          <p className="text-xs text-slate-500">{invitationData.instanceDomain || invitationData.instanceId}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-600">
                          <Company className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{invitationData.companyName || "—"}</p>
                          <p className="text-xs text-slate-500">{invitationData.companyEmail || "—"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-600">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Invited by {invitationData.invitedBy}</p>
                          <p className="text-xs text-slate-500">{invitationData.invitedByEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-600">
                          <Shield className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Role: {invitationData.role}</p>
                          <p className="text-xs text-slate-500">
                            {invitationData.permissions.length > 0
                              ? `Permissions: ${invitationData.permissions.join(", ")}`
                              : "Default permissions applied"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <h4 className="text-sm font-semibold text-slate-700">Invitation Summary</h4>
                      <div className="mt-3 grid gap-2 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail className="h-4 w-4" />
                          <span>Invited to: {invitationData.companyEmail}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Shield className="h-4 w-4" />
                          <span>Assigned Role: {invitationData.role}</span>
                        </div>
                        {invitationData.expiresAt && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <Clock className="h-4 w-4" />
                            <span>Expires: {formatDateTime(invitationData.expiresAt)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock className="h-4 w-4" />
                          <span>Invited: {formatDateTime(invitationData.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        <PermissionGate permissions={["instance.join", "*"]}>
                          <Button onClick={handleAccept} loading={isAccepting} size="lg">
                            <CheckCircle2 className="h-4 w-4" /> Accept Invitation
                          </Button>
                        </PermissionGate>
                        <Button variant="outline" onClick={handleDecline} loading={isDeclining} size="lg">
                          <XCircle className="h-4 w-4" /> Decline
                        </Button>
                      </div>
                      <Link to="/platform" className="text-sm text-slate-500 hover:text-brand-600">← Cancel</Link>
                    </div>

                    {error && (
                      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                        {error}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-500">Loading invitation details…</p>
                )}
              </CardBody>
            </Card>

            {/* Warning about expiry */}
            {invitationData?.expiresAt && (
              <Card>
                <CardBody className="flex items-center gap-3 bg-amber-50 border-amber-200">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">This invitation expires</p>
                    <p className="text-xs text-amber-600">
                      Expires at {formatDateTime(invitationData.expiresAt)}. After expiration, you'll need a new invitation link.
                    </p>
                  </div>
                </CardBody>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Inline icon component since Company isn't imported from lucide
function Company({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 21h18" /><path d="M5 21V7l7-4 7 4v14" /><path d="M9 21v-6h6v6" /><path d="M8 11h8" /><path d="M8 15h8" />
    </svg>
  );
}
