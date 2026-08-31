export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'customer' | 'agent' | 'admin' | 'superadmin';
  permissions: string[];
  modules: string[];
  status?: string;
  isAdmin?: boolean;
}

export interface Tenant {
  _id: string;
  name: string;
  domain?: string;
  email?: string;
  phone?: string;
}

export interface TenantModule {
  _id: string;
  tenantId: string;
  moduleKey: string;
  status: 'active' | 'inactive';
  activatedAt: string;
  updatedAt: string;
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
  department?: string;
  assignedTo?: { name: string; email: string };
  createdBy: { name: string; email: string };
  departmentId?: { name: string };
  slaPlan?: { name: string };
  firstResponseDue?: string;
  resolutionDue?: string;
  thread?: TicketThread[];
  attachments?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketThread {
  _id: string;
  type: string;
  content: string;
  author?: { name: string; email: string };
  attachments?: string[];
  createdAt: string;
}

export interface Asset {
  _id: string;
  assetId: string;
  name: string;
  type: string;
  status: string;
  condition?: string;
  location?: string;
  assignedTo?: { name: string };
  department?: { name: string };
  purchaseDate?: string;
  warrantyEnd?: string;
  createdAt: string;
}

export interface Incident {
  _id: string;
  title: string;
  status: string;
  priority: string;
  impact?: string;
  urgency?: string;
  assignedTo?: { name: string };
  createdAt: string;
}

export interface Problem {
  _id: string;
  title: string;
  status: string;
  priority: string;
  rootCause?: string;
  assignedTo?: { name: string };
  createdAt: string;
}

export interface Change {
  _id: string;
  title: string;
  status: string;
  type?: string;
  risk?: string;
  assignedTo?: { name: string };
  createdAt: string;
}

export interface Lead {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  status: string;
  source?: string;
  score?: number;
  assignedTo?: { name: string };
  createdAt: string;
}

export interface Account {
  _id: string;
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
  status?: string;
  revenue?: number;
  employees?: number;
  createdAt: string;
}

export interface Contact {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  account?: { name: string };
  createdAt: string;
}

export interface Opportunity {
  _id: string;
  name: string;
  stage: string;
  value?: number;
  account?: { name: string };
  assignedTo?: { name: string };
  createdAt: string;
}

export interface Workflow {
  _id: string;
  name: string;
  description?: string;
  event: string;
  status: string;
  conditions: unknown[];
  actions: unknown[];
  createdBy?: { name: string };
  createdAt: string;
  updatedAt: string;
}

export interface SlaPlan {
  _id: string;
  name: string;
  gracePeriod: number;
  schedule?: string;
  status: string;
  notes?: string;
}

export interface Department {
  _id: string;
  name: string;
  email?: string;
  manager?: { name: string };
  sla?: { name: string };
  isPublic: boolean;
  autoAssign: boolean;
}

export interface Role {
  _id: string;
  name: string;
  isAdmin: boolean;
  permissions: string[];
}

export interface Team {
  _id: string;
  name: string;
  lead?: { name: string };
  members: Array<{ name: string }>;
  status: string;
}
