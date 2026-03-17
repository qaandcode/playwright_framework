# Enterprise Playwright Framework

Production-grade E2E automation framework built with **Playwright + TypeScript**.
Designed to plug into any web application with minimal configuration.

---

## Architecture

```
playwright-enterprise/
├── .github/workflows/      # CI/CD pipelines (ci, nightly, release)
├── tests/
│   ├── e2e/                # User journey tests   @regression
│   ├── api/                # API contract tests   @regression
│   ├── visual/             # Screenshot regression @visual
│   ├── accessibility/      # WCAG 2.1 AA audits   @regression
│   ├── smoke/              # Critical path (<5m)  @smoke
│   └── global-setup.ts     # Auth state generation
├── pages/
│   ├── base.page.ts        # BasePage - all POMs extend this
│   ├── login.page.ts
│   ├── dashboard.page.ts
│   └── components/         # Reusable UI components (table, modal)
├── fixtures/
│   └── index.ts            # Extended test() with auth & API fixtures
├── utils/
│   ├── api-client.ts       # Typed API wrapper
│   ├── data-factory.ts     # Faker-based test data generation
│   ├── env.ts              # Validated environment accessor
│   ├── logger.ts           # Structured test logger
│   └── slack-reporter.ts   # CI failure notifications
├── test-data/              # Static JSON fixtures
├── config/
│   └── .env.example        # Template - never commit real values
├── types/
│   └── index.ts            # Shared TypeScript interfaces
└── auth/                   # Gitignored session storage
```

---

## Quick Start

```bash
# 1. Clone and run one-time setup
git clone <your-repo>
cd playwright-enterprise
bash scripts/setup.sh dev

# 2. Configure your environment
cp config/.env.example config/.env.dev
# Edit config/.env.dev with your BASE_URL and credentials

# 3. Run smoke tests (5 min)
npm run test:smoke

# 4. Run full regression
npm test
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

### Import the extended test object — always use fixtures, never base `@playwright/test`

```typescript
import { test, expect } from '../../fixtures';

test('user can view their profile @regression', async ({ authenticatedPage, factory }) => {
  const user = factory.createUser();
  // authenticatedPage is pre-authenticated — no login boilerplate
  await authenticatedPage.goto('/profile');
  await expect(authenticatedPage.locator('h1')).toBeVisible();
});
```

### Available fixtures

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
| `@smoke` | Critical path - runs on every PR |
| `@regression` | Full coverage - runs nightly |
| `@visual` | Visual regression - runs in visual project |

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
| `ci.yml` | Push / PR | @smoke on PR, sharded 4x on push |
| `nightly.yml` | 01:00 UTC | Full @regression across all browsers |
| `release.yml` | Post-deploy | @smoke on prod |

### Required GitHub Secrets

```
STAGING_BASE_URL
STAGING_API_BASE_URL
TEST_USER_EMAIL
TEST_USER_PASSWORD
TEST_ADMIN_EMAIL
TEST_ADMIN_PASSWORD
PROD_BASE_URL
PROD_API_BASE_URL
PROD_TEST_USER_EMAIL
PROD_TEST_USER_PASSWORD
SLACK_WEBHOOK_URL          (optional — for notifications)
```

---

## Environment Setup

Each environment has its own config file. Copy the template and fill in real values:

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
- **GitHub Pages**: Published automatically from main branch CI runs
- **Slack**: Failure notification sent to webhook after each CI run

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
