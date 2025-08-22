# Alden-XYZ Project Context

## Development Standards

### Primary References

1. **STANDARDS.md** - Located at `~/Developer/STANDARDS.md`
   - Overall architectural guidelines
   - Technology stack specifications
   - Development workflow standards
   - Quality requirements

2. **Rules Directory** - Located at `~/.claude/rules/`
   - Detailed implementation rules
   - Platform-specific requirements
   - Architectural patterns
   - Tool configurations

### Quick Access to Rules

- **General**: product_layout, documentation_and_ai_guidance
- **Turborepo**: tooling, monorepo_structure, state_management, api_and_data_flow
- **AI Service**: ai_service_architecture, ai_agent_instructions
- **Apple**: project_structure, architecture_patterns, ui_ux_patterns, networking_layer

## Project Overview

### Ecosystem Structure

This is a **Turborepo monorepo** for the Alden platform using Bun workspaces containing:

**Applications (4 apps):**

- `apps/app` - Next.js 15 web application (main UI)
- `apps/api` - Cloudflare Workers API service (Hono framework)
- `apps/ai` - Mastra AI service (Vertex AI integration)
- `apps/email` - React Email service (email templates)

**Shared Packages (15 packages):**

- `@repo/ai` - AI SDK v5 integration utilities
- `@repo/analytics` - Analytics tracking (PostHog, Vercel)
- `@repo/auth` - Authentication (Clerk integration)
- `@repo/collaboration` - Real-time collaboration features
- `@repo/database` - Database layer (Drizzle ORM, PostgreSQL)
- `@repo/design` - UI components and design system
- `@repo/email` - Email templates and utilities
- `@repo/logger` - Logging utilities
- `@repo/next-config` - Next.js shared configuration
- `@repo/notifications` - Notification system
- `@repo/orpc` - RPC client/server utilities
- `@repo/seo` - SEO utilities
- `@repo/services` - Business logic services
- `@repo/storage` - File storage abstraction (GCS, R2, S3)
- `@repo/typescript-config` - TypeScript configurations

### Technology Stack Matrix

| Layer          | Technology         | Version | Purpose                         |
| -------------- | ------------------ | ------- | ------------------------------- |
| **Frontend**   | Next.js            | 15.3.4  | React framework with App Router |
|                | React              | 19.1.0  | UI library with latest features |
|                | TypeScript         | 5.7.3   | Type safety                     |
|                | Tailwind CSS       | 4.1.11  | Utility-first CSS               |
|                | Clerk              | 6.18.4  | Authentication                  |
| **State**      | Jotai              | 2.6.0   | Client-side state management    |
|                | SWR                | 2.2.5   | Server state caching            |
| **Backend**    | Hono               | 4.6.15  | API framework                   |
|                | Cloudflare Workers | -       | Serverless runtime              |
|                | Mastra             | latest  | AI service framework            |
| **Database**   | PostgreSQL         | latest  | Primary database                |
|                | Drizzle ORM        | 0.38.2  | Type-safe database access       |
| **AI/ML**      | Vertex AI          | -       | Google's AI platform            |
|                | AI SDK             | v5      | AI integration framework        |
| **Analytics**  | PostHog            | 1.205.0 | Product analytics               |
| **Deployment** | Vercel             | -       | Web application hosting         |
|                | Cloudflare Workers | -       | API service hosting             |
|                | Mastra Cloud       | -       | AI service hosting              |

## Development Patterns

### Architecture Patterns

1. **Monorepo Structure**: Turborepo with clear separation of concerns
2. **Microservices**: Each app serves a specific purpose
3. **Shared Packages**: Common functionality extracted into reusable packages
4. **Feature-based Organization**: Components organized by feature domain

### Code Organization

```
apps/
  app/          # Next.js web app
    src/
      app/      # App Router pages
      components/
        modules/     # Feature-specific components
        common/      # Reusable UI components
        ui/          # Base UI Kit components
      hooks/         # Custom React hooks
      atoms/         # Jotai state atoms
  api/          # Cloudflare Workers API
    src/
      routes/   # API endpoints
      services/  # Business logic
      schemas/   # Zod validation schemas
  ai/           # Mastra AI service
    src/
      mastra/   # Mastra configuration
      providers/# AI providers
      services/  # AI services
  email/        # Email service
    emails/     # React Email templates

packages/
  ai/           # AI utilities and hooks
  auth/         # Authentication package
  database/     # Database utilities
  design/       # Shared UI components
  # ... other packages
```

### State Management Patterns

