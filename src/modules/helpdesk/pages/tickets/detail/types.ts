export interface TicketThreadEntry {
  _id: string;
  type: string;
  content: string;
  author?: { name: string; email: string };
  attachments?: string[];
  createdAt: string;
}

export interface Ticket {
  _id: string;
  number: string;
  title: string;
  body?: string;
  status: string;
  priority: string;
  category?: string;
  source?: string;
  assignedTo?: Agent;
  createdBy: { name: string; email: string };
  departmentId?: { name: string };
  slaPlan?: { name: string };
  firstResponseDue?: string;
  resolutionDue?: string;
  thread: TicketThreadEntry[];
  attachments?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Agent { _id: string; name: string; email: string }
export interface Department { _id: string; name: string }
export interface TicketStatus { key: string; name: string; isClosed?: boolean }
export interface AssetOption { _id: string; name: string; serial?: string; hostname?: string }
