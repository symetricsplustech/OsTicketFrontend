export interface ApiErrorBody {
  success?: boolean;
  message?: string;
  error?: string;
  [key: string]: unknown;
}

// ── Auth ────────────────────────────────────────────────────────────────

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role?: string;
  roles?: string[];
  [key: string]: unknown;
}

export interface PortalLoginArgs {
  email: string;
  password: string;
  totpCode?: string;
}

export interface PortalLoginResponse {
  success: boolean;
  token: string;
  user: AuthUser;
  role?: string;
  permissions?: string[];
  moduleKeys?: string[];
}

export interface MeResponse {
  success: boolean;
  user: AuthUser;
  permissions?: string[];
  role?: string | null;
}

export interface MyInstance {
  _id: string;
  name: string;
  domain?: string;
  instanceCode?: string;
  instanceStatus?: string;
  createdAt?: string;
  role?: string;
  membershipStatus?: string;
  joinedAt?: string;
}

export interface MyInstancesResponse {
  success: boolean;
  instances: MyInstance[];
}

export interface SelectInstanceResponse {
  success: boolean;
  token: string;
  instance: { _id: string; name: string; status?: string };
  role?: string;
  permissions?: string[];
  moduleKeys?: string[];
}

// ── Users Directory ─────────────────────────────────────────────────────

export interface DirectoryUnit {
  id: string;
  name: string;
  type: string;
}

export interface GroupSummary {
  id: string;
  name: string;
  role?: string;
}

export interface DirectoryUser {
  _id: string;
  name: string;
  email: string;
  membershipStatus: string;
  role: string | null;
  company: string | null;
  businessUnit: string | null;
  department: string | null;
  location: string | null;
  organizationUnit: string | null;
  unitPath: DirectoryUnit[];
  managerUserId: string | null;
  managerName: string | null;
  teamLeadUserId: string | null;
  teamLeadName: string | null;
  groups: GroupSummary[];
  assignmentGroups: GroupSummary[];
  roleSummary: { id: string; name: string }[];
  accessStatus: string;
  lastSignIn: string | null;
}

export interface DirectoryQueryArgs {
  instanceId: string;
  search?: string;
  page?: number;
  limit?: number;
  userId?: string;
}

