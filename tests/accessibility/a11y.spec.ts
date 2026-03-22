import { test, expect } from '../../fixtures';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility @regression', () => {
  test('login page has no critical WCAG violations', async ({ page }) => {
    await page.goto('/login');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const critical = results.violations.filter(v => v.impact === 'critical');
    if (critical.length > 0) {
      console.log('Critical violations:', JSON.stringify(critical, null, 2));
    }
    expect(critical).toHaveLength(0);
  });

  test('home page passes WCAG 2.1 AA', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations).toHaveLength(0);
  });
});
