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
];

const CARD = '.d-promo-card';

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
        const m = await page.locator(CARD).evaluate((el) => ({
          docWidth: document.documentElement.scrollWidth,
          viewport: window.innerWidth,
          cardRight: el.getBoundingClientRect().right,
          cardOverflow: el.scrollWidth - el.clientWidth,
        }));
        expect(m.docWidth).toBeLessThanOrEqual(m.viewport);
        expect(m.cardRight).toBeLessThanOrEqual(m.viewport);
        expect(m.cardOverflow).toBeLessThanOrEqual(0);
      });
    }

    for (const theme of ['light', 'dark']) {
      test(`legible in ${theme} theme`, async ({ page }) => {
        await page.goto(p.path, { waitUntil: 'domcontentloaded' });
        const colors = await page.locator(CARD).evaluate((el, t) => {
          document.documentElement.setAttribute('data-bs-theme', t);
          const c = (sel) => getComputedStyle(el.querySelector(sel)).color;
          return {
            bg: getComputedStyle(el).backgroundColor,
            title: c('.d-promo-card-title'),
            lead: c('.d-promo-card-lead'),
            iconFilter: getComputedStyle(el.querySelector('.d-promo-card-icon')).filter,
          };
        }, theme);
        expect(colors.bg).not.toBe('rgba(0, 0, 0, 0)');
        expect(colors.title).not.toBe(colors.bg);
        expect(colors.lead).not.toBe(colors.bg);
        // The logo SVG is dark blue, which disappears on the dark card
        // background, so dark mode must recolour it.
        if (theme === 'dark') expect(colors.iconFilter).not.toBe('none');
      });
    }
  });
}
