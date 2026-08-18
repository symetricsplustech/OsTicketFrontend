import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, timeAgo } from '../lib/index.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Notifications() {
  const { loadUnread } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  const load = () => {
    api.get('/agent/notifications').then(({ data }) => setItems(data.items)).catch(() => {});
  };
  useEffect(load, []);

  const markRead = async (n) => {
    if (n.read) return;
    try { await api.put(`/agent/notifications/${n._id}/read`); } catch (err) { return; }
    setItems((list) => list.map((x) => (x._id === n._id ? { ...x, read: true } : x)));
    loadUnread();
  };

  const open = async (n) => {
    await markRead(n);
    if (n.link) {
      navigate(n.link.startsWith('/agent') ? n.link : `/agent${n.link}`);
    }
  };

  const markAllRead = () => {
    api.put('/agent/notifications/read').then(() => { load(); loadUnread(); }).catch(() => {});
  };

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <div className="box">
      <div className="box-header">
        <h1>Notifications {unreadCount > 0 && <span className="muted">({unreadCount} unread)</span>}</h1>
        <button className="btn small secondary" onClick={markAllRead}>Mark all read</button>
      </div>
      {items.length === 0 ? (
        <p className="muted">No notifications yet.</p>
      ) : (
        items.map((n) => (
          <div key={n._id} className={`notif-item ${n.read ? '' : 'unread'}`}>
            <span
              role="button"
              tabIndex={0}
              onClick={() => open(n)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') open(n); }}
              style={{ flex: 1, cursor: 'pointer' }}
              title={n.read ? 'Read' : 'Unread — click to open'}
            >
              <span className={`pill status-${n.type}`}>{n.type.replace('_', ' ')}</span>{' '}
              {n.message}
              {n.ticket && <span className="muted small"> (#{n.ticket.number})</span>}
            </span>
            <span className="muted small">{timeAgo(n.createdAt)}</span>
          </div>
        ))
      )}
    </div>
  );
}
