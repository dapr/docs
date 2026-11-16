// Mechanical inventory of every diagram on a set of content pages: stored
// images and Mermaid blocks alike.
//
// Images are matched by PATH, not by an enumerated list of syntaxes. An
// enumeration silently omits whatever form it was not told about, and the
// inventory then looks complete while missing diagrams - the one failure that
// costs a half-converted page. `syntax` records how each reference was
// written so a later edit knows what to replace; an unrecognised form is
// reported as `other` rather than dropped.
//
// Node built-ins only, like the rest of diagrams/.

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const IMAGE_EXT = 'png|jpe?g|gif|svg|webp';
const IMAGE_RE = new RegExp(String.raw`/images/[A-Za-z0-9._/@%-]+\.(?:${IMAGE_EXT})`, 'gi');

const MERMAID_FENCE_RE = /^[ \t]*```mermaid\b/;
const MERMAID_SHORTCODE_RE = /\{\{<\s*mermaid\s*>\}\}/;

// Opening and closing shortcode delimiters, in both Hugo flavours.
const SHORTCODE_OPEN_RE = /\{\{[<%]\s*([a-zA-Z][\w-]*)[^}]*[>%]\}\}/g;
const SHORTCODE_CLOSE_RE = /\{\{[<%]\s*\/\s*([a-zA-Z][\w-]*)\s*[>%]\}\}/g;

/** Every .md file under a directory, recursively. */
function markdownFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...markdownFiles(full));
    else if (entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

/**
 * How an image reference was written, judged from the text around it.
 * Markdown and raw <img> are the two forms these trees actually use; anything
 * else is reported rather than guessed at.
 */
function imageSyntax(line, index) {
  const before = line.slice(0, index);
  if (/<img\b[^>]*$/i.test(before)) return 'html';
  if (/!\[[^\]]*\]\($/.test(before)) return 'markdown';
  return 'other';
}

/**
 * Shortcode nesting depth at each line of a file, counting opens minus closes
 * on the lines BEFORE it. A Mermaid block inside `{{% codetab %}}` must be
 * replaced without breaking the wrapper, so the inventory records it.
 *
 * Only shortcodes that CLOSE somewhere in the file count as wrappers. Most
 * shortcodes here are inline and self-closing - `{{% ref x.md %}}`,
 * `{{< button >}}` - and counting those as opens leaves the depth permanently
 * above zero, so every diagram after the page's first cross-reference reads as
 * wrapped. That mistake flagged 15 of the 18 real Mermaid blocks.
 */
function nestingDepths(lines, body) {
  const wrappers = new Set(
    [...body.matchAll(SHORTCODE_CLOSE_RE)].map((m) => m[1]),
  );
  const depths = [];
  let depth = 0;
  for (const line of lines) {
    depths.push(depth);
    const closes = [...line.matchAll(SHORTCODE_CLOSE_RE)]
      .filter((m) => wrappers.has(m[1])).length;
    // A close also matches the open pattern, so discount it.
    const opens = [...line.matchAll(SHORTCODE_OPEN_RE)]
      .filter((m) => wrappers.has(m[1])).length - closes;
    // `{{< mermaid >}}` opens a shortcode of its own; it is the diagram, not
    // a wrapper around one, so it must not make its own block look nested.
    const selfOpens = MERMAID_SHORTCODE_RE.test(line) ? 1 : 0;
    depth += Math.max(0, opens - selfOpens) - closes;
    if (depth < 0) depth = 0;
  }
  return depths;
}

function scanFile(file, repoRoot) {
  const body = readFileSync(file, 'utf8');
  const lines = body.split(/\r?\n/);
  const depths = nestingDepths(lines, body);
  const page = relative(repoRoot, file).split(sep).join('/');

  const images = [];
  const mermaid = [];
  let mermaidIndex = 0;
  let inFence = false;

  lines.forEach((line, i) => {
    if (MERMAID_FENCE_RE.test(line) && !inFence) {
      inFence = true;
      mermaid.push({ page, n: ++mermaidIndex, syntax: 'fence', nested: depths[i] > 0 });
      return;
    }
    if (inFence) {
      if (/^[ \t]*```/.test(line)) inFence = false;
      return;
    }
    if (MERMAID_SHORTCODE_RE.test(line)) {
      mermaid.push({ page, n: ++mermaidIndex, syntax: 'shortcode', nested: depths[i] > 0 });
      return;
    }
    for (const m of line.matchAll(IMAGE_RE)) {
      images.push({ id: m[0], page, syntax: imageSyntax(line, m.index) });
    }
  });

  return { images, mermaid };
}

