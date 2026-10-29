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
  {
    name: 'hosting-standalone',
    page: '/overview/',
    labels: [
      'Docker Desktop',
      'dapr init',
      'dapr run [flags]',
      'Scheduler',
      'Placement',
      'Redis',
      'Zipkin',
      'App',
      'Use components',
      'Publish & subscribe',
      'Workflows',
      'State management',
      'Configuration',
      'Secrets',
      'Windows, macOS, Linux or ARM: a local dev machine or virtual machine',
    ],
  },
  {
    name: 'hosting-kubernetes',
    page: '/overview/',
    labels: [
      'Pod',
      'App',
      'Placement',
      'Injector',
      'Sentry',
      'Operator',
      'Scheduler',
      'Kubelet',
      'Host on any cloud or edge infrastructure',
      'Azure',
      'Alibaba Cloud',
      'Kubernetes',
      'Use components',
      'Publish & subscribe',
      'Workflows',
      'State management',
      'Configuration',
      'Secrets',
    ],
  },
  {
    name: 'hosting-vms',
    page: '/overview/',
    labels: [
      'VM1',
      'VM2',
      'VM3',
      'App A',
      'App B',
      'Consul',
      'Placement',
      'Scheduler',
      'Sentry',
      'Use components',
      'Cert store for all machines',
      'Publish & subscribe',
      'Workflows',
      'State management',
      'Configuration',
      'Secrets',
    ],
  },
  {
    name: 'agents-overview',
    page: '/overview/',
    labels: [
      'User',
      'Interaction',
      'Dapr Agents',
      'Planning',
      'Memory',
      'Tools',
      'MCP support',
      'Delegate tasks',
      'Outside world',
      'Built on Dapr',
      'Durable execution',
      'Observability',
      'Security',
    ],
  },
  {
    name: 'building-blocks-concept',
    page: '/concepts/building-blocks-concept/',
    labels: ['Your code', 'API', 'HTTP or gRPC', 'Building block', 'Component'],
  },
  {
    name: 'sidecar-apis',
    page: '/concepts/dapr-services/sidecar/',
    labels: [
      'Building block APIs',
      'Metadata API',
      'Health API',
      'HTTP or gRPC',
      'Called from your application business logic',
      'Discover capabilities and set attributes',
      'Health status, readiness and liveness',
    ],
  },
  {
    name: 'scheduler-architecture',
    page: '/concepts/dapr-services/scheduler/',
    labels: [
      'My app',
      'Dapr sidecar',
      'Jobs API, gRPC or HTTP',
      'OnJobEvent',
      'the triggered job, back to the app',
      'schedule / get / delete',
      'WatchJobs',
      'jobs as they come due',
      'Scheduler process',
      'Scheduler',
      'etcd',
      'Every tracked job is stored in etcd, embedded in the Scheduler by default',
    ],
  },
  {
    name: 'resiliency-policies',
    page: '/concepts/resiliency-concept/',
    labels: [
      'Your solution',
      'App A',
      'App B',
      'App C',
      'App D',
      'App E',
      'Trigger',
      'Get state',
      'State store',
      'Publish',
      'Pub/sub',
      'Subscribe',
      'Call method',
      'Call actor',
      'Retrieve secret',
      'Secret store',
      'External system',
      'State management components: outbound',
      'Input binding components: inbound',
      'Publish and subscribe components: outbound, inbound',
      'Service invocation apps',
      'Actor calls actors',
      'Secret management components: outbound',
      'Output binding components: outbound',
    ],
  },
  {
    name: 'observability-sidecar',
    page: '/concepts/observability-concept/',
    labels: [
      'Your platform and tools',
      'Kubernetes',
      'Grafana',
      'Fluentd',
      'Health checks',
      'GET http://localhost:3500/v1.0/healthz',
      'Metrics',
      'Prometheus endpoint on port 9090',
      'Logs',
    ],
  },
  {
    name: 'observability-tracing',
    page: '/concepts/observability-concept/',
    labels: [
      'App A',
      'App B',
      'App C',
      'Service invocation',
      'Publish',
      'Subscribe',
      'Message broker',
      'W3C tracing context',
      'Backend monitoring tools',
      'and more',
      'Visualize',
    ],
  },
  {
    name: 'service-mesh',
    page: '/concepts/faq/service-mesh/',
    labels: [
      'Application code, in any language or framework',
      'Service invocation',
      'State management',
      'Publish & subscribe',
      'Bindings',
      'Secrets',
      'Actors',
      'mTLS',
      'Metrics',
      'Resiliency',
      'Distributed tracing',
      'Service mesh',
      'Traffic routing',
      'Traffic splitting',
      'Hosting infrastructure',
      'Developer',
      'Operator',
    ],
  },
  {
    name: 'components-concept',
    page: '/concepts/components-concept/',
    labels: [
      'App',
      'State management',
      'Publish & subscribe',
      'Bindings',
      'Secrets',
      'Configuration',
      'Distributed lock',
      'Cryptography',
      'Conversation',
      'Middleware',
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
    // A scene need not use panel(), and its first <text> may be plate ink or
    // the name on a solid app hexagon, both of which are the same colour in
    // both themes by design - they sit on a shape, not on the page. Pick what
    // exists, and prefer a text node that is on neither; the fingerprint below
    // carries the real signal and does not care about scene shape.
    const offPlate = [...svg.querySelectorAll('text')].find(
      (t) => !t.closest('.d-icon-group')
        && !t.closest('.d-hex-solid')
        && !t.closest('.d-on-fill')
        && !t.previousElementSibling?.classList?.contains('d-plate'),
    );
    // A few tokens are the same in both themes ON PURPOSE: the app green and
    // the ink that sits on it, the sky blue (bright enough to carry on either
    // ground, so it never needed a second value), the near-white plate and its
    // ink, and a vendor's own brand colour. A panel drawn in one of those is
    // not evidence that the theme failed to apply, so look past it for one
    // that is themed. _tokens.scss is the list this must agree with.
    const FIXED = ['--d-green', '--d-app-ink', '--d-sky', '--d-diagram-ink', '--d-diagram-plate', '--d-brand-'];
    const themedPanel = [...svg.querySelectorAll('.d-panel')].find(
      (p) => !FIXED.some((t) => (p.getAttribute('stroke') ?? '').includes(t)),
    );

    return {
      panelStroke: themedPanel ? getComputedStyle(themedPanel).stroke : pick('.d-panel', 'stroke'),
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
    // canvas-relative, and the same floor is four times more readable on a
    // 600-wide canvas than on a 1512-wide one. Whether the house style should
    // express this as a ratio instead is an open question for the skill text.
    // The number itself is MIN_LABEL, imported rather than repeated, so this
    // test cannot disagree with the builders about where the floor is.
    test(`${scene.name} draws no text below the label floor`, async ({ page }) => {
      // Imported, not repeated: this spec is CommonJS and the builders are
      // ESM, so the constant comes in dynamically rather than as a literal
      // that could drift from the one the builders enforce.
      const { MIN_LABEL } = await import('../diagrams/shapes.mjs');
      await page.goto(scene.page, { waitUntil: 'domcontentloaded' });
      const sizes = await page.$$eval(`${sel(scene.name)} svg text`, (nodes) =>
        nodes.map((n) => parseFloat(getComputedStyle(n).fontSize)),
      );
      expect(sizes.length).toBeGreaterThan(0);
      expect(Math.min(...sizes)).toBeGreaterThanOrEqual(MIN_LABEL);
    });

    // A label wider than the card it sits in is a real defect that every other
    // check here misses: the scene still resolves, still fits the viewBox and
    // still shows every expected label. Only its own box is too small.
    test(`${scene.name} keeps every tile label inside its tile`, async ({ page }) => {
      await page.goto(scene.page, { waitUntil: 'domcontentloaded' });
      const overflowing = await page.$$eval(`${sel(scene.name)} svg .d-tile`, (tiles) =>
        tiles
          .map((t) => {
            const rect = t.querySelector('rect');
            const texts = [...t.querySelectorAll('text')];
            if (!rect || !texts.length) return null;
            const r = rect.getBoundingClientRect();
            const worst = texts
              .map((n) => {
                const b = n.getBoundingClientRect();
                return Math.max(r.left - b.left, b.right - r.right, r.top - b.top, b.bottom - r.bottom);
              })
              .reduce((a, b) => Math.max(a, b), -Infinity);
            return worst > 0
              ? { label: texts.map((n) => n.textContent).join(' ').trim(), over: Math.round(worst) }
              : null;
          })
          .filter(Boolean),
      );
      expect(overflowing, 'tile labels wider or taller than their tile').toEqual([]);
    });

    // The point of the standalone copy: a file that still looks like the
    // diagram once it is away from this page's tokens. Without this the
    // download and copy buttons hand over something that paints black.
    test(`${scene.name} offers a standalone svg that resolves on its own`, async ({ page }) => {
      await page.goto(scene.page, { waitUntil: 'domcontentloaded' });

      const href = await page.locator(`${sel(scene.name)} a[download]`).getAttribute('href');
      expect(href).toBe(`/diagrams/${scene.name}.svg`);

      const res = await page.request.get(href);
      expect(res.status(), `${href} did not serve`).toBe(200);
      const body = await res.text();
      expect(body.startsWith('<svg')).toBe(true);
      expect(
        body.match(/\bvar\(--d-[a-z-]+\)/g) ?? [],
        'the standalone copy still refers to page tokens, so it will not paint elsewhere',
      ).toEqual([]);
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

    test(`${scene.name} runs no engine in the browser`, async ({ page }) => {
      await page.goto(scene.page, { waitUntil: 'domcontentloaded' });

      // Decision 3 stands where it matters: the SVG is the artifact and the
      // browser never runs the engine that drew it. What the page MAY now
      // ship is the copy button's script, which only fetches a file and
      // writes it to the clipboard - it draws nothing, and the diagram is
      // complete without it. The figure itself still carries no script.
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
      // diagram-actions.js is the ONE allowed diagram script, allowed by name
      // so a second one cannot arrive unnoticed.
      const engines = srcs.filter(
        (s) => /diagram|\bd3\b/i.test(s) && !/diagram-actions(\.[a-f0-9]+)?\.js$/.test(s),
      );
      expect(engines, 'a diagram script other than the copy button').toEqual([]);
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
