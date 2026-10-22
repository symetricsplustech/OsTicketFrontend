import { renderHook, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { store } from "@store";
import { logout, sessionSet, useMeQuery } from "@services/auth";
import { useSessionRefresh } from "@app/auth/useSessionRefresh";

const mePayload = {
  profile: {
    id: "u1",
    email: "admin@acmetech.io",
    firstName: "Ava",
    lastName: "Mehta",
    displayName: "Ava Mehta",
    phone: null,
    avatarUrl: null,
    timezone: "UTC",
    locale: "en-US",
    status: "ACTIVE",
    mfaEnabled: false,
    emailVerifiedAt: "2026-01-01T00:00:00.000Z",
    lastLoginAt: null,
    jobTitle: "Organization Administrator",
    userType: "TENANT_USER",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  roles: ["org-admin"],
  permissions: ["users.read", "dashboard.read", "audit.read"],
  accessibleAreas: ["organization"],
};

const meQueryMock = vi.mocked(useMeQuery);

vi.mock("@services/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@services/auth")>();
  return {
    ...actual,
    useMeQuery: vi.fn(),
  };
});

function seedSession(overrides: {
  roles: string[];
  permissions: string[];
  name: string;
  role: string;
}) {
  store.dispatch(
    sessionSet({
      token: "test-token",
      user: {
        _id: "u1",
        id: "u1",
        name: overrides.name,
        email: "admin@acmetech.io",
        role: overrides.role,
        roles: overrides.roles,
        userType: "TENANT_USER",
        status: "ACTIVE",
      },
      role: overrides.role,
      roles: overrides.roles,
      permissions: overrides.permissions,
      moduleKeys: [],
    }),
  );
}

const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={store}>{children}</Provider>
);

describe("useSessionRefresh", () => {
  beforeEach(() => {
    store.dispatch(logout());
    meQueryMock.mockReset();
  });

  afterEach(() => {
    store.dispatch(logout());
  });

  it("re-syncs stale roles and permissions from /auth/me", async () => {
    seedSession({ roles: ["member"], permissions: ["users.read"], name: "Ava Mehta", role: "member" });
    meQueryMock.mockReturnValue({ data: { success: true, data: mePayload } } as never);

    renderHook(() => useSessionRefresh(), { wrapper });

    await waitFor(() => {
      expect(store.getState().auth.permissions).toEqual(mePayload.permissions);
    });
    expect(store.getState().auth.roles).toEqual(["org-admin"]);
    expect(store.getState().auth.role).toBe("org-admin");
    expect(store.getState().auth.user?.email).toBe("admin@acmetech.io");
  });

  it("skips the /auth/me fetch when signed out", () => {
    meQueryMock.mockReturnValue({ data: undefined } as never);

    renderHook(() => useSessionRefresh(), { wrapper });

    expect(meQueryMock).toHaveBeenCalledWith(undefined, { skip: true });
    expect(store.getState().auth.token).toBeNull();
  });

  it("leaves an already-fresh session unchanged", async () => {
    seedSession({
      roles: mePayload.roles,
      permissions: mePayload.permissions,
      name: "Ava Mehta",
      role: "org-admin",
    });
    meQueryMock.mockReturnValue({ data: { success: true, data: mePayload } } as never);

    renderHook(() => useSessionRefresh(), { wrapper });

    await waitFor(() => expect(meQueryMock).toHaveBeenCalled());
    const state = store.getState().auth;
    expect(state.permissions).toEqual(mePayload.permissions);
    expect(state.roles).toEqual(["org-admin"]);
    expect(state.role).toBe("org-admin");
  });
});
