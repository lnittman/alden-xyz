# Squish API Service Context (apps/api)

## Development Standards

### Project Context
This is the Cloudflare Workers API service for Squish, built with Hono framework. It provides RESTful APIs for all application features including authentication, board management, asset handling, search, and AI integrations.

### Technology Stack
- **Runtime**: Cloudflare Workers with Node.js compatibility
- **Framework**: Hono 4.6.15 - Fast, lightweight web framework
- **TypeScript**: 5.8.3 with strict configuration
- **ORM**: Drizzle 0.38.2 with PostgreSQL
- **Authentication**: Clerk Backend 1.20.1
- **Validation**: Zod 3.25.28
- **Deployment**: Wrangler CLI for Cloudflare Workers deployment

### Key Dependencies
```json
{
  "dependencies": {
    "hono": "^4.6.15",
    "@cloudflare/workers-types": "^4.20241011.0",
    "@clerk/backend": "^1.20.1",
    "@orpc/server": "^1.7.5",
    "drizzle-orm": "^0.38.2",
    "postgres": "^3.4.5",
    "zod": "^3.25.28",
    "pusher": "^5.2.0",
    "resend": "^4.0.1",
    "stripe": "^17.7.0",
    "svix": "^1.66.0"
  },
  "devDependencies": {
    "wrangler": "^3.100.3",
    "vitest": "^3.1.4"
  }
}
```

## Project Structure

### Directory Layout
```
src/
├── index.ts              # Main application entry point
├── constants/            # Application constants
│   ├── error.ts         # Error codes and messages
│   └── index.ts         # Shared constants
├── lib/                  # Utility libraries
│   ├── auth.ts          # Authentication utilities
│   ├── database.ts      # Database connection
│   ├── errors.ts        # Error handling helpers
│   ├── responses.ts     # Standardized response formats
│   ├── user.ts          # User utilities
│   └── utils/           # Additional utilities
├── middleware/           # Route middleware
│   └── auth.ts          # Authentication middleware
├── routes/               # API route definitions
│   ├── ai.ts            # AI-related endpoints
│   ├── asset.ts         # Asset management
│   ├── auth.ts          # Authentication endpoints
│   ├── board.ts         # Board management
│   ├── email.ts         # Email services
│   ├── health.ts        # Health check
│   ├── presence.ts      # Real-time presence
│   ├── report.ts        # Reporting endpoints
│   ├── search.ts        # Search functionality
│   ├── user.ts          # User management
│   └── webhooks.ts      # Webhook handlers
├── schemas/              # Zod validation schemas
│   ├── ai.ts            # AI request/response schemas
│   ├── asset.ts         # Asset schemas
│   ├── board.ts         # Board schemas
│   ├── index.ts         # Schema exports
│   ├── search.ts        # Search schemas
│   └── user.ts          # User schemas
├── services/             # Business logic services
│   ├── ai.ts            # AI service integration
│   ├── asset.ts         # Asset business logic
│   ├── board.ts         # Board business logic
│   ├── index.ts         # Service exports
│   ├── search.ts        # Search service
│   ├── unified-ai.ts    # Unified AI orchestration
│   └── user.ts          # User service
└── env.ts               # Environment variables typing
```

## Architecture Patterns

### Service-Oriented Architecture
The API follows a service-oriented pattern with clear separation:
- **Routes**: HTTP endpoint definitions and request handling
- **Services**: Business logic and domain operations
- **Schemas**: Request/response validation and typing
- **Libraries**: Cross-cutting concerns and utilities
- **Middleware**: Request preprocessing and authentication

### Environment Bindings
```typescript
// src/index.ts - Environment interface
export interface Env {
  // Hyperdrive for database connection pooling
  HYPERDRIVE?: {
    connectionString: string;
  };
  
  // Environment variables
  DATABASE_URL: string;
  CLERK_SECRET_KEY: string;
  // ... other env vars
}
```

## API Patterns

