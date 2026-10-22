import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import {
  mapProfileToAuthUser,
  selectAuth,
  sessionSet,
  useMeQuery,
} from "@services/auth";

function sameList(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

/**
 * Re-syncs the local session from `GET /auth/me` while a token is active, so
 * role/permission changes and profile updates take effect without a re-login.
 * The store (and its localStorage mirrors) is only rewritten when the server
 * actually differs from what is cached; a failed/401 response is left to the
 * base query, which clears the session.
 */
export function useSessionRefresh(): void {
  const auth = useAppSelector(selectAuth);
  const dispatch = useAppDispatch();
  const { data } = useMeQuery(undefined, { skip: !auth.token });

  useEffect(() => {
    const me = data?.data;
    if (!me || !auth.token) return;

    const profileName =
      me.profile.displayName?.trim() ||
      `${me.profile.firstName ?? ""} ${me.profile.lastName ?? ""}`.trim() ||
      me.profile.email;
    const upToDate =
      sameList(me.roles, auth.roles) &&
      sameList(me.permissions, auth.permissions) &&
      auth.user?.email === me.profile.email &&
      auth.user?.status === me.profile.status &&
      auth.user?.name === profileName;
    if (upToDate) return;

    dispatch(
      sessionSet({
        token: auth.token,
        user: mapProfileToAuthUser(me.profile, me.roles),
        role: me.roles[0] ?? null,
        roles: me.roles,
        permissions: me.permissions,
        moduleKeys: [],
      }),
    );
  }, [data, auth.token, auth.roles, auth.permissions, auth.user, dispatch]);
}
