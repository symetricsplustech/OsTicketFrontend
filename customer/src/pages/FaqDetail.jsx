import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/index.js';

export default function FaqDetail() {
  const { id } = useParams();
  const [faq, setFaq] = useState(null);
  const [error, setError] = useState('');
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    api.get(`/kb/faqs/${id}`).then(({ data }) => setFaq(data.faq)).catch((err) => setError(err.message));
  }, [id]);

  const vote = async (helpful) => {
    if (voted) return;
    setVoted(true);
    try {
      await api.post(`/kb/faqs/${id}/vote`, { helpful });
    } catch { /* ignore */ }
  };

  if (error) return <div className="box"><div className="alert error">{error}</div><Link to="/kb">Back to Knowledgebase</Link></div>;
  if (!faq) return <div className="box muted">Loading…</div>;

  return (
    <div className="box">
      <div className="box-header">
        <h1>{faq.question}</h1>
      </div>
      <p className="muted small">{faq.category?.name} · Viewed {faq.views} times</p>
      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, marginBottom: 18 }}>{faq.answer}</div>
      <div style={{ borderTop: '1px solid var(--ost-border-light)', paddingTop: 12, fontSize: 12 }}>
        Was this article helpful?
        <button className="btn small secondary" style={{ marginLeft: 8 }} onClick={() => vote(true)}>Yes ({faq.helpful})</button>
        <button className="btn small secondary" style={{ marginLeft: 8 }} onClick={() => vote(false)}>No ({faq.notHelpful})</button>
      </div>
      <div className="mt-10"><Link to="/kb">← Back to Knowledgebase</Link></div>
    </div>
  );
}
