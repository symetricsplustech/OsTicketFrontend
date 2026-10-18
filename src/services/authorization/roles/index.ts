export interface RoleCategory {
  id: string;
  label: string;
  order: number;
}

export interface RolePreset {
  id: string;
  name: string;
  description: string;
  category: "platform" | "itsm-admin" | "itsm-fulfiller" | "module-manager" | "module-admin" | "self-service";
  permissions: string[];
  moduleKeys?: string[];
  isSystem?: boolean;
}

export { computeEffectiveRoleSync } from "./useRolePresets.ts";
export * from "./useRolePresets.ts";