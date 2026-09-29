export type ScreenKind = "dashboard" | "list" | "record" | "settings" | "workspace" | "report";

export interface ScreenDefinition {
  id: number;
  title: string;
  path: string;
  area: string;
  kind: ScreenKind;
  description: string;
  phase?: number;
  screenId?: string;
  module?: string;
}
