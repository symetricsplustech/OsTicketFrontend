import React from 'react';
import { SettingsForm } from '../components/SettingsForm.jsx';

export default function Alerts() {
  return (
    <SettingsForm
      section="alerts"
      heading="Alerts &amp; Notifications"
      fields={[
        { name: 'notifyNewTicket', label: 'Notify agents on new ticket', type: 'checkbox' },
        { name: 'notifyMessage', label: 'Notify assigned agent on new customer message', type: 'checkbox' },
        { name: 'notifyAssignment', label: 'Notify on ticket assignment', type: 'checkbox' },
        { name: 'notifyTransfer', label: 'Notify on ticket transfer', type: 'checkbox' },
        { name: 'notifyOverdue', label: 'Notify on overdue tickets', type: 'checkbox' },
        { name: 'notifyEscalation', label: 'Notify on ticket escalation', type: 'checkbox' },
        { name: 'notifyClosed', label: 'Notify on ticket closure', type: 'checkbox' },
      ]}
    />
  );
}