export interface DirectoryResponse {
  success: boolean;
  items: DirectoryUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Effective Access ────────────────────────────────────────────────────

export interface EffectiveMembership {
  role: string | null;
  status: string;
  organizationUnit: string | null;
  joinedAt: string | null;
}

export interface EffectiveRole {
  _id: string;
  name: string;
  permissions: string[];
  deniedPermissions: string[];
  status?: string;
}

export interface DelegatedGrant {
  delegationId: string;
  delegatorUserId: string;
  permissions: string[];
  expiresAt: string | null;
}

export interface EffectiveAccessResponse {
  success: boolean;
  userId: string;
  name: string;
  email: string;
  membership: EffectiveMembership;
  directPermissions: string[];
  membershipPermissions: string[];
  roles: EffectiveRole[];
  grants: string[];
  effective: string[];
  denied: string[];
  sources: Record<string, string>;
  scopes: Record<string, unknown>;
  temporaryGrants: unknown[];
  delegatedGrants: DelegatedGrant[];
}

// ── Reporting Line ──────────────────────────────────────────────────────

export interface ReportingLine {
  _id: string;
  id: string;
  memberUserId: string;
  managerUserId: string | null;
  teamLeadUserId: string | null;
  delegatedManagerUserId: string | null;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  isActive: boolean;
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ReportingChainItem {
  userId: string;
  viaTeamLead: boolean;
  effectiveFrom: string | null;
  effectiveTo: string | null;
}

export interface ReportingLineResponse {
  success: boolean;
  reportingLine: ReportingLine | null;
  directReports: ReportingLine[];
  chain: ReportingChainItem[];
}

export interface SetReportingLineArgs {
  instanceId: string;
  userId: string;
  body: {
    managerUserId?: string | null;
    teamLeadUserId?: string | null;
    delegatedManagerUserId?: string | null;
    effectiveFrom?: string | null;
    effectiveTo?: string | null;
    notes?: string | null;
  };
}

// ── Engineer Profile ────────────────────────────────────────────────────

export interface EngineerProfile {
  _id: string;
  id: string;
  userId: string;
  availability: Record<string, unknown>;
  skills: string[];
  territories: string[];
  schedule: Record<string, unknown>;
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface EngineerProfileResponse {
  success: boolean;
  profile: EngineerProfile | null;
}

export interface UpsertEngineerProfileArgs {
  instanceId: string;
  userId: string;
  body: {
    availability?: Record<string, unknown>;
    skills?: string[];
    territories?: string[];
    schedule?: Record<string, unknown>;
    notes?: string | null;
  };
}

// ── Delegations ─────────────────────────────────────────────────────────

export interface Delegation {
  _id: string;
  id: string;
  delegatorUserId: string;
  delegateUserId: string;
  permissions: string[];
  roleIds: string[];
  scope: Record<string, unknown>;
  reason: string | null;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  status: "active" | "revoked" | "cancelled" | "expired" | "scheduled";
  revokedAt: string | null;
  revokedBy: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface DelegationsQueryArgs {
  instanceId: string;
  userId?: string;
  includeInactive?: boolean;
}

export interface DelegationsResponse {
  success: boolean;
  items: Delegation[];
  activeForMe: Delegation[];
}

export interface CreateDelegationArgs {
  instanceId: string;
  body: {
    delegatorUserId?: string | null;
    delegateUserId: string;
    permissions?: string[];
    roleIds?: string[];
    scope?: Record<string, unknown>;
    reason?: string | null;
    startsAt?: string | null;
    expiresAt?: string | null;
  };
}

export interface SingleDelegationResponse {
  success: boolean;
  delegation: Delegation;
}

// ── Assigned work / work history / sessions ─────────────────────────────

export interface WorkItem {
  id: string;
  type: "ticket" | "task";
  number: string;
  title: string;
  status: string;
  priority: string;
  dueAt: string | null;
  updatedAt: string | null;
}

export interface AssignedWorkResponse {
  success: boolean;
  tickets: WorkItem[];
  tasks: WorkItem[];
}

export interface HistoryItem {
  id: string;
  type: "ticket" | "task" | "audit";
  reference: string;
  title: string;
  status: string;
  at: string | null;
}

export interface WorkHistoryResponse {
  success: boolean;
  items: HistoryItem[];
}

export interface MfaStatus {
  enabled: boolean;
  backupCodesRemaining: number;
  lastLogin: string | null;
  lastSeenAt: string | null;
  sessionVersion: number;
}

export interface SessionItem {
  _id: string;
  id: string;
  userId: string | null;
  agentId: string | null;
  email: string;
  ip: string;
  userAgent: string;
  device: string;
  mfaVerified: boolean;
  lastActiveAt: string | null;
  revokedAt: string | null;
  revokedBy: string | null;
  status: "active" | "revoked";
  createdAt: string;
  updatedAt: string;
}

export interface SessionsResponse {
  success: boolean;
  mfa: MfaStatus;
  items: SessionItem[];
}

// ── Audit events ────────────────────────────────────────────────────────

export interface AuditEvent {
  id: string;
  actorId: { _id?: string; name?: string; email?: string } | string | null;
  resourceType: string;
  resourceId: string | null;
  action: string;
  outcome?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  correlationId?: string;
  createdAt: string;
}

export interface AuditQueryArgs {
  actor?: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  page?: number;
  limit?: number;
}

export interface AuditListResponse {
  events: AuditEvent[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ── Org placement / groups / roles options ──────────────────────────────

export interface TeamSummary {
  _id: string;
  id?: string;
  name: string;
  kind?: string;
  members?: unknown[];
}

export interface RoleSummaryOptions {
  _id: string;
  id?: string;
  name: string;
  isActive?: boolean;
}

export interface OrgUnitSummary {
  _id?: string;
  id: string;
  name: string;
  type: string;
  parent_id?: string | null;
}

export interface ListResponse<T> {
  success: boolean;
  items: T[];
}

export interface OrganizationUnitPlaceArgs {
  instanceId: string;
  userId: string;
  organizationUnit: string | null;
}
