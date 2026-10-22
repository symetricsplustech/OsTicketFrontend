# Project Index

Last Updated: 2026-10-15
Project: osTicket Frontend
Project Type: React Frontend (TypeScript)

> NOTE: Sections below predate the 2026-10-09 reorg and are partly stale (e.g.
> `src/shared/`, `src/shells/`, `src/page-shells/` no longer exist). Trust source
> code + root `.opencode/memory/` over these older paths.

## Technology

- Languages: TypeScript
- Frameworks: React 18, React Router v6, Redux Toolkit
- Styling: Tailwind CSS, Lucide React icons
- Build: Vite
- Package: pnpm

## Architecture

- Monorepo with pnpm-workspace
- Feature-based module structure under `src/features/`
- Shared components under `src/shared/components/`
- Shells/layouts under `src/shells/`
- Page shells under `src/page-shells/`
- API layer via RTK Query: single `saasadminApi` in `src/services/saasadmin/base.ts` + injected endpoints

## Entry Points

- `src/app/App.tsx` - Root app
- `src/app/routes/index.tsx` - Router config
- `src/main.tsx` - Entry

## Major Areas

- `src/features/auth/` - Login, Register, MFA, Account Recovery
- `src/features/portal/` - Requester Portal (self-service)
- `src/features/saas/` - SaaS Admin (platform control plane)
- `src/features/instance-admin/` - Instance administration
- `src/features/platform/` - Platform home/instance creation
- `src/features/operations/` - Core operational experience
- `src/shared/` - Shared components, hooks, API, types, auth
- `src/shells/` - Layout shells (Portal, SaaS, Admin, etc.)
- `src/page-shells/` - Reusable page layouts (EntityListPage, RecordWorkspacePage, DashboardPage)

## Important Persistent Facts

- All pages use `PageHeader`, `Card`, `Badge`, `Button`, `DataTable`, `Tabs`, `Pagination`, `PermissionGate`
- RTK Query hooks for data fetching (`useQuery`, `useMutation`)
- Toast notifications via `react-hot-toast`
- Permissions via `@shared/authorization/permissions` (`can()`, `useCan()`)
- Import aliases: `@shared/`, `@shells/`, `@features/`, `@app/`
- Shells provide layout; `ProtectedRoute` wraps authenticated routes

## SaaS Admin API layer (2026-10-10)

The old API clients (`services/base.ts`, `authApi.ts`, `companyApi.ts`,
`instanceApi.ts`, `roleApi.ts`, `setupApi.ts`, `itsmTypes.ts`) were deleted.

- `src/services/saasadmin/` holds the single RTK Query API for the SaaS Admin
  control plane, split module-by-module: `base.ts` (createApi + shared
  `baseQueryWithAuth` from `@services/http`), `auth.ts`, `types.ts` (envelope/pagination types), one file
  per backend `/admin/*` module (dashboard, tenants, tenantDomains, staff,
  roles, permissions, accessPolicies, approvals, serviceManagement,
  slaManagement, workflowManagement, itsmConfiguration, knowledgeManagement,
  cmdbAssets, emailNotifications, integrations, apiKeys, webhooks, support,
  reports, audit, systemAdministration, platformSettings, myAccount), and
  `index.ts` (barrel that registers all injected endpoints).
- Hooks resolve to the full envelope `ApiSuccess<T>` (`{success,data,meta?}`).
- `src/store/index.ts` wires `saasadminApi`.
- `src/services/auth/` (`authSlice`, `tokenStore`) and
  `src/services/authorization/` are kept. `tokenStore` gained refresh-token
  helpers (`getRefresh/setRefresh/clearRefresh`, key `osticket_refresh_token`).
- Auth helpers in `saasadmin/auth.ts`: `runLogin`, `runMfaVerify`, `runLogout`,
  `mapProfileToAuthUser`, `apiErrorMessage` (alias `loginErrorMessage`).
- Auth screens (`LoginPage`, `MfaPage`, `AccountRecoveryPages`, `RegisterPage`)
  now use `@services/saasadmin`. RegisterPage is invitation-acceptance only
  (backend has no self-register/confirm-email endpoints; `/confirm-email` is a
  static page). `useRolePresets` uses static fallbacks (no `roleApi`).

