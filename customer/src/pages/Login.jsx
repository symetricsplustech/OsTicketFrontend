import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/index.js';

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    <path d="M1 1l22 22" />
  </svg>
);

export default function Login() {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/auth/portal-login', { email: form.email, password: form.password });
      setAuth(data.token, data.user, data.role);
      navigate(
        data.role === 'superadmin' ? '/superadmin'
          : data.role === 'admin' ? '/admin'
          : data.role === 'agent' ? '/agent'
          : '/tickets'
      );
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-tabs">
        <Link to="/login" className="active">Sign In</Link>
      </div>
      <div className="box login-box">
        <div className="box-header"><h1>Support Center Sign In</h1></div>
        <p className="muted small" style={{ marginTop: -8, marginBottom: 12 }}>
          One login for all panels — you will be taken to your panel automatically.
        </p>
        {error && <div className="alert error">{error}</div>}
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="login-email">Email Address</label>
            <input id="login-email" type="email" placeholder="you@example.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoFocus />
          </div>
          <div className="field">
            <label htmlFor="login-password">Password</label>
            <div className="pwd-wrap">
              <input id="login-password" type={showPwd ? 'text' : 'password'} placeholder="Enter your password"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              <button type="button" className="pwd-toggle" onClick={() => setShowPwd((v) => !v)}
                aria-label={showPwd ? 'Hide password' : 'Show password'} title={showPwd ? 'Hide password' : 'Show password'}>
                {showPwd ? <EyeIcon /> : <EyeOffIcon />}
              </button>
            </div>
          </div>
          <div className="buttons login-actions">
            <button type="submit" className="btn login-btn" disabled={busy}>{busy ? 'Signing in…' : 'Sign In'}</button>
          </div>
          <div className="mt-10 small login-forgot">
            <Link to="/forgot-password">Forgot your password?</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
