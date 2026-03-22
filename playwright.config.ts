import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

// ── Load .env file BEFORE anything else reads process.env ────────────────────
const ENV = process.env.TEST_ENV || 'dev';

// __dirname = directory of this config file = project root
// This is stable across all worker processes and OS paths
const PROJECT_ROOT = __dirname;

const candidatePaths = [
  path.join(PROJECT_ROOT, 'config', `.env.${ENV}`),
  path.join(PROJECT_ROOT, 'config', '.env'),
  path.join(PROJECT_ROOT, `.env.${ENV}`),
  path.join(PROJECT_ROOT, '.env'),
];

function loadEnv() {
  for (const envPath of candidatePaths) {
    if (!fs.existsSync(envPath)) continue;
    const raw = fs.readFileSync(envPath, 'utf-8');
    let loaded = 0;
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const key   = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim()
        .replace(/^"(.*)"$/, '$1')   // strip double quotes
        .replace(/^'(.*)'$/, '$1');  // strip single quotes
      if (key && !(key in process.env)) {
        process.env[key] = value;
        loaded++;
      }
    }
    console.log(`[config] Loaded ${loaded} vars from: ${envPath}`);
    return;
  }
  console.warn(
    `[config] WARNING: No .env file found for ENV="${ENV}".\n` +
    `Searched:\n${candidatePaths.map(p => `  ${p}`).join('\n')}\n` +
    `Fix: ensure file exists at ${path.join(PROJECT_ROOT, 'config', `.env.${ENV}`)}`
  );
}

loadEnv();

// ─────────────────────────────────────────────────────────────────────────────

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },

  globalSetup: './tests/global-setup.ts',

  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['list'],
    ...(process.env.CI
      ? [
          ['github'] as ['github'],
          ['allure-playwright', { detail: true, outputFolder: 'allure-results' }] as [string, object],
        ]
      : []),
  ],

  use: {
    baseURL: process.env.BASE_URL || 'http://bonzo.knowledgeplatform.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    locale: 'en-US',
    timezoneId: 'America/New_York',
  },

  projects: [
    // ── Desktop browsers ──────────────────────────────────────────────────────
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'auth/user-state.json',
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'auth/user-state.json',
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: 'auth/user-state.json',
      },
    },

    // ── Mobile ────────────────────────────────────────────────────────────────
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 7'],
        storageState: 'auth/user-state.json',
      },
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 14'],
        storageState: 'auth/user-state.json',
      },
    },

    // ── API tests ─────────────────────────────────────────────────────────────
    {
      name: 'api',
      use: {
        browserName: 'chromium',
        baseURL: process.env.API_BASE_URL || process.env.BASE_URL || 'http://localhost:3000',
      },
      testMatch: '**/tests/api/**/*.spec.ts',
    },

    // ── Visual regression ─────────────────────────────────────────────────────
    {
      name: 'visual',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'auth/user-state.json',
      },
      testMatch: '**/tests/visual/**/*.spec.ts',
    },
  ],

  outputDir: 'test-results',
});