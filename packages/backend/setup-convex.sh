#!/bin/bash

# Convex Setup Script
echo "🚀 Setting up Convex for Alden..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
  echo "📝 Creating .env.local from template..."
  cp .env.local.example .env.local
fi

echo "📦 Installing dependencies..."
bun install

echo "🔧 Initializing Convex project..."
echo ""
echo "⚠️  IMPORTANT: When prompted:"
echo "1. Choose 'Create a new project'"
echo "2. Enter a project name (e.g., 'alden-backend')"
echo "3. The script will generate your Convex URL"
echo ""
echo "After setup completes:"
echo "1. Go to https://dashboard.convex.dev/deployment/settings/environment-variables"
echo "2. Add CLERK_ISSUER_URL from https://dashboard.clerk.com/last-active?path=jwt-templates"
echo "3. Optionally add OPENAI_API_KEY for AI features"
echo ""

# Run Convex dev to initialize
npx convex dev

echo ""
echo "✅ Convex setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Copy the CONVEX_URL from .env.local to apps/app/.env.local as NEXT_PUBLIC_CONVEX_URL"
echo "2. Copy the CONVEX_URL from .env.local to apps/ai/.env.local as CONVEX_URL"
echo "3. Run 'bun run dev' in the root to start all services"