import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

// On 401 the session is dead. Clear token + user and bounce to /login only
// when a full session existed; otherwise let callers handle it (optional-auth).
export function handleSessionExpired(
  error: FetchBaseQueryError | SerializedError | undefined,
): void {
  const status = (error as { status?: number | string } | undefined)?.status;
  if (status !== 401) return;
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  if (token && user) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
}