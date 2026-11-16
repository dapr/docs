// A headless page with the site's real faces loaded, for the two tools that
// need one: measure-bbox.mjs measures text, which has no width until a font
// renders it, and render-png.mjs rasterises it. A label measured or drawn
// against a fallback face is a drawing nobody sees.
//
// measure-ink.mjs needs no fonts and does not use this module: it measures
// vendored mark geometry, which is path data and the same width everywhere.
//
// The faces are served from the repo (daprdocs/static) rather than from a
// build, so nothing needs building first.

import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const HERE = dirname(fileURLToPath(import.meta.url));
const STATIC = join(HERE, '..', 'daprdocs', 'static');

export const FACES = [
  ['Geist', 400, 'geist-400.woff2'], ['Geist', 500, 'geist-500.woff2'],
  ['Geist', 600, 'geist-600.woff2'], ['Geist', 700, 'geist-700.woff2'],
  ['Inter', 400, 'inter-400.woff2'], ['Inter', 500, 'inter-500.woff2'],
  ['Inter', 600, 'inter-600.woff2'],
  ['Geist Mono', 400, 'geist-mono-400.woff2'], ['Geist Mono', 500, 'geist-mono-500.woff2'],
];

export const fontCss = FACES
  .map(([family, weight, file]) => `@font-face{font-family:"${family}";font-weight:${weight};font-display:block;src:url("/fonts/${file}") format("woff2")}`)
  .join('');

// The same variables the page sets, so `var(--font-mono)` on a code label
// resolves to the face it will really be drawn in.
export function harnessHtml(body) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${fontCss}
:root{--font-head:"Geist",sans-serif;--font-body:"Inter",sans-serif;--font-mono:"Geist Mono",monospace}
body{margin:0;font-family:var(--font-body)}
.fig svg{display:block;width:100%;height:auto}</style></head><body>${body}</body></html>`;
}

export async function withHarness(fn, { body = '', viewport = { width: 1000, height: 900 } } = {}) {
  const server = createServer((req, res) => {
    const path = new URL(req.url, 'http://localhost').pathname;
    if (path === '/') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      res.end(harnessHtml(body));
      return;
    }
    try {
      const file = join(STATIC, path);
      if (!file.startsWith(STATIC)) throw new Error('outside static');
      res.writeHead(200, { 'content-type': extname(file) === '.woff2' ? 'font/woff2' : 'application/octet-stream' });
      res.end(readFileSync(file));
    } catch {
      res.writeHead(404);
      res.end('');
    }
  });
  await new Promise((ready) => server.listen(0, '127.0.0.1', ready));
  const { port } = server.address();

  const browser = await chromium.launch();
  try {
    const tab = await browser.newPage({ viewport });
    await tab.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'load' });
    await tab.evaluate(() => document.fonts.ready);
    return await fn(tab);
  } finally {
    await browser.close();
    server.close();
  }
}
