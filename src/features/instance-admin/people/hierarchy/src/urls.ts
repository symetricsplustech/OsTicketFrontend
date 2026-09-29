import type { DirectoryQueryArgs } from "@shared/types";

export function directoryUrl({
  instanceId,
  search,
  page,
  limit,
  userId,
}: DirectoryQueryArgs): string {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  if (userId) params.set("userId", userId);
  const qs = params.toString();
  return `/instances/${instanceId}/directory${qs ? `?${qs}` : ""}`;
}

export function effectiveAccessUrl(instanceId: string, userId?: string): string {
  if (userId) return `/instances/${instanceId}/users/${userId}/effective-access`;
  return `/instances/${instanceId}/me/effective-access`;
}

export function reportingLineUrl(instanceId: string, userId: string, variant?: "chain"): string {
  const suffix = variant === "chain" ? "reporting-chain" : "reporting-line";
  return `/instances/${instanceId}/users/${userId}/${suffix}`;
}