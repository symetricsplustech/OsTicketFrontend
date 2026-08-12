export const USER_PERMISSIONS = {
  TICKET_CREATE: 'ticket_create',
  TICKET_VIEW: 'ticket_view',
  TICKET_REPLY: 'ticket_reply',
  TICKET_DELETE: 'ticket_delete',
};

export const isEmployee = (user) => Boolean(user && user.createdBy);

export const can = (user, perm) => !isEmployee(user) || (user.permissions || []).includes(perm);
