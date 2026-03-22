#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
# scripts/setup.sh — One-time dev environment bootstrap
# Usage: bash scripts/setup.sh [dev|staging|prod]
# ─────────────────────────────────────────────────────────────────
set -euo pipefail

ENV=${1:-dev}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "═══════════════════════════════════════════════"
echo "  Enterprise Playwright Framework — Setup"
echo "  Environment: $ENV"
echo "═══════════════════════════════════════════════"

# ── 1. Node version check ─────────────────────────────────────────
MIN_NODE=18
NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt "$MIN_NODE" ]; then
  echo "✗ Node.js $MIN_NODE+ required (found v$NODE_VERSION). Please upgrade."
  exit 1
fi
echo "✓ Node.js v$NODE_VERSION"

# ── 2. Install npm dependencies ───────────────────────────────────
echo ""
echo "Installing npm dependencies…"
npm ci
echo "✓ npm install complete"

# ── 3. Install Playwright browsers ───────────────────────────────
echo ""
echo "Installing Playwright browsers…"
npx playwright install --with-deps chromium
echo "✓ Browsers installed"

# ── 4. Create env file if missing ────────────────────────────────
ENV_FILE="$ROOT_DIR/config/.env.$ENV"
EXAMPLE_FILE="$ROOT_DIR/config/.env.dev"

if [ ! -f "$ENV_FILE" ]; then
  if [ -f "$EXAMPLE_FILE" ]; then
    cp "$EXAMPLE_FILE" "$ENV_FILE"
    echo ""
    echo "✓ Created $ENV_FILE from template"
    echo "  ⚠  Edit it and fill in real BASE_URL and credentials before running tests."
  else
    echo "✗ config/.env.dev not found — cannot create $ENV_FILE"
  fi
else
  echo "✓ $ENV_FILE already exists"
fi

# ── 5. Create auth directory placeholder ─────────────────────────
mkdir -p "$ROOT_DIR/auth"
touch "$ROOT_DIR/auth/.gitkeep"
echo "✓ auth/ directory ready"

echo ""
echo "═══════════════════════════════════════════════"
echo "  Setup complete!"
echo ""
echo "  Next steps:"
echo "  1. Edit config/.env.$ENV with your app URL and credentials"
echo "  2. npm run test:smoke"
echo "═══════════════════════════════════════════════"
