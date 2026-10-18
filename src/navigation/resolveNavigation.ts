import { canAny } from "@services/authorization/permissions";
import { NAVIGATION_AREAS, type NavigationArea, type NavigationItem } from "./navigationModel.ts";
import type { ScreenRoute } from "./screenRegistry.ts";

export interface ResolvedNavigationItem extends NavigationItem {
  /** Path with `:instanceId` already replaced by the active tenant. */
  href: string;
}

export interface ResolvedNavigationArea extends Omit<NavigationArea, "items"> {
  items: ResolvedNavigationItem[];
}

export interface ScreenLocation {
  area: string;
  item: string;
  href: string;
}

/**
 * Resolves the navigation model for a session: instance ids are bound and every
 * destination the session is not entitled to is removed. An area with no
 * remaining destination is dropped too, so the sidebar never shows an empty
 * section — a user only ever sees what they can actually open.
 */
export function resolveNavigation(
  permissions: string[],
  instanceId: string,
  query = "",
): ResolvedNavigationArea[] {
  const needle = query.trim().toLowerCase();
  return NAVIGATION_AREAS.map((area) => ({
    ...area,
    items: area.items
      .filter((item) => canAny(permissions, item.permissions))
      .filter(
        (item) =>
          !needle ||
          item.label.toLowerCase().includes(needle) ||
          item.hint.toLowerCase().includes(needle) ||
          area.label.toLowerCase().includes(needle),
      )
      .map((item) => ({ ...item, href: item.path.replace(":instanceId", instanceId) })),
  })).filter((area) => area.items.length > 0);
}

/**
 * Ties a screen back to the capability that owns it, so breadcrumbs and page
 * headers can name a product area instead of a delivery-plan phase.
 */
export function locateScreen(
  areas: ResolvedNavigationArea[],
  screen: Pick<ScreenRoute, "phase" | "module">,
): ScreenLocation | null {
  const key = `${screen.phase ?? 0}:${screen.module ?? ""}`;
  for (const area of areas) {
    for (const item of area.items) {
      if (`${item.phase}:${item.module}` === key) {
        return { area: area.label, item: item.label, href: item.href };
      }
    }
  }
  return null;
}
