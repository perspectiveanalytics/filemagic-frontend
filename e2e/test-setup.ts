import { test as base } from '@playwright/test';

/**
 * Custom test fixture that rewrites API calls and blocks Turnstile.
 *
 * The production build hardcodes VITE_API_BASE_URL=https://api.filemagic.app/api
 * and loads the Turnstile widget from Cloudflare. In test environments, we:
 * 1. Monkey-patch fetch() to rewrite API URLs to relative /api paths
 *    (handled by Nginx proxy in the frontend Docker container)
 * 2. Block the Turnstile script to avoid widget timeouts
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    // Rewrite fetch URLs from the hardcoded production API domain
    // to relative /api paths, which Nginx proxies to the backend.
    // This avoids Playwright's postDataBuffer() truncation for file uploads.
    await page.addInitScript(() => {
      const originalFetch = window.fetch;
      window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
        if (typeof input === 'string' && input.startsWith('https://api.filemagic.app')) {
          const newUrl = input.replace('https://api.filemagic.app', '');
          console.log(`[API REWRITE] ${input} -> ${newUrl}`);
          input = newUrl;
        }
        return originalFetch.call(this, input, init);
      };
    });

    // Block Turnstile script to prevent widget timeouts
    await page.route('**/challenges.cloudflare.com/**', (route) => route.abort());

    await use(page);
  },
});

export { expect } from '@playwright/test';
