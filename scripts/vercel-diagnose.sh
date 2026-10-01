#!/bin/bash
# Vercel Deployment Diagnostics
# Run this to check backend status and environment setup

echo "🔍 Vercel Deployment Diagnostics"
echo "=================================="
echo ""

# Check authentication
echo "1️⃣  Checking Vercel authentication..."
if ! vercel whoami &>/dev/null; then
  echo "❌ Not authenticated. Run: vercel login"
  exit 1
fi
ACCOUNT=$(vercel whoami)
echo "✅ Authenticated as: $ACCOUNT"
echo ""

# List projects
echo "2️⃣  Finding viridian project..."
PROJECT=$(vercel projects ls | grep viridian | head -1)
if [ -z "$PROJECT" ]; then
  echo "❌ viridian project not found"
  exit 1
fi
echo "✅ Found: $PROJECT"
echo ""

# Check latest deployment
echo "3️⃣  Checking latest deployment..."
DEPLOYMENTS=$(vercel deployments 2>/dev/null | head -5)
echo "$DEPLOYMENTS"
echo ""

# Get environment variables
echo "4️⃣  Checking environment variables (Production)..."
echo "❗ Variables set:"
vercel env ls --production 2>/dev/null || echo "Unable to list vars (not linked)"
echo ""

# Try to view logs (requires project to be linked)
echo "5️⃣  Function logs (last 50 lines)..."
echo "Command: vercel logs /api/communities --limit 50"
vercel logs /api/communities --limit 50 2>/dev/null || echo "Note: Run from project directory or link project first"
echo ""

# Check if DATABASE_URL is set
echo "6️⃣  DATABASE_URL Check:"
DB_URL=$(vercel env get DATABASE_URL --production 2>/dev/null)
if [ -z "$DB_URL" ]; then
  echo "❌ DATABASE_URL not set in production"
else
  # Show partial URL (last 20 chars for security)
  MASKED="${DB_URL: -20}"
  echo "✅ DATABASE_URL is set (ends with: ...${MASKED})"
fi
echo ""

echo "=================================="
echo "Diagnostics complete!"
