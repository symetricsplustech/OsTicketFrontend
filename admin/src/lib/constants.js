export const STATUS_COLORS = {
  open: '#2f9e44',
  assigned: '#e08a2e',
  overdue: '#c0392b',
  closed: '#6c757d',
  archived: '#8e44ad',
  deleted: '#333333',
};

export const ROLE_PERMISSIONS = [
  { value: 'tickets.view', label: 'View tickets' },
  { value: 'tickets.create', label: 'Create tickets' },
  { value: 'tickets.edit', label: 'Edit tickets' },
  { value: 'tickets.assign', label: 'Assign tickets' },
  { value: 'tickets.transfer', label: 'Transfer tickets' },
  { value: 'tickets.close', label: 'Close tickets' },
  { value: 'tickets.delete', label: 'Delete tickets' },
  { value: 'tickets.reply', label: 'Reply to tickets' },
  { value: 'tickets.note', label: 'Add internal notes' },
  { value: 'tickets.tasks', label: 'Manage ticket tasks' },
  { value: 'users.manage', label: 'Manage users' },
  { value: 'kb.manage', label: 'Manage knowledgebase' },
  { value: 'canned.manage', label: 'Manage canned responses' },
  { value: 'orgs.manage', label: 'Manage organizations' },
  { value: 'admin.manage', label: 'Administrative access' },
  { value: 'escalations.manage', label: 'Manage escalation rules' },
];