/**
 * Every diagram referenced by a page under `contentRoots`.
 *
 * @returns {{kind: 'image'|'mermaid', id: string, pages: string[],
 *            syntax: string, nested: boolean}[]}
 *   For an image, `id` is its `/images/...` path and `pages` every page that
 *   references it. For a Mermaid block, `id` is `<page>#<n>` - the nth block
 *   on that page - and `pages` holds that one page.
 */
export function extractDiagrams(contentRoots, repoRoot) {
  const byImage = new Map();
  const mermaidRefs = [];

  for (const root of contentRoots) {
    if (!existsSync(root)) continue;
    for (const file of markdownFiles(root)) {
      const { images, mermaid } = scanFile(file, repoRoot);
      for (const img of images) {
        const found = byImage.get(img.id);
        if (found) {
          if (!found.pages.includes(img.page)) found.pages.push(img.page);
        } else {
          byImage.set(img.id, {
            kind: 'image',
            id: img.id,
            pages: [img.page],
            syntax: img.syntax,
            nested: false,
          });
        }
      }
      for (const blk of mermaid) {
        const name = blk.page.split('/').pop();
        mermaidRefs.push({
          kind: 'mermaid',
          id: `${name}#${blk.n}`,
          pages: [blk.page],
          syntax: blk.syntax,
          nested: blk.nested,
        });
      }
    }
  }

  return [...byImage.values(), ...mermaidRefs];
}

/**
 * Pages outside `contentRoots` that reference the same image: other English
 * pages, and the pinned `translations/docs-zh` submodule.
 *
 * `docsZhAvailable` distinguishes "the submodule says nothing depends on this"
 * from "the submodule is not checked out", which look identical in an empty
 * list and mean opposite things for whether an image may ever be removed.
 */
export function findSharers(ref, repoRoot) {
  const english = [];
  const docsZh = [];
  const owning = new Set(ref.pages);

  const englishRoot = join(repoRoot, 'daprdocs', 'content', 'en');
  if (existsSync(englishRoot)) {
    for (const file of markdownFiles(englishRoot)) {
      const page = relative(repoRoot, file).split(sep).join('/');
      if (owning.has(page)) continue;
      if (readFileSync(file, 'utf8').includes(ref.id)) english.push(page);
    }
  }

  const zhRoot = join(repoRoot, 'translations', 'docs-zh');
  const docsZhAvailable = existsSync(zhRoot);
  if (docsZhAvailable) {
    for (const file of markdownFiles(zhRoot)) {
      if (readFileSync(file, 'utf8').includes(ref.id)) {
        docsZh.push(relative(repoRoot, file).split(sep).join('/'));
      }
    }
  }

  return { english, docsZh, docsZhAvailable };
}

/**
 * The scene names the exporter will write, read from the registry. A new
 * scene reusing one of these silently overwrites a committed SVG.
 */
export function registeredSceneNames(repoRoot) {
  const registry = readFileSync(
    join(repoRoot, 'diagrams', 'scenes', 'index.mjs'),
    'utf8',
  );
  const body = registry.slice(registry.indexOf('export const scenes'));
  const names = [];
  for (const line of body.split(/\r?\n/)) {
    const quoted = line.match(/^\s*'([a-z0-9-]+)'\s*:/);
    if (quoted) {
      names.push(quoted[1]);
      continue;
    }
    // A key needing no quotes, e.g. `overview,`.
    const bare = line.match(/^\s*([a-z][a-zA-Z0-9]*)\s*,\s*$/);
    if (bare) names.push(bare[1]);
  }
  return names;
}