## SaaS Admin generic resource engine (2026-10-11)

Most SaaS Admin sidebar sections are now config-driven screens instead of bespoke
components:

- `src/screens/saas-admin/components/resource/` — engine:
  - `types.ts`: `ResourceListConfig`, `ConfigPanelConfig`, `ResourceRow`
    (`Record<string, unknown>`), `ResourceQueryResult`, `ResourceMutationResult`
    (RTK mutation tuple), `asQueryHook`/`asMutationHook` (casts so hooks can be
    stored on module-level configs), `VARIANT_FROM_STATUS`.
  - `helpers.ts`: `extractRows`, `extractValue`, `getField`, `matchFilter`,
    `displayValue`, `truncate`, `comparable`.
  - `FormFields.tsx`: `FieldInput`, `FormGrid`.
  - `ResourceListScreen.tsx`: search/filter/sort/pagination, stat cards,
    create-in-modal (`config.create`), row `actions`, `quickAction`
    (row mutation w/ toast + refetch), API or `kind:"static"` sources.
  - `ConfigPanelScreen.tsx`: get+update settings panel.
- Configs in `src/screens/saas-admin/resources/` — one file per sidebar
  section (`serviceManagement.tsx`, `slaManagement.tsx`, … `approvals.tsx`,
  `myAccount.tsx`) plus `columns.tsx` (col builders) and `index.ts`
  (aggregates `RESOURCE_LISTS`/`RESOURCE_PANELS` + `relativePath`).
- `saasAdminRoutes.tsx` maps `RESOURCE_LISTS`→`ResourceListScreen`,
  `RESOURCE_PANELS`→`ConfigPanelScreen`; dashboards/tenants/staff/my-account
  password remain bespoke.
- No backend subscription/billing endpoints exist, so the **Subscription
  Management** and **Billing & Payments** sidebar sections (and their nav
  items/routes) were removed entirely (2026-10-11). ITSM module panels wrap
  `useGetItsmModuleQuery(moduleKey)` in a lambda via `asQueryHook`.
- `create-plan` and `plan-limits/:planId` nav items were removed along with
  the subscription section.
- Repeated on the 2026-10-10 tenant/staff work: hidden sidebar items are
  `hidden: true` in `src/navigation/saasAdminNavigation.tsx`.

## Role-based auth gate (2026-10-11)

Frontend login is now wired end-to-end to the backend (`runLogin` → `/auth/login`,
`LoginPage` is the real flow; `SignInScreen` was dead code). SaaS-admin surface is
permission-gated against the backend catalog:

- `RequireSession` (`src/app/auth/RequireSession.tsx`): only `AUTH_PUBLIC_PATHS`
  are public now. Signed-out users → `/login` (with `returnTo`). Signed-in users
  on auth paths → `firstAccessibleSaasAdminPath(permissions)` (falls back to
  `/instances/<id>/work`).
- `src/navigation/saasAdminNavigation.tsx`: sections and items carry
  `areas?: string[]` mapping to backend `accessibleAreas` (→ requirement
  `admin.<area>.*`, matched via `canAny`). Helpers:
  `itemPermissionGrants`, `canViewSaasAdminItem`, `canAccessSaasAdmin`
  (any `admin.*` or `*`), `firstAccessibleSaasAdminPath`. `my-account`
  has no areas (visible to any SaaS admin); platform owner holds `*`.
- `SaasAdminSidebar` filters sections/items by `canViewSaasAdminItem`;
  empty sections dropped. `SaasAdminSurface` renders `Unauthorized` when the
  session has no `admin.*` access and an inline "Access restricted" panel when
  the current route's item is not permitted.
- Permission matcher lives in `src/services/authorization/permissions.ts`
  (`canAny`/`matchesGrant`, mirrors backend grant matcher).
- Tests: `src/navigation/__tests__/saasAdminAccess.test.ts`; `tests/setup.ts`
  restored (was missing, broke `pnpm run test`).

## Common auth API module (2026-10-13)

