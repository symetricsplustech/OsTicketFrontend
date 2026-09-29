# Project Index

Last Updated: 2026-09-23
Project: osTicket Frontend
Project Type: React Frontend (TypeScript)

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
- API layer via RTK Query (`baseApi` + injected endpoints)

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
