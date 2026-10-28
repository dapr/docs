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

/**
 * name   the scene, i.e. assets/diagrams/<name>.svg and the figure's data-diagram
 * page   a page that calls `{{< diagram <name> >}}`
 * labels every text label the scene must draw, with multi-line labels written
 *        as one line (the test joins a <text>'s tspans with a space)
 */
const SCENES = [
  {
    name: 'overview',
    page: '/overview/',
    labels: [
      'Use any language or runtime',
      'App',
      'Rust',
      'HTTP/gRPC',
      'Building block APIs',
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
];

// Phone widths. 320 is the narrowest viewport still worth supporting, 360 and
// 412 are the two commonest Android widths; `tests/layout.spec.js` uses the
// same three for the page-level checks.
const PHONE_WIDTHS = [320, 360, 412];

// Nothing may be drawn nearer than this to the edge of the viewBox: the inlined
// SVG has no padding of its own, so geometry on the boundary touches the prose.
const EDGE_MARGIN = 10;

const sel = (name) => `.dapr-diagram[data-diagram="${name}"]`;

/** Collects the drawn text of every <text>, with tspan lines joined by a space. */
function readLabels(page, name) {
  return page.$$eval(`${sel(name)} svg text`, (nodes) =>
    nodes.map((n) => {
      const spans = n.querySelectorAll('tspan');
      const parts = spans.length ? [...spans].map((s) => s.textContent) : [n.textContent];
      return parts.join(' ').replace(/\s+/g, ' ').trim();
    }),
  );
}

/** Computed paint of the three things every scene has: a panel, a box, a label. */
function readPaint(page, name) {
  return page.evaluate((root) => {
    const svg = document.querySelector(`${root} svg`);
    const pick = (q, prop) => {
      const el = svg.querySelector(q);
      return el ? getComputedStyle(el)[prop] : null;
    };
    return {
      panelStroke: pick('.d-panel', 'stroke'),
      boxFill: pick('.d-box rect', 'fill'),
      textFill: pick('text', 'fill'),
    };
  }, sel(name));
}

for (const scene of SCENES) {
  test.describe(scene.name, () => {
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
        const tagged = await page.$$eval(`${sel(scene.name)} svg .d-tile`, (tiles) =>
          tiles
            .map((t) => {
              const texts = [...t.querySelectorAll('text')].map((n) => {
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

    test(`${scene.name} draws no text below 11px`, async ({ page }) => {
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

      for (const [key, value] of Object.entries(light)) {
        // A var() that does not resolve leaves the paint empty or as the literal
        // text, which is exactly the failure this catches.
        expect(value, `${key} did not resolve`).toMatch(/^rgba?\(/);
        expect(dark[key], `${key} did not resolve in dark`).toMatch(/^rgba?\(/);
        expect(dark[key], `${key} is the same in both themes`).not.toBe(value);
      }
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

test('every .dapr-diagram on a visited page is listed in SCENES', async ({ page }) => {
  const known = SCENES.map((s) => s.name);
  for (const path of new Set(SCENES.map((s) => s.page))) {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    const found = await page.$$eval('.dapr-diagram', (nodes) =>
      nodes.map((n) => n.dataset.diagram ?? '(no data-diagram)'),
    );
    expect(found.length).toBeGreaterThan(0);
    for (const name of found) {
      expect(known, `${path} renders diagram "${name}", which has no row in SCENES`).toContain(name);
    }
  }
});
