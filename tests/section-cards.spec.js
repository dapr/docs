// The Building blocks landing page lists every building block as a card
// (layouts/_partials/section-index.html). The cards are the page's
// navigation, so the page draws no diagram that repeats them: a grid of
// unclickable tiles above a grid of clickable cards reads as one grid and
// sends readers clicking the wrong one (dapr/docs#5494).
//
// The diagram used to be the only place the page said which building blocks
// are alpha, so the cards carry that now. A card is tagged when its page sets
// `status: alpha` in its front matter.

const { test, expect } = require('@playwright/test');

const PAGE = '/developing-applications/building-blocks/';

// Keep in step with the `alpha` list of the building-blocks scene in
// tests/diagrams.spec.js, which tags the same APIs on the overview pages.
const ALPHA = [
  'Binary Store',
  'Conversation',
  'Cryptography',
  'Distributed lock',
  'Search',
  'Vector',
];

test.describe('building blocks landing page', () => {
  test('draws no diagram above the cards', async ({ page }) => {
    await page.goto(PAGE);
    await expect(page.locator('.d-card-grid')).toHaveCount(1);
    await expect(page.locator('.dapr-diagram')).toHaveCount(0);
  });

  test('tags exactly the alpha building blocks', async ({ page }) => {
    await page.goto(PAGE);
    const cards = page.locator('.d-card-grid > .d-card');
    expect(await cards.count()).toBeGreaterThan(ALPHA.length);

    const tagged = await page.$$eval('.d-card-grid > .d-card', (els) =>
      els
        .filter((c) => c.querySelector('.d-card-tag'))
        .map((c) => c.querySelector('.d-card-title').textContent.trim()),
    );
    expect(tagged.sort()).toEqual([...ALPHA].sort());

    for (const tag of await page.locator('.d-card-tag').all()) {
      await expect(tag).toHaveText('alpha');
    }
  });

  test('puts the alpha tag in the top-right corner, clear of the title', async ({ page }) => {
    for (const width of [360, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(PAGE);
      for (const card of await page.locator('.d-card:has(.d-card-tag)').all()) {
        const c = await card.boundingBox();
        const t = await card.locator('.d-card-tag').boundingBox();
        // The title span stretches across the card, so measure its text, not its
        // box. Viewport coordinates, like boundingBox().
        const title = await card.locator('.d-card-title').evaluate((el) => {
          const r = document.createRange();
          r.selectNodeContents(el);
          const b = r.getBoundingClientRect();
          return { x: b.x, y: b.y, width: b.width, height: b.height };
        });
        // Top-right: in the card's top third, and its right edge near the card's.
        expect(t.y - c.y).toBeLessThan(c.height / 3);
        expect(c.x + c.width - (t.x + t.width)).toBeLessThan(24);
        // The tag never sits on top of the title text.
        const overlaps =
          t.x < title.x + title.width && title.x < t.x + t.width &&
          t.y < title.y + title.height && title.y < t.y + t.height;
        expect(overlaps, `alpha tag overlaps the title at ${width}px`).toBe(false);
      }
    }
  });
});
