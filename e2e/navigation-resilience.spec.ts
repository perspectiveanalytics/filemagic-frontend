import { test, expect } from './test-setup';

test('sidebar navigation stays client-side and preserves its position', async ({ page }) => {
  const errors: Error[] = [];
  page.on('pageerror', (error) => errors.push(error));

  await page.goto('/');

  const sidebar = page.locator('.sidebar');
  const link = sidebar.getByRole('link', { name: 'Ebook Convert', exact: true });
  await link.scrollIntoViewIfNeeded();

  const scrollTop = await sidebar.evaluate((element) => element.scrollTop);
  const timeOrigin = await page.evaluate(() => performance.timeOrigin);
  await page.evaluate(() => {
    (window as Window & { fileMagicNavigationTest?: boolean }).fileMagicNavigationTest = true;
  });

  let documentRequests = 0;
  page.on('request', (request) => {
    if (request.isNavigationRequest() && request.frame() === page.mainFrame()) documentRequests += 1;
  });

  await link.click();
  await page.waitForURL('**/convert/ebook/');
  await expect(page.getByRole('combobox', { name: 'Target format' })).toBeVisible();
  await expect(page.getByText('Drop file here or click to browse')).toBeVisible();

  expect(await page.evaluate(() => performance.timeOrigin)).toBe(timeOrigin);
  expect(await page.evaluate(() => (window as Window & { fileMagicNavigationTest?: boolean }).fileMagicNavigationTest)).toBe(true);
  expect(await sidebar.evaluate((element) => element.scrollTop)).toBe(scrollTop);
  expect(documentRequests).toBe(0);
  expect(errors).toEqual([]);
});

test('shows a retry action when a page chunk cannot be loaded', async ({ page }) => {
  const errors: Error[] = [];
  page.on('pageerror', (error) => errors.push(error));

  let blockChunk = true;
  await page.route(/\/_astro\/ImageCompressPage\.[^/]+\.js(?:[?#].*)?$/, async (route) => {
    if (blockChunk) {
      await route.fulfill({ status: 429, contentType: 'text/plain', body: 'Too Many Requests' });
      return;
    }
    await route.continue();
  });

  await page.goto('/compress/image/');

  const alert = page.getByRole('alert');
  await expect(alert).toContainText('The tool could not be loaded');
  const retry = alert.getByRole('button', { name: 'Try again' });
  await expect(retry).toBeVisible();

  blockChunk = false;
  await retry.click();
  await expect(page.getByRole('spinbutton', { name: 'Target file size' })).toHaveValue('500');
  await expect(page.getByText('Drop file here or click to browse')).toBeVisible();
  await expect(page.locator('.tool-runtime-fallback')).toHaveCount(0);
  expect(errors).toEqual([]);
});
