export interface Task {
  _id: string;
  tenantId: string;
  number: string;
  title: string;
  description: string;
  type: 'incident' | 'problem' | 'change' | 'request' | 'task' | 'subtask';
  state: string;
  priority: string;
  impact?: string;
  urgency?: string;
  category?: string;
  subcategory?: string;
  assignmentGroup?: { _id: string; name: string };
  assignedTo?: { _id: string; name: string; email: string; avatar?: string };
  requestedBy: { _id: string; name: string; email: string };
  requestedFor?: { _id: string; name: string; email: string };
  parentTask?: { _id: string; number: string; title: string; state: string };
  company?: { _id: string; name: string };
  department?: { _id: string; name: string };
  location?: string;
  resolution?: string;
  resolutionCode?: string;
  dueDate?: string;
  resolvedAt?: string;
  closedAt?: string;
  tags?: string[];
  isMajorIncident?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskActivity {
  _id: string;
  tenantId: string;
  taskId: string;
  type: 'comment' | 'work_note' | 'state_change' | 'assignment' | 'field_update' | 'attachment' | 'system';
  content: string;
  isPublic: boolean;
  actor: string;
  actorName: string;
  fieldChanged?: string;
  oldValue?: unknown;
  newValue?: unknown;
  createdAt: string;
}

export interface TaskWatcher {
  _id: string;
  userId: { _id: string; name: string; email: string; avatar?: string };
  createdAt: string;
}

export interface TaskRelationship {
  _id: string;
  sourceTaskId: Task;
  targetTaskId: Task;
  relationshipType: string;
}

export interface TaskListResponse {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface TaskStats {
  byState: Array<{ _id: string; count: number }>;
  byType: Array<{ _id: string; count: number }>;
  byPriority: Array<{ _id: string; count: number }>;
}
