import React, { useEffect, useState } from 'react';
import { api } from '../lib/index.js';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = { monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday' };

export default function Schedules() {
  const [sched, setSched] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/settings')
      .then(({ data }) => setSched(data.settings.schedules || {}))
      .catch((err) => { setError(err.message); setSched({}); });
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await api.put('/admin/settings', { section: 'schedules', values: sched });
      setMessage('Schedule settings saved.');
    } catch (err) {
      setError(err.message);
    }
  };

  const setDay = (day, key, value) => {
    setSched((s) => ({ ...s, [day]: { ...s[day], [key]: value } }));
  };

  if (!sched) return <div className="box muted">Loading…</div>;

  return (
    <div className="box">
      <div className="box-header"><h1>Business Hours / Schedules</h1></div>
      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}
      <form onSubmit={save}>
        <div className="form-panel">
          <h2>Schedule Settings</h2>
          <div className="form-row">
            <div className="field"><label>Timezone</label>
              <input type="text" value={sched.timezone || ''} onChange={(e) => setSched({ ...sched, timezone: e.target.value })} placeholder="e.g. Asia/Kolkata, UTC, America/New_York" />
            </div>
            <div className="field">
              <label><input type="checkbox" checked={!!sched.businessHoursEnabled} onChange={(e) => setSched({ ...sched, businessHoursEnabled: e.target.checked })} /> Enforce business hours (tickets created outside hours start counting after opening time)</label>
            </div>
          </div>
        </div>
        <div className="form-panel">
          <h2>Working Hours</h2>
          <table className="list">
            <thead><tr><th>Day</th><th>Open</th><th>Open Time</th><th>Close Time</th></tr></thead>
            <tbody>
              {DAYS.map((day) => {
                const d = sched[day] || { enabled: true, open: '09:00', close: '17:00' };
                return (
                  <tr key={day}>
                    <td><strong>{DAY_LABELS[day]}</strong></td>
                    <td><input type="checkbox" checked={!!d.enabled} onChange={(e) => setDay(day, 'enabled', e.target.checked)} /></td>
                    <td><input type="time" value={d.open || '09:00'} onChange={(e) => setDay(day, 'open', e.target.value)} /></td>
                    <td><input type="time" value={d.close || '17:00'} onChange={(e) => setDay(day, 'close', e.target.value)} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="buttons"><button className="btn" type="submit">Save Schedule</button></div>
      </form>
    </div>
  );
}
