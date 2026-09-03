import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@core/auth/useAuth';
import api from '@shared/lib/api';
import toast from 'react-hot-toast';

interface EmailStatus {
  currentEmail: string;
  pendingEmail: string;
  pendingExpires: string | null;
  verified: boolean;
  supportInbox: string;
  supportDomain: string;
  supportCompany: { _id: string; name: string } | null;
  canConfigure: boolean;
}

export default function SupportEmail() {
  const [params] = useSearchParams();
  const { user: authUser } = useAuth();
  const [status, setStatus] = useState<EmailStatus | null>(null);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [token, setToken] = useState(params.get('token') || '');
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [ticketCount, setTicketCount] = useState<number | null>(null);
  const [inbox, setInbox] = useState('');
  const [domain, setDomain] = useState('');
  const [savingInbox, setSavingInbox] = useState(false);

  const load = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await api.get('/users/me/email');
      setStatus(res.data);
      setInbox(res.data?.supportInbox || '');
      setDomain(res.data?.supportDomain || '');
    } catch (err: any) {
      setStatus(null);
      const msg = err?.response?.data?.message || err?.response?.data?.error || '';
      const http = err?.response?.status;
      setLoadError(
        http === 404
          ? 'API route not found (404). Restart the backend server to pick up the new /users/me/email route, then refresh.'
          : http === 403
            ? `Access denied (403). ${msg || 'Your account has no company/tenant linked.'}`
            : msg || 'Could not load email status. Is the backend running?'
      );
    } finally {
      setLoading(false);
    }
    try {
      const t = await api.get('/tickets', { params: { limit: 1 } });
      setTicketCount(typeof t.data?.total === 'number' ? t.data.total : (t.data?.items?.length ?? null));
    } catch {
      setTicketCount(null);
    }
  };

  useEffect(() => { load(); }, []);

  const requestChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setSaving(true);
    try {
      const res = await api.post('/users/me/email', { email: newEmail.trim() });
      toast.success(res.data?.message || 'Verification sent');
      if (res.data?.debugToken) {
        setToken(res.data.debugToken);
        toast('Dev mode: token prefilled below', { icon: '🔧' });
      }
      setNewEmail('');
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to request change');
    } finally {
      setSaving(false);
    }
  };

  const confirmChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    setConfirming(true);
    try {
      const res = await api.post('/users/me/email/confirm', { token: token.trim() });
      toast.success(res.data?.message || 'Email updated');
      setToken('');
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid or expired token');
    } finally {
      setConfirming(false);
    }
  };

  const saveInbox = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inbox.trim()) return;
    setSavingInbox(true);
    try {
      const res = await api.put('/users/company/support-inbox', { supportEmail: inbox.trim(), domain: domain.trim() || undefined });
      toast.success(res.data?.message || 'Support inbox updated');
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save inbox');
    } finally {
      setSavingInbox(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" /></div>;

  const senderAddress = status?.currentEmail || (authUser as any)?.email || '';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Support Email</h1>
        <p className="text-sm text-gray-500">Mail from this address to create tickets without logging in. They appear here automatically.</p>
      </div>

      {loadError && (
        <div className="card p-5 border-red-200 bg-red-50">
          <p className="text-sm font-medium text-red-800">Couldn't load email status</p>
          <p className="text-xs text-red-600 mt-1">{loadError}</p>
          <button onClick={load} className="btn-secondary text-xs mt-3">Retry</button>
        </div>
      )}

      <div className="card p-5 space-y-2">
        <div className="text-sm"><span className="text-gray-500">Your sender address: </span><span className="font-semibold">{senderAddress || '—'}</span></div>
        <div className="text-sm"><span className="text-gray-500">Mail tickets to (hired organisation): </span>
          {status?.supportInbox
            ? <span className="font-mono font-semibold text-brand-700">{status.supportInbox}</span>
            : <span className="text-gray-400">not configured — ask your company owner to set it below</span>}
          {status?.supportCompany && <span className="text-gray-500"> ({status.supportCompany.name})</span>}
        </div>
        {ticketCount !== null && (
          <div className="text-sm text-gray-500">{ticketCount} ticket(s) linked to this account. <Link to="/ticket-board" className="text-brand-600 hover:underline">View progress →</Link></div>
        )}
        <p className="text-xs text-gray-400">Tip: keep the ticket <span className="font-mono">[#NUMBER]</span> in the subject when replying by email so it threads to the same ticket.</p>
      </div>

      {status?.canConfigure && (
        <div className="card p-5 border-brand-200">
          <h2 className="font-semibold mb-1">Organisation inbox <span className="text-xs font-normal text-gray-400">(company owner)</span></h2>
          <p className="text-xs text-gray-500 mb-3">You own this company — set the ONE address customers mail to. Inbound mail to it auto-creates tickets here.</p>
          <form onSubmit={saveInbox} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Support inbox *</label>
              <input type="email" required placeholder="support@your-company.com" value={inbox} onChange={(e) => setInbox(e.target.value)} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Domain <span className="font-normal text-gray-400">(optional fallback: anything@mail-domain routes here)</span></label>
              <input placeholder="your-company.com" value={domain} onChange={(e) => setDomain(e.target.value)} className="input-field w-full" />
            </div>
            <button disabled={savingInbox} className="btn-primary text-sm">{savingInbox ? 'Saving…' : 'Save inbox'}</button>
          </form>
        </div>
      )}

      {status?.pendingEmail && (
        <div className="card p-5 border-amber-200 bg-amber-50">
          <p className="text-sm font-medium text-amber-800">Pending verification: {status.pendingEmail}</p>
          <p className="text-xs text-amber-600">Confirm within 30 minutes using the token mailed to the new address.</p>
        </div>
      )}

      <div className="card p-5">
        <h2 className="font-semibold mb-2">Change sender address</h2>
        <form onSubmit={requestChange} className="flex gap-2">
          <input type="email" required placeholder="new-email@example.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="input-field flex-1" />
          <button disabled={saving} className="btn-primary">{saving ? 'Sending…' : 'Send verification'}</button>
        </form>
        <p className="text-xs text-gray-400 mt-2">History stays linked — the account id never changes, only the address.</p>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold mb-2">Confirm new address</h2>
        <form onSubmit={confirmChange} className="flex gap-2">
          <input placeholder="Paste verification token" value={token} onChange={(e) => setToken(e.target.value)} className="input-field flex-1 font-mono text-sm" />
          <button disabled={confirming} className="btn-secondary">{confirming ? 'Confirming…' : 'Confirm'}</button>
        </form>
      </div>
    </div>
  );
}
