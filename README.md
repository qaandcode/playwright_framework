# Enterprise Playwright Framework

Production-grade E2E automation framework built with **Playwright + TypeScript**.
Designed to plug into any web application with minimal configuration.

---

## Architecture

```
playwright-enterprise/
├── .github/workflows/          # CI/CD pipelines (ci, nightly, release)
├── tests/
│   ├── e2e/                    # User journey tests        @regression
│   ├── api/                    # API contract tests        @regression
│   ├── visual/                 # Screenshot regression     @visual
│   ├── accessibility/          # WCAG 2.1 AA audits        @regression
│   ├── smoke/                  # Critical path (<5 min)    @smoke
│   └── global-setup.ts         # Auth state generation
├── pages/
│   ├── base.page.ts            # BasePage — all POMs extend this
│   ├── login.page.ts
│   ├── dashboard.page.ts
│   └── components/             # Reusable UI components (table, modal)
├── fixtures/
│   └── index.ts                # Extended test() with auth & API fixtures
├── utils/
│   ├── api-client.ts           # Typed API wrapper
│   ├── data-factory.ts         # Faker-based test data generation
│   ├── env.ts                  # Validated environment accessor
│   ├── logger.ts               # Structured test logger
│   └── slack-reporter.ts       # CI failure notifications
├── test-data/                  # Static JSON fixtures
├── config/
│   └── .env.example            # Template — never commit real values
├── types/
│   └── index.ts                # Shared TypeScript interfaces
└── auth/                       # Gitignored session storage
```

---

## Quick Start

```bash
# 1. Clone and run one-time setup
git clone https://github.com/qaandcode/playwright_framework
cd playwright-framework
bash scripts/setup.sh dev

# 2. Configure your environment
cp config/.env.example config/.env.dev
# Edit config/.env.dev with your BASE_URL and credentials

# 3. Run smoke tests (~5 min)
npm run test:smoke

# 4. Run full regression
npm test
```

---

## ⚠️ First-Time Configuration (Required)

The framework needs a `.env.dev` file before tests can run. Without it, tests that require authentication or a live API will skip gracefully rather than crashing.

```bash
cp config/.env.example config/.env.dev
```

Then open `config/.env.dev` and fill in:

```env
BASE_URL=https://your-app.com
API_BASE_URL=https://your-app.com/api
TEST_USER_EMAIL=testuser@your-app.com
TEST_USER_PASSWORD=YourPassword123!
```

---

## Running Tests

| Command | What it runs |
|---|---|
| `npm test` | Full suite, all projects |
| `npm run test:smoke` | @smoke tagged tests only |
| `npm run test:regression` | @regression tagged tests |
| `npm run test:api` | API project only (no browser) |
| `npm run test:a11y` | Accessibility audits |
| `npm run test:visual` | Visual regression |
| `npm run test:dev` | Against dev environment |
| `npm run test:staging` | Against staging environment |
| `npm run test:headed` | With visible browser |
| `npm run test:ui` | Playwright interactive UI |
| `npm run test:debug` | Debug mode (step-through) |

---

## Writing Tests

Always import from `../../fixtures`, never from `@playwright/test` directly:

```typescript
import { test, expect } from '../../fixtures';

test('user can view their profile @regression', async ({ authenticatedPage, factory }) => {
  const user = factory.createUser();
  await authenticatedPage.goto('/profile');
  await expect(authenticatedPage.locator('h1')).toBeVisible();
});
```

### Available Fixtures

| Fixture | Description |
|---|---|
| `loginPage` | LoginPage POM instance |
| `dashboardPage` | DashboardPage POM instance |
| `authenticatedPage` | Pre-authenticated user browser page |
| `adminPage` | Pre-authenticated admin browser page |
| `apiClient` | Unauthenticated API client |
| `authedApiClient` | Authenticated API client |
| `factory` | DataFactory for generating test data |
| `testUser` | Fresh User object (not persisted) |

### Tags

| Tag | When to use |
|---|---|
| `@smoke` | Critical path — runs on every PR |
| `@regression` | Full coverage — runs nightly |
| `@visual` | Visual regression — runs in visual project |

---

## Adding a New Page Object

```typescript
// pages/my-feature.page.ts
import { type Page } from '@playwright/test';
import { BasePage } from './base.page';

export class MyFeaturePage extends BasePage {
  private readonly header = '[data-testid="my-feature-header"]';

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.navigate('/my-feature');
  }

  async assertLoaded() {
    await this.assertVisible(this.header);
  }
}
```

---

## CI/CD Pipelines

| Workflow | Trigger | Runs |
|---|---|---|
| `ci.yml` | Push / PR | @smoke on PR, sharded 4× on push |
| `nightly.yml` | 01:00 UTC | Full @regression across all browsers |
| `release.yml` | Manual dispatch | @smoke on selected environment |

### Required GitHub Secrets

```
STAGING_BASE_URL
STAGING_API_BASE_URL
TEST_USER_EMAIL
TEST_USER_PASSWORD
TEST_ADMIN_EMAIL          (optional)
TEST_ADMIN_PASSWORD       (optional)
PROD_BASE_URL
PROD_API_BASE_URL
SLACK_WEBHOOK_URL         (optional — for notifications)
```

---

## Environment Setup

Each environment has its own config file:

```bash
cp config/.env.example config/.env.dev
cp config/.env.example config/.env.staging
cp config/.env.example config/.env.prod
```

Switch environments with `TEST_ENV`:
```bash
TEST_ENV=staging npm test
TEST_ENV=prod npm run test:smoke
```

---

## Reports

- **HTML report**: `npm run report` (auto-opens browser)
- **Allure report**: `npm run report:allure` (requires Allure CLI)
- **GitHub Actions**: HTML report published as artifact on every run

---

## Docker

```bash
# Build
docker build -t playwright-tests .

# Run smoke tests
docker run --rm \
  -e BASE_URL=https://staging.example.com \
  -e TEST_USER_EMAIL=test@example.com \
  -e TEST_USER_PASSWORD=secret \
  -v $(pwd)/playwright-report:/app/playwright-report \
  playwright-tests npx playwright test --grep @smoke
```

---

## Troubleshooting

**`Missing required environment variable`**  
→ Create and fill `config/.env.dev` (see Quick Start above)

**`Invalid URL` in api-client**  
→ Set `API_BASE_URL` in your `.env.dev` file

**`ECONNREFUSED localhost:3000`**  
→ Either start your local app, or point `BASE_URL` at a running environment

**`auth/user.json not found`**  
→ The global setup skips auth when credentials are missing. Set `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` and re-run

**Tests skip instead of run**  
→ Expected behaviour when env vars are missing. Fill in your `.env.dev` to enable them
