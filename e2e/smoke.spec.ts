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

  test('sidebar search filters and ranks tools by label and keyword', async ({ page }) => {
    await page.goto('/');

    const sidebar = page.locator('.sidebar');
    const search = sidebar.locator('[data-tool-search]');
    const navGroups = sidebar.locator('[data-tool-nav-groups]');
    const searchResults = sidebar.locator('[data-tool-search-results]');
    await expect(search).toBeVisible();

    await search.fill('redact');
    await expect(navGroups).toBeHidden();
    await expect(sidebar.locator('[data-tool-result]:visible')).toHaveText(['PDF Editor']);

    // A tool whose name matches ranks ahead of keyword-only matches.
    await search.fill('compress');
    await expect(sidebar.locator('[data-tool-result]:visible').first()).toHaveText(/Compress/);

    await search.fill('zzzz-no-tool');
    await expect(sidebar.locator('[data-tool-search-empty]')).toBeVisible();

    await search.fill('');
    await expect(navGroups).toBeVisible();
    await expect(searchResults).toBeHidden();
  });

  test('mobile drawer search is discoverable, focuses and filters', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    await expect(page.locator('.sidebar')).toBeHidden();
    const trigger = page.locator('.mobile-menu-trigger');
    await expect(trigger).toBeVisible();
    await expect(trigger).toContainText('Tools');

    const details = page.locator('details.mobile-menu');
    const drawer = page.locator('.mobile-drawer');
    const search = drawer.locator('[data-tool-search]');

    await trigger.click();
    await expect(search).toBeFocused();

    await search.fill('redact');
    await expect(drawer.locator('[data-tool-result]:visible')).toHaveText(['PDF Editor']);

    await search.fill('zzzz-no-tool');
    await expect(drawer.locator('[data-tool-search-empty]')).toBeVisible();

    // Close button closes the drawer and removes it from the tab order.
    await drawer.locator('[data-drawer-close]').click();
    await expect(details).toHaveJSProperty('open', false);
    await expect(search).toBeHidden();

    // Tapping the backdrop strip outside the panel also closes it.
    await trigger.click();
    await expect(details).toHaveJSProperty('open', true);
    await page.locator('[data-drawer-backdrop]').click({ position: { x: 375, y: 90 } });
    await expect(details).toHaveJSProperty('open', false);

    // Enter opens the top-ranked result.
    await trigger.click();
    await search.fill('compress');
    await search.press('Enter');
    await page.waitForURL('**/compress/**');
  });
});