The auth endpoints/helpers moved out of `saasadmin` into a shared module so every
surface (SaaS admin now; tenant/ITSM later) uses one implementation:

- `src/services/http.ts` — shared transport: `API_URL` (from `VITE_API_URL`,
  default `http://localhost:3008/api/v1`), envelope types (`ApiSuccess`,
  `ApiErrorBody`, `ApiErrorDetail`, `PaginationMeta`), `baseQueryWithAuth`
  (token attach + `401` → one shared silent `POST /auth/refresh` with the
  stored refresh token, retry the request; refresh impossible/failed →
  `logout()`; `/auth/login`, `/auth/refresh`, `/auth/mfa/verify`,
  invitation + password-reset URLs are exempt so bad credentials never
  clear a session), `apiErrorMessage` (alias `loginErrorMessage`; unwraps
  the RTK `{status,data}` rejection so server messages surface).
- `src/services/auth/authApi.ts` — canonical `authApi`
  (`reducerPath: "authApi"`, `baseQuery: baseQueryWithAuth`) with all endpoints
  (`login`, `refresh`, `me`, `logout`, `acceptInvitation`, `forgotPassword`,
  `resetPassword`, `changePassword`, `mfa*`, `listSessions`, `revokeSession`)
  plus helpers `runLogin`, `runMfaVerify`, `runLogout`, `mapProfileToAuthUser`.
- `src/services/auth/types.ts` — auth types (`PublicProfile`, `AuthSessionPayload`,
  `Login*`, `MeResponse`, `SessionRecord`, `MessageResponse`); `auth/index.ts`
  barrels slice + tokenStore + types + authApi.
- `src/services/saasadmin/auth.ts` is now a back-compat `export *` shim;
  `saasadmin/base.ts` reuses `baseQueryWithAuth` + `API_URL` from `@services/http`;
  `saasadmin/types.ts` re-exports the moved envelope/auth types.
- `src/store/index.ts` registers both `saasadminApi` and `authApi`.
- Auth screens import from `@services/auth` (`LoginPage`, `MfaPage`,
  `RegisterPage`, `AccountRecoveryPages`, `resources/ChangePasswordScreen.tsx`).
  Generic resource screens keep importing `apiErrorMessage` from
  `@services/saasadmin` (re-exported).

## Roles in session + permission-aware post-login (2026-10-13)

Backend login already returns `roles: string[]` (plus `permissions`,
`accessibleAreas`); the frontend now persists the **full roles array** rather
than just `roles[0]`:

- `AuthUser` gained `roles?: string[]` (`src/types/index.ts`); `authSlice`
  carries `roles` (state, init, `sessionSet`, `logout`) + `selectRoles`;
  `tokenStore` gained `getRoles/setRoles` (key `osticket_roles_json`);
  `mapProfileToAuthUser` and the `sessionSet` payload include `roles`.
- Post-auth navigation is now permission-driven and shared:
  `src/app/auth/postAuthDestination.ts` → `firstAccessibleSaasAdminPath(perms)`
  ?? `/instances/<id>/work` (mirrors `RequireSession`). `LoginPage` fallback no
  longer hardcodes `/saas-admin/dashboard/overview`; `MfaPage` no longer
  navigates to the dead `/platform`. Both read the just-returned
  `permissions` from the login/MFA payload.
- Behavior verified live (backend `:3008`): owner `platform.owner@example.com`
  → roles `["platform-owner"]`, 52 perms, 22 areas; created staff
  `support.manager@example.com` (role `support-manager`) → 7 perms, areas
  `dashboard/reports/support/tenants`; ITSM/empty sessions → `canAccessSaasAdmin`
  false → `Unauthorized` + fallback `/instances/<id>/work`.
- Tests: `src/app/auth/__tests__/postAuthDestination.test.ts`,
  `src/services/auth/__tests__/authSession.test.ts` (full suite 5 files / 59).

## SaaS-admin dummy-data removal + API wiring (2026-10-13)

All bespoke SaaS-admin screens were rewritten to use real `@services/saasadmin`
hooks; hardcoded/mock data and no-API panels were removed. Build + tests pass
(`pnpm run build`, `pnpm run test` → 5 files / 59).

