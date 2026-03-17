import { test as setup, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { env } from '../utils/env';
import { Logger } from '../utils/logger';

const logger = new Logger('GlobalSetup');
const AUTH_DIR = path.join(__dirname, '..', 'auth');

// Ensure the auth directory exists but is gitignored
function ensureAuthDir() {
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }
  const gitignore = path.join(AUTH_DIR, '.gitignore');
  if (!fs.existsSync(gitignore)) {
    fs.writeFileSync(gitignore, '*\n!.gitignore\n');
  }
}

// ── Standard user setup ───────────────────────────────────────────────────────
setup('authenticate as user', async ({ page }) => {
  ensureAuthDir();
  logger.info(`Authenticating user: ${env.userEmail}`);

  await page.goto(`${env.baseUrl}/login`);

  await page.locator('input[name="email"], #email, [data-testid="email"]').fill(env.userEmail);
  await page.locator('input[name="password"], #password, [data-testid="password"]').fill(env.userPassword);
  await page.locator('button[type="submit"], [data-testid="login-btn"]').click();

  // Wait for successful redirect — adjust selector to your app's dashboard indicator
  await expect(page).toHaveURL(/dashboard|home|app/, { timeout: 15_000 });
  logger.info('User auth successful — saving state');

  await page.context().storageState({ path: 'auth/user-state.json' });
});

// ── Admin user setup ──────────────────────────────────────────────────────────
setup('authenticate as admin', async ({ page }) => {
  if (!env.adminEmail) {
    logger.warn('TEST_ADMIN_EMAIL not set — skipping admin setup');
    return;
  }
  ensureAuthDir();
  logger.info(`Authenticating admin: ${env.adminEmail}`);

  await page.goto(`${env.baseUrl}/login`);

  await page.locator('input[name="email"], #email, [data-testid="email"]').fill(env.adminEmail);
  await page.locator('input[name="password"], #password, [data-testid="password"]').fill(env.adminPassword);
  await page.locator('button[type="submit"], [data-testid="login-btn"]').click();

  await expect(page).toHaveURL(/dashboard|home|admin/, { timeout: 15_000 });
  logger.info('Admin auth successful — saving state');

  await page.context().storageState({ path: 'auth/admin-state.json' });
});
