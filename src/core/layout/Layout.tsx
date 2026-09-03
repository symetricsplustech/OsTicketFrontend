import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@core/auth/useAuth';
import { useGetNotificationsQuery, useMarkReadMutation, useMarkAllReadMutation, useGlobalSearchQuery, useMyApprovalsQuery } from '@shared/store/apiEndpoints';
import { LayoutDashboard, Ticket, AlertTriangle, Search, BookOpen, ShoppingCart, Server, Users, UserPlus, Phone, BarChart3, Briefcase, FolderKanban, Heart, Wrench, Zap, Settings, Shield, ShieldCheck, Clock, Calendar, MessageSquare, DollarSign, FileText, Flag, Mail, Play, RotateCcw, Package, BoxesIcon, Network, ShieldAlert, Scale, Building2, Gavel, Calculator, Leaf, Layers, CloudCog, Megaphone, Target, Package2, CreditCard, Bell, Inbox, Repeat, MapPin, Store, ScanBarcode, Users2, KeyRound, Grid3x3, Radio, GitBranch, FileStack, MapPinned, ScrollText, HeartPulse, LineChart, Truck, Send, Database, Upload, CheckCircle, Table2, Plus, PanelLeftClose, PanelLeftOpen, Activity } from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
  module?: string;
  permission?: string;
  section?: string;
}

const allNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  // Helpdesk
  { label: 'Tickets', path: '/tickets', icon: Ticket, module: 'helpdesk', section: 'Helpdesk' },
  { label: 'Incidents', path: '/incidents', icon: AlertTriangle, module: 'helpdesk' },
  { label: 'Problems', path: '/problems', icon: Search, module: 'helpdesk' },
  { label: 'Changes', path: '/changes', icon: Zap, module: 'helpdesk' },
  { label: 'Knowledge Base', path: '/kb', icon: BookOpen, module: 'helpdesk' },
  { label: 'Service Catalog', path: '/catalog', icon: ShoppingCart, module: 'helpdesk' },
  { label: 'Playbooks', path: '/playbooks', icon: Play, module: 'helpdesk' },
  { label: 'On-Call', path: '/oncall', icon: Calendar, module: 'helpdesk' },
  { label: 'Templates', path: '/templates', icon: FileText, module: 'helpdesk' },
  { label: 'Outages', path: '/outages', icon: AlertTriangle, module: 'helpdesk' },
  { label: 'Change Calendar', path: '/change-calendar', icon: Calendar, module: 'helpdesk' },
  { label: 'PIR', path: '/pir', icon: FileText, module: 'helpdesk' },
  { label: 'War Room', path: '/warroom', icon: MessageSquare, module: 'helpdesk' },
  { label: 'Diagnosis', path: '/diagnosis', icon: Search, module: 'helpdesk' },
  { label: 'Ticket Board', path: '/ticket-board', icon: LayoutDashboard, module: 'helpdesk' },
  { label: 'Handover', path: '/shift-handover', icon: Repeat, module: 'helpdesk' },
  { label: 'KB Insights', path: '/knowledge-insights', icon: FileText, module: 'helpdesk' },
  { label: 'Priority Matrix', path: '/priority-matrix', icon: Grid3x3, module: 'helpdesk' },
  { label: 'My Work', path: '/my-work', icon: Inbox, module: 'helpdesk' },
  { label: 'Major Incidents', path: '/major-incidents', icon: ShieldAlert, module: 'helpdesk' },
  { label: 'CAB Board', path: '/cab', icon: Gavel, module: 'helpdesk' },
  { label: 'Requests', path: '/requests', icon: Package, module: 'helpdesk' },
  { label: 'Known Errors', path: '/known-errors', icon: FileStack, module: 'helpdesk' },
  { label: 'Escalations', path: '/escalations', icon: Flag, module: 'helpdesk' },
  { label: 'SLA Monitor', path: '/sla-monitor', icon: Clock, module: 'helpdesk' },
  { label: 'Assignment', path: '/assignment', icon: GitBranch, module: 'helpdesk' },
  { label: 'CSAT', path: '/csat', icon: Heart, module: 'helpdesk' },
  { label: 'HD Reports', path: '/helpdesk-reports', icon: LineChart, module: 'helpdesk' },
  { label: 'HD Admin', path: '/helpdesk-admin', icon: Layers, module: 'helpdesk' },
  { label: 'Audit Trail', path: '/audit-trail', icon: ScrollText, module: 'helpdesk' },
  // CRM
  { label: 'Leads', path: '/leads', icon: UserPlus, module: 'crm', section: 'CRM' },
  { label: 'Accounts', path: '/accounts', icon: Briefcase, module: 'crm' },
  { label: 'Contacts', path: '/contacts', icon: Users, module: 'crm' },
  { label: 'Opportunities', path: '/opportunities', icon: BarChart3, module: 'crm' },
  { label: 'Pipeline', path: '/pipeline', icon: BarChart3, module: 'crm' },
  { label: 'Quotes', path: '/quotes', icon: BarChart3, module: 'crm' },
  { label: 'Price Books', path: '/price-books', icon: DollarSign, module: 'crm' },
  { label: 'Sequences', path: '/sequences', icon: RotateCcw, module: 'crm' },
  { label: 'Segments', path: '/segments', icon: Users, module: 'crm' },
  { label: 'Duplicates', path: '/duplicates', icon: AlertTriangle, module: 'crm' },
  { label: 'CRM Reports', path: '/crm-reports', icon: BarChart3, module: 'crm' },
  { label: 'E-Signatures', path: '/esign', icon: FileText, module: 'crm' },
  { label: 'Growth', path: '/growth-tools', icon: Megaphone, module: 'crm' },
  { label: 'Capture Forms', path: '/lead-capture', icon: Radio, module: 'crm' },
  { label: 'Pipelines+', path: '/sales-pipelines', icon: GitBranch, module: 'crm' },
  { label: 'Quote Versions', path: '/quote-versions', icon: FileStack, module: 'crm' },
  // ITAM
  { label: 'Assets', path: '/assets', icon: Server, module: 'itam', section: 'IT Asset Mgmt' },
  { label: 'Inventory', path: '/inventory', icon: Package, module: 'itam' },
  { label: 'Licenses', path: '/licenses', icon: ShieldCheck, module: 'itam' },
  { label: 'Asset Labels', path: '/asset-labels', icon: FileText, module: 'itam' },
  { label: 'Software Policy', path: '/prohibited-software', icon: AlertTriangle, module: 'itam' },
  { label: 'Asset Scanner', path: '/audit-scanner', icon: ScanBarcode, module: 'itam' },
  { label: 'SW Governance', path: '/software-governance', icon: Package2, module: 'itam' },
  { label: 'Vendor Pack', path: '/vendor-pack', icon: Package2, module: 'itam' },
  // ITOM
  { label: 'Resources', path: '/resources', icon: Server, module: 'itom', section: 'IT Ops Mgmt' },
  { label: 'Alerts', path: '/alerts', icon: AlertTriangle, module: 'itom' },
  { label: 'Ops Tools', path: '/ops-tools', icon: Settings, module: 'itom' },
  { label: 'Service Map', path: '/service-map', icon: LayoutDashboard, module: 'itom' },
  { label: 'Ops Gov', path: '/ops-governance', icon: CloudCog, module: 'itom' },
  { label: 'Discovery', path: '/discovery-schedules', icon: Database, module: 'itom' },
  // Projects
  { label: 'Projects', path: '/projects', icon: FolderKanban, module: 'projects', section: 'Projects' },
  { label: 'Project Templates', path: '/project-templates', icon: FileText, module: 'projects' },
  { label: 'Project Issues', path: '/project-issues', icon: AlertTriangle, module: 'projects' },
  { label: 'Timesheets', path: '/timesheets', icon: Clock, module: 'projects' },
  { label: 'Project Risks', path: '/project-risks', icon: AlertTriangle, module: 'projects' },
  { label: 'Gantt', path: '/gantt', icon: BarChart3, module: 'projects' },
  { label: 'Task Board', path: '/project-board', icon: LayoutDashboard, module: 'projects' },
  { label: 'Portfolio', path: '/portfolio', icon: FolderKanban, module: 'projects' },
  { label: 'Allocation', path: '/resource-allocation', icon: Users, module: 'projects' },
  { label: 'Planning', path: '/planning-extras', icon: Target, module: 'projects' },
  // HR
  { label: 'HR', path: '/hr', icon: Heart, module: 'hr', section: 'HR' },
  { label: 'HR Catalogue', path: '/hr-catalogue', icon: ShoppingCart, module: 'hr' },
  { label: 'Onboarding', path: '/onboarding', icon: Users, module: 'hr' },
  { label: 'Doc Requests', path: '/document-requests', icon: FileText, module: 'hr' },
  { label: 'Policies', path: '/policies', icon: ShieldCheck, module: 'hr' },
  { label: 'Employee Portal', path: '/employee-portal', icon: Users, module: 'hr' },
  { label: 'Manager Hub', path: '/manager-hub', icon: Users2, module: 'hr' },
  { label: 'HR Templates', path: '/hr-doc-templates', icon: FileText, module: 'hr' },
  { label: 'Promotions', path: '/hr-promotions', icon: Users2, module: 'hr' },
  { label: 'HR Access', path: '/settings/hr-access', icon: Shield, module: 'hr' },
  // Field Service
  { label: 'Work Orders', path: '/work-orders', icon: Wrench, module: 'field-service', section: 'Field Service' },
  { label: 'Availability', path: '/technician-availability', icon: Calendar, module: 'field-service' },
  { label: 'Dispatcher', path: '/dispatcher', icon: MapPinned, module: 'field-service' },
  { label: 'Marketplace', path: '/contractor-market', icon: Truck, module: 'field-service' },
  // CMDB
  { label: 'CMDB', path: '/cmdb', icon: Network, module: 'cmdb', section: 'CMDB' },
  // CSM
  { label: 'Customer Service', path: '/customer-service', icon: MessageSquare, module: 'csm', section: 'Customer Service' },
  { label: 'Partner Portal', path: '/partner-portal', icon: Users, module: 'csm' },
  { label: 'Communities', path: '/communities', icon: Users2, module: 'csm' },
  { label: 'Unified Inbox', path: '/unified-inbox', icon: Inbox, module: 'csm' },
  { label: 'Replies', path: '/social-replies', icon: Send, module: 'csm' },
  // SecOps
  { label: 'SecOps', path: '/secops', icon: ShieldAlert, module: 'secops', section: 'Security' },
  { label: 'Vuln Ops', path: '/vuln-ops', icon: ShieldCheck, module: 'secops' },
  { label: 'Patching', path: '/patch-campaigns', icon: ShieldCheck, module: 'secops' },
  // GRC
  { label: 'GRC', path: '/grc', icon: Scale, module: 'grc', section: 'GRC' },
  { label: 'Gov Extras', path: '/governance-extras', icon: ScrollText, module: 'grc' },
  // Workplace
  { label: 'Workplace', path: '/workplace', icon: Building2, module: 'workplace', section: 'Workplace' },
  { label: 'Floor Plans', path: '/floor-plans', icon: MapPin, module: 'workplace' },
  // Legal
  { label: 'Legal', path: '/legal', icon: Gavel, module: 'legal', section: 'Legal' },
  { label: 'Clauses', path: '/clause-library', icon: Scale, module: 'legal' },
  { label: 'OC Invoices', path: '/outside-counsel', icon: DollarSign, module: 'legal' },
  // Procurement
  { label: 'Procurement', path: '/procurement', icon: ShoppingCart, module: 'procurement', section: 'Procurement' },
  { label: 'Storefront', path: '/storefront', icon: Store, module: 'procurement' },
  { label: 'Spend', path: '/spend-analytics', icon: Truck, module: 'procurement' },
  // Finance & ESG
  { label: 'Finance', path: '/finance', icon: Calculator, module: 'finance', section: 'Finance' },
  { label: 'ESG', path: '/esg', icon: Leaf, module: 'esg', section: 'ESG' },
  // Workflow & Analytics
  { label: 'Workflows', path: '/workflows', icon: Zap, module: 'workflow', section: 'Workflow & Analytics' },
  { label: 'Workflow Logs', path: '/workflow-logs', icon: RotateCcw, module: 'workflow' },
  { label: 'Designer', path: '/workflow-designer', icon: Zap, module: 'workflow' },
  { label: 'Dec Tables', path: '/decision-tables', icon: Table2, module: 'workflow' },
  { label: 'Reports', path: '/reports', icon: BarChart3, module: 'analytics' },
  { label: 'Scheduled Reports', path: '/scheduled-reports', icon: FileText, module: 'analytics' },
  { label: 'Report Builder', path: '/report-builder', icon: BarChart3, module: 'analytics' },
  { label: 'Drill-Down', path: '/drilldown', icon: BarChart3, module: 'analytics' },
  { label: 'Chart Builder', path: '/chart-builder', icon: BarChart3, module: 'analytics' },
  { label: 'Dashboard Builder', path: '/dashboard-builder', icon: LayoutDashboard, module: 'analytics' },
  { label: 'Adv Views', path: '/advanced-views', icon: LineChart, module: 'analytics' },
  // AI
  { label: 'Otto AI', path: '/otto', icon: Zap, module: 'ai', section: 'AI' },
  { label: 'Agent Studio', path: '/agent-studio', icon: Zap, module: 'ai' },
  // Settings & Admin
  { label: 'Settings', path: '/settings', icon: Settings, module: 'settings', section: 'Admin' },
  { label: 'Modules', path: '/settings/modules', icon: Layers, module: 'settings' },
  { label: 'Compliance', path: '/settings/compliance', icon: Shield, module: 'settings' },
  { label: 'Billing', path: '/settings/billing', icon: CreditCard, module: 'settings' },
  { label: 'Notifications', path: '/settings/notifications', icon: Bell, module: 'settings' },
  { label: 'Integrations', path: '/settings/integrations', icon: Settings, module: 'settings' },
  { label: 'SSO / LDAP', path: '/settings/integrations-config', icon: Shield, module: 'settings' },
  { label: 'Delegations', path: '/settings/delegations', icon: Users, module: 'settings' },
  { label: 'Access Control', path: '/settings/access', icon: KeyRound, module: 'settings' },
  { label: 'Organisation Structure', path: '/settings/organization', icon: Building2, module: 'settings' },
  { label: 'Import Data', path: '/import-wizard', icon: Upload, module: 'settings' },
  { label: 'Orgs', path: '/org-switcher', icon: Building2 },
];

