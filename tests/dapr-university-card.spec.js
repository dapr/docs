// Dapr University track card tests.
//
// The card (shortcode `dapr-university-track`) promotes one Dapr University
// track inside a regular docs page. These tests pin what a reader gets: the
// copy, a button whose link carries the UTM parameters attribution depends on,
// a card that sits in the page flow (not inside a list or code block), no
// sideways overflow on a phone, and legible text in both themes.

const { test, expect } = require('@playwright/test');

const UTM = {
  utm_source: 'dapr-docs',
  utm_medium: 'referral',
  utm_campaign: 'dapr-university',
};

const PLACEMENTS = [
  {
    path: '/developing-applications/building-blocks/pubsub/pubsub-overview/',
    url: 'https://www.diagrid.io/university/dapr-pubsub',
    topic: 'pub/sub',
    title: 'Dapr Pub/Sub',
    content: 'pubsub-overview-middle',
  },
  {
    path: '/developing-applications/building-blocks/secrets/secrets-overview/',
    url: 'https://www.diagrid.io/university/dapr-secrets',
    topic: 'secrets management',
    title: 'Dapr Secrets',
    content: 'secrets-overview-middle',
  },
  {
    path: '/developing-applications/building-blocks/bindings/bindings-overview/',
    url: 'https://www.diagrid.io/university/dapr-bindings',
    topic: 'bindings',
    title: 'Dapr Bindings',
    content: 'bindings-overview-middle',
  },
  {
    path: '/getting-started/quickstarts/pubsub-quickstart/',
    url: 'https://www.diagrid.io/university/dapr-pubsub',
    topic: 'pub/sub',
    title: 'Dapr Pub/Sub',
    content: 'pubsub-quickstart-end',
  },
  {
    path: '/getting-started/quickstarts/secrets-quickstart/',
    url: 'https://www.diagrid.io/university/dapr-secrets',
    topic: 'secrets management',
    title: 'Dapr Secrets',
    content: 'secrets-quickstart-end',
  },
  {
    path: '/getting-started/quickstarts/bindings-quickstart/',
    url: 'https://www.diagrid.io/university/dapr-bindings',
    topic: 'bindings',
    title: 'Dapr Bindings',
    content: 'bindings-quickstart-end',
  },
  {
    path: '/developing-applications/building-blocks/workflow/workflow-overview/',
    url: 'https://www.diagrid.io/university/dapr-workflow',
    topic: 'Dapr Workflow',
    title: 'Dapr Workflow',
    content: 'workflow-overview-middle',
  },
  {
    path: '/developing-applications/building-blocks/workflow/workflow-patterns/',
    url: 'https://www.diagrid.io/university/dapr-workflow',
    topic: 'Dapr Workflow',
    title: 'Dapr Workflow',
    content: 'workflow-patterns-end',
  },
  {
    path: '/getting-started/quickstarts/workflow-quickstart/',
    url: 'https://www.diagrid.io/university/dapr-workflow',
    topic: 'Dapr Workflow',
    title: 'Dapr Workflow',
    content: 'workflow-quickstart-end',
  },
  {
    path: '/developing-applications/sdks/dotnet/dotnet-workflow/dotnet-workflow-examples/',
    url: 'https://www.diagrid.io/university/dapr-workflow',
    topic: 'Dapr Workflow',
    title: 'Dapr Workflow',
    content: 'dotnet-workflow-examples-end',
  },
];

const CARD = '.d-promo-card';

// Load a page in a theme the way a reader gets it: the pre-paint script in
// hooks/head-end.html picks the theme from prefers-color-scheme. Switching
// data-bs-theme after load would read colours mid-transition (Bootstrap's
// .btn animates background-color), so the theme is set before navigation.
async function gotoInTheme(page, path, theme) {
  await page.emulateMedia({ colorScheme: theme });
  await page.goto(path, { waitUntil: 'load' });
  await expect(page.locator('html')).toHaveAttribute('data-bs-theme', theme);
}

