import type { AuthUser } from '@repo/auth/server-types';
import type { Services } from '@repo/services';
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
export declare function createContext(options: {
    user: AuthUser | null;
    env?: Env;
    requestId?: string;
    headers?: Headers;
    services?: Services;
}): Context;
export declare function isAuthenticated(ctx: Context): ctx is AuthenticatedContext;
//# sourceMappingURL=context.d.ts.map