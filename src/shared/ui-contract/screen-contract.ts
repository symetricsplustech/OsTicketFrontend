export interface ScreenContract {
  // Unique screen ID and canonical route
  screenId: string;
  canonicalRoute: string;
  
  // One owning module/submodule
  owningModule: string;
  owningSubmodule?: string;
  
  // Parent route and breadcrumb
  parentRoute?: string;
  breadcrumb?: string;
  
  // Persona(s)
  persona?: string[];
  
  // Required module entitlement
  moduleEntitlement?: string;
  
  // Required permissions
  requiredPermissions?: string[];
  
  // Record/data scope
  recordScope?: string;
  
  // Page title and context
  pageTitle: string;
  pageContext?: string;
  
  // Primary/secondary actions
  primaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  secondaryActions?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    variant?: "ghost" | "secondary";
  }[];
  
  // Tabs/sections/related lists
  tabs?: TabContract[];
  sections?: SectionContract[];
  relatedLists?: RelatedListContract[];
  
  // Fields and field types where applicable
  fields?: FieldContract[];
  
  // Required/read-only/hidden rules
  fieldRules?: FieldRuleContract[];
  
  // Default values
  defaultValues?: Record<string, any>;
  
  // Reference filtering
  referenceFiltering?: ReferenceFilterContract;
  
  // Validation and error messages
  validation?: ValidationContract;
  
  // Drawers/modals/wizards
  drawers?: DrawerContract[];
  modals?: ModalContract[];
  wizards?: WizardContract;
  
  // Context menu
  contextMenu?: ContextMenuContract;
  
  // Bulk actions where applicable
  bulkActions?: BulkActionContract[];
  
  // Activity/history where applicable
  activity?: ActivityContract;
  
  // Attachments where applicable
  attachments?: AttachmentContract;
  
  // Audit visibility
  auditVisibility?: AuditVisibilityContract;
  
  // Notifications/side effects
  notifications?: NotificationContract;
  
  // Search exposure
  searchExposure?: SearchExposureContract;
  
  // Reporting exposure
  reportingExposure?: ReportingExposureContract;
  
  // Loading/skeleton
  loading?: boolean;
  skeleton?: boolean;
  
  // Empty/filtered-empty/no-results
  emptyState?: EmptyStateContract;
  
  // Permission denied
  permissionDenied?: boolean;
  
  // Not found
  notFound?: boolean;
  
  // Partial/full failure
  failure?: FailureContract;
  
  // Retry
  retry?: {
    enabled: boolean;
    onRetry: () => void;
  };
  
  // Saving/success/failure
  saving?: boolean;
  success?: boolean;
  failureSave?: boolean;
  
  // Dirty/unsaved guard
  dirtyCheck?: {
    hasUnsavedChanges: boolean;
    onBeforeUnload?: (e: BeforeUnloadEvent) => void;
  };
  
  // Stale/concurrent update
  staleCheck?: {
    enabled: boolean;
    onStale: () => void;
  };
  
  // Desktop/tablet/mobile
  viewport?: "desktop" | "tablet" | "mobile";
  
  // Keyboard navigation
  keyboardNavigation?: {
    focusableElements: string[];
    escapeHandler?: () => void;
  };
  
  // Screen-reader semantics
  accessibility?: {
    ariaLabel?: string;
    ariaDescribedby?: string;
    role?: string;
  };
  
  // Focus management
  focusManagement?: {
    initialFocus?: string;
    onFocusLoss?: () => void;
  };
  
  // Analytics events
  analyticsEvents?: AnalyticsEventContract[];
  
  // Acceptance tests
  acceptanceTests?: AcceptanceTestContract;
}

export interface TabContract {
  key: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface SectionContract {
  title?: string;
  items: ReactNode;
}

export interface RelatedListContract {
  title: string;
  dataKey: string;
  columns: string[];
  rows: any[];
}

export interface FieldContract {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "checkbox" | "date" | "datetime" | "reference" | "boolean";
  placeholder?: string;
  defaultValue?: any;
  disabled?: boolean;
  readOnly?: boolean;
  hidden?: boolean;
  options?: OptionContract[];
  referenceType?: string;
  validation?: ValidationRule;
}

export interface OptionContract {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface FieldRuleContract {
  field: string;
  type: "required" | "readonly" | "hidden" | "conditional";
  value?: any;
  when?: boolean;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minValue?: number;
  maxValue?: number;
  custom?: (value: any) => string | null;
}

export interface ReferenceFilterContract {
  sourceModule: string;
  sourceField: string;
  displayField: string;
  filterFields: string[];
}

export interface ValidationContract {
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

export interface DrawerContract {
  id: string;
  title: string;
  width?: string;
  onClose: () => void;
  children: ReactNode;
}

export interface ModalContract {
  id: string;
  title: string;
  onClose: () => void;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export interface WizardContract {
  steps: WizardStepContract[];
  currentStep: number;
  onComplete: () => void;
  onCancel: () => void;
}

export interface WizardStepContract {
  key: string;
  title: string;
  description?: string;
  validate: () => boolean | string;
  children: ReactNode;
}

export interface ContextMenuContract {
  items: ContextMenuItemContract[];
  onSelect: (item: ContextMenuItemContract) => void;
  x: number;
  y: number;
}

export interface ContextMenuItemContract {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  separator?: boolean;
}

export interface BulkActionContract {
  label: string;
  onClick: (selectedIds: string[]) => void;
  disabled?: boolean;
  confirmation?: {
    title: string;
    text: string;
    confirmLabel: string;
    cancelLabel: string;
  };
}

export interface ActivityContract {
  id: string;
  type: "create" | "update" | "delete" | "state_change" | "comment";
  timestamp: string;
  user: {
    name: string;
    avatar?: string;
  };
  description: string;
}

export interface AttachmentContract {
  id: string;
  name: string;
  size: string;
  url: string;
  thumbnailUrl?: string;
  onRemove: () => void;
}

export interface AuditVisibilityContract {
  showAudit: boolean;
  auditEvents: AuditEventContract[];
}

export interface AuditEventContract {
  id: string;
  timestamp: string;
  user: {
    name: string;
  };
  action: string;
  details?: string;
}

export interface NotificationContract {
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface SearchExposureContract {
  enabled: boolean;
  placeholder: string;
  onSearch: (query: string) => void;
}

export interface ReportingExposureContract {
  enabled: boolean;
  menuItems: ReportingMenuItemContract[];
}

export interface ReportingMenuItemContract {
  label: string;
  format: "csv" | "pdf" | "excel" | "json";
  onDownload: () => void;
}

export interface EmptyStateContract {
  title: ReactNode;
  description?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
}

export interface FailureContract {
  message: string;
  retryable: boolean;
  onRetry: () => void;
  onDismiss: () => void;
}

export interface AnalyticsEventContract {
  name: string;
  params: Record<string, any>;
}

export interface AcceptanceTestContract {
  id: string;
  name: string;
  status: "pending" | "pass" | "fail";
  testFunction?: () => boolean;
}