### Route Definition Pattern
```typescript
// src/routes/[feature].ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createItemSchema, updateItemSchema } from '../schemas';

const app = new Hono<{ Bindings: Env }>();

// GET /api/items
app.get('/', zValidator('query', listItemsSchema), async (c) => {
  const query = c.req.valid('query');
  const items = await itemService.list(query);
  return c.json({ success: true, data: items });
});

// POST /api/items
app.post('/', zValidator('json', createItemSchema), async (c) => {
  const data = c.req.valid('json');
  const item = await itemService.create(data);
  return c.json({ success: true, data: item }, 201);
});

export default app;
```

### Service Layer Pattern
```typescript
// src/services/[feature].ts
export class ItemService {
  constructor(private db: Database) {}
  
  async list(query: ListItemsQuery): Promise<Item[]> {
    const result = await this.db.query.items.findMany({
      where: buildWhereClause(query),
      orderBy: [desc(items.createdAt)],
      limit: query.limit,
    });
    return result;
  }
  
  async create(data: CreateItemInput): Promise<Item> {
    const result = await this.db
      .insert(items)
      .values(data)
      .returning();
    return result[0];
  }
}
```

### Schema Validation Pattern
```typescript
// src/schemas/[feature].ts
import { z } from 'zod';

export const createItemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  boardId: z.string().uuid(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
```

## Database Patterns

### Drizzle ORM Usage
```typescript
// src/lib/database.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@repo/database/schema';

export function createDatabase(env: Env) {
  const client = postgres(env.DATABASE_URL, {
    prepare: false,
  });
  
  return drizzle(client, { schema });
}
```

### Query Building
```typescript
// Using Drizzle type-safe queries
const result = await db
  .select()
  .from(boards)
  .leftJoin(boardMembers, eq(boards.id, boardMembers.boardId))
  .where(eq(boardMembers.userId, userId))
  .orderBy(desc(boards.updatedAt));
```

## Authentication Middleware

### Clerk Integration
```typescript
// src/middleware/auth.ts
import { auth } from '@clerk/backend';
import { HTTPException } from 'hono/http-exception';

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader) {
    throw new HTTPException(401, { message: 'Missing authorization header' });
  }
  
  const token = authHeader.replace('Bearer ', '');
  const { userId } = await auth().verifyToken(token);
  
  if (!userId) {
    throw new HTTPException(401, { message: 'Invalid token' });
  }
  
  c.set('userId', userId);
  await next();
};
```

### Protected Route Usage
```typescript
// In route definition
app.use('/protected/*', authMiddleware);

app.get('/protected/data', async (c) => {
  const userId = c.get('userId');
  const data = await service.getUserData(userId);
  return c.json({ data });
});
```

## Error Handling Patterns

### Standardized Responses
```typescript
// src/lib/responses.ts
export const success = (data: any, status = 200) => ({
  success: true,
  data,
  timestamp: new Date().toISOString(),
});

export const error = (message: string, code = 400, details?: any) => ({
  success: false,
  error: {
    message,
    code,
    details,
  },
  timestamp: new Date().toISOString(),
});
```

### Error Types
```typescript
// src/constants/error.ts
export const ErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export class AppError extends Error {
  constructor(
    public code: keyof typeof ErrorCode,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

## Testing Patterns

### Vitest Setup
```typescript
// Tests for routes
import { test } from 'vitest';
import { createApp } from '../src/index';
import { createTestContext } from './utils';

