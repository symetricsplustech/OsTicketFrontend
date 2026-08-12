import React, { useEffect, useState } from 'react';
import { api } from '../lib/index.js';

export default function AdminKb() {
  const [categories, setCategories] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({});
  const [showCat, setShowCat] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', description: '' });

  const load = () => {
    api.get('/agent/faq-categories').then(({ data }) => setCategories(data.items)).catch(() => {});
    api.get('/agent/faqs', { params: { limit: 100 } }).then(({ data }) => setFaqs(data.items)).catch((e) => setError(e.message));
  };
  useEffect(load, []);

  const addFaq = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/faqs', form);
      setForm({});
      load();
    } catch (err) { setError(err.message); }
  };

  const addCat = async (e) => {
    e.preventDefault();
    try {
      await api.post('/agent/faq-categories', catForm);
      setCatForm({ name: '', description: '' });
      setShowCat(false);
      load();
    } catch (err) { setError(err.message); }
  };

  const del = async (type, id) => {
    if (!window.confirm('Delete?')) return;
    try { await api.delete(`/agent/${type}/${id}`); load(); } catch (err) { setError(err.message); }
  };

  return (
    <>
      <div className="box">
        <div className="box-header">
          <h1>Knowledgebase — Categories</h1>
          <button className="btn small" onClick={() => setShowCat(!showCat)}>Add Category</button>
        </div>
        {error && <div className="alert error">{error}</div>}
        {showCat && (
          <form onSubmit={addCat} className="form-panel">
            <div className="form-row">
              <div className="field"><label>Name <span className="req">*</span></label>
                <input type="text" required value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} /></div>
              <div className="field"><label>Description</label>
                <input type="text" value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} /></div>
            </div>
            <div className="buttons"><button className="btn small" type="submit">Create</button></div>
          </form>
        )}
        <table className="list">
          <thead><tr><th>Name</th><th>Description</th><th>Public</th><th style={{ width: 100 }}>Actions</th></tr></thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c._id}>
                <td><strong>{c.name}</strong></td>
                <td>{c.description}</td>
                <td>{c.isPublic ? 'Yes' : 'No'}</td>
                <td><button className="btn small danger" onClick={() => del('faq-categories', c._id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="box">
        <div className="box-header"><h1>FAQ Articles</h1></div>
        <form onSubmit={addFaq} className="form-panel">
          <h2>Add FAQ</h2>
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
          <thead><tr><th>Question</th><th>Category</th><th>Published</th><th>Views</th><th style={{ width: 100 }}>Actions</th></tr></thead>
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
    </>
  );
}
