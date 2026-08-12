import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/index.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setMessage('If an account exists with that email, a password reset link has been sent.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="box">
        <div className="box-header"><h1>Password Reset</h1></div>
        {error && <div className="alert error">{error}</div>}
        {message && <div className="alert success">{message}</div>}
        <form onSubmit={submit}>
          <div className="field">
            <label>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </div>
          <div className="buttons">
            <button type="submit" className="btn" disabled={busy}>{busy ? 'Sending…' : 'Send Reset Link'}</button>
          </div>
          <div className="mt-10 small">
            <Link to="/login">Back to Sign In</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
