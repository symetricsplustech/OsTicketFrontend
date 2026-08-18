import React, { useEffect, useState } from 'react';
import { api, timeAgo } from '../lib/index.js';

export default function Directory() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/agent/directory').then(({ data }) => setData(data)).catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="alert error">{error}</div>;
  if (!data) return <div className="box muted">Loading…</div>;

  return (
    <>
      <div className="box">
        <div className="box-header"><h1>Agent Directory</h1></div>
        <table className="list">
          <thead><tr><th>Name</th><th>Email</th><th>Last Login</th></tr></thead>
          <tbody>
            {data.agents.map((a) => (
              <tr key={a._id}><td><strong>{a.name}</strong></td><td>{a.email}</td><td>{a.lastLogin ? timeAgo(a.lastLogin) : 'Never'}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="box">
        <div className="box-header"><h1>Teams</h1></div>
        {data.teams.map((t) => (
          <div key={t._id} style={{ border: '1px solid var(--ost-border-light)', padding: 10, marginBottom: 10 }}>
            <strong>{t.name}</strong>
            <div className="small muted mt-10">Members: {t.members?.map((m) => m.name).join(', ') || 'None'}</div>
          </div>
        ))}
      </div>
    </>
  );
}