test.describe('API Routes', () => {
  let app: any;
  let context: TestContext;
  
  test.beforeEach(() => {
    context = createTestContext();
    app = createApp(context.env);
  });
  
  test('GET /api/health', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});
```

## Deployment Configuration

### Wrangler Configuration
```toml
# wrangler.toml
name = "squish-api"
main = "src/index.ts"
compatibility_date = "2025-04-01"
compatibility_flags = ["nodejs_compat"]

# Observability
[observability]
enabled = true

[observability.logs]
enabled = true

# Environment variables (development)
[vars]
NODE_ENV = "development"
```

### Environment Variables
```typescript
// src/env.ts - Type-safe environment variables
interface Env {
  // Database
  DATABASE_URL: string;
  
  // Authentication
  CLERK_SECRET_KEY: string;
  CLERK_PUBLISHABLE_KEY: string;
  
  // External services
  AI_SERVICE_URL: string;
  RESEND_API_KEY: string;
  PUSHER_APP_ID: string;
  PUSHER_KEY: string;
  PUSHER_SECRET: string;
  PUSHER_CLUSTER: string;
  
  // Storage
  R2_ACCOUNT_ID: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_BUCKET_NAME: string;
  
  // AI services
  VERTEX_AI_PROJECT: string;
  VERTEX_AI_LOCATION: string;
  GOOGLE_APPLICATION_CREDENTIALS: string;
  
  // Monitoring
  SENTRY_DSN: string;
  REDIS_URL: string;
}
```

## Development Workflow

### Local Development
```bash
# Start development server
bun run dev

# Build for deployment
bun run build

# Deploy to Cloudflare
bun run deploy

# Deploy to production
bun run deploy:production
```

### Database Setup
```bash
# Setup Hyperdrive for local development
wrangler hyperdrive create squish-db --connection-string="$DATABASE_URL"

# Run database migrations
bun run db:migrate
```

### Testing
```bash
# Run tests
bun run test

# Run tests with coverage
bun run test:coverage

# Type checking
bun run typecheck
```

## Performance Considerations

### Cloudflare Workers Optimization
- Keep CPU time under 10ms for most operations
- Use streaming for large responses
- Cache frequently accessed data
- Minimize cold starts with proper warming

### Database Optimization
- Use Hyperdrive for connection pooling
- Implement query result caching
- Use proper indexing strategies
- Monitor query performance

### API Optimization
- Implement rate limiting
- Use compression middleware
- Optimize response payloads
- Implement pagination

## Monitoring and Observability

### Logging
```typescript
// Structured logging pattern
export const logger = {
  info: (message: string, data?: any) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      data,
      timestamp: new Date().toISOString(),
    }));
  },
  
  error: (message: string, error?: any) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error?.stack || error,
      timestamp: new Date().toISOString(),
    }));
  }
};
```

### Metrics
- Track request duration and success rates
- Monitor database query performance
- Track error rates by endpoint
- Monitor memory usage

## Security Considerations

### CORS Configuration
```typescript
// src/index.ts - CORS setup
app.use('*', cors({
  origin: ['https://squish.xyz', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));
```

### Rate Limiting
```typescript
// Implement rate limiting middleware
const rateLimit = new Map<string, { count: number; reset: number }>();

app.use('*', async (c, next) => {
  const clientIP = c.req.header('CF-Connecting-IP');
  // Implement rate limiting logic
});
```

## Common Tasks

### Adding a New API Endpoint
1. Create schema in `src/schemas/[feature].ts`
2. Add route in `src/routes/[feature].ts`
3. Implement service method in `src/services/[feature].ts`
4. Add authentication middleware if needed
5. Write tests for the endpoint
6. Update API documentation

### Adding a New Database Model
1. Update schema in `@repo/database/src/schema.ts`
2. Generate types: `bun run db:generate`
3. Create migration if needed
4. Update service files with new model usage
5. Update API schemas

### Adding External Integration
1. Add environment variables to `Env` interface
2. Create client/service in `src/lib/` or `src/services/`
2. Add necessary dependencies to package.json
3. Implement error handling for the service
4. Add tests for the integration

## Files to Know

- `src/index.ts` - Main application setup and middleware
- `src/routes/` - All API endpoint definitions
- `src/services/` - Business logic implementations
- `src/schemas/` - Zod validation schemas
- `wrangler.toml` - Cloudflare Workers configuration
- `src/lib/database.ts` - Database connection setup

## Quality Checklist

Before committing changes to this API:
- [ ] TypeScript compiles without errors
- [ ] All API endpoints have proper validation
- [ ] Error handling is implemented
- [ ] Authentication middleware is applied where needed
- [ ] Tests pass for modified endpoints
- [ ] Database queries are optimized
- [ ] CORS and security headers are correct
- [ ] Environment variables are properly typed
- [ ] No sensitive data is logged
- [ ] API documentation is updated

---

*This context ensures Claude Code understands the API service structure and patterns when working on the backend.*