import type { ComponentType } from "react";
import type { RouteObject } from "react-router-dom";
import { AUTH_NAVIGATION } from "@/navigation/authNavigation";
import { LoginPage } from "./LoginPage";
import { RegisterPage } from "./RegisterPage";
import {
  ConfirmEmailPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from "./AccountRecoveryPages";
import { MfaPage } from "./MfaPage";

/** Screen name declared in `AUTH_NAVIGATION.screen` to its implementation. */
const AUTH_SCREENS: Record<string, ComponentType> = {
  LoginPage,
  RegisterPage,
  ConfirmEmailPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  MfaPage,
};

/**
 * React Router route objects for the public auth surface.
 *
 * Built from `AUTH_NAVIGATION` so a new auth screen is added in exactly one
 * place. Compose these with `useRoutes`/`createBrowserRouter` — never match on
 * `location.pathname` by hand.
 */
export const AUTH_ROUTES: RouteObject[] = AUTH_NAVIGATION.flatMap((item) => {
  const Screen = AUTH_SCREENS[item.screen];
  if (!Screen) return [];
  return [{ path: item.path, element: <Screen /> }];
});
