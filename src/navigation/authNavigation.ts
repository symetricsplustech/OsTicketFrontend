import type { LucideIcon } from "lucide-react";
import {
  KeyRound,
  LogIn,
  MailCheck,
  RotateCcw,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

export interface AuthNavigationItem {
  key: string;
  label: string;
  hint: string;
  path: string;
  icon: LucideIcon;
  screen: string;
}

/**
 * Public, unauthenticated screens.
 *
 * This is the single source of truth for the auth surface: routing
 * (`AUTH_ROUTES`) and the session gate both derive from it.
 */
export const AUTH_NAVIGATION: AuthNavigationItem[] = [
  {
    key: "login",
    label: "Sign in",
    hint: "Sign in to your service desk workspace",
    path: "/login",
    icon: LogIn,
    screen: "LoginPage",
  },
  {
    key: "register",
    label: "Create account",
    hint: "Register a new workspace account",
    path: "/register",
    icon: UserPlus,
    screen: "RegisterPage",
  },
  {
    key: "confirm-email",
    label: "Confirm email",
    hint: "Verify your email address",
    path: "/confirm-email",
    icon: MailCheck,
    screen: "ConfirmEmailPage",
  },
  {
    key: "forgot-password",
    label: "Forgot password",
    hint: "Request a password reset link",
    path: "/forgot-password",
    icon: KeyRound,
    screen: "ForgotPasswordPage",
  },
  {
    key: "reset-password",
    label: "Reset password",
    hint: "Choose a new password",
    path: "/reset-password",
    icon: RotateCcw,
    screen: "ResetPasswordPage",
  },
  {
    key: "mfa",
    label: "Two-factor verification",
    hint: "Verify a sign-in challenge",
    path: "/mfa",
    icon: ShieldCheck,
    screen: "MfaPage",
  },
];

/** Paths reachable without a session. */
export const AUTH_PUBLIC_PATHS: readonly string[] = AUTH_NAVIGATION.map(
  (item) => item.path,
);

export function getAuthNavigationItem(
  path: string,
): AuthNavigationItem | undefined {
  return AUTH_NAVIGATION.find((item) => item.path === path);
}
