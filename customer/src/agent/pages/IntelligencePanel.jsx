import React, { useEffect, useState } from 'react';
import { en } from '../lib/enterprise.js';

const Tag = ({ children, tone = '' }) => <span className={`pill et-pill ${tone}`}>{children}</span>;

export default function IntelligencePanel({ number }) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiBusy, setAiBusy] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiInput, setAiInput] = useState('');
  const [links, setLinks] = useState([]);
  const [linkTo, setLinkTo] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    setItem(null);
    Promise.allSettled([
      en.intelligence(number),
      en.ticketLinks(number).catch(() => ({ items: [] })),
    ]).then(([intel, lnk]) => {
      setLoading(false);
      if (intel.status === 'fulfilled') setItem(intel.value);
      else setError(intel.reason.message);
      if (lnk.status === 'fulfilled') setLinks(lnk.value.items || []);
    });
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [number]);

  const run = async (kind, body = {}) => {
    setAiBusy(kind);
    setAiResult('');
    setError('');
    try {
      const res = await en.aiAction(kind, number, body);
      const text = res.topics?.map((t) => `• ${t}`).join('\n') || res.summary || res.rewritten || res.translated || res.reply || res.result || res.suggestions?.join('\n') || JSON.stringify(res).slice(0, 400);
      setAiResult(text);
    } catch (e) {
      setError(e.message);
    } finally {
      setAiBusy('');
    }
  };

  const refresh = () => en.refreshIntelligence(number).then(load).catch((e) => setError(e.message));
  const addLink = () => {
    if (!linkTo.trim()) return;
    en.addTicketLink(number, { toTicketNumber: linkTo.trim() }).then(() => { setLinkTo(''); load(); }).catch((e) => setError(e.message));
  };

  const predicted = item?.slaRisk;
  const senti = item?.sentiment;

  return (
    <div className="box et-box">
      <div className="box-header et-flex et-between">
        <span>🤖 Ticket Intelligence</span>
        <button className="btn btn-small" onClick={refresh} disabled={loading}>Refresh</button>
      </div>
      {loading && <div className="muted">Analyzing ticket…</div>}
      {error && <div className="alert">{error}</div>}
      {!loading && item && (
        <div className="et-stack">
          <div className="et-flex et-wrap">
            <Tag tone="intent">Intent: {item.intent || 'general'}</Tag>
            <Tag tone="senti">Sentiment: {senti || 'neutral'}</Tag>
            <Tag>Complexity: {item.complexity || 'medium'}</Tag>
            <Tag>Urgency: {item.urgency || 'medium'}</Tag>
            <Tag tone={item.churnRisk ? 'warn' : ''}>Churn risk: {item.churnRisk ? 'high' : 'low'}</Tag>
          </div>
          {item.summary && <div className="et-summary">{item.summary}</div>}
          <div className="et-flex et-wrap et-tags">
            {(item.suggestedTags || []).map((t, i) => <Tag key={i}>#{t}</Tag>)}
          </div>
          <table className="et-table">
            <tbody>
              <tr><td className="muted">Suggested dept</td><td><strong>{item.suggestedDepartment || '—'}</strong></td></tr>
              <tr><td className="muted">Suggested agent</td><td><strong>{item.suggestedAgent || '—'}</strong></td></tr>
              <tr><td className="muted">Suggested priority</td><td><strong>{item.suggestedPriority || '—'}</strong></td></tr>
              <tr><td className="muted">Suggested SLA</td><td><strong>{item.suggestedSla || '—'}</strong></td></tr>
              <tr><td className="muted">SLA breach risk</td><td><strong>{predicted ? `at risk (${item.confidence ? Math.round(item.confidence * 100) : ''}%)` : 'on track'}</strong></td></tr>
            </tbody>
          </table>

          {links.length > 0 && (
            <details>
              <summary><strong>Linked tickets ({links.length})</strong></summary>
              {links.map((lk) => (
                <div key={lk._id} className="et-flex et-between et-row">
                  <span>{lk.type} → <a href={`/agent/tickets/${lk.to?.number || lk.from?.number}`}>{(lk.to?.number || lk.from?.number)}</a></span>
                </div>
              ))}
            </details>
          )}
          <div className="et-flex">
            <input className="field et-grow" placeholder="Link ticket #…" value={linkTo} onChange={(e) => setLinkTo(e.target.value)} />
            <button className="btn" onClick={addLink}>Link</button>
          </div>
        </div>
      )}

      <div className="box-header et-flex et-between et-mt">
        <span>⚡ AI Assist</span>
      </div>
      <div className="et-flex et-wrap">
        <button className="btn btn-small" disabled={!!aiBusy} onClick={() => run('summarize')}>Summarize</button>
        <button className="btn btn-small" disabled={!!aiBusy} onClick={() => run('rewrite', { kind: 'professional', body: aiInput || undefined })}>Rewrite draft</button>
        <button className="btn btn-small" disabled={!!aiBusy} onClick={() => run('translate', { target: 'es' })}>Translate (ES)</button>
        <button className="btn btn-small" disabled={!!aiBusy} onClick={() => run('assist', { query: aiInput || 'recommend next action' })}>Recommend</button>
      </div>
      <textarea className="field et-mt" rows={2} placeholder="Draft text to rewrite / question to ask AI…" value={aiInput} onChange={(e) => setAiInput(e.target.value)} />
      {aiBusy && <div className="muted">Working…</div>}
      {aiResult && <pre className="et-ai-result">{aiResult}</pre>}
    </div>
  );
}