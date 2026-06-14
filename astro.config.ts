import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { lingui } from '@lingui/vite-plugin';

export default defineConfig({
  site: 'https://filemagic.app',
  output: 'static',
  server: {
    port: 3000,
  },
  redirects: {
    '/split/pdf': '/edit/pdf/',
    '/fr/split/pdf': '/fr/edit/pdf/',
    '/convert/pdf-rotate': '/edit/pdf/',
    '/fr/convert/pdf-rotate': '/fr/edit/pdf/',
    '/convert/svg-to-png': '/convert/image/',
    '/fr/convert/svg-to-png': '/fr/convert/image/',
    '/convert/markdown/pdf': '/convert/markdown-pdf/',
    '/fr/convert/markdown/pdf': '/fr/convert/markdown-pdf/',
    '/convert/audio/extract': '/convert/audio-extract/',
    '/fr/convert/audio/extract': '/fr/convert/audio-extract/',
    '/tools/hash-generator': '/tools/hash/',
    '/fr/tools/hash-generator': '/fr/tools/hash/',
  },
  integrations: [
    react({
      babel: {
        plugins: ['@lingui/babel-plugin-lingui-macro'],
      },
    }),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en-US',
          fr: 'fr-FR',
        },
      },
    }),
  ],
  vite: {
    plugins: [lingui()],
    envPrefix: ['PUBLIC_', 'VITE_'],
    optimizeDeps: {
      entries: ['src/**/*.{astro,ts,tsx}'],
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8090',
          changeOrigin: true,
        },
      },
    },
  },
});
