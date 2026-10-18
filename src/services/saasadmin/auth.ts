/**
 * Backwards-compatible re-export.
 *
 * The canonical authentication API now lives in the common `@services/auth`
 * module (`authApi`, `runLogin`, `runMfaVerify`, `mapProfileToAuthUser`, …).
 * This shim keeps existing `@services/saasadmin` imports working.
 */
export * from "@services/auth/authApi";
