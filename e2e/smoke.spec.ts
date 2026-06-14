import { test, expect } from './test-setup';

test.describe('Smoke Tests', () => {
  test('home page loads and shows title', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#page-title')).toHaveText('Free Private File Conversion');
  });

  test('sidebar navigation visible on desktop', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Image Tools', exact: true }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'PDF Compress', exact: true }).first()).toBeVisible();
  });

  test('navigate to image convert page', async ({ page }) => {
    await page.goto('/convert/image');
    await expect(page.locator('#page-title')).toHaveText('Image Tools');
    await expect(page.getByText('Drop file here or click to browse')).toBeVisible();
  });

  test('navigate to PDF compress page', async ({ page }) => {
    await page.goto('/compress/pdf');
    await expect(page.locator('#page-title')).toHaveText('PDF Compress');
  });

  test('navigate to privacy page', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.locator('#page-title')).toHaveText('Privacy Policy');
  });

  test('404 page for unknown route', async ({ page }) => {
    await page.goto('/nonexistent-page');
    await expect(page.locator('#page-title')).toHaveText('Page not found');
  });

  test('old routes redirect to new paths', async ({ page }) => {
    await page.goto('/split/pdf');
    await page.waitForURL('**/edit/pdf/');
    await expect(page.locator('#page-title')).toHaveText('PDF Editor');
  });

  test('sidebar search filters tools by label and keyword', async ({ page }) => {
    await page.goto('/');

    const sidebar = page.locator('.sidebar');
    const search = sidebar.locator('[data-tool-search]');
    const navGroups = sidebar.locator('[data-tool-nav-groups]');
    const searchResults = sidebar.locator('[data-tool-search-results]');
    await expect(search).toBeVisible();

    await search.fill('redact');
    await expect(navGroups).toBeHidden();
    await expect(sidebar.locator('[data-tool-result]:visible')).toHaveText(['PDF Editor']);

    await search.fill('zzzz-no-tool');
    await expect(sidebar.locator('[data-tool-search-empty]')).toBeVisible();

    await search.fill('');
    await expect(navGroups).toBeVisible();
    await expect(searchResults).toBeHidden();
  });
});
