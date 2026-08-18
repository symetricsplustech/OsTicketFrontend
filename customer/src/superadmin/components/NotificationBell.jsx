import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { api, timeAgo } from '../lib/index.js';
import { useAuth } from '../context/AuthContext.jsx';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
  || (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace(/\/api\/v1$/, '')
  || 'http://localhost:5000';

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

export default function NotificationBell() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const load = async () => {
    try {
      const { data } = await api.get('/superadmin/notifications');
      setItems(data.items || []);
      setUnread(data.unread || 0);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!user?._id) return;
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socket.on('connect', () => {
      socket.emit('superadmin:join', user._id);
    });
    socket.on('notification', () => {
      load();
    });
    return () => {
      socket.disconnect();
    };
  }, [user?._id]);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const markAllRead = async () => {
    try {
      await api.put('/superadmin/notifications/read');
      setUnread(0);
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      // ignore
    }
  };

  const markRead = async (n) => {
    if (n.read) return;
    try {
      await api.put(`/superadmin/notifications/${n._id}/read`);
      setItems((prev) => prev.map((x) => (x._id === n._id ? { ...x, read: true } : x)));
      setUnread((u) => Math.max(0, u - 1));
    } catch (err) {
      // ignore
    }
  };

  return (
    <div className="sa-bell" ref={ref}>
      <button type="button" className="sa-bell-btn" onClick={() => setOpen((v) => !v)} aria-label="Notifications">
        <BellIcon />
        {unread > 0 && <span className="sa-bell-badge">{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && (
        <div className="sa-bell-dropdown">
          <div className="sa-bell-head">
            <strong>Notifications</strong>
            {unread > 0 && <button type="button" onClick={markAllRead}>Mark all read</button>}
          </div>
          <div className="sa-bell-list">
            {items.length === 0 && <div className="sa-bell-empty">No notifications yet.</div>}
            {items.slice(0, 12).map((n) => (
              <Link
                key={n._id}
                to={n.link || '/superadmin/notifications'}
                className={`sa-bell-item ${n.read ? '' : 'unread'}`}
                onClick={() => { setOpen(false); markRead(n); }}
              >
                <span className={`pill status-${n.type}`}>{n.type.replace(/_/g, ' ')}</span>
                <div className="sa-bell-msg">{n.message}</div>
                <div className="muted small">{timeAgo(n.createdAt)}</div>
              </Link>
            ))}
          </div>
          <Link to="/superadmin/notifications" className="sa-bell-footer" onClick={() => setOpen(false)}>
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
