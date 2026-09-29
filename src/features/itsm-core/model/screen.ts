import { ScreenContract } from "@shared/ui-contract/screen-contract";

export type Phase00Module =
  | "00.1"
  | "00.2"
  | "00.3"
  | "00.4"
  | "00.5"
  | "00.6"
  | "00.7"
  | "00.8"
  | "00.9"
  | "00.10";

export type Phase00Screen =
  | "00.1.1"
  | "00.1.2"
  | "00.1.3"
  | "00.1.4"
  | "00.1.5"
  | "00.1.6"
  | "00.1.7"
  | "00.1.8"
  | "00.1.9"
  | "00.2.1"
  | "00.2.2"
  | "00.2.3"
  | "00.2.4"
  | "00.2.5"
  | "00.2.6"
  | "00.2.7"
  | "00.2.8"
  | "00.3.1"
  | "00.3.2"
  | "00.3.3"
  | "00.3.4"
  | "00.3.5"
  | "00.3.6"
  | "00.3.7"
  | "00.3.8"
  | "00.3.9"
  | "00.3.10"
  | "00.4.1"
  | "00.4.2"
  | "00.4.3"
  | "00.4.4"
  | "00.4.5"
  | "00.4.6"
  | "00.4.7"
  | "00.4.8"
  | "00.4.9";

