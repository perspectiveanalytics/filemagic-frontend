# FileMagic - Frontend

Frontend for [filemagic.app](https://filemagic.app), a free and private file conversion platform. Built with React, TypeScript, and MUI Joy UI.

Backend: [filemagic-backend](https://github.com/perspectiveanalytics/filemagic-backend)

## Setup

Use Node.js 24 or newer (`.node-version` selects Node 24).

```bash
npm ci
npm run dev
```

Copy `.env.example` to `.env` and fill in the values.

## Validation

```bash
npm test
npm run build
npx playwright install --with-deps chromium firefox webkit
npm run test:e2e
```

The unit suite covers conversion lifecycles and server polling deadlines. The
hash suite also checks a 512 MiB input against Node's cryptographic implementation.

Without `APP_URL`, Playwright builds the static site and serves it at
`http://127.0.0.1:4173`. Chromium, Firefox and WebKit run browser-local tools,
navigation, translations and conversion flows with deterministic API responses.
The three tests tagged `@backend` require a real conversion service and are
excluded from this standalone run.

For a complete integration run, explicitly select a frontend whose `/api` proxy
reaches a test backend:

```bash
APP_URL=http://localhost:8080 npm run test:e2e
```

An explicit `APP_URL` includes the backend tests and does not start a web server.
To run only the standalone scenarios against an existing build, add
`-- --grep-invert @backend`. HTTPS certificate validation remains enabled; a
test environment with a self-signed certificate can opt into
`E2E_IGNORE_HTTPS_ERRORS=1`.

On systems without Playwright's browser libraries, run the same suite in its
matching image after `npm ci`:

```bash
docker run --rm --init --ipc=host \
  --user "$(id -u):$(id -g)" --env HOME=/tmp \
  --volume "$PWD:/work" --workdir /work \
  mcr.microsoft.com/playwright:v1.65.1-noble npm run test:e2e
```

Production-specific legal content is applied by the separate deployment
repository. Keep those overlays out of this application's public sources and
validate the overlaid build in the deployment pipeline.

## License

AGPL-3.0
