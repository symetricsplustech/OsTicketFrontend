import type { ApiRecord } from "@shared/api/itsmTypes";

export type ExperienceResponse = { success?: boolean; data?: ApiRecord[] | ApiRecord };
export type ExperienceQuery = { resource: string; search?: string; status?: string; limit?: number };
export type ExperienceMutation = { resource: string; id?: string; body?: Record<string, unknown> };

export function experienceRows(payload?: ExperienceResponse): ApiRecord[] {
  if (Array.isArray(payload?.data)) return payload.data;
  return payload?.data ? [payload.data] : [];
}
