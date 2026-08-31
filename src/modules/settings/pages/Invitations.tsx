import { useState, useEffect } from 'react';
import { Mail, Plus, XCircle, Clock, CheckCircle, Send } from 'lucide-react';
import api from '@shared/lib/api';

interface Invitation {
  _id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  invitedBy: { name: string };
  createdAt: string;
  token: string;
}

export default function Invitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: '', role: 'client', modules: [] as string[] });

  useEffect(() => { loadInvitations(); }, []);

  const loadInvitations = async () => {
    try { const { data } = await api.get('/platform/invitations'); setInvitations(data); } catch {}
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.post('/platform/invitations', form); setShowForm(false); setForm({ email: '', role: 'client', modules: [] }); loadInvitations(); } catch {}
  };

  const handleCancel = async (id: string) => {
    try { await api.delete(`/platform/invitations/${id}`); loadInvitations(); } catch {}
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'expired': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-gray-400" />;
      default: return <Mail className="h-4 w-4 text-gray-400" />;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'expired': return 'bg-red-100 text-red-700';
      case 'cancelled': return 'bg-gray-100 text-gray-500';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  const roleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700';
      case 'agent': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Mail className="h-6 w-6" /> User Invitations</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Send className="h-4 w-4" /> Send Invitation
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-4 rounded-lg border space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input type="email" placeholder="Email address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="border rounded-lg px-3 py-2" required />
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="border rounded-lg px-3 py-2">
              <option value="client">Client</option>
              <option value="agent">Agent</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Send</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Role</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Invited By</th>
              <th className="text-left px-4 py-3 font-medium">Expires</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {invitations.map(inv => (
              <tr key={inv._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{inv.email}</td>
                <td className="px-4 py-3"><span className={`px-2 py-1 text-xs rounded-full ${roleColor(inv.role)}`}>{inv.role}</span></td>
                <td className="px-4 py-3"><div className="flex items-center gap-2">{statusIcon(inv.status)}<span className={`px-2 py-1 text-xs rounded-full ${statusColor(inv.status)}`}>{inv.status}</span></div></td>
                <td className="px-4 py-3 text-sm text-gray-500">{inv.invitedBy?.name || 'N/A'}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{new Date(inv.expiresAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {inv.status === 'pending' && (
                    <button onClick={() => handleCancel(inv._id)} className="text-red-600 hover:text-red-800 text-xs px-2 py-1 bg-red-50 rounded">Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
