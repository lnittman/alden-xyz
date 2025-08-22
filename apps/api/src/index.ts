import { verifyToken } from '@clerk/backend';
import { RPCHandler } from '@orpc/server/fetch';
import { appRouter, createContext } from '@repo/orpc';
import { createDatabaseClient } from '@repo/database';
import { createServices } from '@repo/services';
import { Hono } from 'hono';
import { compress } from 'hono/compress';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { logger } from 'hono/logger';
import type { Env } from './types/env';

// Re-export Env type for compatibility
export type { Env };

const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use('*', logger());
// app.use('*', compress()); // Temporarily disable compression for debugging

// CORS configuration - first, doesn't read body
app.use(
  '*',
  cors({
    origin: (origin) => {
      const allowed = [
        'http://localhost:3000',
        'http://localhost:9999',
        'https://alden.xyz',
        'https://*.alden.xyz',
        'https://*.vercel.app',
        'https://alden.vercel.app',
      ];

      if (!origin) {
        return null;
      }

      for (const pattern of allowed) {
        if (pattern.includes('*')) {
          const regex = new RegExp(pattern.replace('*', '.*'));
          if (regex.test(origin)) {
            return origin;
          }
        } else if (origin === pattern) {
          return origin;
        }
      }

      return null;
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposeHeaders: ['Content-Length', 'X-Request-ID'],
    maxAge: 600,
    credentials: true,
  })
);

// Health check endpoint - normal route
app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'alden-api' });
});

// Import and register routes
import chatRoutes from './routes/chat';
import webhookRoutes from './routes/webhook';

app.route('/api/chat', chatRoutes);
app.route('/api/webhook', webhookRoutes);

// --- ORPC x Hono (consensus best-practices pattern) ---
const orpcHandler = new RPCHandler(appRouter);

// Prevent double body-reading if any other middleware could parse the body
const BODY_PARSER_METHODS = new Set(['arrayBuffer', 'blob', 'formData', 'json', 'text'] as const);
type BodyParserMethod = typeof BODY_PARSER_METHODS extends Set<infer T> ? T : never;

app.use('/api/orpc/*', async (c, next) => {
  // Optional auth decode here (Clerk JWT)
  const authHeader = c.req.header('Authorization');
  let user = null;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const verified = await verifyToken(token, {
        secretKey: c.env.CLERK_SECRET_KEY,
      });

      if (verified?.sub) {
        user = {
          userId: verified.sub,
          sessionId: verified.sid || '',
          orgId: verified.org_id as string | undefined,
          orgRole: verified.org_role as string | undefined,
          orgSlug: verified.org_slug as string | undefined,
          email: verified.email as string | undefined,
        };
      }
    } catch (_error) {
      // Silent fail for auth - some endpoints are public
    }
  }

  // Create database client and services
  const db = createDatabaseClient(c.env.DATABASE_URL);
  const services = createServices({ db, env: c.env });

  const context = createContext({
    user,
    env: c.env,
    requestId: c.req.header('X-Request-ID') ?? crypto.randomUUID(),
    services,
  });

  // Proxy raw Request so body-readers defer to Hono's c.req methods
  const request = new Proxy(c.req.raw, {
    get(target, prop) {
      if (BODY_PARSER_METHODS.has(prop as BodyParserMethod)) {
        return () => (c.req as any)[prop as BodyParserMethod]();
      }
      return Reflect.get(target, prop, target);
    },
  });

  const { matched, response } = await orpcHandler.handle(request, {
    prefix: '/api/orpc', // <-- keep explicit and in sync with the mount path
    context,
  });

  if (matched) {
    return c.newResponse(response.body, response);
  }
  
  await next();
});

// 404 fallback for unmatched ORPC routes
app.all('/api/orpc/*', (c) => {
  return c.json({ error: 'ORPC procedure not found', status: 404 }, 404);
});

// Global error handler
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json(
      {
        error: err.message,
        status: err.status,
      },
      err.status
    );
  }

  return c.json(
    {
      error: 'Internal Server Error',
      status: 500,
    },
    500
  );
});

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      error: 'Not Found',
      status: 404,
      path: c.req.path,
    },
    404
  );
});

export default app;