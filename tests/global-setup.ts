import { chromium, type FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '../utils/logger';

const logger = new Logger('GlobalSetup');

const AUTH_DIR         = path.resolve(process.cwd(), 'auth');
const USER_STATE_FILE  = path.join(AUTH_DIR, 'user-state.json');
const ADMIN_STATE_FILE = path.join(AUTH_DIR, 'admin-state.json');
const EMPTY_STATE      = JSON.stringify({ cookies: [], origins: [] });

function ensureAuthDir() {
  if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });
  const gi = path.join(AUTH_DIR, '.gitignore');
  if (!fs.existsSync(gi)) fs.writeFileSync(gi, '*\n!.gitignore\n');
}

function writeEmptyState(filePath: string, label: string) {
  fs.writeFileSync(filePath, EMPTY_STATE);
  logger.info(`Empty auth state written → ${filePath} (${label})`);
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN_ENABLED = set to true once you have confirmed login selectors via:
// npx playwright codegen https://bonzo.knowledgeplatform.com
// Then restore the saveAuthState() call below.
// ─────────────────────────────────────────────────────────────────────────────
const LOGIN_ENABLED = false;

async function saveAuthState(
  baseUrl: string,
  storageFile: string,
  email: string,
  password: string,
  label: string
): Promise<void> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page    = await context.newPage();

  try {
    logger.info(`Authenticating ${label} (${email})`);
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForTimeout(2_000);

    logger.info(`Landed on: ${page.url()}`);

    // ── TODO: Replace these selectors with real ones from codegen ─────────────
    // Run: npx playwright codegen https://bonzo.knowledgeplatform.com
    // Click the email field → copy the selector shown on the right panel
    await page.fill('YOUR_EMAIL_SELECTOR_HERE', email);
    await page.fill('YOUR_PASSWORD_SELECTOR_HERE', password);
    await page.click('YOUR_SUBMIT_SELECTOR_HERE');

    await page.waitForURL(url => !url.toString().includes('login'), { timeout: 15_000 });
    logger.info(`Login successful → ${page.url()}`);

    await context.storageState({ path: storageFile });
    logger.info(`Auth state saved → ${storageFile}`);
  } catch (err) {
    const shot = path.join(AUTH_DIR, `login-failure-${label}.png`);
    await page.screenshot({ path: shot, fullPage: true }).catch(() => {});
    logger.error(`Login failed — screenshot: ${shot}`, err);
    throw err;
  } finally {
    await browser.close();
  }
}

export default async function globalSetup(config: FullConfig): Promise<void> {
  ensureAuthDir();

  const baseUrl =
    config.projects.find(p => p.name === 'chromium')?.use?.baseURL ??
    process.env.BASE_URL ??
    'http://localhost:3000';

  logger.info(`Global setup — baseUrl: ${baseUrl}, LOGIN_ENABLED: ${LOGIN_ENABLED}`);

  if (LOGIN_ENABLED) {
    const userEmail    = process.env.TEST_USER_EMAIL;
    const userPassword = process.env.TEST_USER_PASSWORD;

    if (userEmail && userPassword) {
      await saveAuthState(baseUrl, USER_STATE_FILE, userEmail, userPassword, 'user');
    } else {
      logger.warn('TEST_USER_EMAIL / TEST_USER_PASSWORD not set - writing empty user state.');
      writeEmptyState(USER_STATE_FILE, 'user');
    }

    const adminEmail    = process.env.TEST_ADMIN_EMAIL;
    const adminPassword = process.env.TEST_ADMIN_PASSWORD;

    if (adminEmail && adminPassword) {
      await saveAuthState(baseUrl, ADMIN_STATE_FILE, adminEmail, adminPassword, 'admin');
    } else {
      logger.warn('TEST_ADMIN_EMAIL not set - writing empty admin state.');
      writeEmptyState(ADMIN_STATE_FILE, 'admin');
    }
  } else {
    logger.warn('LOGIN_ENABLED=false - writing empty auth state files.');
    logger.warn('To enable: set LOGIN_ENABLED=true and add correct selectors in global-setup.ts');
    logger.warn('Find selectors by running: npx playwright codegen ' + baseUrl);
    writeEmptyState(USER_STATE_FILE, 'user');
    writeEmptyState(ADMIN_STATE_FILE, 'admin');
  }

  logger.info('Global setup complete.');
}