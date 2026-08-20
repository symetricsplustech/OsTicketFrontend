import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/index.js';

export default function Register() {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm((current) => ({ ...current, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      if (!data.token || !data.user) throw new Error('Account could not be created. Please try again.');
      setAuth(data.token, data.user, 'customer');
      navigate('/open');
    } catch (err) {
      setError(err.message || 'Account could not be created.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-tabs">
        <Link to="/login">Sign In</Link>
        <Link to="/register" className="active">Create Account</Link>
      </div>
      <div className="box login-box">
        <div className="box-header"><h1>Create Your Support Account</h1></div>
        <p className="muted small" style={{ marginTop: -8, marginBottom: 12 }}>
          Create an account to open, track, and reply to your support tickets.
        </p>
        {error && <div className="alert error">{error}</div>}
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="register-name">Full Name</label>
            <input id="register-name" type="text" value={form.name} onChange={set('name')} required autoFocus />
          </div>
          <div className="field">
            <label htmlFor="register-email">Email Address</label>
            <input id="register-email" type="email" value={form.email} onChange={set('email')} required />
          </div>
          <div className="field">
            <label htmlFor="register-phone">Phone <span className="muted">(optional)</span></label>
            <input id="register-phone" type="tel" value={form.phone} onChange={set('phone')} />
          </div>
          <div className="field">
            <label htmlFor="register-password">Password</label>
            <input id="register-password" type="password" value={form.password} onChange={set('password')} minLength="6" required />
          </div>
          <div className="field">
            <label htmlFor="register-confirm-password">Confirm Password</label>
            <input id="register-confirm-password" type="password" value={form.confirmPassword} onChange={set('confirmPassword')} minLength="6" required />
          </div>
          <div className="buttons login-actions">
            <button type="submit" className="btn login-btn" disabled={busy}>{busy ? 'Creating Account…' : 'Create Account'}</button>
          </div>
          <div className="mt-10 small login-forgot">
            <Link to="/login">Already have an account? Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
