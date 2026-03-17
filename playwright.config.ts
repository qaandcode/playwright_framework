import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment-specific config
const ENV = process.env.TEST_ENV || 'dev';
dotenv.config({ path: path.resolve(__dirname, `config/.env.${ENV}`) });

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
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    locale: 'en-US',
    timezoneId: 'America/New_York',
  },

  projects: [
    // ── Auth setup (runs once, stores cookies/localStorage) ──────────────────
    {
      name: 'setup',
      testMatch: '**/global-setup.ts',
    },

    // ── Desktop browsers ───────────────────────────────────────────────────────
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'auth/user-state.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'auth/user-state.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: 'auth/user-state.json',
      },
      dependencies: ['setup'],
    },

    // ── Mobile ─────────────────────────────────────────────────────────────────
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 7'],
        storageState: 'auth/user-state.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 14'],
        storageState: 'auth/user-state.json',
      },
      dependencies: ['setup'],
    },

    // ── API tests (no browser overhead) ───────────────────────────────────────
    {
      name: 'api',
      testDir: './tests/api',
      use: { browserName: 'chromium' },
    },

    // ── Visual regression ──────────────────────────────────────────────────────
    {
      name: 'visual',
      testDir: './tests/visual',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'auth/user-state.json',
      },
      dependencies: ['setup'],
    },
  ],

  outputDir: 'test-results',
});
