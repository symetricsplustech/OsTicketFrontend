import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, formatDateTime } from '../lib/index.js';

export default function Notifications() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);

  const load = () => {
    api.get('/users/notifications').then(({ data }) => { setItems(data.items || []); setUnread(data.unread || 0); }).catch(() => {});
  };
  useEffect(load, []);

  const markRead = async (n) => {
    if (n.read) return;
    try { await api.put(`/users/notifications/${n._id}/read`); } catch (err) { return; }
    setItems((list) => list.map((x) => (x._id === n._id ? { ...x, read: true } : x)));
    setUnread((u) => Math.max(0, u - 1));
  };

  const open = async (n) => {
    await markRead(n);
    if (n.link) navigate(n.link);
  };

  const markAllRead = () => {
    api.put('/users/notifications/read').then(() => { load(); }).catch(() => {});
  };

  return (
    <div className="box">
      <div className="box-header">
        <h1>Notifications {unread > 0 && <span className="muted">({unread} unread)</span>}</h1>
        <button className="btn small secondary" onClick={markAllRead}>Mark all read</button>
      </div>
      {items.length === 0 ? (
        <p className="muted">No notifications yet.</p>
      ) : (
        items.map((n) => (
          <div key={n._id} className="notif-item">
            <span
              role="button"
              tabIndex={0}
              onClick={() => open(n)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') open(n); }}
              style={{ flex: 1, cursor: 'pointer' }}
              title={n.read ? 'Read' : 'Unread — click to open'}
            >
              {n.message}
            </span>
            <span className="muted small">{formatDateTime(n.createdAt)}</span>
          </div>
        ))
      )}
    </div>
  );
}
