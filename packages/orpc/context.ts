import type { AuthUser } from '@repo/auth/server-types';
import type { Services } from '@repo/services';

// Avoid cross-package import of API Env; keep generic here
export type Env = unknown;

export interface Context {
  user: AuthUser | null;
  env?: Env;
  requestId?: string;
  headers?: Headers;
  services?: Services;
}

export interface AuthenticatedContext extends Context {
  user: AuthUser;
}

export function createContext(options: {
  user: AuthUser | null;
  env?: Env;
  requestId?: string;
  headers?: Headers;
  services?: Services;
}): Context {
  return {
    user: options.user,
    env: options.env,
    requestId: options.requestId || crypto.randomUUID(),
    headers: options.headers,
    services: options.services,
  };
}

export function isAuthenticated(ctx: Context): ctx is AuthenticatedContext {
  return ctx.user !== null;
}
