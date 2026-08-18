export const setAgentAuth = (token, user, panel) => {
  localStorage.setItem('ost_agent_token', token);
  localStorage.setItem('ost_agent_user', JSON.stringify(user));
  localStorage.setItem('ost_agent_panel', panel);
};

export const getAgentAuth = () => {
  const token = localStorage.getItem('ost_agent_token');
  const raw = localStorage.getItem('ost_agent_user');
  return { token, user: raw ? JSON.parse(raw) : null };
};

export const clearAgentAuth = () => {
  localStorage.removeItem('ost_agent_token');
  localStorage.removeItem('ost_agent_user');
  localStorage.removeItem('ost_agent_panel');
};
