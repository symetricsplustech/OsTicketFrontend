export const formatDate = (date, withTime = false) => {
  if (!date) return '—';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '—';
  const opts = withTime
    ? { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { day: '2-digit', month: 'short', year: 'numeric' };
  return d.toLocaleDateString('en-GB', opts);
};

export const formatDateTime = (date) => formatDate(date, true);

export const timeAgo = (date) => {
  if (!date) return '—';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
};

export const initials = (name = '') => {
  const parts = name.trim().split(/\s+/);
  return parts.map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '?';
};

export const truncate = (str = '', len = 80) =>
  str.length > len ? `${str.slice(0, len)}…` : str;

export const fileSize = (bytes = 0) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const uploadUrl = (path) => {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
  const origin = base.replace(/\/api\/v1\/?$/, '');
  return `${origin}/uploads/${path}`;
};
