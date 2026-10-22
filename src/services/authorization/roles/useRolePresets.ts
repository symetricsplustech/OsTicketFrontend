import { useMemo } from "react";
import {
  FALLBACK_ROLE_PRESETS,
  FALLBACK_ROLE_CATEGORIES,
  RolePreset,
  RoleCategory,
} from "./rolePresets.ts";

export function useRolePresets() {
  // Role presets are static on the SaaS Admin control plane; the previous
  // instance-scoped `roleApi` no longer exists.
  const presets = useMemo<RolePreset[]>(() => FALLBACK_ROLE_PRESETS, []);
  const categories = useMemo<RoleCategory[]>(
    () => FALLBACK_ROLE_CATEGORIES,
    [],
  );

  const presetsByCategory = useMemo(() => {
    const map: Record<string, RolePreset[]> = {};
    for (const category of categories) {
      map[category.id] = presets.filter((p) => p.category === category.id);
    }
    return map;
  }, [presets, categories]);

  const getPreset = (id: string): RolePreset | undefined => {
    return presets.find((p) => p.id === id);
  };

  const getPermissions = (roleId: string): string[] => {
    const preset = getPreset(roleId);
    return preset?.permissions ?? [];
  };

  return {
    presets,
    categories,
    presetsByCategory,
    getPreset,
    getPermissions,
    isLoading: false,
    error: undefined,
    refetch: () => {},
  };
}

export function useEffectiveRole(userPermissions?: string[]): string | null {
  const { presets } = useRolePresets();
  const permissions = userPermissions;

  if (!permissions) return null;

  // Check for platform_owner (has saas.* and tenant.* but NOT itsm.*)
  const hasSaas = permissions.some(
    (p) => p === "saas.*" || p.startsWith("saas."),
  );
  const hasTenant = permissions.some(
    (p) => p === "tenant.*" || p.startsWith("tenant."),
  );
  const hasItsm = permissions.some(
    (p) => p === "itsm.*" || p.startsWith("itsm."),
  );

  if (hasSaas && hasTenant && !hasItsm) return "platform_owner";
  if (hasSaas && hasTenant && hasItsm) return "platform_admin"; // legacy/platform_admin with ITSM

  const roleScores = presets
    .filter((role) => !role.isSystem)
    .map((role) => {
      let matches = 0;
      for (const perm of role.permissions) {
        if (
          permissions.some(
            (p) =>
              p === perm ||
              (perm.endsWith(".*") && p.startsWith(perm.slice(0, -1))),
          )
        ) {
          matches++;
        }
      }
      return { role: role.id, score: matches };
    });

  roleScores.sort((a, b) => b.score - a.score);
  return roleScores[0]?.score > 0 ? roleScores[0].role : null;
}

/**
 * Synchronous helper to compute effective role from permissions and presets.
 * Use this when you already have the presets data (e.g., from useRolePresets).
 */
export function computeEffectiveRoleSync(
  permissions: string[] | undefined,
  presets: RolePreset[],
): string | null {
  if (!permissions) return null;

  // Check for platform_owner (has saas.* and tenant.* but NOT itsm.*)
  const hasSaas = permissions.some(
    (p) => p === "saas.*" || p.startsWith("saas."),
  );
  const hasTenant = permissions.some(
    (p) => p === "tenant.*" || p.startsWith("tenant."),
  );
  const hasItsm = permissions.some(
    (p) => p === "itsm.*" || p.startsWith("itsm."),
  );

  if (hasSaas && hasTenant && !hasItsm) return "platform_owner";
  if (hasSaas && hasTenant && hasItsm) return "platform_admin"; // legacy/platform_admin with ITSM

  const roleScores = presets
    .filter((role) => !role.isSystem)
    .map((role) => {
      let matches = 0;
      for (const perm of role.permissions) {
        if (
          permissions.some(
            (p) =>
              p === perm ||
              (perm.endsWith(".*") && p.startsWith(perm.slice(0, -1))),
          )
        ) {
          matches++;
        }
      }
      return { role: role.id, score: matches };
    });

  roleScores.sort((a, b) => b.score - a.score);
  return roleScores[0]?.score > 0 ? roleScores[0].role : null;
}

export function useCanAssignRole(targetRoleId: string): boolean {
  const { presets } = useRolePresets();
  const effectiveRole = useEffectiveRole();

  if (!effectiveRole) return false;
  if (effectiveRole === "platform_owner") return true;

  const currentRolePreset = presets.find((r) => r.id === effectiveRole);
  const targetRolePreset = presets.find((r) => r.id === targetRoleId);

  if (!currentRolePreset || !targetRolePreset) return false;

  const categoryOrder: Record<string, number> = {
    platform: 1,
    "itsm-admin": 2,
    "itsm-fulfiller": 3,
    "module-manager": 4,
    "module-admin": 5,
    "self-service": 6,
  };

  const currentCategoryIndex = categoryOrder[currentRolePreset.category] ?? 99;
  const targetCategoryIndex = categoryOrder[targetRolePreset.category] ?? 99;

  return currentCategoryIndex <= targetCategoryIndex;
}

export function useAvailableRolesForAssignment(): RolePreset[] {
  const { presets } = useRolePresets();
  const effectiveRole = useEffectiveRole();

  if (!effectiveRole) return [];
  if (effectiveRole === "platform_owner")
    return presets.filter((r) => !r.isSystem);

  const currentRolePreset = presets.find((r) => r.id === effectiveRole);
  if (!currentRolePreset) return [];

  const categoryOrder: Record<string, number> = {
    platform: 1,
    "itsm-admin": 2,
    "itsm-fulfiller": 3,
    "module-manager": 4,
    "module-admin": 5,
    "self-service": 6,
  };

  const currentCategoryIndex = categoryOrder[currentRolePreset.category] ?? 99;

  return presets.filter((r) => {
    if (r.isSystem) return false;
    const targetCategoryIndex = categoryOrder[r.category] ?? 99;
    return targetCategoryIndex >= currentCategoryIndex;
  });
}
