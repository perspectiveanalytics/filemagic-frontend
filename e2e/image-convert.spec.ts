import { test, expect } from './test-setup';
import path from 'path';
import { fileURLToPath } from 'url';

const fixtures = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');

test.describe('Image Conversion', () => {
  test('convert JPG to PNG', async ({ page }) => {
    await page.goto('/convert/image');

    // Upload file via hidden input
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(fixtures, 'sample.jpg'));

    // Image preview should appear
    await expect(page.getByRole('img', { name: 'Preview' })).toBeVisible({ timeout: 5000 });

    // Select PNG output format
    const formatSelect = page.locator('select, [role="combobox"]').first();
    await formatSelect.click();
    await page.getByRole('option', { name: 'PNG' }).click();

    // Click Convert
    await page.getByRole('button', { name: 'Convert' }).last().click();

    // Wait for Download button (conversion complete)
    await expect(page.getByRole('button', { name: 'Download' })).toBeVisible({ timeout: 60_000 });
  });

  test('convert PNG to JPG', async ({ page }) => {
    await page.goto('/convert/image');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(fixtures, 'sample.png'));

    await expect(page.getByRole('img', { name: 'Preview' })).toBeVisible({ timeout: 5000 });

    // JPG is typically the default — just click Convert
    await page.getByRole('button', { name: 'Convert' }).last().click();

    await expect(page.getByRole('button', { name: 'Download' })).toBeVisible({ timeout: 60_000 });
  });
});
