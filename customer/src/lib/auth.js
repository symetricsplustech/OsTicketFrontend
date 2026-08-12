export const setCustomerAuth = (token, user) => {
  localStorage.setItem('ost_ticket_token', token);
  localStorage.setItem('ost_customer_user', JSON.stringify(user));
};

export const getCustomerAuth = () => {
  const token = localStorage.getItem('ost_ticket_token');
  const raw = localStorage.getItem('ost_customer_user');
  return { token, user: raw ? JSON.parse(raw) : null };
};

export const clearCustomerAuth = () => {
  localStorage.removeItem('ost_ticket_token');
  localStorage.removeItem('ost_customer_user');
};