- **Client State**: Jotai atoms organized by domain (ui, user, board, search, etc.)
- **Server State**: SWR hooks for data fetching and caching
- **Forms**: React Hook Form with Zod validation
- **Real-time**: WebSocket (LiveBlocks) and Pusher for presence

### API Patterns

- **RESTful Design**: Organized by domain in `/routes/`
- **Type Safety**: Zod schemas for request/response validation
- **Authentication**: Clerk middleware JWT verification
- **Error Handling**: Standardized error responses
- **RPC Layer**: ORPC for type-safe client-server communication

## Agent Instructions

### When Working on Features

1. **Always create/update CLAUDE.md files** for modified packages/apps
2. **Follow the established patterns** don't introduce new patterns without discussion
3. **Use TypeScript strictly** no any types without good reason
4. **Test thoroughly** ensure all functionality works as expected
5. **Update documentation** document new features and API changes

### When Debugging

1. **Check the logs** use the logger package consistently
2. **Verify environment variables** ensure proper configuration
3. **Test in isolation** reproduce issues in minimal setup
4. **Check database state** verify data integrity
5. **Review recent changes** git bisect if necessary

### Code Quality Requirements

- **TypeScript**: Must compile without errors
- **Linting**: Must pass Ultracite (Biome) checks
- **Formatting**: Code must be properly formatted
- **No console.log**: Remove or use proper logging
- **Error Boundaries**: Implement where appropriate
- **Loading States**: All async operations need loading UI
- **Accessibility**: Follow WCAG guidelines
- **Mobile Responsive**: Design mobile-first

### Quality Checklist Before Committing

- [ ] TypeScript compiles without errors
- [ ] Biome formatting applied (`bun run lint:fix`)
- [ ] No console.log statements (use logger instead)
- [ ] Error boundaries implemented where needed
- [ ] Loading states handled
- [ ] Mobile responsive design verified
- [ ] Accessibility checked
- [ ] Documentation updated
- [ ] Tests passing (if applicable)

## Build and Deployment

### Development

```bash
# Install dependencies
bun install

# Start all apps in development
bun run dev

# Build everything
bun run build

# Run tests
bun run test
```

### Deployment Targets

- **Web App (apps/app)**: Vercel - Automatic deployment on merge to main
- **API Service (apps/api)**: Cloudflare Workers - Deploy with `wrangler deploy`
- **AI Service (apps/ai)**: Mastra Cloud - Deploy with `mastra deploy`
- **Email Service (apps/email)**: Vercel/Serverless - Part of web app deployment

### Environment Variables

See `.env.example` for required variables. Each app may have additional requirements.

## Key Architectural Decisions

1. **Turborepo + Bun**: Chosen for efficient monorepo management
2. **Next.js App Router**: Latest Next.js features with server components
3. **Jotai over Redux**: Simpler state management for modern React
4. **Cloudflare Workers**: Edge computing for API scalability
5. **Mastra Framework**: Specialized AI service infrastructure
6. **Clerk Authentication**: Comprehensive auth solution
7. **Drizzle ORM**: Type-safe database access with migrations

## Common Tasks

### Adding a New Package

1. Create directory in `packages/`
2. Add to root `package.json` workspaces
3. Create `package.json` with workspace:\*
4. Add TypeScript configuration
5. Create `CLAUDE.md` and `README.md`
6. Export from `index.ts`

### Adding a New Feature

1. Create components in `src/components/modules/[feature]/`
2. Add hooks in `src/hooks/` if needed
3. Add atoms in `src/atoms/` for state
4. Update routing in `src/app/`
5. Update API routes in `apps/api/src/routes/`
6. Update documentation

### Database Changes

1. Update schema in `packages/database/src/schema.ts`
2. Generate migrations: `bun run db:generate`
3. Run migrations: `bun run db:migrate`
4. Update types: `bun run db:studio` (if needed)
5. Test with actual database

## Files to Know

- `turbo.json`: Turborepo configuration
- Root `package.json` workspaces: Workspace definitions
- `packages/database/src/schema.ts`: Database schema
- `apps/app/src/atoms/index.ts`: Global state atoms
- `apps/api/src/index.ts`: API entry point
- `apps/ai/src/mastra/index.ts`: Mastra configuration
- `docs/`: Project documentation

## Getting Help

1. **Documentation**: Check `docs/` directory
2. **Examples**: Look at existing features for patterns
3. **Architecture**: Review `docs/architecture/`
4. **Standards**: Refer to `~/Developer/STANDARDS.md`

---

_This context helps Claude Code understand the project structure and development patterns. Update as the project evolves._
