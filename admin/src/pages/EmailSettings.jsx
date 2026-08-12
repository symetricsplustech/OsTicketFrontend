import React from 'react';
import { SettingsForm } from '../components/SettingsForm.jsx';

export default function EmailSettings() {
  return (
    <SettingsForm
      section="email"
      heading="Email / SMTP Settings"
      fields={[
        { name: 'fromName', label: 'From Name' },
        { name: 'fromEmail', label: 'From Email Address', type: 'email' },
        { name: 'smtpHost', label: 'SMTP Host (e.g. smtp.gmail.com)' },
        { name: 'smtpPort', label: 'SMTP Port', type: 'number', default: 587 },
        { name: 'smtpSecure', label: 'Use Secure Connection (TLS/SSL)', type: 'checkbox' },
        { name: 'smtpUser', label: 'SMTP Username' },
        { name: 'smtpPass', label: 'SMTP Password / App Password', type: 'password' },
      ]}
    />
  );
}
