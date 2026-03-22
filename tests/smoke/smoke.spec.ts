import { test, expect } from '@playwright/test';

/**
 * Smoke suite @smoke
 * Uses @playwright/test directly — no custom fixtures needed.
 */

// ── Read env at module level — workers load this after playwright.config.ts ───
// Use process.env directly (not env util) to avoid any import-time capture
const getBaseUrl  = () => process.env.BASE_URL     || '';
const getApiUrl   = () => process.env.API_BASE_URL  || process.env.BASE_URL || '';

test.describe('Smoke Tests @smoke', () => {

  // ── Guard: skip entire suite if BASE_URL is not configured ─────────────────
  test.beforeAll(() => {
    console.log('\n── Environment ─────────────────────────────');
    console.log(`  BASE_URL     : ${process.env.BASE_URL     ?? '(not set)'}`);
    console.log(`  API_BASE_URL : ${process.env.API_BASE_URL ?? '(not set)'}`);
    console.log('────────────────────────────────────────────\n');
  });

  // ── UI tests ────────────────────────────────────────────────────────────────

  test('home page loads and returns 2xx', async ({ page }) => {
    const baseUrl = getBaseUrl();
    if (!baseUrl) test.skip(true, 'BASE_URL not configured');

    const response = await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    const status = response?.status() ?? 0;

    console.log(`  Navigated to : ${page.url()}`);
    console.log(`  Status       : ${status}`);
    console.log(`  Title        : ${await page.title()}`);

    expect(status, `Expected 2xx but got ${status}`).toBeLessThan(400);
  });

    test('home page title contains expected text', async ({ page }) => {
    const baseUrl = getBaseUrl();
    test.skip(!baseUrl, 'BASE_URL not configured');

    await page.goto(baseUrl);

    // Auto-waits until title is set
    await expect(page).toHaveTitle("Bonzo - Competitive Gaming Platform");
    });

      // ── API tests ────────────────────────────────────────────────────────────────

      test.describe('API health check', () => {

    test('GET /api/instance/config returns 2xx or 405', async ({ request }) => {
      const apiBase = getApiUrl();
      test.skip(!apiBase, 'API_BASE_URL not configured');

      const url = `${apiBase}/api/instance/config`;
      console.log(`  Requesting: ${url}`);

      const res = await request.get(url);
      console.log(`  Status: ${res.status()}`);

      if (res.status() === 405) {
        // Send JSON body + header
        const postRes = await request.post(url, {
          headers: {
            'Content-Type': 'application/json',
          },
          data: {}, // minimal valid body
        });

        console.log(`  POST status: ${postRes.status()}`);

        expect(
          postRes.status(),
          `Both GET (405) and POST (${postRes.status()}) failed on ${url}`
        ).toBeLessThan(400);
      } else {
        expect(res.status(), `Unexpected status from ${url}`).toBeLessThan(400);
      }
    });

    test('API responds within 3 seconds', async ({ request }) => {
      const apiBase = getApiUrl();
      if (!apiBase) test.skip(true, 'API_BASE_URL not configured');

      const start = Date.now();
      const res   = await request.get(`${apiBase}/api/instance/config`);
      const ms    = Date.now() - start;

      console.log(`  Status: ${res.status()} — ${ms}ms`);
      expect(res.status()).toBeLessThan(500);
      expect(ms, `API too slow: ${ms}ms`).toBeLessThan(3_000);
    });

   test('API returns JSON when called correctly', async ({ request }) => {
  const apiBase = getApiUrl();
  test.skip(!apiBase, 'API_BASE_URL not configured');

  const url = `${apiBase}/api/instance/config`;

  let res = await request.get(url);

  if (res.status() === 405) {
    res = await request.post(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: {},
    });
  }

  expect(res.ok(), `Request failed with status ${res.status()}`).toBeTruthy();

  const contentType = res.headers()['content-type'] ?? '';
  console.log(`  Content-Type: ${contentType}`);

  expect(contentType).toContain('application/json');

  const body = await res.json();
  const keys = Object.keys(body as object);

  console.log(`  Config keys (${keys.length}): ${keys.join(', ')}`);

  expect(keys.length).toBeGreaterThan(0);
});

  });

});