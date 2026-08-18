export const setSuperAdminAuth = (token, user) => {
  localStorage.setItem('ost_superadmin_token', token);
  localStorage.setItem('ost_superadmin_user', JSON.stringify(user));
};

export const getSuperAdminAuth = () => {
  const token = localStorage.getItem('ost_superadmin_token');
  const raw = localStorage.getItem('ost_superadmin_user');
  return { token, user: raw ? JSON.parse(raw) : null };
};

export const clearSuperAdminAuth = () => {
  localStorage.removeItem('ost_superadmin_token');
  localStorage.removeItem('ost_superadmin_user');
};
