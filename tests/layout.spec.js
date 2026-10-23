// Layout regression tests.
//
// These assert geometric invariants — is the content on screen, does anything
// overflow sideways, does the sidebar collapse — rather than diffing
// screenshots. On a docs site the prose changes constantly, so pixel diffs
// would produce a steady stream of false positives and get muted; these
// invariants hold regardless of what any page says.
//
// Each assertion below traces to a real regression that reached production
// (dapr/docs#5443): a sidebar that kept Docsy's full-viewport-height box in the
// stacked band and pushed content an entire screen down, a duplicate
// `id="docsearch"` that left a dead element padded out to ~100px, and a navbar
// that stacked into three rows on phones. A green Hugo build reported none of
// them, because compiling is not rendering.

const { test, expect } = require('@playwright/test');

// Bootstrap's lg breakpoint: at and above this the layout is two-column, below
// it the sidebar stacks and collapses behind the hamburger.
const LG = 992;

// 768 and 991 bracket the band that broke: Docsy's `md` rules start at 768 but
// this project's stacking override runs to 991.98, so the two disagree there.
// 991/992 pin the breakpoint boundary itself.
const WIDTHS = [320, 360, 412, 768, 900, 991, 992, 1280];

// A section landing page, a deep content page and the home page exercise three
// different layouts (docs/list.html, docs/single.html, the hero home page).
const PAGES = [
  { path: '/', name: 'home' },
  { path: '/getting-started/', name: 'section landing' },
  {
    path: '/developing-applications/building-blocks/pubsub/pubsub-overview/',
    name: 'deep content page',
  },
];

// Real device profiles, since the bug was reported on a phone. Portrait was
// cramped; landscape fell inside the broken band entirely.
const DEVICES = [
  { name: 'Galaxy portrait', width: 360, height: 780 },
  { name: 'Galaxy landscape', width: 800, height: 360 },
  { name: 'Galaxy Tab portrait', width: 800, height: 1280 },
  { name: 'foldable unfolded', width: 832, height: 1000 },
];

/** Bounding box of a selector, or null when it is absent or not rendered. */
async function box(page, selector) {
  const el = page.locator(selector).first();
  if ((await el.count()) === 0) return null;
  return el.boundingBox();
}

test.describe('layout invariants', () => {
  for (const { path, name } of PAGES) {
    for (const width of WIDTHS) {
      test(`${name} @ ${width}px: content is on screen and nothing overflows`, async ({
        page,
      }) => {
        const height = 780;
        await page.setViewportSize({ width, height });
        await page.goto(path, { waitUntil: 'domcontentloaded' });

        // ── No horizontal overflow ──────────────────────────────────────────
        // A page wider than its viewport means something is clipped or the
        // reader has to pan sideways to read a line of prose.
        const scrollWidth = await page.evaluate(
          () => document.documentElement.scrollWidth,
        );
        expect(
          scrollWidth,
          `document is ${scrollWidth - width}px wider than the ${width}px viewport`,
        ).toBeLessThanOrEqual(width + 1);

        // ── Main content starts within the first screen ─────────────────────
        // The original bug put <main> at y=847 on an 800px-tall viewport: the
        // reader saw a navbar, a menu bar and then nothing.
        const main = await box(page, 'main[role="main"]');
        expect(main, '<main role="main"> is missing').not.toBeNull();
        expect(
          main.y,
          `<main> starts at y=${Math.round(main.y)}, below the ${height}px fold`,
        ).toBeLessThan(height);
        expect(main.height, '<main> rendered with no height').toBeGreaterThan(0);

        // ── Breakpoint-specific structure ───────────────────────────────────
        const sidebar = await box(page, '.td-sidebar');
        if (sidebar) {
          if (width < LG) {
            // Stacked: the sidebar is a collapsed menu bar, not a column. It
            // regressed to 801px when Docsy's `height: calc(100vh - 5rem)`
            // survived into this band.
            expect(
              sidebar.height,
              `collapsed sidebar is ${Math.round(sidebar.height)}px tall; it should be a menu bar, not a column`,
            ).toBeLessThan(200);
            expect(
              Math.round(sidebar.width),
              'stacked sidebar should span the full width',
            ).toBeGreaterThanOrEqual(width - 1);
          } else {
            // Two-column: content sits to the right of the sidebar.
            expect(
              main.x,
              'at lg and above <main> should be beside the sidebar, not under it',
            ).toBeGreaterThan(0);
            expect(
              sidebar.height,
              'desktop sidebar should be a full column',
            ).toBeGreaterThan(200);
          }
        }

        // ── Header furniture budget ─────────────────────────────────────────
        // `flex-column` stacked brand / links / theme toggle into three rows,
        // a 147px header on a 780px screen.
        const navbar = await box(page, '.td-navbar');
        if (navbar && width < LG) {
          expect(
            navbar.height,
            `navbar is ${Math.round(navbar.height)}px tall below lg; it should be a single row`,
          ).toBeLessThan(100);
        }
      });
    }
  }
});