const platformNavItems: NavItem[] = [
  { label: 'Platform Dashboard', path: '/superadmin', icon: Shield, permission: 'platform.view_dashboard', section: 'Platform' },
  { label: 'Tenant Management', path: '/superadmin/tenants', icon: Building2, permission: 'platform.view_tenants' },
  { label: 'Plans & Pricing', path: '/superadmin/plans', icon: CreditCard, permission: 'platform.view_plans' },
  { label: 'New Tenant', path: '/superadmin/tenants/new', icon: Plus, permission: 'platform.manage_tenants' },
  { label: 'Module Management', path: '/superadmin/modules', icon: Layers, permission: 'platform.view_modules', section: 'Operations' },
  { label: 'Platform Operations', path: '/superadmin/operations', icon: Activity, permission: 'platform.view_operations' },
  { label: 'Audit Logs', path: '/superadmin/audit', icon: FileText, permission: 'platform.view_audit', section: 'Security & Compliance' },
  { label: 'Security Management', path: '/superadmin/security', icon: ShieldCheck, permission: 'platform.view_security' },
  { label: 'Platform Operators', path: '/superadmin/admins', icon: Users, permission: 'platform.view_superadmins', section: 'Administration' },
  { label: 'Global Settings', path: '/superadmin/settings', icon: Settings, permission: 'platform.view_platform' },
];

