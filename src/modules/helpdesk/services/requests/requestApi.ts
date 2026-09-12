import api from '@shared/lib/api';

// ─── Types ──────────────────────────────────────────────────────────────

export interface Catalog {
  _id: string;
  tenantId: string;
  number: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  isActive: boolean;
  visibleInPortal: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogCategory {
  _id: string;
  tenantId: string;
  catalogId: string;
  number: string;
  name: string;
  description: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
  visibleInPortal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogItem {
  _id: string;
  tenantId: string;
  catalogId: string;
  categoryId: string | CatalogCategory;
  number: string;
  name: string;
  title: string;
  description: string;
  shortDescription: string;
  icon: string;
  picture: string;
  price: number;
  currency: string;
  needsPayment: boolean;
  isBundle: boolean;
  bundleItems: string[];
  estimatedDeliveryTime: string;
  estimatedTime: number;
  autoFulfill: boolean;
  requiresApproval: boolean;
  approvalMode: 'individual' | 'group' | 'sequential' | 'parallel';
  approvers: string[];
  approvalGroups: string[];
  visibleInPortal: boolean;
  isActive: boolean;
  sortOrder: number;
  helpTopic: string;
  department: string;
  sla: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  formId: string;
  entitlementRequired: boolean;
  publishedAt: string;
  retiredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogItemVariable {
  _id: string;
  tenantId: string;
  itemId: string;
  variableSetId: string;
  name: string;
  label: string;
  type: string;
  defaultValue: unknown;
  helpText: string;
  placeholder: string;
  required: boolean;
  readOnly: boolean;
  visible: boolean;
  maxLength: number;
  minLength: number;
  regex: string;
  choices: Array<{ label: string; value: string; order: number; inactive: boolean }>;
  sortOrder: number;
  section: string;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  _id: string;
  tenantId: string;
  userId: string;
  number: string;
  status: 'active' | 'submitted' | 'abandoned';
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  currency: string;
  requestedFor: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  _id: string;
  tenantId: string;
  cartId: string;
  catalogItemId: string | CatalogItem;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  variableAnswers: Record<string, unknown>;
  specialInstructions: string;
  createdAt: string;
  updatedAt: string;
}

export interface Request {
  _id: string;
  tenantId: string;
  number: string;
  title: string;
  description: string;
  status: 'open' | 'work_in_progress' | 'closed_complete' | 'closed_incomplete' | 'closed_canceled';
  requester: { _id: string; name: string; email: string };
  requestedFor: { _id: string; name: string; email: string };
  requestedItems: RequestedItem[];
  itemCount: number;
  totalCost: number;
  currency: string;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'not_required';
  priority: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  dueAt: string;
  resolvedAt: string;
  closedAt: string;
  closeCode: string;
  closeNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface RequestedItem {
  _id: string;
  tenantId: string;
  requestId: string;
  number: string;
  catalogItemId: string | CatalogItem;
  catalogItemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  variableAnswers: Record<string, unknown>;
  status: 'pending_approval' | 'open' | 'work_in_progress' | 'closed_complete' | 'closed_incomplete' | 'closed_canceled';
  requestedFor: { _id: string; name: string; email: string };
  assignedTo: { _id: string; name: string; email: string };
  fulfillmentStatus: 'not_started' | 'in_progress' | 'complete' | 'partial' | 'failed';
  fulfillmentStepsTotal: number;
  fulfillmentStepsComplete: number;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'not_required';
  dueAt: string;
  closedAt: string;
  closeCode: string;
  closeNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogTask {
  _id: string;
  tenantId: string;
  requestedItemId: string;
  requestId: string;
  number: string;
  title: string;
  description: string;
  status: 'open' | 'work_in_progress' | 'closed_complete' | 'closed_incomplete' | 'closed_skipped';
  order: number;
  executionType: 'sequential' | 'parallel';
  assignedTo: { _id: string; name: string; email: string };
  assignmentGroup: string;
  startedAt: string;
  completedAt: string;
  closeCode: string;
  closeNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface RequestApproval {
  _id: string;
  tenantId: string;
  requestedItemId: string;
  requestId: string;
  mode: 'sequential' | 'parallel';
  status: 'pending' | 'approved' | 'rejected' | 'escalated' | 'cancelled';
  approvers: Array<{
    userId: string;
    status: 'pending' | 'approved' | 'rejected' | 'skipped' | 'delegated';
    decidedBy: string;
    decidedAt: string;
    comment: string;
  }>;
  requiredApprovals: number;
  approvalCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FulfillmentPlan {
  _id: string;
  tenantId: string;
  number: string;
  name: string;
  description: string;
  isActive: boolean;
  steps: FulfillmentStep[];
  stepCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FulfillmentStep {
  _id: string;
  tenantId: string;
  planId: string;
  name: string;
  description: string;
  order: number;
  executionType: 'sequential' | 'parallel' | 'conditional';
  assignmentGroup: string;
  assignedTo: string;
  generateTask: boolean;
  taskTitle: string;
  isAutomated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── API ────────────────────────────────────────────────────────────────

export const requestApi = {
  // Catalog
  listCatalogs: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: Catalog[] }>('/core/requests/catalogs', { params }),
  getCatalog: (id: string) =>
    api.get<{ success: boolean; data: Catalog }>(`/core/requests/catalogs/${id}`),
  createCatalog: (data: Partial<Catalog>) =>
    api.post<{ success: boolean; data: Catalog }>('/core/requests/catalogs', data),
  updateCatalog: (id: string, data: Partial<Catalog>) =>
    api.put<{ success: boolean; data: Catalog }>(`/core/requests/catalogs/${id}`, data),
  deleteCatalog: (id: string) =>
    api.delete<{ success: boolean; data: { success: boolean } }>(`/core/requests/catalogs/${id}`),

  // Categories
  listCategories: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: CatalogCategory[] }>('/core/requests/categories', { params }),
  getCategory: (id: string) =>
    api.get<{ success: boolean; data: CatalogCategory }>(`/core/requests/categories/${id}`),
  createCategory: (data: Partial<CatalogCategory>) =>
    api.post<{ success: boolean; data: CatalogCategory }>('/core/requests/categories', data),
  updateCategory: (id: string, data: Partial<CatalogCategory>) =>
    api.put<{ success: boolean; data: CatalogCategory }>(`/core/requests/categories/${id}`, data),
  deleteCategory: (id: string) =>
    api.delete<{ success: boolean; data: { success: boolean } }>(`/core/requests/categories/${id}`),

  // Catalog Items
  listCatalogItems: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: CatalogItem[] }>('/core/requests/items', { params }),
  getCatalogItem: (id: string) =>
    api.get<{ success: boolean; data: CatalogItem }>(`/core/requests/items/${id}`),
  createCatalogItem: (data: Partial<CatalogItem>) =>
    api.post<{ success: boolean; data: CatalogItem }>('/core/requests/items', data),
  updateCatalogItem: (id: string, data: Partial<CatalogItem>) =>
    api.put<{ success: boolean; data: CatalogItem }>(`/core/requests/items/${id}`, data),
  deleteCatalogItem: (id: string) =>
    api.delete<{ success: boolean; data: { success: boolean } }>(`/core/requests/items/${id}`),
  publishItem: (id: string) =>
    api.post<{ success: boolean; data: CatalogItem }>(`/core/requests/items/${id}/publish`),
  retireItem: (id: string) =>
    api.post<{ success: boolean; data: CatalogItem }>(`/core/requests/items/${id}/retire`),

  // Variables
  listItemVariables: (itemId: string) =>
    api.get<{ success: boolean; data: CatalogItemVariable[] }>(`/core/requests/items/${itemId}/variables`),
  createItemVariable: (itemId: string, data: Partial<CatalogItemVariable>) =>
    api.post<{ success: boolean; data: CatalogItemVariable }>(`/core/requests/items/${itemId}/variables`, data),
  updateItemVariable: (id: string, data: Partial<CatalogItemVariable>) =>
    api.put<{ success: boolean; data: CatalogItemVariable }>(`/core/requests/variables/${id}`, data),
  deleteItemVariable: (id: string) =>
    api.delete<{ success: boolean; data: { success: boolean } }>(`/core/requests/variables/${id}`),

  // Cart
  getMyCart: () =>
    api.get<{ success: boolean; data: Cart }>('/core/requests/cart'),
  getCart: (id: string) =>
    api.get<{ success: boolean; data: Cart }>(`/core/requests/cart/${id}`),
  addToCart: (cartId: string, data: { catalogItemId: string; quantity?: number; variableAnswers?: Record<string, unknown> }) =>
    api.post<{ success: boolean; data: Cart }>(`/core/requests/cart/${cartId}/items`, data),
  updateCartItem: (cartItemId: string, data: { quantity?: number; variableAnswers?: Record<string, unknown> }) =>
    api.put<{ success: boolean; data: CartItem }>(`/core/requests/cart/items/${cartItemId}`, data),
  removeFromCart: (cartItemId: string) =>
    api.delete<{ success: boolean; data: Cart }>(`/core/requests/cart/items/${cartItemId}`),
  abandonCart: (cartId: string) =>
    api.post<{ success: boolean; data: Cart }>(`/core/requests/cart/${cartId}/abandon`),

  // Checkout
  checkout: (cartId: string, data: { requestedFor?: string; specialInstructions?: string; priority?: string }) =>
    api.post<{ success: boolean; data: { request: Request; requestedItems: RequestedItem[]; cart: Cart } }>(`/core/requests/cart/${cartId}/checkout`, data),
  orderDirect: (itemId: string, data: { quantity?: number; requestedFor?: string; variableAnswers?: Record<string, unknown>; specialInstructions?: string; priority?: string }) =>
    api.post<{ success: boolean; data: { request: Request; requestedItem: RequestedItem } }>(`/core/requests/items/${itemId}/order`, data),

  // Requests
  listRequests: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: PaginatedResponse<Request> }>('/core/requests/reqs', { params }),
  getRequest: (id: string) =>
    api.get<{ success: boolean; data: Request }>(`/core/requests/reqs/${id}`),
  transitionRequest: (id: string, data: { status: string; closeCode?: string; closeNotes?: string }) =>
    api.post<{ success: boolean; data: Request }>(`/core/requests/reqs/${id}/transition`, data),
  cancelRequest: (id: string, data?: { closeNotes?: string }) =>
    api.post<{ success: boolean; data: Request }>(`/core/requests/reqs/${id}/cancel`, data),

  // RITMs
  listRITMs: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: PaginatedResponse<RequestedItem> }>('/core/requests/ritms', { params }),
  getRITM: (id: string) =>
    api.get<{ success: boolean; data: RequestedItem }>(`/core/requests/ritms/${id}`),
  transitionRITM: (id: string, data: { status: string; closeCode?: string; closeNotes?: string }) =>
    api.post<{ success: boolean; data: RequestedItem }>(`/core/requests/ritms/${id}/transition`, data),

  // Catalog Tasks
  listCatalogTasks: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: CatalogTask[] }>('/core/requests/tasks', { params }),
  getCatalogTask: (id: string) =>
    api.get<{ success: boolean; data: CatalogTask }>(`/core/requests/tasks/${id}`),
  transitionCatalogTask: (id: string, data: { status: string; closeNotes?: string }) =>
    api.post<{ success: boolean; data: CatalogTask }>(`/core/requests/tasks/${id}/transition`, data),

  // Approvals
  listRequestApprovals: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: RequestApproval[] }>('/core/requests/approvals', { params }),
  decideRequestApproval: (id: string, data: { decision: 'approved' | 'rejected'; comment?: string }) =>
    api.post<{ success: boolean; data: RequestApproval }>(`/core/requests/approvals/${id}/decide`, data),

  // Fulfillment Plans
  listFulfillmentPlans: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: FulfillmentPlan[] }>('/core/requests/fulfillment-plans', { params }),
  getFulfillmentPlan: (id: string) =>
    api.get<{ success: boolean; data: FulfillmentPlan }>(`/core/requests/fulfillment-plans/${id}`),
  createFulfillmentPlan: (data: Partial<FulfillmentPlan>) =>
    api.post<{ success: boolean; data: FulfillmentPlan }>('/core/requests/fulfillment-plans', data),
  addFulfillmentStep: (planId: string, data: Partial<FulfillmentStep>) =>
    api.post<{ success: boolean; data: FulfillmentStep }>(`/core/requests/fulfillment-plans/${planId}/steps`, data),

  // Eligibility
  checkEligibility: (itemId: string) =>
    api.get<{ success: boolean; data: { entitled: boolean; reason?: string } }>(`/core/requests/items/${itemId}/eligibility`),
};

export default requestApi;