export const phase00ScreenMetadata: Record<Phase00Screen, ScreenContract> = {
  "00.1.1": {
    screenId: "L00445",
    canonicalRoute: "/phase00/instance-home",
    owningModule: "00.1",
    pageTitle: "Instance Home",
    primaryAction: {
      label: "Create New",
      onClick: () => {},
    },
  },
  "00.1.2": {
    screenId: "L00461",
    canonicalRoute: "/phase00/instance-profile",
    owningModule: "00.1",
    pageTitle: "Instance Profile",
    primaryAction: {
      label: "Edit",
      onClick: () => {},
    },
  },
  "00.1.3": {
    screenId: "L00479",
    canonicalRoute: "/phase00/instance-settings",
    owningModule: "00.1",
    pageTitle: "Instance Settings",
    primaryAction: {
      label: "Save",
      onClick: () => {},
    },
  },
  "00.1.4": {
    screenId: "L00497",
    canonicalRoute: "/phase00/branding",
    owningModule: "00.1",
    pageTitle: "Branding",
    primaryAction: {
      label: "Update Branding",
      onClick: () => {},
    },
  },
  "00.1.5": {
    screenId: "L00515",
    canonicalRoute: "/phase00/locale-timezone",
    owningModule: "00.1",
    pageTitle: "Locale & Time Zone",
    primaryAction: {
      label: "Save",
      onClick: () => {},
    },
  },
  "00.1.6": {
    screenId: "L00533",
    canonicalRoute: "/phase00/feature-entitlements",
    owningModule: "00.1",
    pageTitle: "Feature Entitlements",
    primaryAction: {
      label: "Manage Features",
      onClick: () => {},
    },
  },
  "00.1.7": {
    screenId: "L00551",
    canonicalRoute: "/phase00/module-activation",
    owningModule: "00.1",
    pageTitle: "Module Activation",
    primaryAction: {
      label: "Activate Module",
      onClick: () => {},
    },
  },
  "00.1.8": {
    screenId: "L00569",
    canonicalRoute: "/phase00/instance-health",
    owningModule: "00.1",
    pageTitle: "Instance Health",
    primaryAction: {
      label: "Run Health Check",
      onClick: () => {},
    },
  },
  "00.1.9": {
    screenId: "L00587",
    canonicalRoute: "/phase00/instance-audit",
    owningModule: "00.1",
    pageTitle: "Instance Audit",
    primaryAction: {
      label: "Generate Audit Report",
      onClick: () => {},
    },
  },
  "00.2.1": {
    screenId: "L00607",
    canonicalRoute: "/phase00/signin",
    owningModule: "00.2",
    pageTitle: "Sign In",
    primaryAction: null,
  },
  "00.2.2": {
    screenId: "L00625",
    canonicalRoute: "/phase00/sso-signin",
    owningModule: "00.2",
    pageTitle: "SSO Sign In",
    primaryAction: null,
  },
  "00.2.3": {
    screenId: "L00643",
    canonicalRoute: "/phase00/mfa-challenge",
    owningModule: "00.2",
    pageTitle: "MFA Challenge",
    primaryAction: null,
  },
  "00.2.4": {
    screenId: "L00661",
    canonicalRoute: "/phase00/password-recovery",
    owningModule: "00.2",
    pageTitle: "Password Recovery",
    primaryAction: null,
  },
  "00.2.5": {
    screenId: "L00679",
    canonicalRoute: "/phase00/invitation-acceptance",
    owningModule: "00.2",
    pageTitle: "Invitation Acceptance",
    primaryAction: null,
  },
  "00.2.6": {
    screenId: "L00697",
    canonicalRoute: "/phase00/account-recovery",
    owningModule: "00.2",
    pageTitle: "Account Recovery",
    primaryAction: null,
  },
  "00.2.7": {
    screenId: "L00715",
    canonicalRoute: "/phase00/session-expired",
    owningModule: "00.2",
    pageTitle: "Session Expired",
    primaryAction: null,
  },
  "00.2.8": {
    screenId: "L00733",
    canonicalRoute: "/phase00/active-sessions",
    owningModule: "00.2",
    pageTitle: "Active Sessions",
    primaryAction: null,
  },
  "00.3.1": {
    screenId: "L00753",
    canonicalRoute: "/phase00/organization-home",
    owningModule: "00.3",
    pageTitle: "Organization Home",
    primaryAction: {
      label: "Create Company",
      onClick: () => {},
    },
  },
  "00.3.2": {
    screenId: "L00769",
    canonicalRoute: "/phase00/companies",
    owningModule: "00.3",
    pageTitle: "Companies",
    primaryAction: {
      label: "New Company",
      onClick: () => {},
    },
  },
  "00.3.3": {
    screenId: "L00787",
    canonicalRoute: "/phase00/company-record",
    owningModule: "00.3",
    pageTitle: "Company Record",
    primaryAction: {
      label: "Edit",
      onClick: () => {},
    },
  },
  "00.3.4": {
    screenId: "L00805",
    canonicalRoute: "/phase00/business-units",
    owningModule: "00.3",
    pageTitle: "Business Units",
    primaryAction: {
      label: "New Business Unit",
      onClick: () => {},
    },
  },
  "00.3.5": {
    screenId: "L00823",
    canonicalRoute: "/phase00/business-unit-record",
    owningModule: "00.3",
    pageTitle: "Business Unit Record",
    primaryAction: {
      label: "Edit",
      onClick: () => {},
    },
  },
  "00.3.6": {
    screenId: "L00841",
    canonicalRoute: "/phase00/departments",
    owningModule: "00.3",
    pageTitle: "Departments",
    primaryAction: {
      label: "New Department",
      onClick: () => {},
    },
  },
  "00.3.7": {
    screenId: "L00859",
    canonicalRoute: "/phase00/department-record",
    owningModule: "00.3",
    pageTitle: "Department Record",
    primaryAction: {
      label: "Edit",
      onClick: () => {},
    },
  },
  "00.3.8": {
    screenId: "L00877",
    canonicalRoute: "/phase00/locations",
    owningModule: "00.3",
    pageTitle: "Locations",
    primaryAction: {
      label: "New Location",
      onClick: () => {},
    },
  },
  "00.3.9": {
    screenId: "L00895",
    canonicalRoute: "/phase00/location-record",
    owningModule: "00.3",
    pageTitle: "Location Record",
    primaryAction: {
      label: "Edit",
      onClick: () => {},
    },
  },
  "00.3.10": {
    screenId: "L00913",
    canonicalRoute: "/phase00/organization-hierarchy",
    owningModule: "00.3",
    pageTitle: "Organization Hierarchy",
    primaryAction: {
      label: "Update Hierarchy",
      onClick: () => {},
    },
  },
  "00.4.1": {
    screenId: "L00933",
    canonicalRoute: "/phase00/user-directory",
    owningModule: "00.4",
    pageTitle: "User Directory",
    primaryAction: {
      label: "Create User",
      onClick: () => {},
    },
  },
  "00.4.2": {
    screenId: "L00951",
    canonicalRoute: "/phase00/create-user",
    owningModule: "00.4",
    pageTitle: "Create User",
    primaryAction: null,
  },
  "00.4.3": {
    screenId: "L00969",
    canonicalRoute: "/phase00/invite-user",
    owningModule: "00.4",
    pageTitle: "Invite User",
    primaryAction: null,
  },
  "00.4.4": {
    screenId: "L00987",
    canonicalRoute: "/phase00/bulk-invite",
    owningModule: "00.4",
    pageTitle: "Bulk Invite",
    primaryAction: null,
  },
  "00.4.5": {
    screenId: "L01005",
    canonicalRoute: "/phase00/user-record",
    owningModule: "00.4",
    pageTitle: "User Record",
    primaryAction: {
      label: "Edit",
      onClick: () => {},
    },
  },
  "00.4.6": {
    screenId: "L01023",
    canonicalRoute: "/phase00/user-access",
    owningModule: "00.4",
    pageTitle: "User Access",
    primaryAction: null,
  },
  "00.4.7": {
    screenId: "L01041",
    canonicalRoute: "/phase00/user-sessions",
    owningModule: "00.4",
    pageTitle: "User Sessions",
    primaryAction: null,
  },
  "00.4.8": {
    screenId: "L01059",
    canonicalRoute: "/phase00/user-workload",
    owningModule: "00.4",
    pageTitle: "User Workload",
    primaryAction: null,
  },
  "00.4.9": {
    screenId: "L01077",
    canonicalRoute: "/phase00/transfer-user",
    owningModule: "00.4",
    pageTitle: "Transfer User",
    primaryAction: null,
  },
};