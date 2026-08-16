import React, { useEffect, useState } from 'react';
import { en } from '../lib/enterprise.js';
import { api, formatDateTime, formatDate } from '../lib/index.js';

const fmtH = (h) => (h == null ? '—' : `${Math.round(h * 10) / 10}h`);
const fmtM = (m) => (m == null ? '—' : `${Math.round(m)}m`);

export default function Reports() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('overview');

  const load = (d = days) => {
    setError('');
    en.reportOverview(d).then((d2) => {
      setData(d2);
      setDays(d2.days);
    }).catch((e) => setError(e.message));
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const exportCsv = async () => {
    try {
      const res = await api.get('/enterprise/reports/volume', { params: { days, format: 'csv' }, responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `volume-${days}d.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message);
    }
  };

  const live = data?.live;
  const t = data?.volume?.trend || data?.trend || [];

  return (
    <div>
      <div className="et-flex et-between et-mb">
        <h1>Reports &amp; Realtime</h1>
        <div className="et-flex et-gap">
          <select className="field et-sm" value={days} onChange={(e) => load(parseInt(e.target.value, 10))}>
            <option value={7}>7 days</option><option value={30}>30 days</option><option value={90}>90 days</option>
          </select>
          <button className="btn small" onClick={exportCsv}>Export CSV</button>
          <div className="et-flex et-gap et-tabs">
            {['overview', 'agents', 'departments', 'customers', 'volume'].map((k) => (
              <button key={k} className={`pill et-tab ${tab === k ? 'et-tab-active' : ''}`} onClick={() => setTab(k)}>{k}</button>
            ))}
          </div>
        </div>
      </div>
      {error && <div className="alert">{error}</div>}
      {live && (
        <div className="stat-cards et-mb">
          <div className="stat-card"><div className="muted">Open tickets</div><div className="stat-num">{live.tickets?.open || 0}</div></div>
          <div className="stat-card"><div className="muted">Critical</div><div className="stat-num">{live.tickets?.critical || 0}</div></div>
          <div className="stat-card"><div className="muted">SLA at risk</div><div className="stat-num">{live.tickets?.atRisk || 0}</div></div>
          <div className="stat-card"><div className="muted">Breached</div><div className="stat-num">{live.tickets?.breached || 0}</div></div>
          <div className="stat-card"><div className="muted">Waiting customer</div><div className="stat-num">{live.tickets?.waitingCustomer || 0}</div></div>
          <div className="stat-card"><div className="muted">Agents online</div><div className="stat-num">{live.agents?.online || 0}/{live.agents?.total || 0}</div></div>
        </div>
      )}

      {tab === 'overview' && (
        <>
          <div className="stat-cards et-mb">
            <div className="stat-card"><div className="muted">Avg first response</div><div className="stat-num">{fmtM(live?.performance?.avgResponseMin)}</div></div>
            <div className="stat-card"><div className="muted">Avg resolution</div><div className="stat-num">{fmtH(live?.performance?.avgResolutionHours)}</div></div>
            <div className="stat-card"><div className="muted">CSAT (avg)</div><div className="stat-num">{data?.csat?.avgRating ?? '—'}</div></div>
            <div className="stat-card"><div className="muted">CSAT responses</div><div className="stat-num">{data?.csat?.responses || 0}</div></div>
          </div>
          <h3>Volume (last {days} days)</h3>
          <table className="et-table">
            <thead><tr><th>Date</th><th>Created</th><th>Resolved</th></tr></thead>
            <tbody>
              {t.slice(-10).reverse().map((row, i) => (
                <tr key={i}><td>{formatDate(row.date)}</td><td>{row.created || 0}</td><td>{row.resolved || 0}</td></tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {tab === 'agents' && (
        <table className="et-table">
          <thead><tr><th>Agent</th><th>Presence</th><th>Assigned</th><th>Resolved</th><th>Backlog</th><th>First resp</th><th>Avg resp</th><th>Avg resolve</th><th>SLA %</th><th>Reopen %</th></tr></thead>
          <tbody>
            {(data?.agents?.agents || []).map((a) => (
              <tr key={String(a.agentId)}>
                <td><strong>{a.name}</strong></td>
                <td>{a.presence || 'offline'}</td>
                <td>{a.assigned}</td><td>{a.resolved}</td><td>{a.backlog}</td>
                <td>{fmtM(a.avgFirstResponseMin)}</td><td>{fmtM(a.avgResponseMin)}</td>
                <td>{fmtH(a.avgResolutionHours)}</td><td>{a.slaCompliance != null ? `${a.slaCompliance}%` : '—'}</td>
                <td>{a.reopenRate != null ? `${a.reopenRate}%` : '—'}</td>
              </tr>
            ))}
            {!data?.agents?.agents?.length && <tr><td colSpan={10} className="muted">No data.</td></tr>}
          </tbody>
        </table>
      )}

      {tab === 'departments' && (
        <table className="et-table">
          <thead><tr><th>Department</th><th>Incoming</th><th>Resolved</th><th>Backlog</th><th>SLA breaches</th><th>Escalations</th><th>Avg resolve</th></tr></thead>
          <tbody>
            {(data?.departments?.departments || []).map((d) => (
              <tr key={String(d.deptId)}>
                <td><strong>{d.name}</strong></td>
                <td>{d.incoming}</td><td>{d.resolved}</td><td>{d.backlog}</td>
                <td>{d.slaBreaches || 0}</td><td>{d.escalations || 0}</td><td>{fmtH(d.avgResolutionHours)}</td>
              </tr>
            ))}
            {!data?.departments?.departments?.length && <tr><td colSpan={7} className="muted">No data.</td></tr>}
          </tbody>
        </table>
      )}

      {tab === 'customers' && (
        <table className="et-table">
          <thead><tr><th>Customer</th><th>Tickets</th><th>Open</th><th>Overdue</th><th>Avg response</th><th>Health</th></tr></thead>
          <tbody>
            {(data?.customers?.customers || []).map((u) => (
              <tr key={String(u.userId)}>
                <td><strong>{u.name}</strong> <span className="muted small">{u.email}</span></td>
                <td>{u.tickets}</td><td>{u.open}</td><td>{u.overdue}</td>
                <td>{fmtM(u.avgResponseMin)}</td><td>{u.healthScore != null ? `${u.healthScore}/100` : '—'}</td>
              </tr>
            ))}
            {!data?.customers?.customers?.length && <tr><td colSpan={6} className="muted">No data.</td></tr>}
          </tbody>
        </table>
      )}

      {tab === 'volume' && (
        <table className="et-table">
          <thead><tr><th>Date</th><th>Created</th><th>Resolved</th><th>Delta</th></tr></thead>
          <tbody>
            {t.map((row, i) => (
              <tr key={i}>
                <td>{formatDate(row.date)}</td>
                <td>{row.created || 0}</td><td>{row.resolved || 0}</td>
                <td>{(row.created || 0) - (row.resolved || 0)}</td>
              </tr>
            ))}
            {!t.length && <tr><td colSpan={4} className="muted">No volume data.</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}