export default function Layout() {
  const { user, logout, hasModule, hasPermission } = useAuth();
  const { data: notifData } = useGetNotificationsQuery();
  const [markRead] = useMarkReadMutation();
  const [markAllRead] = useMarkAllReadMutation();
  const { data: approvals } = useMyApprovalsQuery();
  const [showNotifs, setShowNotifs] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { data: searchResults } = useGlobalSearchQuery(searchQ.length >= 2 ? searchQ : '');
  const totalUnread = notifData?.unread || 0;
  const approvalCount = Array.isArray(approvals) ? approvals.reduce((s2: number, a2: any) => s2 + (a2.count || 1), 0) : 0;
  const location = useLocation();

  const isPlatformAdmin = user?.role === 'superadmin';

  // Platform items visible to platform admins only
  const canSeePlatformItem = (item: NavItem): boolean => {
    if (!isPlatformAdmin) return false;
    if (item.permission && hasPermission(item.permission)) return true;
    return true;
  };

  // Module items visible to non-platform-admin users based on module/permission
  const canSeeModuleItem = (item: NavItem): boolean => {
    if (isPlatformAdmin) return false;
    if (!item.module && !item.permission) return true;
    if (item.module && hasModule(item.module)) return true;
    if (item.permission && hasPermission(item.permission)) return true;
    return false;
  };

  const visibleItems = allNavItems.filter(canSeeModuleItem);
  const visiblePlatformItems = platformNavItems.filter(canSeePlatformItem);

  const renderNavItem = (item: NavItem, colorClass: string) => {
    const isActive = location.pathname === item.path ||
      (item.path !== '/' && location.pathname.startsWith(item.path));
    const Icon = item.icon;
    return (
      <Link
        key={item.path}
        to={item.path}
        title={collapsed ? item.label : undefined}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? colorClass === 'purple'
              ? 'bg-purple-50 text-purple-700'
              : 'bg-brand-50 text-brand-700'
            : colorClass === 'purple'
              ? 'text-purple-600 hover:bg-purple-50 hover:text-purple-800'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        } ${collapsed ? 'justify-center px-2' : ''}`}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    );
  };

  const renderNavItems = () => {
    const elements: React.ReactNode[] = [];
    let lastSection: string | null = null;

    for (const item of visibleItems) {
      if (item.section && item.section !== lastSection) {
        lastSection = item.section;
        if (!collapsed) {
          elements.push(
            <div key={`section-${item.section}`} className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase text-gray-400 tracking-wider first:pt-1">
              {item.section}
            </div>
          );
        } else {
          elements.push(
            <div key={`section-${item.section}`} className="border-t border-gray-200 my-2 mx-2" />
          );
        }
      }
      elements.push(renderNavItem(item, 'brand'));
    }
    return elements;
  };

  const sidebarWidth = collapsed ? 'w-16' : 'w-64';

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className={`${sidebarWidth} bg-white border-r border-gray-200 flex flex-col transition-all duration-200`}>
        {/* Header */}
        <div className={`p-4 border-b border-gray-200 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && <h1 className="text-lg font-bold text-brand-600">Unified Platform</h1>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="px-3 pb-2 relative">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input value={searchQ} onChange={e => { setSearchQ(e.target.value); setShowSearchResults(e.target.value.length >= 2); }}
                placeholder="Search everything..." className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border rounded-md focus:bg-white focus:border-brand-300 outline-none transition-all" />
            </div>
            {showSearchResults && searchResults && (
              <div className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto">
                {(searchResults as any[]).map((r: any) => (
                  <Link key={`${r.entity}-${r.id}`} to={`/${r.module}`} className="block px-3 py-2 hover:bg-gray-50 border-b last:border-0">
                    <span className="text-[10px] uppercase text-brand-500 font-semibold">{r.label}</span>
                    <p className="text-sm truncate">{r.title}</p>
                  </Link>
                ))}
                {!searchResults.length && <p className="px-3 py-4 text-xs text-gray-400">No results for "{searchQ}"</p>}
              </div>
            )}
          </div>
        )}

        {/* Approval badge */}
        {!collapsed && approvalCount > 0 && (
          <div className="px-3 pb-2">
            <Link to="/approvals" className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg text-xs font-medium text-purple-700 hover:bg-purple-100">
              <CheckCircle className="h-3.5 w-3.5" />
              {approvalCount} pending approval{approvalCount > 1 ? 's' : ''}
            </Link>
          </div>
        )}

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {/* Platform section - shown based on permissions, not role */}
          {visiblePlatformItems.length > 0 && (
            <>
              {!collapsed ? (
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-purple-600 tracking-wider">
                  Platform
                </div>
              ) : (
                <div className="border-t border-gray-200 my-2 mx-2" />
              )}
              {visiblePlatformItems.map(item => renderNavItem(item, 'purple'))}
            </>
          )}

          {/* Main Nav */}
          {renderNavItems()}
        </nav>

        {/* User footer */}
        <div className={`p-4 border-t border-gray-200 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-semibold text-sm flex-shrink-0">
              {user?.name?.charAt(0) || '?'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            )}
          </div>

          {!collapsed && (
            <div className="flex items-center gap-2 mt-2">
              <div className="relative flex-1">
                <button onClick={() => setShowNotifs(!showNotifs)} className="relative text-gray-400 hover:text-gray-600">
                  <Bell className="h-5 w-5" />
                  {totalUnread > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">{totalUnread > 9 ? '9+' : totalUnread}</span>
                  )}
                </button>
                {showNotifs && (
                  <div className="fixed bottom-16 right-6 w-80 bg-white border rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
                    <div className="sticky top-0 bg-white border-b px-4 py-2.5 flex items-center justify-between">
                      <h3 className="font-semibold text-sm">Notifications</h3>
                      <button onClick={() => markAllRead()} className="text-xs text-brand-600 hover:text-brand-800">Mark all read</button>
                    </div>
                    {(notifData?.items || []).map((n: any) => (
                      <div key={n._id} onClick={() => markRead(n._id)}
                        className={`px-4 py-2.5 border-b cursor-pointer hover:bg-gray-50 ${!n.read ? 'bg-blue-50' : ''}`}>
                        <p className="text-sm font-medium truncate">{n.title}</p>
                        {n.message && <p className="text-xs text-gray-400 truncate">{n.message}</p>}
                        <p className="text-[10px] text-gray-300">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                    {!notifData?.items?.length && <p className="px-4 py-6 text-center text-sm text-gray-400">All caught up!</p>}
                  </div>
                )}
              </div>
              <button onClick={logout} className="text-gray-400 hover:text-red-500 text-sm whitespace-nowrap">Sign out</button>
            </div>
          )}
          {collapsed && (
            <button onClick={logout} className="text-gray-400 hover:text-red-500 text-xs mt-1" title="Sign out">
              <Mail className="h-4 w-4" />
            </button>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
