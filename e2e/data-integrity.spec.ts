import { test, expect } from './test-setup';
import { readFile } from 'node:fs/promises';
import readXlsxFile from 'read-excel-file/node';
import { PDFDocument, StandardFonts } from 'pdf-lib';

async function pdfFixture() {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (const text of ['PUBLIC FIRST PAGE', 'SECRET SECOND PAGE']) {
    doc.addPage([300, 400]).drawText(text, { x: 30, y: 320, font, size: 12 });
  }
  return { name: 'pages.pdf', mimeType: 'application/pdf', buffer: Buffer.from(await doc.save()) };
}

test('Base64 downloads the original binary bytes', async ({ page }) => {
  await page.goto('/tools/base64/');
  await page.getByRole('radio', { name: /decode/i }).check();
  await page.locator('textarea').first().fill('/wAB');
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: /download/i }).click();
  const path = await (await pending).path();
  expect((await readFile(path!)).toString('hex')).toBe('ff0001');
});

test('CSV identifiers survive XLSX export', async ({ page }) => {
  await page.goto('/convert/csv-excel/');
  await page.locator('input[type=file]').setInputFiles({ name: 'ids.csv', mimeType: 'text/csv', buffer: Buffer.from('id,account\n00123,9007199254740993\n') });
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: /download/i }).click();
  const path = await (await pending).path();
  expect(await readXlsxFile(path!)).toEqual([['id', 'account'], ['00123', '9007199254740993']]);
});

test('hash worker computes all fingerprints', async ({ page }) => {
  await page.goto('/tools/hash/');
  await page.locator('input[type=file]').setInputFiles({ name: 'abc.txt', mimeType: 'text/plain', buffer: Buffer.from('abc') });
  await expect(page.getByText('900150983cd24fb0d6963f7d28e17f72', { exact: true })).toBeVisible();
  await expect(page.getByText('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad', { exact: true })).toBeVisible();
});

test('PDF redactions retain source page identity after deleting a preceding page', async ({ page }) => {
  await page.goto('/edit/pdf/');
  await page.locator('input[type=file]').setInputFiles(await pdfFixture());
  await page.getByRole('button', { name: 'Redact', exact: true }).click();
  await page.getByRole('button', { name: 'Redact page 2', exact: true }).click();
  const canvas = page.locator('canvas[style*="position: absolute"]');
  await expect(canvas).toBeVisible();
  await page.waitForFunction(() => [...document.querySelectorAll('canvas')].some(c => c.style.position === 'absolute' && c.height > 150));
  const box = (await canvas.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.05, box.y + box.height * 0.1);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.95, box.y + box.height * 0.4, { steps: 8 });
  await page.mouse.up();
  await page.getByRole('button', { name: 'Close redaction editor' }).click();
  await page.getByRole('button', { name: 'Pages', exact: true }).click();
  await page.getByRole('button', { name: 'Delete page 1', exact: true }).click();
  let options: any;
  await page.route('**/api/convert/pdf/edit', async route => {
    const request = route.request();
    const form = await new Response(request.postDataBuffer(), { headers: { 'Content-Type': request.headers()['content-type'] } }).formData();
    options = JSON.parse(String(form.get('options')));
    await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ code: 'VALIDATION_ERROR', error: 'Test capture' }) });
  });
  await page.getByRole('button', { name: 'Apply & Download', exact: true }).click();
  await expect.poll(() => options).toBeTruthy();
  expect(options.pages).toEqual([2]);
  expect(options.redactionSpace).toBe('source');
  expect(options.redactions).toHaveLength(1);
  expect(options.redactions[0].page).toBe(1);
});

test.describe('touch and keyboard PDF ordering', () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });
  test('pages can be moved by touch and keyboard', async ({ page }) => {
    await page.goto('/edit/pdf/');
    await page.locator('input[type=file]').setInputFiles(await pdfFixture());
    await page.getByRole('button', { name: 'Move page 1 later', exact: true }).tap();
    await expect(page.getByRole('img', { name: /^Page [12]$/ }).first()).toHaveAttribute('alt', 'Page 2');
    const button = page.getByRole('button', { name: 'Move page 1 earlier', exact: true });
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('img', { name: /^Page [12]$/ }).first()).toHaveAttribute('alt', 'Page 1');
  });
});
