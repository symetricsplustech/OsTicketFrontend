import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { customerEn } from '../lib/enterprise.js';

const COMPONENT_STATUS = {
  operational: 'Operational',
  degraded: 'Degraded',
  partial_outage: 'Partial Outage',
  major_outage: 'Major Outage',
  maintenance: 'Maintenance',
};

const COLOR = {
  operational: '#16a34a',
  degraded: '#d97706',
  partial_outage: '#f59e0b',
  major_outage: '#dc2626',
  maintenance: '#6366f1',
};

export default function StatusPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    customerEn.statusPage(slug)
      .then((d) => { setData(d); setError(''); })
      .catch((e) => setError(e.message));
  }, [slug]);

  if (error) return <div className="alert error">{error}</div>;
  if (!data) return <p className="muted">Loading status…</p>;

  const page = data.page || data;
  const overall = (() => {
    const cs = (page.components || []).map((c) => c.status);
    if (cs.some((s) => s === 'major_outage')) return { label: 'Major Outage', color: COLOR.major_outage };
    if (cs.some((s) => s === 'partial_outage')) return { label: 'Partial Outage', color: COLOR.partial_outage };
    if (cs.some((s) => s === 'degraded')) return { label: 'Degraded', color: COLOR.degraded };
    return { label: 'All Systems Operational', color: COLOR.operational };
  })();

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: 720, width: '100%' }}>
        <div className="box" style={{ textAlign: 'center', borderColor: overall.color, borderWidth: 2 }}>
          <h1 style={{ color: overall.color, fontSize: 24, marginBottom: 4 }}>{overall.label}</h1>
          <span className="muted small">{page.name}{page.description ? ` — ${page.description}` : ''}</span>
        </div>

        <div className="box mt-10">
          <div className="box-header"><h1>Components</h1></div>
          {(page.components || []).map((c) => (
            <div className="member-row" key={c._id || c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <b>{c.name}</b>
                {c.group && <span className="muted small"> · {c.group}</span>}
              </div>
              <span className="pill" style={{ background: COLOR[c.status] || '#888', color: '#fff' }}>
                {COMPONENT_STATUS[c.status] || c.status}
              </span>
            </div>
          ))}
          {(page.components || []).length === 0 && <p className="muted">No components listed.</p>}
        </div>

        {(data.incidents || []).length > 0 && (
          <div className="box mt-10">
            <div className="box-header"><h1>Incidents</h1></div>
            {(data.incidents || []).map((i) => (
              <div className="box mb-10" key={i._id}>
                <div className="box-header">
                  <h1><span className="pill" style={{ background: i.severity === 'critical' ? '#dc2626' : i.severity === 'major' ? '#d97706' : '#888', color: '#fff' }}>{i.severity}</span> {i.title}</h1>
                  <span className={`pill ${i.status === 'resolved' ? '' : 'muted'}`}>{i.status}</span>
                </div>
                <p>{i.body}</p>
                {(i.updates || []).map((u, idx) => (
                  <div key={idx} className="small muted">
                    <b>{new Date(u.at).toLocaleString()}</b> — {u.message || u.status}
                  </div>
                ))}
                <div className="small muted mt-10">Opened {new Date(i.startedAt).toLocaleString()}{i.resolvedAt ? ` · Resolved ${new Date(i.resolvedAt).toLocaleString()}` : ''}</div>
              </div>
            ))}
          </div>
        )}

        <p className="muted small mt-10">Powered by osTicket Enterprise Status Pages</p>
      </div>
    </div>
  );
}