- Static panels with no backend endpoint deleted or reduced: `resources/
supportManagement.tsx` (announcements/maintenanceNotices), `resources/
platformSettings.tsx` (fileStorageRows), `resources/systemAdministration.tsx`
  (appLogs/backups). Corresponding nav items removed from
  `src/navigation/saasAdminNavigation.tsx`: `announcements`,
  `maintenance-notices`, `file-storage-settings`, `application-logs`,
  `backup-recovery` (`database-status` retained).
- Bespoke screens wired: dashboard `OverviewScreen`
  (`useDashboardSummaryQuery`, `useDashboardRecentActivityQuery`);
  staff-management `StaffAccountsScreen`, `CreateStaffScreen`,
  `RolesManagementScreen`, `RoleAssignmentScreen`,
  `PermissionsManagementScreen`, `AccessAuditLogsScreen`; tenants
  `AllTenantsScreen`, `CreateTenantScreen`, `TenantDetailsScreen`,
  `TenantConfigurationScreen`, `TenantStatusScreen`.
- **Gotcha (corrected):** backend list controllers call `paginated(res, rows,
meta)` → `{ success:true, data: <array>, meta:{page,limit,total,...} }`. So
  `data.data` IS the bare array and `data.meta` is the pagination meta (verified
  live). The service layer returns `{rows, meta}` internally but the controller
  flattens it. (An earlier note claimed `data` was `{rows,meta}` — that was
  wrong and caused empty-table bugs in AllTenants/TenantStatus/TenantDetails/
  AccessAuditLogs, since fixed.)
- **Gotcha:** `Field` (`src/components/common/ui.tsx`) has no `error` prop —
  render error text manually. `ErrorState` from `@components/common/ui`;
  `apiErrorMessage` from `@services/http`. `Select` accepts `className`.
- Key response shapes (see backend services/validators):
  - dashboard summary: `{ tenants:{total,active,suspended,provisioning,
archived,failed}, staff:{total,active,invited,mfaEnabled,
mfaAdoptionPercent}, support:{openTickets}, approvals:{pending},
integrations:{enabled,error}, webhooks:{active}, generatedAt }`.
  - staff row: `id,email,firstName,lastName,displayName,phone,jobTitle,
timezone,locale,userType,status(INVITED|ACTIVE|SUSPENDED|DEACTIVATED),
mfaEnabled,lastLoginAt,roles[],roleIds[]`; `createStaff` always starts
    status `INVITED`.
  - role row: `id,key,name,description,isSystem,permissionCodes,permissions[],
memberCount`. Permission catalog groups by `module`.
  - audit event: `action,resourceType,resourceId,outcome(SUCCESS|FAILURE|
DENIED),actorEmail,actorId,tenantId,ipAddress,metadata,createdAt`.
  - tenant: `status(PROVISIONING|ACTIVE|SUSPENDED|ARCHIVED|FAILED)`,
    `provisioningStatus`, `suspendedAt/suspendedReason`,
    `archivedAt/archivedReason`, `_count{memberships,domains,...}`.
    `updateTenantSchema` accepts name/primaryContactName/primaryContactEmail/
    timezone/locale/industry/website/notes/metadata; suspend/archive require
    `reason` (min 4). TenantConfigurationScreen edits exactly these fields.
- Role detail/form screens added (fixes roles list View/Edit/Create 404s):
  `staff-management/roles-management/RoleDetailsScreen.tsx` (view role meta,
  grouped permission chips, members table; delete when custom `isSystem:false`
  - `memberCount:0`) and `RoleFormScreen.tsx` (create + edit; create POSTs
    `createRole` with `{key,name,description,permissionCodes}`; edit PATCHes
    `updateRole` then PUTs `setRolePermissions` only when permission set changed;
    system-role key disabled). Routes in `saasAdminRoutes.tsx`:
    `staff-management/roles/new`, `staff-management/roles/edit/:roleId`,
    `staff-management/roles/:roleId`.
