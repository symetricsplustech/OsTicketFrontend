import { useEffect, useState } from 'react';
import { customerEn } from '../lib/enterprise.js';

export default function ServiceCatalog() {
  const [data, setData] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    customerEn.catalog()
      .then((d) => { setData(d); setError(''); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const items = (data.items || []).filter((i) =>
    `${i.name} ${i.description} ${i.category || ''} ${i.helpTopic?.topic || ''}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <h1>Service Catalog</h1>
      <p className="muted">What’s included in your plan — and what needs approval or a paid ask.</p>
      {error && <div className="alert error">{error}</div>}
      {loading && <p className="muted">Loading…</p>}

      {!loading && (
        <>
          <div className="field" style={{ maxWidth: 420, marginBottom: 16 }}>
            <input placeholder="Search services…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>

          <div className="kb-grid">
            {items.map((i) => (
              <div className="kb-card" key={i._id}>
                <div className="kb-card-header">
                  <h3>{i.name}</h3>
                  <span className="pill">{i.category || 'General'}</span>
                </div>
                <p className="muted">{i.description}</p>
                <div className="small muted">
                  {i.priority && <>Priority: {i.priority} · </>}
                  {i.estimatedTime && <>ETA: {i.estimatedTime} · </>}
                  {i.sla?.name && <>SLA: {i.sla.name}</>}
                </div>
                <p className="small" style={{ margin: '8px 0 0' }}>
                  {i.requiresApproval && <span className="pill">approval required</span>}{' '}
                  {i.needsPayment && <span className="pill muted">{i.price > 0 ? `$${i.price}` : 'paid'}</span>}
                </p>
              </div>
            ))}
            {items.length === 0 && <p className="muted">No services match.</p>}
          </div>
        </>
      )}
    </div>
  );
}