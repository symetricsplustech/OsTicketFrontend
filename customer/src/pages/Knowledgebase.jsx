import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, truncate } from '../lib/index.js';

export default function Knowledgebase() {
  const [categories, setCategories] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const load = () => {
    api.get('/kb/faqs', { params: { search: search || undefined, category: category || undefined, limit: 50 } })
      .then(({ data }) => setFaqs(data.items))
      .catch(() => {});
  };

  useEffect(() => {
    api.get('/kb/categories').then(({ data }) => setCategories(data.items)).catch(() => {});
    load();
  }, [category]);

  return (
    <>
      <div className="box">
        <div className="box-header"><h1>Knowledgebase</h1></div>
        <p>Search our knowledgebase for instant answers to common questions.</p>
        <div className="kb-search">
          <input type="text" placeholder="Search the knowledgebase…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { setCategory(''); load(); } }} />
          <button className="btn" onClick={() => { setCategory(''); load(); }}>Search</button>
        </div>
      </div>

      {!category && (
        <div className="kb-cats">
          {categories.map((c) => (
            <div className="kb-cat" key={c._id}>
              <h3>{c.name} <span className="muted small">({c.count})</span></h3>
              <p className="muted small">{c.description}</p>
              <Link to={`/kb?category=${c._id}`} onClick={() => { setCategory(c._id); }}>Browse articles →</Link>
            </div>
          ))}
        </div>
      )}

      <div className="box mt-10">
        <div className="box-header">
          <h1>{category ? 'Search Results' : 'Recent Articles'}</h1>
          {category && <button className="btn secondary small" onClick={() => setCategory('')}>All Categories</button>}
        </div>
        {faqs.length === 0 ? (
          <p className="muted">No articles found.</p>
        ) : (
          faqs.map((f) => (
            <div className="kb-faq-item" key={f._id}>
              <Link to={`/kb/${f._id}`}><strong>{f.question}</strong></Link>
              <p className="muted small" style={{ marginTop: 3 }}>{truncate(f.answer, 180)}</p>
            </div>
          ))
        )}
      </div>
    </>
  );
}