- **Fixed:** `PermissionsManagementScreen` read `getRolePermissions` as
  `string[]` and sent `{permissions}`. Backend returns
  `{roleId,roleKey,roleName,permissionCodes,permissions[]}` and expects
  `{permissionCodes}` on PUT (`setRolePermissionsSchema`). Both corrected in
  `services/saasadmin/roles.ts` (types) and the screen. Verified live:
  create role → set permissions with `permissionCodes` → 200 + correct codes.

## Backend admin surface is complete (2026-10-15)

The sibling backend (`../backend`, Express + Prisma, base `/api/v1`) exposes the
**full** SaaS-admin surface — 278 endpoints across 24 route modules under
`/admin/*` (`src/routes/index.ts` `API_MOUNTS`, routers `src/routes/saasadmin/*.routes.ts`,
controllers/services `src/controllers|services/saasadmin/*`). Every one is
`authenticate`-gated globally and `authorize('admin.*')`-gated per route; all
Prisma-backed (no stubs/TODOs). So frontend work is wiring, not inventing
endpoints. Notable gaps vs the ITSM spec: no modules/entitlements create-time
input (`createTenantSchema` accepts only name/slug/contact/timezone/locale/
industry/website/notes/metadata), no staff sessions _list_ endpoint (only
`revoke-sessions`), no access-reviews API, no per-tenant sessions; `reports/run`
is synchronous. List endpoints use `parseListQuery` (`page,limit,search,sortBy,
sortOrder` + per-resource filter fields) and return `{data, meta:{page,limit,
total,totalPages,hasNextPage,hasPreviousPage}}`.

## Shared resource-engine + shell hardening (2026-10-15)

- `resource/MutationBridge.tsx`: child that calls a mutation hook
  **unconditionally** and hands its trigger to the parent via ref callback —
  replaces the old conditional `create ? create.useCreate() : [null,null]`
  pattern in `ResourceListScreen`/`ConfigPanelScreen`.
- `resource/types.ts`: `ResourceDataSource.serverPagination?`/`extractTotal?`;
  `ResourceRowAction.confirm?`/`ResourceQuickAction.confirm?`;
  `ConfigPanelConfig.getVersion?`.
- `resource/helpers.ts`: `extractTotal(payload)` (total|count|totalCount|
  meta.total|pagination.total|data.total).
- `resource/FormFields.tsx`: `FieldInputProps.error?`, `FieldError`,
  `FormGrid errors?`, exported `validateRequiredFields(fields,values)`.
- `ResourceListScreen`: server-pagination path (renders returned page; total
  from aggregate), page resets on search/filter/size change, create-modal
  required-field validation, confirm prompts for quick + row actions.
- `ConfigPanelScreen`: dirty tracking (`JSON.stringify` form vs loaded),
  `beforeunload` guard, Reset button, save disabled until dirty, required-field
  validation, optional version display.
- `SaasAdminSurface`: bare `/saas-admin` redirects to
  `firstAccessibleSaasAdminPath`; unknown route → `NotFound`
  (`@app/layouts/NotFound`); no more misleading first-item fallback. Verified all
  83 registered route paths still match a nav pattern (regex `^<path>(/.*)?$`).

## Tenant + dashboard enhancements (2026-10-15)

- `AllTenantsScreen`: now **server-side** pagination/filter/sort — query state in
  URL search params (`page,limit,q,status,sortBy,sortOrder`), total from
  `data.meta.total`, KPI cards from `useDashboardTenantStatusQuery`
  (`{byStatus:[{status,count}],byProvisioning}`), bulk suspend/reactivate/archive
  over selection, provision-polling every 10s when a page row is `PROVISIONING`.
- `TenantDetailsScreen`: added **Domains** tab (`listTenantDomains` +
  create/verify/activate/disable/delete, delete/disable confirmed) and
  **Lifecycle** tab (`tenantProvisioningStatus` → `{tenant, latestRun, recentJobs}`,
  provision/retry via `useProvisionTenantMutation`). Tabs now:
  overview/users/domains/health/lifecycle/activity.
