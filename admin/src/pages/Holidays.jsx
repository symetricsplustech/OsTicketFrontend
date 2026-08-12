import React from 'react';
import CrudManager from '../components/CrudManager.jsx';

export default function Holidays() {
  return (
    <CrudManager
      url="/admin/holidays"
      title="Holidays"
      columns={[
        { key: 'name', label: 'Holiday', render: (h) => <strong>{h.name}</strong> },
        { key: 'date', label: 'Date', render: (h) => new Date(h.date).toLocaleDateString() },
        { key: 'isRecurring', label: 'Recurring Yearly', render: (h) => h.isRecurring ? 'Yes' : 'No' },
        { key: 'isActive', label: 'Active', render: (h) => <span className={`pill ${h.isActive ? 'green' : 'gray'}`}>{h.isActive ? 'Active' : 'Disabled'}</span> },
      ]}
      fields={[
        { name: 'name', label: 'Holiday Name', required: true },
        { name: 'date', label: 'Date', type: 'date', required: true, get: (h) => (h.date ? h.date.slice(0, 10) : '') },
        { name: 'isRecurring', label: 'Repeats Every Year', type: 'checkbox' },
        { name: 'isActive', label: 'Active', type: 'checkbox', default: true },
      ]}
    />
  );
}
