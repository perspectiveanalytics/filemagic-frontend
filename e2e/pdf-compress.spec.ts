import { test, expect } from './test-setup';
import path from 'path';
import { fileURLToPath } from 'url';

const fixtures = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');

test.describe('PDF Compression', () => {
  test('compress PDF file', async ({ page }) => {
    await page.goto('/compress/pdf');

    // PDF compress starts processing immediately on file select
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(fixtures, 'sample.pdf'));

    // Wait for Download button (compression complete)
    await expect(page.getByRole('button', { name: 'Download' })).toBeVisible({ timeout: 60_000 });
  });
});