- `DashboardOverviewScreen`: 6 KPI cards (tenants %, staff MFA %, tickets,
  approvals, integration errors, platform health) linking to real nav paths,
  alerts panel (`useDashboardAlertsQuery`, severity-mapped), tenant growth
  **recharts** LineChart (`useDashboardTenantGrowthQuery`, 90d), status breakdown
  bars (`useDashboardTenantStatusQuery`), work-queue summary
  (`useDashboardWorkQueueQuery`). `recharts@^3.10.1` is a dependency (bundle now
  ~1 MB — needs route-level code-splitting). Backend alert `link`s use paths that
  do not all match frontend nav, so `resolveAlertLink` validates against
  `SAAS_ADMIN_NAVIGATION` before rendering a View button.
- Real nav paths (used by the above): approvals
  `/saas-admin/approval-management/pending|policies|workflows|history`; integrations
  `/saas-admin/integrations-api/directory|api-keys|webhooks|sso|oauth|logs`; jobs
  `/saas-admin/system-administration/background-jobs`; support
  `/saas-admin/support-management/tickets`; health
  `/saas-admin/system-administration/health`.

## Staff & access increment (2026-10-15)

- `StaffAccountsScreen`: now **server-side** pagination/filter/sort with
  URL-persisted state (`page,limit,q,status,sortBy,sortOrder`); KPI counts come
  from `useListStaffQuery({limit:1})` `meta.total` per status
  (`ACTIVE`/`INVITED`/`SUSPENDED`) — there is no aggregate endpoint. Sortable
  keys are the backend's: `firstName,lastName,email,status,createdAt,lastLoginAt`.
  Destructive row actions (Disable, Revoke Sessions) now go through
  `ConfirmDialog`; Enable wraps `activateStaff` with toast + refetch. Removed the
  role filter (backend `listStaff` filters only by `status`/`search`; roles are
  not filterable) and the MFA KPI (no aggregate — shown as a per-page note).
- Backend `listStaff` (`backend/src/services/saasadmin/staff.service.ts`)
  serializes `roles`, `roleIds`, `roleAssignments` via `serializeStaff`, so
  `RoleAssignmentScreen` (reads `row.roleIds`) and `StaffAccountsScreen` (reads
  `row.roles`) are correct. Staff statuses: `INVITED|ACTIVE|SUSPENDED|DEACTIVATED`.
- Confirmed already-complete: `RoleDetailsScreen` (delete guarded by
  `ConfirmDialog` + system-role/member checks), `RoleFormScreen` (slug/key
  validation, dirty tracking, system-key lock), `PermissionsManagementScreen` and
  `RoleAssignmentScreen` (staging UI with dirty-gated save).
- New `src/hooks/useUnsavedChanges.ts` (`beforeunload` guard when `dirty`), wired
  into `RoleFormScreen`, `PermissionsManagementScreen`, `RoleAssignmentScreen`
  (mirrors `ConfigPanelScreen`).
- Config-driven resource lists (`resources/*.tsx`) are read-only + create only
  (no row actions), so action `confirm` isn't applicable. API-key/webhook
  one-time secret reveal + rotation and dependency/SoD warnings remain gaps
  (need shared-screen create-result handling and/or backend fields).

## Resource action + secret-reveal engine (2026-10-15)

- `MutationBridge` now exposes an **`.unwrap()`-wrapped** trigger, so mutation
  failures reject (error toasts fire) and callers receive the parsed response
  body. (Previously the raw trigger resolved on HTTP errors too.)
- `resource/types.ts`: `RevealPayload`; `ResourceCreateConfig.reveal?(result)`;
  `ResourceRowAction` gains `useAction?`/`buildArg(row, input?)`/
  `successMessage?`/`reveal?`/`promptFor?` and `onClick` is now optional.
- `resource/helpers.ts`: `mutationBody(result)` drills nested `data` envelopes
  (RTK result → API `{success,data}` → payload) to reach `{ secret, ... }`.
- New `resource/RevealModal.tsx`: copy/reveal modal for one-time secrets.
- `ResourceListScreen`: renders a `MutationBridge` per mutation-backed row
  action, runs them with busy state + confirm + optional `promptFor` text input,
  and shows the reveal modal after create/action. `resources/*.tsx` configs can
  now declare `actions`/`reveal`.
