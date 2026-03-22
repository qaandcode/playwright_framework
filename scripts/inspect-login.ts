/**
 * inspect-login.ts
 * Navigates to your login page, waits for ANY input to appear (handles
 * redirects / SSO), then prints every input + button with all attributes.
 *
 * Run:
 *   npx playwright test scripts/inspect-login.ts --headed --project=chromium
 */
import { test } from '@playwright/test';

test('inspect login page selectors', async ({ page }) => {
  const BASE_URL = process.env.BASE_URL || 'https://bonzo.knowledgeplatform.com';

  console.log(`\nNavigating to ${BASE_URL}/login …`);
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });

  // Wait up to 15s for ANY input to appear — handles JS-rendered forms
  try {
    await page.waitForSelector('input', { timeout: 15_000 });
  } catch {
    console.log('\n⚠ No <input> found after 15s. The page may have redirected.');
  }

  console.log(`\nFinal URL after navigation: ${page.url()}`);
  console.log('Page title:', await page.title());

  // ── All inputs ──────────────────────────────────────────────────────────────
  const inputs = await page.evaluate(() =>
    Array.from(document.querySelectorAll('input')).map((el, i) => ({
      index:          i + 1,
      type:           el.type           || '(none)',
      id:             el.id             || '(none)',
      name:           el.name           || '(none)',
      placeholder:    el.placeholder    || '(none)',
      'data-testid':  el.getAttribute('data-testid')  || '(none)',
      'data-qa':      el.getAttribute('data-qa')      || '(none)',
      'aria-label':   el.getAttribute('aria-label')   || '(none)',
      'autocomplete': el.getAttribute('autocomplete') || '(none)',
      class:          el.className      || '(none)',
    }))
  );

  console.log('\n══════════════════════════════════════════════');
  console.log(` INPUTS found: ${inputs.length}`);
  console.log('══════════════════════════════════════════════');
  for (const inp of inputs) {
    console.log(`\n  ── Input #${inp.index} ──`);
    for (const [k, v] of Object.entries(inp)) {
      if (k !== 'index') console.log(`     ${k.padEnd(16)}: ${v}`);
    }
  }

  // ── All buttons ─────────────────────────────────────────────────────────────
  const buttons = await page.evaluate(() =>
    Array.from(document.querySelectorAll('button, input[type="submit"]')).map((el, i) => ({
      index:         i + 1,
      tag:           el.tagName.toLowerCase(),
      type:          (el as HTMLButtonElement).type   || '(none)',
      id:            el.id             || '(none)',
      text:          el.textContent?.trim().slice(0, 60) || '(none)',
      'data-testid': el.getAttribute('data-testid')  || '(none)',
      'aria-label':  el.getAttribute('aria-label')   || '(none)',
      class:         el.className      || '(none)',
    }))
  );

  console.log('\n══════════════════════════════════════════════');
  console.log(` BUTTONS found: ${buttons.length}`);
  console.log('══════════════════════════════════════════════');
  for (const btn of buttons) {
    console.log(`\n  ── Button #${btn.index} ──`);
    for (const [k, v] of Object.entries(btn)) {
      if (k !== 'index') console.log(`     ${k.padEnd(16)}: ${v}`);
    }
  }

  console.log('\n══════════════════════════════════════════════');
  console.log(' COPY THE SELECTORS ABOVE INTO global-setup.ts');
  console.log('══════════════════════════════════════════════\n');

  // Keep the browser open for 30s so you can inspect it manually
  console.log('Browser stays open for 30s — inspect the page if needed…');
  await page.waitForTimeout(30_000);
});