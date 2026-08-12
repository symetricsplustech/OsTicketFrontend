import React from 'react';
import CrudManager from '../components/CrudManager.jsx';

export default function HelpTopics() {
  const priorities = ['Low', 'Normal', 'High', 'Emergency'].map((p) => ({ value: p, label: p }));

  const references = {
    department: { url: '/admin/departments', label: 'name' },
    sla: { url: '/admin/sla-plans', label: 'name' },
    autoAssignAgent: { url: '/admin/agents', label: (a) => `${a.name} (${a.email})` },
    autoAssignTeam: { url: '/admin/teams', label: 'name' },
  };

  return (
    <CrudManager
      url="/admin/help-topics"
      title="Help Topics"
      references={references}
      columns={[
        { key: 'topic', label: 'Help Topic', render: (t) => <strong>{t.topic}</strong> },
        { key: 'category', label: 'Category' },
        { key: 'department', label: 'Department', render: (t) => t.department?.name || '—' },
        { key: 'priority', label: 'Priority' },
        { key: 'sla', label: 'SLA Plan', render: (t) => t.sla?.name || '—' },
        { key: 'status', label: 'Status', render: (t) => <span className={`pill ${t.status === 'active' ? 'green' : 'gray'}`}>{t.status}</span> },
      ]}
      fields={[
        { name: 'topic', label: 'Help Topic Name', required: true },
        { name: 'category', label: 'Category' },
        { name: 'department', label: 'Department', type: 'select', get: (t) => t.department?._id || '' },
        { name: 'priority', label: 'Priority', type: 'select', options: priorities, default: 'Normal' },
        { name: 'sla', label: 'SLA Plan', type: 'select', get: (t) => t.sla?._id || '' },
        { name: 'autoAssignAgent', label: 'Auto-Assign Agent', type: 'select', get: (t) => t.autoAssignAgent?._id || '' },
        { name: 'autoAssignTeam', label: 'Auto-Assign Team', type: 'select', get: (t) => t.autoAssignTeam?._id || '' },
        { name: 'status', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'disabled', label: 'Disabled' }], default: 'active' },
        { name: 'notes', label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