- Wired (backend endpoints already existed): API keys — Rotate (reveals new
  secret) + Revoke; Webhooks — Send Test / Enable / Disable / Rotate Secret
  (reveal) + create reveal; Integration Directory — Test / Enable / Disable;
  Approvals — pending Approve/Reject (reject prompts for required reason),
  history Cancel, policies Enable/Disable; Background Jobs — Retry / Cancel;
  Workflow templates — Validate / Publish / Retire; workflow runs — Cancel;
  Service Catalog — Enable/Disable; Service Templates — Publish; SLA Policies —
  Enable/Disable; Email Providers — Verify/Send Test/Disable; Notification
  Rules — Enable/Disable; Support Tickets — Reply/Resolve/Reopen; Access
  Policies — Enable/Disable; Audit Logs — Export CSV (prompts required reason);
  Report Catalog — Run (`{reportKey,limit}`), report-run lists — Export CSV
  (prompt required reason); Email Templates — Preview (renders subject/body via
  the reveal modal, surfaces `missingVariables`).
  Backend shapes: api-key + webhook create/rotate return `{ apiKey|webhook,
secret }`; `rejectApprovalSchema` requires `reason` (min 4); `auditExportSchema`
  requires `reason` (min 4) + `format` default CSV; ticket `replyTicketSchema`
  requires `body`, `resolveTicketSchema` optional `resolutionNote`.
- `ResourceListScreen.runRowAction`: confirm runs first, then `promptFor`
  (modal `PromptDialog` since 2026-10-19; required-empty aborts), then optional
  reveal of result.

## Feedback + auth hardening (2026-10-19)

- **Toasts now render**: `ToastContainer` (`components/common/Toast/
  ToastContainer.tsx`) returns `<Toaster position="top-right" />` (it
  previously returned `null`, so all 38 `toast.*`/`showSuccess`/`showConfirm`
  calls were invisible). It is mounted **once** in `AppProviders`
  (`src/app/providers/index.tsx`) — do NOT mount it again in screens
  (duplicate mount = double toasts; auth-screen mounts were removed).
- **Silent refresh**: `baseQueryWithAuth` attempts one shared in-flight
  `POST /auth/refresh` (plain `fetch`, refresh token from `TokenStore`) on
  401, retries the original request, `logout()` only if refresh fails.
  Credential endpoints (login/refresh/mfa-verify/invitation/password-reset)
  are exempt. Refresh request is deduplicated across parallel 401s.
- `apiErrorMessage` unwraps the RTK `{status,data}` rejection before reading
  the envelope — passing the raw error OR `.data` both work; ~15 call sites
  no longer collapse to "Request failed".
- Tenant suspend/reactivate (TenantDetails + TenantStatus) and role delete
  (RolesManagementScreen) now have catch + success toasts (were
  try/finally-without-catch / fire-and-forget).

## Modal dialogs, code-splitting, org-admin honesty (2026-10-19)

- **No native dialogs**: `window.prompt`/`window.confirm` are gone from `src/`
  (only `alert`-free code remains). `ResourceListScreen` uses promise-based
  `askConfirm`/`askPrompt` backed by `ConfirmDialog` + new
  `resource/PromptDialog.tsx` (validates required + `promptFor.minLength`);
  `ConfirmDialog` accepts `children` (slots for reason fields).
- Tenant suspend reason (TenantDetails + TenantStatus) is a validated textarea
  (min 4 chars, backend `suspendTenant` requirement) inside the `ConfirmDialog`
  — no `window.prompt`. `RolesManagementScreen` delete uses `ConfirmDialog`.
- **Code-split** (initial chunk 1.27 MB → ~892 kB / gzip ~212 kB):
  `DashboardOverviewScreen` (recharts, own 346 kB async chunk),
  `OrganizationAdminPage`, `RecordDetailPage` are `React.lazy`; `AppRoutes`
  wraps the `useRoutes` tree in `<Suspense>` with a light "Loading…" fallback.
