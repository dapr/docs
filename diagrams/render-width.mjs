// How wide a diagram is asked to render, and where every call site asks it.
//
// `_diagrams.scss` sets `svg { width: 100% }`, so a scene unit renders at
// `columnWidth / canvasWidth`: the NARROWER the canvas, the further it is
// stretched and the bigger everything in it comes out. Two scenes with the
// same declared label size land two and a bit times apart if their canvases
// differ enough. The lever is the shortcode's `width`, and SKILL.md gives the
// formula. This module is that formula, so the rule is executable rather than
// only written down - and `render-width.test.mjs` sweeps every call site with
// it.
//
// The divisor is not a taste. The canvases in this set fall into two groups
// with a clear gap between 1050 and 1122 - full-page architecture diagrams
// above it, set-pieces below - and 1100 sits in that gap. See SKILL.md.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = fileURLToPath(new URL('.', import.meta.url));
export const REPO_ROOT = join(HERE, '..');
export const CONTENT_ROOT = join(REPO_ROOT, 'daprdocs', 'content');

// Above this, the difference is not worth the markup and the call passes none.
export const WIDTH_CEILING = 85;
const DIVISOR = 1100;

/**
 * The percentage a scene of this canvas width should be asked to render at,
 * or null when the call should pass no width at all.
 */
export function renderWidth(canvasWidth) {
  const pct = Math.min(100, Math.round((canvasWidth / DIVISOR) * 20) * 5);
  return pct > WIDTH_CEILING ? null : pct;
}

// `{{< diagram overview >}}` and `{{< diagram name="x" width="70" >}}`. Hugo
// refuses to mix positional and named parameters, so a call that passes a
// width names the scene as well - which is why the positional form can never
// carry one.
const CALL = /\{\{<\s*diagram\s+([^>]*?)>\}\}/g;
const NAMED = /name="([^"]+)"/;
const WIDTH = /width="([^"]+)"/;

/**
 * Every diagram call in the docs, as { name, width, file, line }. `width` is
 * null when the call passes none. Fenced blocks are skipped: a page that
 * documents the shortcode is showing markup, not calling it.
 */
export function diagramCalls({ sources } = {}) {
  const files = sources ?? markdownFiles(CONTENT_ROOT);
  const calls = [];
  for (const { file, body } of files) {
    const text = withoutFences(body);
    for (const m of text.matchAll(CALL)) {
      const args = m[1];
      const named = NAMED.exec(args);
      const width = named ? WIDTH.exec(args) : null;
      calls.push({
        name: named ? named[1] : args.trim().split(/\s+/)[0],
        width: width ? Number(width[1]) : null,
        file,
        line: text.slice(0, m.index).split('\n').length,
      });
    }
  }
  return calls;
}

// Blanked rather than removed, so the line numbers reported still match the
// file a reader opens.
function withoutFences(body) {
  let fenced = false;
  return body
    .split('\n')
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) {
        fenced = !fenced;
        return '';
      }
      return fenced ? '' : line;
    })
    .join('\n');
}

function markdownFiles(root) {
  const out = [];
  (function walk(dir) {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) walk(path);
      else if (path.endsWith('.md')) {
        out.push({ file: relative(REPO_ROOT, path).split(sep).join('/'), body: readFileSync(path, 'utf8') });
      }
    }
  })(root);
  return out;
}
