import { useEffect } from 'react';

const PORTAL_LOGIN = (import.meta.env.VITE_PORTAL_URL || 'http://localhost:5173').replace(/\/$/, '') + '/login';

export default function Login() {
  useEffect(() => {
    window.location.replace(PORTAL_LOGIN);
  }, []);
  return null;
}
