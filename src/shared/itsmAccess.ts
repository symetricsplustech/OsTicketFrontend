export interface ItsmRouteAccess {
  prefix: string;
  module: number;
  permissions: readonly string[];
}

// Most-specific prefixes must appear first. A route is available when the user
// has at least one listed read/UI permission; mutations remain action-gated.
export const ITSM_ROUTE_ACCESS: readonly ItsmRouteAccess[] = [
  { prefix: '/major-incidents', module: 10, permissions: ['itsm.major_incident.major_incident.read', 'itsm.major_incident.ui.mi_dashboard.access'] },
  { prefix: '/warroom', module: 10, permissions: ['itsm.major_incident.bridge_session.read', 'itsm.major_incident.ui.collaborate.access'] },
  { prefix: '/outages', module: 10, permissions: ['itsm.major_incident.major_incident.read', 'itsm.major_incident.ui.mi_workbench.access'] },
  { prefix: '/pir', module: 10, permissions: ['itsm.major_incident.post_incident_report.read', 'itsm.major_incident.ui.pir.access'] },
  { prefix: '/approval-dashboard', module: 9, permissions: ['itsm.approval.approval_read', 'itsm.approval.ui.my_approvals.access'] },
  { prefix: '/settings/delegations', module: 9, permissions: ['itsm.approval.delegation.read', 'itsm.approval.ui.delegation.access'] },
  { prefix: '/assignment-dashboard', module: 8, permissions: ['itsm.assignment.routing_rule.read', 'itsm.assignment.ui.assignment_admin.access'] },
  { prefix: '/assignment', module: 8, permissions: ['itsm.assignment.routing_read', 'itsm.assignment.ui.routing_diagnostics.access'] },
  { prefix: '/my-work', module: 8, permissions: ['itsm.assignment.queue_read', 'itsm.assignment.ui.agent_inbox.access', 'itsm.core.task.read'] },
  { prefix: '/group-queues', module: 8, permissions: ['itsm.assignment.queue.read', 'itsm.assignment.ui.queue_view.access'] },
  { prefix: '/sla-dashboard', module: 7, permissions: ['itsm.sla.definition_read', 'itsm.sla.ui.sla_dashboard.access'] },
  { prefix: '/sla-monitor', module: 7, permissions: ['itsm.sla.task_sla_read', 'itsm.sla.ui.sla_timer.access'] },
  { prefix: '/knowledge-dashboard', module: 6, permissions: ['itsm.knowledge.kb_read', 'itsm.knowledge.ui.knowledge_analytics.access'] },
  { prefix: '/knowledge-insights', module: 6, permissions: ['itsm.knowledge.article_read', 'itsm.knowledge.ui.knowledge_analytics.access'] },
  { prefix: '/neural-search', module: 6, permissions: ['itsm.knowledge.article_read', 'itsm.knowledge.ui.knowledge_search.access'] },
  { prefix: '/kb', module: 6, permissions: ['itsm.knowledge.knowledge_article.read', 'itsm.knowledge.ui.knowledge_search.access'] },
  { prefix: '/ritms', module: 5, permissions: ['itsm.request_catalog.ritm_read', 'itsm.request_catalog.ui.ritm_detail.access'] },
  { prefix: '/requests', module: 5, permissions: ['itsm.request_catalog.request_read', 'itsm.request_catalog.ui.req_detail.access'] },
  { prefix: '/catalog', module: 5, permissions: ['itsm.request_catalog.catalog_item.read', 'itsm.request_catalog.ui.catalog_home.access'] },
  { prefix: '/cab', module: 4, permissions: ['itsm.change.cabmeeting.read', 'itsm.change.ui.cab_workbench.access'] },
  { prefix: '/change-calendar', module: 4, permissions: ['itsm.change.change_request.read', 'itsm.change.ui.change_calendar.access'] },
  { prefix: '/change-dashboard', module: 4, permissions: ['itsm.change.change_request.read', 'itsm.change.ui.change_dashboard.access'] },
  { prefix: '/changes', module: 4, permissions: ['itsm.change.change_request.read', 'itsm.change.ui.change_list.access'] },
  { prefix: '/known-errors', module: 3, permissions: ['itsm.problem.known_error.read', 'itsm.problem.ui.known_error.access'] },
  { prefix: '/problem-dashboard', module: 3, permissions: ['itsm.problem.problem.read', 'itsm.problem.ui.problem_dashboard.access'] },
  { prefix: '/problems', module: 3, permissions: ['itsm.problem.problem.read', 'itsm.problem.ui.problem_list.access'] },
  { prefix: '/incident-dashboard', module: 2, permissions: ['itsm.incident.incident.read', 'itsm.incident.ui.incident_dashboards.access'] },
  { prefix: '/incidents', module: 2, permissions: ['itsm.incident.incident.read', 'itsm.incident.ui.incident_list.access'] },
  { prefix: '/diagnosis', module: 2, permissions: ['itsm.incident.incident_resolution.read', 'itsm.incident.ui.incident_record.access'] },
  { prefix: '/playbooks', module: 2, permissions: ['itsm.incident.incident.read', 'itsm.incident.ui.incident_record.access'] },
  { prefix: '/priority-matrix', module: 2, permissions: ['itsm.incident.incident.read', 'itsm.incident.ui.triage_panel.access'] },
  { prefix: '/tasks', module: 1, permissions: ['itsm.core.task.read', 'itsm.core.ui.task_record_shell.access'] },
  { prefix: '/tickets', module: 1, permissions: ['itsm.core.task.read', 'itsm.incident.incident.read'] },
  { prefix: '/ticket-board', module: 1, permissions: ['itsm.core.task_read', 'itsm.core.ui.my_work.access'] },
  { prefix: '/audit-trail', module: 1, permissions: ['itsm.core.audit_event.read', 'itsm.core.audit_read'] },
];

export function getItsmRouteAccess(pathname: string): ItsmRouteAccess | undefined {
  return ITSM_ROUTE_ACCESS.find(({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
