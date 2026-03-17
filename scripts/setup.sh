#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# setup.sh - First-time framework setup

# Usage: bash scripts/setup.sh [environment]
# ─────────────────────────────────────────────────────────────

set -euo pipefail

ENV=${1:-dev}
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[setup]${NC} $1"; }
warn() { echo -e "${YELLOW}[setup]${NC} $1"; }
err()  { echo -e "${RED}[setup]${NC} $1"; }

log "Starting enterprise Playwright framework setup..."
log "Target environment: $ENV"

# Check Node.js version
REQUIRED_NODE=18
CURRENT_NODE=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$CURRENT_NODE" -lt "$REQUIRED_NODE" ]; then
  err "Node.js $REQUIRED_NODE+ required. Current: $(node -v)"
  exit 1
fi
log "Node.js $(node -v) ✓"

# Install dependencies
log "Installing npm dependencies..."
npm ci
log "Dependencies installed ✓"

# Install Playwright browsers
log "Installing Playwright browsers..."
npx playwright install --with-deps chromium firefox webkit
log "Browsers installed ✓"

# Set up env file
ENV_FILE="config/.env.$ENV"
if [ ! -f "$ENV_FILE" ]; then
  warn "$ENV_FILE not found — creating from template..."
  cp config/.env.example "$ENV_FILE"
  warn "Edit $ENV_FILE and fill in real values before running tests."
else
  log "$ENV_FILE already exists ✓"
fi

# Set up Husky git hooks
if [ -d ".git" ]; then
  log "Installing Husky git hooks..."
  npx husky install
  npx husky add .husky/pre-commit "npx lint-staged"
  chmod +x .husky/pre-commit
  log "Git hooks installed ✓"
else
  warn "No .git directory found — skipping Husky setup"
fi

# Create auth directory with gitignore
mkdir -p auth
if [ ! -f "auth/.gitignore" ]; then
  printf '*\n!.gitignore\n' > auth/.gitignore
fi
log "auth/ directory ready ✓"

# Create screenshots directory
mkdir -p screenshots
log "screenshots/ directory ready ✓"

echo ""
log "─────────────────────────────────────────"
log "Setup complete!"
log ""
log "Next steps:"
log "  1. Edit config/.env.$ENV with your app's URL and credentials"
log "  2. Run: npm run test:smoke    (quick sanity check)"
log "  3. Run: npm test              (full suite)"
log "  4. Run: npm run test:ui       (visual Playwright UI)"
log "─────────────────────────────────────────"
