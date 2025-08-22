# Alden - Modern Messaging Platform

A sophisticated messaging platform built with a modern microservices architecture, featuring real-time chat, AI-powered assistance, and scalable infrastructure.

## <× Architecture

This is a **Turborepo monorepo** with three primary services:

- **Web App** (`apps/app`) - Next.js 15 application deployed to Vercel
- **API Service** (`apps/api`) - Cloudflare Workers API with Hono framework
- **AI Service** (`apps/ai`) - Mastra-powered AI assistant deployed to Mastra Cloud
- **Email Service** (`apps/email`) - React Email templates for transactional emails

## =€ Quick Start

### Prerequisites

- [Bun](https://bun.sh) (v1.2+)
- PostgreSQL database
- Clerk account for authentication
- At least one AI provider API key (Google, OpenAI, or Anthropic)

### Setup

1. **Clone and install dependencies:**
   ```bash
   git clone [your-repo-url]
   cd alden-xyz
   bun install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Fill in your API keys and configuration
   ```

3. **Set up the database:**
   ```bash
   bun run db:push
   ```

4. **Start development servers:**
   ```bash
   bun run dev
   ```

   This starts:
   - Web app at http://localhost:3000
   - API at http://localhost:8787
   - AI service at http://localhost:3999

## =æ Package Structure

### Applications
- `apps/app` - Next.js web application
- `apps/api` - Cloudflare Workers API
- `apps/ai` - Mastra AI service
- `apps/email` - Email templates

### Shared Packages
- `@repo/ai` - AI SDK v5 integration and hooks
- `@repo/auth` - Clerk authentication utilities
- `@repo/database` - Drizzle ORM schema and client
- `@repo/design` - Shared UI components
- `@repo/orpc` - Type-safe RPC client/server
- `@repo/services` - Business logic services
- `@repo/analytics` - Analytics tracking
- `@repo/storage` - File storage abstraction

## =à Technology Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS v4
- **Backend:** Cloudflare Workers, Hono, PostgreSQL, Drizzle ORM
- **AI:** Mastra, AI SDK v5, Google Gemini, OpenAI, Anthropic
- **Auth:** Clerk with custom Elements forms
- **State:** Jotai (client), SWR (server state)
- **Analytics:** PostHog, Vercel Analytics

## =Ý Development

### Common Commands

```bash
# Install dependencies
bun install

# Start development
bun run dev

# Build all apps
bun run build

# Type checking
bun run typecheck

# Linting
bun run lint

# Database migrations
bun run db:generate  # Generate migrations
bun run db:push      # Push schema changes
bun run db:studio    # Open Drizzle Studio
```

### Adding a New Package

1. Create directory in `packages/`
2. Add to workspace in root `package.json`
3. Create `package.json` with proper exports
4. Add TypeScript configuration
5. Create `CLAUDE.md` for AI context

## =¢ Deployment

### Web App (Vercel)
```bash
cd apps/app
vercel
```

### API Service (Cloudflare Workers)
```bash
cd apps/api
wrangler deploy
```

### AI Service (Mastra Cloud)
```bash
cd apps/ai
bunx mastra deploy
```

## = Key Features

- **Real-time Messaging** - WebSocket-powered chat with presence
- **AI Assistant** - Integrated chat agent powered by Mastra
- **Authentication** - Secure auth with Clerk and custom UI
- **File Attachments** - Support for images and documents
- **Message References** - Quote and reply to messages
- **Read Receipts** - Track message delivery and reading
- **Reactions** - Emoji reactions to messages
- **Search** - Full-text search across conversations

## =Ä License

Private - All rights reserved

## > Contributing

This is a private project. Please reach out to the maintainers for contribution guidelines.

## =Þ Support

For issues and questions, please contact the development team.

---

Built with d using modern web technologies