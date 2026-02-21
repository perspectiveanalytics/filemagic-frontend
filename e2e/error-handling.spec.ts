import { test, expect } from './test-setup';

test.describe('Error Handling', () => {
  test('rejects wrong file type on image convert', async ({ page }) => {
    await page.goto('/convert/image');

    // Upload a text file — should be rejected client-side
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('this is not an image'),
    });

    // Drop zone should show an error (message: ".TXT isn't supported — try ...")
    await expect(page.getByText(/isn't supported/)).toBeVisible({ timeout: 5000 });
  });

  test('rejects wrong file type on PDF compress', async ({ page }) => {
    await page.goto('/compress/pdf');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('this is not a pdf'),
    });

    await expect(page.getByText(/isn't supported/)).toBeVisible({ timeout: 5000 });
  });
});
