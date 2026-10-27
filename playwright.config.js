// Playwright config for the layout regression suite (tests/layout.spec.js).
//
// These tests assert geometric invariants — content is on screen, nothing
// overflows horizontally, the sidebar collapses below lg — rather than
// comparing screenshots. Screenshot diffs would churn on every content change;
// the invariants hold no matter what the pages say.
//
// `webServer` starts the Hugo dev server and waits for it, so `npm run
// test:layout` works from a clean checkout with no manual setup.

const { defineConfig } = require('@playwright/test');

const PORT = Number(process.env.LAYOUT_TEST_PORT || 1314);

module.exports = defineConfig({
  testDir: './tests',
  // The invariants are deterministic; a retry would only mask a real flake.
  retries: 0,
  // Hugo serves one site; parallel page loads are cheap, browser contexts are not.
  workers: process.env.CI ? 2 : undefined,
  fullyParallel: true,
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],
  timeout: 30_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'on-first-retry',
  },

  webServer: {
    // Mirrors `npm run serve` (-e dev -DFE renders drafts/future/expired pages),
    // but calls hugo directly: the npm script chain puts flags before the
    // `serve` subcommand, and --port is only valid after it.
    command: `npx --no-install hugo serve -e dev -DFE --renderToMemory --port ${PORT} --bind 127.0.0.1`,
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    // A cold Hugo build of ~1100 pages takes well over a minute on CI runners.
    timeout: 300_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
