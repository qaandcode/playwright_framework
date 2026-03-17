import { test as base, type Page, type APIRequestContext } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { ApiClient } from '../utils/api-client';
import { DataFactory } from '../utils/data-factory';
import { Logger } from '../utils/logger';
import { env } from '../utils/env';
import type { User } from '../types';

const logger = new Logger('Fixtures');

// ── Fixture type declarations ─────────────────────────────────────────────────
type PageFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
};

type AuthFixtures = {
  authenticatedPage: Page;
  adminPage: Page;
  apiClient: ApiClient;
  authedApiClient: ApiClient;
  testUser: User;
};

type DataFixtures = {
  factory: typeof DataFactory;
};

// ── Extend base test ──────────────────────────────────────────────────────────
export const test = base.extend<PageFixtures & AuthFixtures & DataFixtures>({

  // ── Page Object fixtures ───────────────────────────────────────────────────

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  // ── Auth fixtures ──────────────────────────────────────────────────────────

  /**
   * authenticatedPage — browser context pre-loaded with saved user session.
   * Zero login overhead per test that uses this fixture.
   */
  authenticatedPage: async ({ browser }, use) => {
    logger.info('Creating authenticated user context');
    const context = await browser.newContext({
      storageState: 'auth/user-state.json',
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  /**
   * adminPage - browser context pre-loaded with saved admin session.
   */
  adminPage: async ({ browser }, use) => {
    logger.info('Creating admin context');
    const context = await browser.newContext({
      storageState: 'auth/admin-state.json',
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  // ── API fixtures ───────────────────────────────────────────────────────────

  /**
   * apiClient — unauthenticated API client. Good for public endpoint tests.
   */
  apiClient: async ({ request }, use) => {
    await use(new ApiClient(request));
  },

  /**
   * authedApiClient — API client pre-authenticated as the test user.
   * Use for seeding data before UI tests, or pure API contract tests.
   */
  authedApiClient: async ({ request }, use) => {
    const client = new ApiClient(request);
    await client.login(env.userEmail, env.userPassword);
    await use(client);
  },

  // ── Data fixtures ──────────────────────────────────────────────────────────

  factory: async ({}, use) => {
    await use(DataFactory);
  },

  /**
   * testUser — a fresh User object per test (not persisted, just data).
   * Seed it via API in your test if you need it in the DB.
   */
  testUser: async ({}, use) => {
    const user = DataFactory.createUser();
    logger.debug('Generated testUser', { email: user.email });
    await use(user);
  },
});

export { expect } from '@playwright/test';
