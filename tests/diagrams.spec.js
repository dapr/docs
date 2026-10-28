// Diagram regression tests.
//
// Scenes in `diagrams/scenes/` are exported to `daprdocs/assets/diagrams/` and
// inlined by the `{{< diagram >}}` shortcode. The committed SVG already shows a
// moved arrow as a reviewable diff, so these tests are structural rather than
// pixel baselines (design decision 15): is the SVG really inlined, does it name
// itself for screen readers, are the labels the page promises actually drawn,
// does anything escape the viewBox, do the `var(--d-*)` colours resolve in both
// themes, and does the figure fit on a phone.
//
// SCENES is the single registry. Every scene added to `diagrams/scenes/index.mjs`
// and called from a page gets a row here; the last test fails if a page renders
// a diagram that no row covers, so no diagram can ship untested.

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');

/**
 * name   the scene, i.e. assets/diagrams/<name>.svg and the figure's data-diagram
 * page   a page that calls `{{< diagram <name> >}}`
 * labels every text label the scene must draw, with multi-line labels written
 *        as one line (the test joins a label's tspan LINES with a space;
 *        richLabel's inline runs join with nothing)
 */
const SCENES = [
  {
    name: 'overview',
    page: '/overview/',
    labels: [
      'Use any language or runtime',
      'App',
      'HTTP/gRPC',
      'Dapr APIs',
      'Workflows',
      'Publish & subscribe',
      'Service invocation',
      'State management',
      'Actors',
      'Jobs',
      'Configuration',
      'Secrets',
      'Bindings',
      'Middleware',
      'Cryptography',
      'Distributed lock',
      'Conversation',
      'Binary Store',
      'Search',
      'Vector',
      'Cross-cutting APIs',
      'Observability',
      'Security',
      'Resiliency',
      'Host on & integrate with any cloud or edge infrastructure',
      'Azure',
      'Virtual or physical machines',
      'Databases',
      'Message brokers',
      'Services',
    ],
    // Tiles that must carry the "alpha" tag, and the only ones that may.
    // Source: daprdocs/content/en/operations/support/alpha-beta-apis.md.
    alpha: [
      'Cryptography',
      'Distributed lock',
      'Conversation',
      'Binary Store',
      'Search',
      'Vector',
    ],
  },
  {
    // One scene, two pages. Both rows are needed: the call-site guard matches on
    name: 'building-blocks',
    page: '/overview/',
    labels: [
      'Workflows',
      'Publish & subscribe',
      'Service invocation',
      'State management',
      'Actors',
      'Jobs',
      'Configuration',
      'Secrets',
      'Bindings',
      'Cryptography',
      'Distributed lock',
      'Conversation',
      'Binary Store',
      'Search',
      'Vector',
    ],
    alpha: [
      'Cryptography',
      'Distributed lock',
      'Conversation',
      'Binary Store',
      'Search',
      'Vector',
    ],
  },
  {
    // name AND page, so a scene shown twice must be listed twice.
    name: 'building-blocks',
    page: '/concepts/building-blocks-concept/',
    labels: [
      'Workflows',
      'Publish & subscribe',
      'Service invocation',
      'State management',
      'Actors',
      'Jobs',
      'Configuration',
      'Secrets',
      'Bindings',
      'Cryptography',
      'Distributed lock',
      'Conversation',
      'Binary Store',
      'Search',
      'Vector',
    ],
    alpha: [
      'Cryptography',
      'Distributed lock',
      'Conversation',
      'Binary Store',
      'Search',
      'Vector',
    ],
  },
  {
    // Shared with the sidecar page below; one row per page, as above.
    name: 'sidecar-model',
    page: '/overview/',
    labels: [
      'App',
      'Application code',
      'Dapr sidecar',
      'Dapr API',
      'HTTP/gRPC',
      'POST',
      'GET',
      'http://localhost:3500/v1.0/invoke/cart/method/order',
      'http://localhost:3500/v1.0/state/inventory/item50',
      'http://localhost:3500/v1.0/publish/mybroker/order-messages',
      'http://localhost:3500/v1.0/secrets/vault/dbaccess',
      'http://localhost:3500/v1.0/workflows/dapr/businessprocess/start',
    ],
  },
  {
    // The URLs are single labels: richLabel joins its tspans with no space.
    name: 'sidecar-model',
    page: '/concepts/dapr-services/sidecar/',
    labels: [
      'App',
      'Application code',
      'Dapr sidecar',
      'Dapr API',
      'HTTP/gRPC',
      'POST',
      'GET',
      'http://localhost:3500/v1.0/invoke/cart/method/order',
      'http://localhost:3500/v1.0/state/inventory/item50',
      'http://localhost:3500/v1.0/publish/mybroker/order-messages',
      'http://localhost:3500/v1.0/secrets/vault/dbaccess',
      'http://localhost:3500/v1.0/workflows/dapr/businessprocess/start',
    ],
  },
];

