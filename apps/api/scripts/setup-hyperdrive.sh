#!/bin/bash

# Script to set up Cloudflare Hyperdrive for database connection pooling
# This provides optimized database connectivity for Cloudflare Workers

echo "Setting up Cloudflare Hyperdrive for Squish API..."

# Get the database URL from .dev.vars
DB_URL=$(grep DATABASE_URL .dev.vars | cut -d'=' -f2-)

if [ -z "$DB_URL" ]; then
  echo "Error: DATABASE_URL not found in .dev.vars"
  exit 1
fi

echo "Creating Hyperdrive configuration..."
echo "Using database URL: ${DB_URL:0:30}..."

# Create Hyperdrive configuration
# Note: This will prompt for Cloudflare auth if not already logged in
wrangler hyperdrive create squish-api-db --connection-string="$DB_URL"

echo ""
echo "Hyperdrive configuration created!"
echo ""
echo "Add the following to your wrangler.toml:"
echo ""
echo "[[hyperdrive]]"
echo "binding = \"HYPERDRIVE\""
echo "id = \"<your-hyperdrive-id-here>\""
echo ""
echo "Remember to update the ID with the one provided above."