import React from 'react';
import { SettingsForm } from '../components/SettingsForm.jsx';

export default function Authentication() {
  return (
    <SettingsForm
      section="auth"
      heading="Authentication Settings"
      fields={[
        { name: 'registrationEnabled', label: 'Allow new customer registration', type: 'checkbox' },
        { name: 'emailVerification', label: 'Require email verification on registration', type: 'checkbox' },
        { name: 'allowGuestTickets', label: 'Allow guests to open tickets without an account', type: 'checkbox' },
        { name: 'passwordMinLength', label: 'Minimum password length', type: 'number', default: 8 },
        { name: 'sessionTimeoutMinutes', label: 'Session timeout (minutes, 0 = never)', type: 'number', default: 0 },
        { name: 'lockoutEnabled', label: 'Lock account after repeated failed logins', type: 'checkbox' },
        { name: 'maxLoginAttempts', label: 'Max login attempts before lockout', type: 'number', default: 5 },
      ]}
    />
  );
}
