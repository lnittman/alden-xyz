export interface AuthUser {
  userId: string;
  sessionId: string;
  email?: string;
  orgId?: string;
  orgRole?: string;
  orgSlug?: string;
}