// Phone widths. 320 is the narrowest viewport still worth supporting, 360 and
// 412 are the two commonest Android widths; `tests/layout.spec.js` uses the
// same three for the page-level checks.
const PHONE_WIDTHS = [320, 360, 412];

// Nothing may be drawn nearer than this to the edge of the viewBox: the inlined
// SVG has no padding of its own, so geometry on the boundary touches the prose.
const EDGE_MARGIN = 10;

const sel = (name) => `.dapr-diagram[data-diagram="${name}"]`;

/**
 * Collects the drawn text of every <text>.
 *
 * A tspan is used for two different things. label() starts each LINE of a
 * multi-line label with one, and gives it an `x`, so those join with a space
 * and read as one sentence. richLabel() uses them for INLINE runs of a single
 * line that differ in colour or weight, with no `x`, and those must join with
 * nothing or a URL comes back with spaces in it.
 */
function readLabels(page, name) {
  return page.$$eval(`${sel(name)} svg text`, (nodes) =>
    nodes.map((n) => {
      const spans = [...n.querySelectorAll('tspan')];
      if (!spans.length) return n.textContent.replace(/\s+/g, ' ').trim();
      return spans
        .map((s) => (s.hasAttribute('x') ? ` ${s.textContent}` : s.textContent))
        .join('')
        .replace(/\s+/g, ' ')
        .trim();
    }),
  );
}

/**
 * Every resolved paint in the scene, plus the two a scene always has: the panel
 * stroke and the first label's fill. Scene-agnostic on purpose, so a scene that
 * happens not to use a given builder does not silently skip the check.
 */
function readPaint(page, name) {
  return page.evaluate((root) => {
    const svg = document.querySelector(`${root} svg`);
    const all = [];
    for (const el of svg.querySelectorAll('*')) {
      const cs = getComputedStyle(el);
      all.push(`${cs.fill}|${cs.stroke}`);
    }
    const pick = (q, prop) => {
      const el = svg.querySelector(q);
      return el ? getComputedStyle(el)[prop] : null;
    };
    // A scene need not use panel(), and its first <text> may be plate ink, which
    // is the same colour in both themes by design. Pick what exists, and prefer
    // a text node that is not sitting on a plate; the fingerprint below carries
    // the real signal and does not care about scene shape.
    const offPlate = [...svg.querySelectorAll('text')].find(
      (t) => !t.closest('.d-icon-group') && !t.previousElementSibling?.classList?.contains('d-plate'),
    );
    return {
      panelStroke: pick('.d-panel', 'stroke'),
      textFill: offPlate ? getComputedStyle(offPlate).fill : pick('text', 'fill'),
      fingerprint: all.join(';'),
      unresolved: all.filter((v) => v.includes('var(') || v.includes('||')),
    };
  }, sel(name));
}