- **Org-admin honesty** (approach: stop lying first): fake save/delete
  toasts removed. `OrganizationAdminPage` form + settings and `RecordDetailPage`
  edit show amber "Not connected yet — changes are not saved" notices; Save
  buttons disabled; Delete fires an info toast stating nothing was removed.
  Real API wiring landed 2026-10-19 (see next section).
- **Config cleanup**: dangling `@features`/`@portal` aliases removed from
  `tsconfig.json`, `vite.config.ts`, `vitest.config.ts` (dirs never existed,
  zero imports); `permissions:generate` script removed from `package.json`
  (`scripts/` absent; `itsmPermissions.generated.ts` kept as-is).
- Root `AGENTS.md` corrected: `tests/setup.ts` exists (96 tests pass),
  `permissions:generate` removed, `screenRegistry.ts` is a static array,
  `src/app/routes/` empty, `src/features/` bullets dropped, alias table synced.

## Org-admin wiring pass (2026-10-19)

- **Coverage**: all 387 org-admin nav leaves are either wired to a real
  backend screen or land on an honest "Not connected yet" fallback.
  301 wired / 86 honest leftovers (no backend endpoint exists for them —
  checked against `backend/src` routes/validators). Decisions: dead-code
  purge of the sample-pool page model stays skipped per user; the honest
  fallback pages (`OrganizationAdminPage`, `RecordDetailPage`) remain for
  the 86.
- **Wiring surfaces** (all under `src/screens/organization-admin/`):
  - `resources/orgSettings.tsx` — `settingsValuePanel(key)` helper: panels
    for UPLOAD/RETENTION/FEATURES keys via `useListSettingsQuery` +
    `putSetting {key,value}`; config-history + reset panels removed (no
    endpoints; config-history aliased to audit-logs, reset stays honest).
  - New panels: knowledge publishing-rules (knowledge settings API),
    change-password (`POST /auth/change-password` via `myAccountApi`),
    security-overview (synthetic metric rows over `SecurityOverview`).
  - `resources/roles.tsx` — 4 permission-list configs from
    `useListTenantPermissionsQuery` (`/tenant-admin/permissions`).
  - `resources/workflows.tsx` — approval review queue over
    `useListApprovalRequestQuery` (filters: status/actionKey/resourceType).
  - `resources/reports.tsx` — 2 more `reportCatalogConfig` entries (all 25
    report-catalog configs are wired; factory lives in `reports.tsx`).
  - `resources/helpSupport.tsx` — fake contact/service-status rows emptied
    with honest copy; knowledge article reuse for docs leaves; support
    create forms fixed to uppercase priority enums (backend zod).
  - `pages/tenant/` — `ResourceCreateScreen` (generic standalone create
    page wired to each list config's `create` block), `RolePermissionMatrixPage`
    (roles × permission catalog checkbox matrix, GET/PUT role permissions),
    `index.tsx` = `TENANT_SCREEN_ROUTES` (7 creates + matrix).
  - `organizationAdminRoutes.tsx` — route order: lists → `/:recordId` →
    `TENANT_RESOURCE_PANELS` (`ConfigPanelScreen`) → `TENANT_SCREEN_ROUTES`
    → `LEAF_ALIASES` (~125 `<Navigate replace>` pairs, exported) → honest
    `leafRoutes` → `/:recordId`. Alias rule: target must be same resource
    or a superset view; never invent endpoints.
- **Bug fixed**: `cmdbApi.ts` exported `useListAssetMaintenanceQuery` in the
  API slice but not from the module — org-admin routes crashed at module
  eval. Added it + `useCreateAssetMaintenanceMutation` to the destructure.
- **Regression guard**: `src/screens/organization-admin/__tests__/navCoverage.test.ts`
  — computes covered sets (lists + panels + tenant screens + customers +
  alias sources) and fails if any nav leaf is uncovered outside the pinned
  `HONEST_LEFTOVERS` set (86 paths). One-directional: wiring more shrinks
  uncovered without test edits; new nav leaves must be wired or consciously
  added to the list. `organizationAdminSidebarVisibility.test.ts` ported off
  the deleted `pageModel` to `TENANT_SCREEN_ROUTES`.
- Build: initial chunk 922 kB (gzip 218 kB); 11 test files / 96 tests green.
