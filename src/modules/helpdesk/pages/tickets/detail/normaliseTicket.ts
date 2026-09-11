import type { Ticket } from './types';

export function normaliseTicket(payload: any): Ticket {
  const ticket = payload.ticket || payload;
  const threads = payload.threads || ticket.thread || [];

  return {
    ...ticket,
    title: ticket.subject || ticket.title || '',
    body: ticket.customData?.details || ticket.body || '',
    assignedTo: ticket.agent || ticket.assignedTo,
    createdBy: ticket.user || ticket.createdBy || { name: '', email: '' },
    departmentId: ticket.dept || ticket.departmentId,
    slaPlan: ticket.sla || ticket.slaPlan,
    resolutionDue: ticket.dueDate || ticket.resolutionDue,
    thread: threads.map((entry: any) => ({
      ...entry,
      content: entry.body || entry.content || entry.systemMessage || '',
      author: entry.agent || entry.user || entry.author,
      attachments: (entry.attachments || []).map((attachment: any) => (
        attachment.path || attachment.filename || attachment
      )),
    })),
  };
}
