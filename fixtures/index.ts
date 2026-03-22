import { test as base, type BrowserContext, request as playwrightRequest } from '@playwright/test';
import { LoginPage }     from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { ApiClient }     from '../utils/api-client';
import { DataFactory }   from '../utils/data-factory';
import { env }           from '../utils/env';
import { Logger }        from '../utils/logger';
import type { User }     from '../types';

const logger = new Logger('Fixtures');

// ── Fixture types ─────────────────────────────────────────────────────────────
type Fixtures = {
  loginPage:         LoginPage;
  dashboardPage:     DashboardPage;
  authenticatedPage: import('@playwright/test').Page;
  adminPage:         import('@playwright/test').Page;
  apiClient:         ApiClient;
  authedApiClient:   ApiClient;
  factory:           DataFactory;
  testUser:          User;
};

// ── Extended test ─────────────────────────────────────────────────────────────
export const test = base.extend<Fixtures>({
  // ── Page Object Models ──────────────────────────────────────────────────────
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  // ── Authenticated page (user) ───────────────────────────────────────────────
  authenticatedPage: async ({ browser }, use) => {
    let context: BrowserContext;
    try {
      context = await browser.newContext({ storageState: 'auth/user.json' });
    } catch {
      logger.warn('auth/user.json not found — creating unauthenticated context');
      context = await browser.newContext();
    }
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  // ── Authenticated page (admin) ──────────────────────────────────────────────
  adminPage: async ({ browser }, use) => {
    if (!env.hasAdminCreds()) {
      logger.warn('Admin credentials not set — skipping adminPage fixture');
      const context = await browser.newContext();
      await use(await context.newPage());
      await context.close();
      return;
    }
    let context: BrowserContext;
    try {
      context = await browser.newContext({ storageState: 'auth/admin.json' });
    } catch {
      logger.warn('auth/admin.json not found — creating unauthenticated context');
      context = await browser.newContext();
    }
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  // ── Unauthenticated API client ──────────────────────────────────────────────
  apiClient: async ({}, use) => {
    const ctx = await playwrightRequest.newContext({ baseURL: env.apiBaseUrl });
    await use(new ApiClient(ctx, env.apiBaseUrl));
    await ctx.dispose();
  },

  // ── Authenticated API client ────────────────────────────────────────────────
  authedApiClient: async ({}, use) => {
    const email    = env.userEmail();
    const password = env.userPassword();
    const ctx      = await playwrightRequest.newContext({ baseURL: env.apiBaseUrl });
    const tempClient = new ApiClient(ctx, env.apiBaseUrl);

    let token = '';
    try {
      const res = await tempClient.post<{ token: string }>('/auth/login', { email, password });
      token = res.body?.token ?? '';
      if (!token) logger.warn('Login response did not include a token — authedApiClient will be unauthenticated');
    } catch (err) {
      logger.error('Failed to obtain auth token for authedApiClient', err);
    }

    await use(new ApiClient(ctx, env.apiBaseUrl, token));
    await ctx.dispose();
  },

  // ── Test data factory ────────────────────────────────────────────────────────
  factory: async ({}, use) => {
    await use(new DataFactory());
  },

  // ── A fresh (unsaved) user ───────────────────────────────────────────────────
  testUser: async ({ factory }, use) => {
    await use(factory.createUser());
  },
});

export { expect } from '@playwright/test';
