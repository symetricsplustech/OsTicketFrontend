import React, { useEffect, useState } from 'react';
import { api } from '../lib/index.js';

export default function KbManage() {
  const [tab, setTab] = useState('faqs');
  const [faqs, setFaqs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [canned, setCanned] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({});

  const loadAll = () => {
    api.get('/agent/faqs', { params: { limit: 50 } }).then(({ data }) => setFaqs(data.items)).catch((e) => setError(e.message));
    api.get('/agent/faq-categories').then(({ data }) => setCategories(data.items)).catch(() => {});
    api.get('/agent/canned').then(({ data }) => setCanned(data.items)).catch(() => {});
    api.get('/agent/announcements').then(({ data }) => setAnnouncements(data.items)).catch(() => {});
  };

  useEffect(loadAll, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      if (tab === 'faqs') {
        await api.post('/agent/faqs', form);
      } else if (tab === 'canned') {
        await api.post('/agent/canned', { title: form.title, response: form.response });
      } else if (tab === 'announcements') {
        await api.post('/agent/announcements', { title: form.title, body: form.body });
      }
      setForm({});
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const del = async (type, id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await api.delete(`/agent/${type}/${id}`);
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="tabs" style={{ marginBottom: 14, borderRadius: 3, background: '#0a4a73' }}>
        <div className="tabs-inner">
          {['faqs', 'canned', 'announcements'].map((t) => (
            <a key={t} className={tab === t ? 'active' : ''} href="#" onClick={(e) => { e.preventDefault(); setTab(t); }}>
              {t === 'faqs' ? 'FAQ Articles' : t === 'canned' ? 'Canned Responses' : 'Announcements'}
            </a>
          ))}
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      {tab === 'faqs' && (
        <div className="box">
          <div className="box-header"><h1>Knowledgebase — FAQ Articles</h1></div>
          <form onSubmit={save} style={{ border: '1px solid var(--ost-border)', padding: 14, marginBottom: 14, background: '#f8fbfd' }}>
            <h2>Add FAQ Article</h2>
            <div className="form-row">
              <div className="field"><label>Question <span className="req">*</span></label>
                <input type="text" required value={form.question || ''} onChange={(e) => setForm({ ...form, question: e.target.value })} /></div>
              <div className="field"><label>Category</label>
                <select value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="">None</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select></div>
            </div>
            <div className="field"><label>Answer <span className="req">*</span></label>
              <textarea required value={form.answer || ''} onChange={(e) => setForm({ ...form, answer: e.target.value })} /></div>
            <div className="buttons"><button className="btn small" type="submit">Add FAQ</button></div>
          </form>
          <table className="list">
            <thead><tr><th>Question</th><th>Category</th><th>Published</th><th>Views</th><th></th></tr></thead>
            <tbody>
              {faqs.map((f) => (
                <tr key={f._id}>
                  <td><strong>{f.question}</strong></td>
                  <td>{f.category?.name || '—'}</td>
                  <td>{f.isPublished ? 'Yes' : 'No'}</td>
                  <td>{f.views}</td>
                  <td><button className="btn small danger" onClick={() => del('faqs', f._id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'canned' && (
        <div className="box">
          <div className="box-header"><h1>Canned Responses</h1></div>
          <form onSubmit={save} style={{ border: '1px solid var(--ost-border)', padding: 14, marginBottom: 14, background: '#f8fbfd' }}>
            <h2>Add Canned Response</h2>
            <div className="field"><label>Title <span className="req">*</span></label>
              <input type="text" required value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="field"><label>Response <span className="req">*</span></label>
              <textarea required value={form.response || ''} onChange={(e) => setForm({ ...form, response: e.target.value })} /></div>
            <div className="buttons"><button className="btn small" type="submit">Add Canned</button></div>
          </form>
          <table className="list">
            <thead><tr><th>Title</th><th>Response</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {canned.map((c) => (
                <tr key={c._id}>
                  <td><strong>{c.title}</strong></td>
                  <td className="small">{c.response}</td>
                  <td><span className="pill" style={{ background: c.status === 'active' ? '#2f9e44' : '#6c757d' }}>{c.status}</span></td>
                  <td><button className="btn small danger" onClick={() => del('canned', c._id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'announcements' && (
        <div className="box">
          <div className="box-header"><h1>Announcements</h1></div>
          <form onSubmit={save} style={{ border: '1px solid var(--ost-border)', padding: 14, marginBottom: 14, background: '#f8fbfd' }}>
            <h2>Add Announcement</h2>
            <div className="field"><label>Title <span className="req">*</span></label>
              <input type="text" required value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="field"><label>Body <span className="req">*</span></label>
              <textarea required value={form.body || ''} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
            <div className="buttons"><button className="btn small" type="submit">Add Announcement</button></div>
          </form>
          {announcements.map((a) => (
            <div key={a._id} style={{ border: '1px solid var(--ost-border-light)', padding: 12, marginBottom: 10 }}>
              <strong>{a.title}</strong> <span className={`pill ${a.isActive ? 'status-open' : 'status-closed'}`}>{a.isActive ? 'Active' : 'Inactive'}</span>
              <div className="small muted mt-10" style={{ whiteSpace: 'pre-wrap' }}>{a.body}</div>
              <div className="mt-10"><button className="btn small danger" onClick={() => del('announcements', a._id)}>Delete</button></div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
