import type { ApiSuccess } from "@services/http";

/**
 * Authentication flow types shared by every surface (SaaS admin and, later,
 * tenant/ITSM clients). Response envelopes (`ApiSuccess`) live in
 * `@services/http`.
 */

export interface PublicProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  jobTitle: string | null;
  timezone: string;
  locale: string;
  userType: string;
  status: string;
  mfaEnabled: boolean;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AuthSessionPayload {
  user: PublicProfile;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  roles: string[];
  permissions: string[];
  accessibleAreas: string[];
}

export interface LoginSuccess extends AuthSessionPayload {
  mfaRequired: false;
}

export interface LoginMfaChallenge {
  mfaRequired: true;
  mfaToken: string;
}

export type LoginResponse = LoginSuccess | LoginMfaChallenge;

export interface MeResponse {
  profile: PublicProfile;
  roles: string[];
  permissions: string[];
  accessibleAreas: string[];
}

export interface SessionRecord {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string;
  revokedAt: string | null;
  revokedReason: string | null;
  isCurrent: boolean;
  isActive: boolean;
}

export interface MessageResponse {
  message: string;
}

export type LoginApiResponse = ApiSuccess<LoginResponse>;
export type LoginSuccessApiResponse = ApiSuccess<LoginSuccess>;
export type MeApiResponse = ApiSuccess<MeResponse>;
export type MessageApiResponse = ApiSuccess<MessageResponse>;
