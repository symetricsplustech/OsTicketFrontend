import React, { useState } from 'react';
import { api } from '../lib/index.js';

export default function TicketSettings() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const save = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const fd = new FormData(e.target);
      const values = {
        autoResponder: fd.get('autoResponder') === 'on',
        autoAssign: fd.get('autoAssign') === 'on',
        notifyNewTicketToDept: fd.get('notifyNewTicketToDept') === 'on',
        notifyNewTicketToTeam: fd.get('notifyNewTicketToTeam') === 'on',
        notifyAssignment: fd.get('notifyAssignment') === 'on',
        notifyTransfer: fd.get('notifyTransfer') === 'on',
        notifyReplyToUser: fd.get('notifyReplyToUser') === 'on',
        closedTicketEmail: fd.get('closedTicketEmail') === 'on',
        overdueNotice: fd.get('overdueNotice') === 'on',
      };
      await api.put('/admin/settings', { section: 'tickets', values });
      setMessage('Ticket settings saved.');
    } catch (err) {
      setError(err.message);
    }
  };

  const checkbox = (name, label) => (
    <div className="field"><label><input type="checkbox" name={name} defaultChecked /> {label}</label></div>
  );

  return (
    <div className="box">
      <div className="box-header"><h1>Ticket Settings</h1></div>
      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}
      <form onSubmit={save}>
        <div className="form-panel">
          <h2>Settings</h2>
          {checkbox('autoResponder', 'Send auto-response / acknowledgment email when a ticket is created')}
          {checkbox('autoAssign', 'Automatically assign tickets based on help topic / department settings')}
        </div>
        <div className="form-panel">
          <h2>Alerts &amp; Notices</h2>
          {checkbox('notifyNewTicketToDept', 'Email new ticket alert to department')}
          {checkbox('notifyNewTicketToTeam', 'Email new ticket alert to team')}
          {checkbox('notifyAssignment', 'Email assignment notice when ticket is assigned')}
          {checkbox('notifyTransfer', 'Email notice when ticket is transferred')}
          {checkbox('notifyReplyToUser', 'Email customer when a reply is posted')}
          {checkbox('closedTicketEmail', 'Email customer when ticket is closed')}
          {checkbox('overdueNotice', 'Mark tickets overdue automatically')}
        </div>
        <div className="buttons"><button className="btn" type="submit">Save Settings</button></div>
      </form>
    </div>
  );
}
