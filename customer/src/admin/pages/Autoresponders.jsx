import React from 'react';
import { SettingsForm } from '../components/SettingsForm.jsx';

export default function Autoresponders() {
  return (
    <SettingsForm
      section="autoresponder"
      heading="Autoresponder"
      fields={[
        { name: 'enabled', label: 'Enable autoresponder (send acknowledgment email on new ticket)', type: 'checkbox' },
        { name: 'subject', label: 'Email Subject (tokens: [ticket.number], [user.name], [company.name])', default: 'Ticket received - [ticket.number]' },
        { name: 'body', label: 'Email Body (plain text, tokens supported)', type: 'textarea', default: 'Dear [user.name],\n\nThank you for contacting us...' },
      ]}
    />
  );
}