for (const scene of SCENES) {
  test.describe(`${scene.name} on ${scene.page}`, () => {
    test(`${scene.name} renders an inline svg with a title and desc`, async ({ page }) => {
      await page.goto(scene.page, { waitUntil: 'domcontentloaded' });

      const figure = page.locator(sel(scene.name));
      await expect(figure).toHaveCount(1);

      // Inlined, not an <img>: only an inline SVG re-themes and is searchable.
      const svg = figure.locator('> svg');
      await expect(svg).toHaveCount(1);
      await expect(svg).toHaveAttribute('viewBox', /^0 0 \d+(\.\d+)? \d+(\.\d+)?$/);
      await expect(svg).toHaveAttribute('role', 'img');

      // The accessible name and description come from inside the SVG and are
      // wired up by id, so a renamed scene cannot quietly lose them.
      const labelledBy = (await svg.getAttribute('aria-labelledby')).split(/\s+/);
      expect(labelledBy).toHaveLength(2);
      for (const id of labelledBy) {
        await expect(svg.locator(`[id="${id}"]`)).toHaveCount(1);
      }
      await expect(svg.locator('> title')).toHaveText(/\S/);
      await expect(svg.locator('> desc')).toHaveText(/\S/);

      // Our own copy rule: no em dash or en dash in the description.
      const desc = await svg.locator('> desc').textContent();
      expect(desc).not.toMatch(/[–—]/);
    });

    test(`${scene.name} shows every expected label`, async ({ page }) => {
      await page.goto(scene.page, { waitUntil: 'domcontentloaded' });
      const drawn = await readLabels(page, scene.name);
      for (const label of scene.labels) {
        expect(drawn, `missing label "${label}"`).toContain(label);
      }
    });

    if (scene.alpha) {
      test(`${scene.name} tags exactly the alpha APIs`, async ({ page }) => {
        await page.goto(scene.page, { waitUntil: 'domcontentloaded' });
        // A tile's tag and its label are two <text> nodes in the same .d-tile
        // group, so read each tile whole and keep the ones carrying "alpha".
        // A card's description is excluded: it is prose, not the tile's name.
        const tagged = await page.$$eval(`${sel(scene.name)} svg .d-tile`, (tiles) =>
          tiles
            .map((t) => {
              const texts = [...t.querySelectorAll('text')].filter((n) => !n.closest('.d-tile-desc')).map((n) => {
                const spans = n.querySelectorAll('tspan');
                const parts = spans.length ? [...spans].map((s) => s.textContent) : [n.textContent];
                return parts.join(' ').replace(/\s+/g, ' ').trim();
              });
              return { texts, isAlpha: texts.includes('alpha') };
            })
            .filter((t) => t.isAlpha)
            .map((t) => t.texts.filter((x) => x !== 'alpha').join(' ')),
        );
        expect(tagged.sort()).toEqual([...scene.alpha].sort());
      });
    }

    // NOTE: this measures USER UNITS inside the viewBox, not what a reader sees.
    // _diagrams.scss sets `svg { width: 100% }`, so the rendered size is
    // size x columnWidth / viewBoxWidth: on a 1512-wide canvas a 12-unit label
    // lands near 6-7 CSS px in a typical Docsy column. The floor is therefore
    // canvas-relative, and the same "11" is four times more readable on a
    // 600-wide canvas than on a 1512-wide one. Whether the house style should
    // express this as a ratio instead is an open question for the skill text.
    test(`${scene.name} draws no text below 11 user units`, async ({ page }) => {
      await page.goto(scene.page, { waitUntil: 'domcontentloaded' });
      const sizes = await page.$$eval(`${sel(scene.name)} svg text`, (nodes) =>
        nodes.map((n) => parseFloat(getComputedStyle(n).fontSize)),
      );
      expect(sizes.length).toBeGreaterThan(0);
      expect(Math.min(...sizes)).toBeGreaterThanOrEqual(11);
    });

    test(`${scene.name} has no element outside its viewBox`, async ({ page }) => {
      await page.goto(scene.page, { waitUntil: 'domcontentloaded' });
      const { bbox, view } = await page.evaluate((root) => {
        const svg = document.querySelector(`${root} svg`);
        const b = svg.getBBox();
        const v = svg.viewBox.baseVal;
        return {
          bbox: { left: b.x, top: b.y, right: b.x + b.width, bottom: b.y + b.height },
          view: { width: v.width, height: v.height },
        };
      }, sel(scene.name));

      expect(bbox.left).toBeGreaterThanOrEqual(EDGE_MARGIN);
      expect(bbox.top).toBeGreaterThanOrEqual(EDGE_MARGIN);
      expect(bbox.right).toBeLessThanOrEqual(view.width - EDGE_MARGIN);
      expect(bbox.bottom).toBeLessThanOrEqual(view.height - EDGE_MARGIN);
    });

    test(`${scene.name} resolves its token colors in light and in dark`, async ({ page }) => {
      await page.goto(scene.page, { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => document.documentElement.setAttribute('data-bs-theme', 'light'));
      const light = await readPaint(page, scene.name);

      // The site's toggle flips this attribute on <html>; no media query involved.
      await page.evaluate(() => document.documentElement.setAttribute('data-bs-theme', 'dark'));
      const dark = await readPaint(page, scene.name);

      // A var() that does not resolve survives as the literal text, which is
      // exactly the failure this catches.
      expect(light.unresolved, 'unresolved paint in light').toEqual([]);
      expect(dark.unresolved, 'unresolved paint in dark').toEqual([]);

      // Only assert on what this scene actually draws: a missing .d-panel is a
      // legitimate scene shape, not a regression. The fingerprint below is the
      // assertion that every scene must pass.
      for (const key of ['panelStroke', 'textFill']) {
        if (light[key] === null && dark[key] === null) continue;
        expect(light[key], `${key} did not resolve`).toMatch(/^rgba?\(/);
        expect(dark[key], `${key} did not resolve in dark`).toMatch(/^rgba?\(/);
        expect(dark[key], `${key} is the same in both themes`).not.toBe(light[key]);
      }
      expect(dark.fingerprint, 'the scene paints identically in both themes').not.toBe(
        light.fingerprint,
      );
    });

    for (const width of PHONE_WIDTHS) {
      test(`${scene.name} does not overflow at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 780 });
        await page.goto(scene.page, { waitUntil: 'domcontentloaded' });

        const figure = page.locator(sel(scene.name));
        const svgBox = await figure.locator('> svg').boundingBox();
        expect(svgBox.x + svgBox.width).toBeLessThanOrEqual(width + 1);

        // Scoped to the figure on purpose. Page-level overflow is
        // tests/layout.spec.js's job, and a page can overflow for reasons that
        // have nothing to do with its diagram (overview.md's wide Markdown
        // tables push 3px past 320px today, with or without this figure).
        const inner = await page.evaluate(
          (root) => {
            const fig = document.querySelector(root);
            return { scroll: fig.scrollWidth, client: fig.clientWidth };
          },
          sel(scene.name),
        );
        expect(inner.scroll).toBeLessThanOrEqual(inner.client + 1);
      });
    }

    test(`${scene.name} ships no diagram JavaScript`, async ({ page }) => {
      await page.goto(scene.page, { waitUntil: 'domcontentloaded' });

      // Decision 3: the SVG is the artifact, the browser never runs the engine.
      await expect(page.locator(`${sel(scene.name)} script`)).toHaveCount(0);

      const handlers = await page.evaluate((root) => {
        const bad = [];
        for (const el of document.querySelectorAll(`${root} *`)) {
          for (const attr of el.attributes) {
            if (/^on/i.test(attr.name)) bad.push(`${el.tagName}[${attr.name}]`);
          }
        }
        return bad;
      }, sel(scene.name));
      expect(handlers).toEqual([]);

      const srcs = await page.$$eval('script[src]', (nodes) => nodes.map((n) => n.getAttribute('src')));
      expect(srcs.filter((s) => /diagram|\bd3\b/i.test(s))).toEqual([]);
    });
  });
}

// Where the call sites actually are, read from the repo rather than from SCENES.
// Building the page list out of SCENES (as this guard used to) can only ever see
// pages that already have a row, so the failure it exists to prevent - a scene
// shipped on a page nobody listed - was invisible to it.
const CONTENT_DIR = path.join(REPO_ROOT, 'daprdocs', 'content', 'en');

function markdownFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return markdownFiles(full);
    return e.isFile() && e.name.endsWith('.md') ? [full] : [];
  });
}

// content/en/overview.md -> /overview/ ; .../_index.md -> that directory's url
function urlFor(file) {
  const rel = path.relative(CONTENT_DIR, file).split(path.sep).join('/');
  const stem = rel.replace(/\.md$/, '').replace(/(^|\/)_index$/, '');
  return `/${stem}${stem.endsWith('/') || stem === '' ? '' : '/'}`;
}

function diagramCallSites() {
  const calls = [];
  for (const file of markdownFiles(CONTENT_DIR)) {
    const body = fs.readFileSync(file, 'utf8');
    for (const m of body.matchAll(/\{\{<\s*diagram\s+([^\s>]+)/g)) {
      calls.push({ name: m[1].replace(/^["']|["']$/g, ''), page: urlFor(file) });
    }
  }
  return calls;
}

test('every exported diagram has a row in SCENES', () => {
  // The exporter writes one svg per registered scene and deletes orphans, so
  // the directory listing is the registry.
  const exported = fs
    .readdirSync(path.join(REPO_ROOT, 'daprdocs', 'assets', 'diagrams'))
    .filter((f) => f.endsWith('.svg'))
    .map((f) => f.slice(0, -4));
  const known = SCENES.map((s) => s.name);
  expect(
    exported.filter((n) => !known.includes(n)),
    'exported but untested - add a SCENES row',
  ).toEqual([]);
});

test('every {{< diagram >}} call site in the content is listed in SCENES', () => {
  const rows = SCENES.map((s) => `${s.name} ${s.page}`);
  const missing = diagramCallSites()
    .filter(({ name, page }) => !rows.includes(`${name} ${page}`))
    .map(({ name, page }) => `${name} on ${page}`);
  expect(missing, 'diagram call sites with no matching SCENES row').toEqual([]);
});

test('every .dapr-diagram on a visited page is listed in SCENES', async ({ page }) => {
  const known = SCENES.map((s) => s.name);
  const pages = new Set([...SCENES.map((s) => s.page), ...diagramCallSites().map((c) => c.page)]);
  for (const url of pages) {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const found = await page.$$eval('.dapr-diagram', (nodes) =>
      nodes.map((n) => n.dataset.diagram ?? '(no data-diagram)'),
    );
    expect(found.length, `${url} renders no diagram`).toBeGreaterThan(0);
    for (const name of found) {
      expect(known, `${url} renders diagram "${name}", which has no row in SCENES`).toContain(name);
    }
  }
});


// Windows high contrast drops author colours entirely. A diagram that depends on
// var(--d-*) can collapse to invisible there, which is why _diagrams.scss has a
// forced-colors block - and why it needs a test, as a named Review Focus item.
test.describe('high contrast', () => {
  for (const scene of SCENES) {
    test(`${scene.name} on ${scene.page} stays visible in forced-colors mode`, async ({ page }) => {
      // emulateMedia, not test.use({ forcedColors }): the fixture form did not
      // make the media query match in this Chromium, so the test silently
      // measured the ordinary light theme instead of high contrast.
      await page.emulateMedia({ forcedColors: 'active' });
      await page.goto(scene.page, { waitUntil: 'domcontentloaded' });
      expect(
        await page.evaluate(() => matchMedia('(forced-colors: active)').matches),
        'forced-colors emulation did not take effect; this test would prove nothing',
      ).toBe(true);
      const paints = await page.evaluate((root) => {
        const svg = document.querySelector(`${root} svg`);
        const text = [...svg.querySelectorAll('text')].map((n) => getComputedStyle(n).fill);
        const strokes = [...svg.querySelectorAll('path, rect, polygon, polyline, line')]
          .filter((n) => !n.closest('.d-icon'))
          .map((n) => getComputedStyle(n).stroke);
        return { text, strokes };
      }, sel(scene.name));

      // Nothing may still be asking for a custom property the UA has dropped.
      expect(paints.text.filter((v) => v.includes('var(')), 'unresolved text fill').toEqual([]);
      expect(paints.strokes.filter((v) => v.includes('var(')), 'unresolved stroke').toEqual([]);
      expect(paints.text.length, 'no text found').toBeGreaterThan(0);
      // And text must not be painted in the window background colour.
      const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      expect(paints.text.filter((v) => v === bg), 'text painted in the page background').toEqual([]);
    });
  }
});
