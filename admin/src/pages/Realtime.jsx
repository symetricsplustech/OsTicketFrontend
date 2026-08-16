import { useEffect, useState } from 'react';
import { adminEn } from '../lib/enterprise.js';

export default function Realtime() {
  const [data, setData] = useState(null);
  const [outage, setOutage] = useState([]);
  const [error, setError] = useState('');

  const load = () => {
    Promise.all([adminEn.realtime().catch(() => null), adminEn.outageSignals().catch(() => [])])
      .then(([d, o]) => { setData(d); setOutage(Array.isArray(o) ? o : (o.signals || [])); setError(''); })
      .catch((e) => setError(e.message));
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, []);

  const promote = async () => {
    if (!window.confirm('Convert selected outage signals into status incidents?')) return;
    await adminEn.promoteSignals(outage); load();
  };

  const Stat = ({ label, value }) => (
    <div className="stat-card"><div className="stat-value">{value}</div><div className="stat-label">{label}</div></div>
  );

  const Gauge = ({ pct }) => {
    const avg = data?.slas?.averageBreachPct ?? 0;
    return <span className={`pill ${avg > 10 ? 'muted' : ''}`}>{pct}%</span>;
  };

  const d = data || {};

  return (
    <div>
      <h1>Realtime Operations Dashboard <span className="muted small">(auto-refresh 10s)</span></h1>
      {error && <div className="alert error">{error}</div>}

      {!data && !error && <p className="muted">Loading…</p>}

      {data && (
        <>
          <div className="stat-cards">
            <Stat label="Open Tickets" value={d.tickets?.open ?? 0} />
            <Stat label="Assigned" value={d.tickets?.assigned ?? 0} />
            <Stat label="Unassigned" value={d.tickets?.unassigned ?? 0} />
            <Stat label="Chats Waiting" value={d.chats?.waiting ?? 0} />
            <Stat label="Active Chats" value={d.chats?.active ?? 0} />
            <Stat label="Approvals Pending" value={d.approvals?.pending ?? 0} />
          </div>

          <div className="box mt-10">
            <div className="box-header"><h1>SLA Health</h1></div>
            <div className="form-row">
              <Stat label="Average Breach Risk" value={<Gauge pct={(d.slas?.averageBreachPct ?? 0).toFixed(0)} />} />
              <Stat label="At Risk (1hr)" value={d.slas?.atRiskOneHour?.length ?? 0} />
              <Stat label="Overdue" value={d.slas?.overdue?.length ?? 0} />
              <Stat label="With Warning" value={d.slas?.warning?.length ?? 0} />
            </div>
            <div className="form-row">
              <label className="field"><span>Overdue Tickets</span>
                <select size={4} style={{ width: '100%' }}>{(d.slas?.overdue || []).map((t) => <option key={t._id}>#{t.number} — {t.subject}</option>)}</select>
              </label>
              <label className="field"><span>At Risk (1 hour)</span>
                <select size={4} style={{ width: '100%' }}>{(d.slas?.atRiskOneHour || []).map((t) => <option key={t._id}>#{t.number} — {t.subject}</option>)}</select>
              </label>
            </div>
          </div>

          <div className="box mt-10">
            <div className="box-header"><h1>Workload</h1></div>
            <table className="list">
              <thead><tr><th>Agent</th><th>Open</th><th>At Risk</th><th>Overdue</th></tr></thead>
              <tbody>
                {Object.entries(d.workload || {}).map(([name, w]) => (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>{w.open ?? 0}</td>
                    <td>{w.atRisk ?? 0}</td>
                    <td>{w.overdue ?? 0}</td>
                  </tr>
                ))}
                {Object.keys(d.workload || {}).length === 0 && <tr><td colSpan={4} className="muted">No workload data.</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="box mt-10">
            <div className="box-header">
              <h1>Outage Signals <span className="muted small">(anomaly detection on activity, errors, CSAT)</span></h1>
              {outage.length > 0 && <button className="btn" onClick={promote}>Promote to Status Incident</button>}
            </div>
            <table className="list">
              <thead><tr><th>Time</th><th>Source</th><th>Signal</th><th>Severity</th></tr></thead>
              <tbody>
                {outage.map((s, i) => (
                  <tr key={i}>
                    <td>{s.at ? new Date(s.at).toLocaleString() : '—'}</td>
                    <td>{s.source || '—'}</td>
                    <td>{s.message || s.signal || JSON.stringify(s)}</td>
                    <td><span className="pill">{s.severity || 'unknown'}</span></td>
                  </tr>
                ))}
                {outage.length === 0 && <tr><td colSpan={4} className="muted">No signals right now.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}