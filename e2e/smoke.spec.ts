import { test, expect } from './test-setup';

test.describe('Smoke Tests', () => {
  test('home page loads and shows title', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('File tools that just work');
  });

  test('sidebar navigation visible on desktop', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Image Tools', exact: true }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'PDF Compress', exact: true }).first()).toBeVisible();
  });

  test('navigate to image convert page', async ({ page }) => {
    await page.goto('/convert/image');
    await expect(page.locator('h1')).toContainText('Image Tools');
    await expect(page.getByText('Drop file here or click to browse')).toBeVisible();
  });

  test('navigate to PDF compress page', async ({ page }) => {
    await page.goto('/compress/pdf');
    await expect(page.locator('h1')).toContainText('PDF Compress');
  });

  test('navigate to privacy page', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.locator('h1')).toContainText('Privacy');
  });

  test('404 page for unknown route', async ({ page }) => {
    await page.goto('/nonexistent-page');
    await expect(page.getByText('Page not found')).toBeVisible();
  });

  test('old routes redirect to new paths', async ({ page }) => {
    await page.goto('/split/pdf');
    await page.waitForURL('/edit/pdf');
    await expect(page.locator('h1')).toBeVisible();
  });
});
