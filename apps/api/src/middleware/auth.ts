import { verifyToken } from '@clerk/backend';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import type { Env } from '../index';

export interface AuthUser {
  userId: string;
  sessionId: string;
  orgId?: string;
  orgRole?: string;
  orgSlug?: string;
  email?: string;
}

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser;
  }
}

export const auth = createMiddleware<{ Bindings: Env }>(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: 'Unauthorized' });
  }

  const token = authHeader.substring(7);

  try {
    const verified = await verifyToken(token, {
      secretKey: c.env.CLERK_SECRET_KEY,
    });

    if (!verified || !verified.sub) {
      throw new HTTPException(401, { message: 'Invalid token' });
    }

    const user: AuthUser = {
      userId: verified.sub,
      sessionId: verified.sid || '',
      orgId: verified.org_id as string | undefined,
      orgRole: verified.org_role as string | undefined,
      orgSlug: verified.org_slug as string | undefined,
      email: verified.email as string | undefined,
    };

    c.set('user', user);

    await next();
  } catch (_error) {
    throw new HTTPException(401, { message: 'Invalid token' });
  }
});

// Optional auth middleware that doesn't throw on missing auth
export const optionalAuth = createMiddleware<{ Bindings: Env }>(
  async (c, next) => {
    const authHeader = c.req.header('Authorization');

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      try {
        const verified = await verifyToken(token, {
          secretKey: c.env.CLERK_SECRET_KEY,
        });

        if (verified?.sub) {
          const user: AuthUser = {
            userId: verified.sub,
            sessionId: verified.sid || '',
            orgId: verified.org_id as string | undefined,
            orgRole: verified.org_role as string | undefined,
            orgSlug: verified.org_slug as string | undefined,
            email: verified.email as string | undefined,
          };

          c.set('user', user);
        }
      } catch (_error) {}
    }

    await next();
  }
);
