import { test, expect } from '@playwright/test';

test.describe('Login page UI', () => {
  test('shows single-line title and renders', async ({ page }) => {
    await page.goto('/login');

    const title = page.getByRole('heading', { level: 1, name: /SANARUスタッフ昇給試験サイト/ });
    await expect(title).toBeVisible();

    // Ensure the title is forced into a single line (truncate uses nowrap)
    await expect(title).toHaveCSS('white-space', 'nowrap');

    if (process.env.VRT === '1') {
      // Capture a visual snapshot when visual regression is enabled
      await expect(page).toHaveScreenshot('login.png', { fullPage: true });
    }
  });
});

