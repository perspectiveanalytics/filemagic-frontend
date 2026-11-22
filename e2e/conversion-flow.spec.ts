import { test, expect } from './test-setup';
import { readFile } from 'node:fs/promises';

const pdfPath = new URL('./fixtures/sample.pdf', import.meta.url);

test('completed conversions can be downloaded twice without consuming the server result twice', async ({ page }) => {
  const pdf = await readFile(pdfPath);
  let polls = 0;
  let downloads = 0;
  await page.route('**/api/convert/pdf/compress', route => route.fulfill({
    status: 202, json: { jobId: 'pdf-job', position: 1, estimatedWait: 5, timeoutSeconds: 790 },
  }));
  await page.route('**/api/queue/position/pdf-job', route => route.fulfill({
    json: ++polls === 1
      ? { jobId: 'pdf-job', status: 'processing', position: 0 }
      : { jobId: 'pdf-job', status: 'done', inputSize: pdf.length, outputSize: pdf.length },
  }));
  await page.route('**/api/download/pdf-job', route => {
    downloads += 1;
    return route.fulfill({
      status: downloads === 1 ? 200 : 404,
      contentType: 'application/pdf',
      headers: { 'Content-Disposition': 'attachment; filename="result.pdf"' },
      body: downloads === 1 ? pdf : Buffer.from('Already downloaded'),
    });
  });

  await page.goto('/compress/pdf/');
  await page.locator('input[type=file]').setInputFiles({ name: 'sample.pdf', mimeType: 'application/pdf', buffer: pdf });
  const downloadButton = page.getByRole('button', { name: 'Download', exact: true });
  await expect(downloadButton).toBeVisible();
  for (let attempt = 0; attempt < 2; attempt++) {
    const pending = page.waitForEvent('download');
    await downloadButton.click();
    const download = await pending;
    expect(download.suggestedFilename()).toBe('result.pdf');
    expect(await readFile((await download.path())!)).toEqual(pdf);
  }
  expect(downloads).toBe(1);
  await page.getByRole('button', { name: 'New', exact: true }).click();
  await expect(page.getByText('Drop file here or click to browse', { exact: true })).toBeVisible();
});

test('an unavailable API offers a retry without displaying an HTML error page', async ({ page }) => {
  await page.route('**/api/convert/pdf/compress', route => route.fulfill({
    status: 503, contentType: 'text/html', body: '<html><body>private proxy diagnostic</body></html>',
  }));
  await page.goto('/compress/pdf/');
  await page.locator('input[type=file]').setInputFiles({
    name: 'sample.pdf', mimeType: 'application/pdf', buffer: await readFile(pdfPath),
  });
  await expect(page.getByRole('button', { name: 'Try again', exact: true })).toBeVisible();
  await expect(page.getByText('private proxy diagnostic')).toHaveCount(0);
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(page.getByText('Drop file here or click to browse', { exact: true })).toBeVisible();
});

test('French routes hydrate their translated controls', async ({ page }) => {
  await page.goto('/fr/archive/decompress/');
  await expect(page.getByRole('heading', { name: 'Décompresser une archive', exact: true })).toBeVisible();
  await expect(page.getByLabel('Mot de passe (optionnel)', { exact: true })).toBeVisible();
  await expect(page.getByText('Déposez le fichier ici ou cliquez pour parcourir', { exact: true })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
});