test.describe('duplicate element ids', () => {
  // The dead sidebar search was a second id="docsearch". Duplicate ids are
  // invalid HTML and silently break anything that binds by id — DocSearch
  // mounts into the first match only, which is why the sidebar copy stayed an
  // empty 0x0 element.
  for (const { path, name } of PAGES) {
    test(`${name} has no duplicate ids`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 780 });
      await page.goto(path, { waitUntil: 'domcontentloaded' });

      const duplicates = await page.evaluate(() => {
        const seen = new Map();
        for (const el of document.querySelectorAll('[id]')) {
          // Skip ids inside inline SVGs. The navbar embeds a light and a dark
          // copy of the logo, and each carries the same internal ids from the
          // source asset (Rectangle-4, tie, dapr), so they collide by
          // construction. They are referenced only within their own SVG and
          // are never used as script mount points, which is the failure mode
          // this test exists to catch.
          if (el.closest('svg')) continue;
          seen.set(el.id, (seen.get(el.id) || 0) + 1);
        }
        return [...seen.entries()].filter(([, n]) => n > 1).map(([id, n]) => `${id} (x${n})`);
      });

      expect(duplicates, `duplicate ids: ${duplicates.join(', ')}`).toEqual([]);
    });
  }
});

test.describe('mobile menu', () => {
  for (const { name, width, height } of DEVICES) {
    test(`${name} (${width}x${height}): menu opens, closes and reaches the docs`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/getting-started/', { waitUntil: 'domcontentloaded' });

      const nav = page.locator('#td-section-nav');
      const toggle = page.locator('.td-sidebar__toggle');

      await expect(toggle, 'hamburger toggle should be visible below lg').toBeVisible();
      await expect(nav, 'section nav should start collapsed').toBeHidden();

      await toggle.click();
      await expect(nav, 'section nav should open on tap').toBeVisible();
      // Bootstrap marks the element `collapsing` for the duration of the
      // transition and ignores toggles while it is mid-flight. Visible is true
      // as soon as the animation starts, so wait for it to settle before
      // tapping again — otherwise the close tap is silently swallowed.
      await expect(nav).not.toHaveClass(/collapsing/);

      // The tree is fetched and injected by sidebar-nav.js; if that fetch fails
      // the menu opens empty and the docs become unreachable on mobile.
      await expect(
        nav.locator('a'),
        'injected nav tree is empty — sidebar-nav.js fetch may have failed',
      ).not.toHaveCount(0);

      // The site menu links live in the hamburger below lg, since the navbar
      // hides them there. Losing them strands mobile readers.
      await expect(
        nav.locator('.dapr-mobile-nav a'),
        'site menu links are missing from the mobile menu',
      ).not.toHaveCount(0);

      await toggle.click();
      await expect(nav, 'section nav should close again on tap').toBeHidden();
    });
  }
});

test.describe('search availability', () => {
  test('mobile search mount is present below lg and absent above it', async ({ page }) => {
    const displayOf = (selector) =>
      page.evaluate((s) => {
        const el = document.querySelector(s);
        return el ? getComputedStyle(el).display : null;
      }, selector);

    // Below lg the navbar search is hidden, so the menu bar carries the only
    // search on the page.
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto('/getting-started/', { waitUntil: 'domcontentloaded' });
    expect(
      await displayOf('#docsearch-mobile'),
      'mobile search mount is missing or hidden below lg — there would be no search at all',
    ).not.toBe('none');

    // Above lg the navbar search takes over; showing both would be redundant.
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/getting-started/', { waitUntil: 'domcontentloaded' });
    expect(
      await displayOf('#docsearch-mobile'),
      'mobile search mount should be hidden at lg and above',
    ).toBe('none');
    expect(
      await displayOf('#docsearch'),
      'navbar search mount is missing at lg and above',
    ).not.toBe('none');
  });
});
