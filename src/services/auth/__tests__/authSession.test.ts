import { describe, it, expect } from "vitest";
import { authReducer, sessionSet, logout, type AuthState } from "@services/auth/authSlice";

const base: AuthState = {
  token: null,
  user: null,
  role: null,
  roles: [],
  permissions: [],
  moduleKeys: [],
  instances: [],
  selectedInstance: null,
};

describe("auth session roles", () => {
  it("persists the full roles array from the login response", () => {
    const next = authReducer(
      base,
      sessionSet({
        token: "t",
        user: {
          _id: "u",
          name: "Sam Manager",
          email: "support.manager@example.com",
          role: "support-manager",
          roles: ["support-manager"],
        },
        role: "support-manager",
        roles: ["support-manager"],
        permissions: ["admin.dashboard.read", "admin.tenants.read"],
      }),
    );
    expect(next.roles).toEqual(["support-manager"]);
    expect(next.user?.roles).toEqual(["support-manager"]);
    expect(next.role).toBe("support-manager");
    expect(next.permissions).toEqual(["admin.dashboard.read", "admin.tenants.read"]);
  });

  it("falls back to the user's roles when the payload omits them", () => {
    const next = authReducer(
      base,
      sessionSet({
        token: "t",
        user: { _id: "u", name: "Owner", email: "o@e.com", roles: ["platform-owner"] },
        permissions: ["*"],
      }),
    );
    expect(next.roles).toEqual(["platform-owner"]);
  });

  it("clears roles on logout", () => {
    const next = authReducer({ ...base, token: "t", roles: ["platform-owner"] }, logout());
    expect(next.roles).toEqual([]);
  });
});