for (const p of PLACEMENTS) {
  test.describe(`university card on ${p.path}`, () => {
    test('renders one card with the spec copy', async ({ page }) => {
      await page.goto(p.path, { waitUntil: 'domcontentloaded' });
      const card = page.locator(CARD);
      await expect(card).toHaveCount(1);
      await expect(card.locator('.d-promo-card-eyebrow')).toHaveText(
        'Dapr University · Free self-paced track',
      );
      const lead = card.locator('.d-promo-card-lead');
      await expect(lead.locator('strong')).toHaveText(`Learn ${p.topic} hands-on.`);
      await expect(lead).toHaveText(
        `Learn ${p.topic} hands-on. Work through the ${p.topic} API in a free lab that runs in your browser, with nothing to install.`,
      );
      await expect(card.locator('.d-promo-card-title')).toHaveText(p.title);
      await expect(card.locator('.d-promo-card-desc')).not.toBeEmpty();
      await expect(card.locator('a.btn.d-promo-card-btn')).toHaveText('Explore the free track');
    });

    test('button link carries the UTMs', async ({ page }) => {
      await page.goto(p.path, { waitUntil: 'domcontentloaded' });
      const href = await page.locator(`${CARD} a.d-promo-card-btn`).getAttribute('href');
      const url = new URL(href);
      expect(url.origin + url.pathname).toBe(p.url);
      const params = Object.fromEntries(url.searchParams.entries());
      expect(params).toEqual({ ...UTM, utm_content: p.content });
    });

    test('card sits in page flow', async ({ page }) => {
      await page.goto(p.path, { waitUntil: 'domcontentloaded' });
      const facts = await page.locator(CARD).evaluate((el) => ({
        ancestors: ['a', 'li', 'pre', 'code'].filter((tag) => el.parentElement.closest(tag)),
        headings: el.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
        links: el.querySelectorAll('a').length,
      }));
      expect(facts).toEqual({ ancestors: [], headings: 0, links: 1 });
    });

    for (const width of [360, 1280]) {
      test(`no horizontal overflow at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(p.path, { waitUntil: 'domcontentloaded' });
        // Measures the card only: some pages already overflow at phone width
        // for reasons unrelated to the card (e.g. a fixed-width video embed),
        // and page-wide overflow is covered by tests/layout.spec.js.
        const m = await page.locator(CARD).evaluate((el) => ({
          viewport: window.innerWidth,
          cardRight: el.getBoundingClientRect().right,
          cardOverflow: el.scrollWidth - el.clientWidth,
        }));
        expect(m.cardRight).toBeLessThanOrEqual(m.viewport);
        expect(m.cardOverflow).toBeLessThanOrEqual(0);
      });
    }

    for (const theme of ['light', 'dark']) {
      test(`legible in ${theme} theme`, async ({ page }) => {
        await gotoInTheme(page, p.path, theme);
        const colors = await page.locator(CARD).evaluate((el) => {
          const c = (sel) => getComputedStyle(el.querySelector(sel)).color;
          return {
            bg: getComputedStyle(el).backgroundColor,
            title: c('.d-promo-card-title'),
            lead: c('.d-promo-card-lead'),
            iconFilter: getComputedStyle(el.querySelector('.d-promo-card-icon')).filter,
          };
        });
        expect(colors.bg).not.toBe('rgba(0, 0, 0, 0)');
        expect(colors.title).not.toBe(colors.bg);
        expect(colors.lead).not.toBe(colors.bg);
        // The logo SVG is dark blue, which disappears on the dark card
        // background, so dark mode must recolour it.
        if (theme === 'dark') expect(colors.iconFilter).not.toBe('none');
      });

      test(`button text meets WCAG AA contrast in ${theme} theme`, async ({ page }) => {
        await gotoInTheme(page, p.path, theme);
        const ratio = await page.locator(`${CARD} .d-promo-card-btn`).evaluate((el) => {
          const rgb = (s) => s.match(/[\d.]+/g).slice(0, 3).map(Number);
          const lum = ([r, g, b]) => {
            const c = [r, g, b].map((v) => {
              v /= 255;
              return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
            });
            return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
          };
          const cs = getComputedStyle(el);
          const [a, b] = [lum(rgb(cs.color)), lum(rgb(cs.backgroundColor))];
          return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
        });
        // 4.5:1 is WCAG AA for normal-size text; the button text is .86rem.
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });
    }
  });
}

// The homepage "Dapr University" card links to the University hub, not a
// track, so it keeps its homepage card layout, but its link must carry the
// same UTMs as the track cards.
test('homepage University card link carries the UTMs', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const card = page.locator('a.d-card', { hasText: 'Dapr University' });
  await expect(card).toHaveCount(1);
  const url = new URL(await card.getAttribute('href'));
  expect(url.origin + url.pathname).toBe('https://www.diagrid.io/university');
  expect(Object.fromEntries(url.searchParams.entries())).toEqual({ ...UTM, utm_content: 'home' });
});

// No page may link to Dapr University without the UTMs (catches plain links
// added later, like the one the .NET workflow examples page used to have).
test('no untagged Dapr University links on placement pages', async ({ page }) => {
  for (const p of PLACEMENTS) {
    await page.goto(p.path, { waitUntil: 'domcontentloaded' });
    const hrefs = await page.$$eval('a[href*="diagrid.io/"]', (as) =>
      as.map((a) => a.href).filter((h) => /university/.test(h)));
    for (const h of hrefs) {
      expect(new URL(h).searchParams.get('utm_source'), `${p.path}: ${h}`).toBe('dapr-docs');
    }
  }
});
