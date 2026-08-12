import React from 'react';
import CrudManager from '../components/CrudManager.jsx';

export default function SlaPlans() {
  return (
    <CrudManager
      url="/admin/sla-plans"
      title="SLA Plans"
      columns={[
        { key: 'name', label: 'Name', render: (p) => <strong>{p.name}</strong> },
        { key: 'gracePeriod', label: 'Response Time (hours)' },
        { key: 'schedule', label: 'Schedule' },
        { key: 'status', label: 'Status', render: (p) => <span className={`pill ${p.status === 'active' ? 'green' : 'gray'}`}>{p.status}</span> },
        { key: 'notes', label: 'Notes' },
      ]}
      fields={[
        { name: 'name', label: 'SLA Name', required: true },
        { name: 'gracePeriod', label: 'First Response (hours)', type: 'number', default: 24 },
        { name: 'schedule', label: 'Schedule', type: 'select', options: [{ value: '24/7', label: '24/7' }, { value: 'Business Hours', label: 'Business Hours' }], default: '24/7' },
        { name: 'status', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'disabled', label: 'Disabled' }], default: 'active' },
        { name: 'notes', label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
