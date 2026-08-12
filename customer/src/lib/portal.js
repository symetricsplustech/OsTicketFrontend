export const PORTAL_URL = (import.meta.env.VITE_PORTAL_URL || 'http://localhost:5173').replace(/\/$/, '');

export const PANEL_URLS = {
  customer: (import.meta.env.VITE_CUSTOMER_URL || 'http://localhost:5173').replace(/\/$/, ''),
  agent: (import.meta.env.VITE_AGENT_URL || 'http://localhost:5174').replace(/\/$/, ''),
  admin: (import.meta.env.VITE_ADMIN_URL || 'http://localhost:5175').replace(/\/$/, ''),
  superadmin: (import.meta.env.VITE_SUPERADMIN_URL || 'http://localhost:5176').replace(/\/$/, ''),
};

export const panelPathFor = (role) => {
  switch (role) {
    case 'superadmin':
      return `${PANEL_URLS.superadmin}/?access=`;
    case 'admin':
      return `${PANEL_URLS.admin}/admin?access=`;
    case 'agent':
      return `${PANEL_URLS.agent}/agent?access=`;
    default:
      return `${PANEL_URLS.customer}/tickets?access=`;
  }
};
