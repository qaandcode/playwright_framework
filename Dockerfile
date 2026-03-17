# ── Build stage ───────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/playwright:v1.44.0-jammy AS base

WORKDIR /app

# Install dependencies first (cached layer)
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# ── Runner stage ───────────────────────────────────────────────────────────────
FROM base AS runner

# Create non-root user for security
RUN groupadd -r playwright && useradd -r -g playwright playwright \
  && chown -R playwright:playwright /app

USER playwright

# Default command — override with docker run args
CMD ["npx", "playwright", "test", "--reporter=list"]

# Usage examples:
#
#   Build:
#     docker build -t playwright-tests .
#
#   Run smoke tests against staging:
#     docker run --rm \
#       -e BASE_URL=https://staging.example.com \
#       -e TEST_USER_EMAIL=test@example.com \
#       -e TEST_USER_PASSWORD=secret \
#       -v $(pwd)/playwright-report:/app/playwright-report \
#       playwright-tests npx playwright test --grep @smoke
#
#   Run with custom env file:
#     docker run --rm --env-file .env.staging \
#       -v $(pwd)/playwright-report:/app/playwright-report \
#       playwright-tests
