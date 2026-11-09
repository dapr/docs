// The downloaded SVG, measured in a face that is NOT the site's.
//
// `daprdocs/static/diagrams/<name>.svg` is the copy the download button hands
// over. Away from this site it has no webfonts: its root carries the font
// STACK the page uses, and whatever machine opens it resolves that stack to
// whichever face it happens to own. The shapes, meanwhile, were hand-sized
// against Inter's metrics, and every other test in this suite measures them
// with Inter loaded on a real page. Nobody has ever measured the download.
//
// This guard pins the substitute face rather than taking the machine's. A
// guard that merely blocked Inter would measure Segoe UI on Windows and
// Liberation Sans on an Ubuntu runner - two different verdicts from one
// assertion, which is the worst possible shape for a guard. `Arial,
// "Liberation Sans", sans-serif` resolves to the same METRICS on both: the
// two faces are metric-compatible by design, and the test below proves the
// one in use really is that metric rather than a third face.
//
// Two things make the pin work:
//
//   * `standalone()` writes the stack as a PRESENTATION ATTRIBUTE on the root
//     `<svg>`, and any CSS rule beats a presentation attribute. A stylesheet
//     rule of `svg{font-family:...}` therefore wins over the baked stack. The
//     first test here confirms that in the browser rather than assuming it:
//     drop the rule and the same probe measures 539.06 on this Windows
//     machine - Segoe UI, the stack's second name - rather than Arial's
//     556.16, so the rule is demonstrably the one that applies.
//   * The page loads NO webfonts at all, so "Inter" in the stack can never
//     resolve, whatever the machine has installed.

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const STANDALONE_DIR = path.join(REPO_ROOT, 'daprdocs', 'static', 'diagrams');

// Read from disk rather than over the dev server: the file on disk is what
// gets committed and what a reader downloads, and measuring it needs no Hugo.
const SCENES = fs.readdirSync(STANDALONE_DIR)
  .filter((f) => f.endsWith('.svg')).map((f) => f.slice(0, -4)).sort();

const FALLBACK_STACK = 'Arial, "Liberation Sans", sans-serif';

// A label fails above this much of the room its shape leaves it.
//
// On the committed set every label clears this rule: the widest, the callout
// in `resiliency-policies`, measures 1.013 of the room its box leaves, and
// the step badges the spec expected to break measure 0.57 - Arial's digits
// are NARROWER than Inter's at that size, not wider. So 1.05 is not a number
// any scene here was fitted to; it is headroom over a set that already fits,
// and the tightest scene has 3.6% of it left. That is the right order: tight
// enough that a scene drawn to Inter's width and read in Arial's would trip
// it, loose enough that the rounding between two metric-compatible faces
// cannot. Raising it to 1.1 would let a genuinely broken label through;
// dropping it to 1.0 would turn that pre-existing callout red without the
// fallback face having had anything to do with it.
const TOLERANCE = 1.05;

// Arial's digits advance 1139/2048 em, so ten of them at font-size 100 run
// 556.16 units; Liberation Sans is metric-compatible and matches. Anything
// else - Segoe UI runs 539.06, DejaVu Sans wider again - is a different face,
// and measuring the set against it would prove nothing about either machine.
const ARIAL_DIGIT_RUN = 556.16;
const DIGIT_RUN_SLACK = 0.01; // 1%, which no metric-compatible pair exceeds

function harness(body) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
body{margin:0}
svg{font-family:${FALLBACK_STACK}}
</style></head><body>${body}</body></html>`;
}

/**
 * Every label that sits in a shape and is wider than that shape leaves room
 * for, measured in the page.
 *
 * "The shape a label sits in" is the nearest `g.d-step` or `g.d-tile` - the
 * two builders whose whole job is a label on a shape - or any `<g>` holding
 * exactly one `rect` or `circle`, which is what every other labelled box,
 * pill, card and disc in the set looks like. The group's single `rect` or
 * `circle` is the shape; an icon's own rect never qualifies, because an icon
 * group holds a dozen.
 *
 * A label only counts as sitting IN that shape when its own centre lies
 * inside the shape's box. Without that, the loose "one rect or circle" clause
 * sweeps up every caption that sits ABOVE or BELOW a shape - a code card's
 * title, a node's name under its circle, a sequence diagram's lifeline label
 * over a 10-unit dot - and reports each as 10x overflowing. Measured on the
 * committed set this rule drops 118 such captions and keeps all 736 labels
 * that are genuinely inside something, including every `d-step` and `d-tile`.
 *
 * The room a shape leaves is its width less half an em each side, which is
 * the clear space `diagrams.spec.js` already requires of a shape's own name
 * with Inter loaded. A circle is measured across its DIAMETER, the same
 * bounding-box approximation the suite's hexagon and tile checks make: exact
 * across the middle, where a one-line label sits, and lenient at the curve.
 *
 * getBoundingClientRect, not getBBox: a label can sit under a `transform`
 * its shape does not share, and getBBox would hand back the two boxes in two
 * different coordinate systems. The caller renders the SVG at its natural
 * size, so a client pixel IS a scene unit and no scale factor is needed.
 */
function labelsOverflowing({ scene, tolerance }) {
  const svg = document.querySelector('svg');
  const containerFor = (text) => {
    for (let g = text.parentElement; g && g !== svg; g = g.parentElement) {
      if (g.tagName !== 'g') continue;
      if (g.classList.contains('d-step') || g.classList.contains('d-tile')) return g;
      if ([...g.children].filter((c) => c.tagName === 'rect' || c.tagName === 'circle').length === 1) return g;
    }
    return null;
  };
  const out = [];
  for (const text of svg.querySelectorAll('text')) {
    if (text.getAttribute('aria-hidden') === 'true') continue;
    const g = containerFor(text);
    if (!g) continue;
    // Its own rect or circle, not a descendant's: a `d-tile` holding an icon
    // holds that icon's rects too, and measuring a label against one of those
    // would be a verdict about an icon.
    const shape = [...g.children].find((c) => c.tagName === 'rect' || c.tagName === 'circle');
    if (!shape) continue;
    const t = text.getBoundingClientRect();
    const s = shape.getBoundingClientRect();
    if (!t.width || !s.width) continue;
    const sits = (t.left + t.right) / 2 >= s.left && (t.left + t.right) / 2 <= s.right
      && (t.top + t.bottom) / 2 >= s.top && (t.top + t.bottom) / 2 <= s.bottom;
    if (!sits) continue;
    const em = parseFloat(getComputedStyle(text).fontSize) || 0;
    const room = Math.max(1, s.width - em);
    const ratio = t.width / room;
    if (ratio > tolerance) {
      out.push({
        scene,
        label: (text.textContent || '').replace(/\s+/g, ' ').trim(),
        ratio: +ratio.toFixed(3),
      });
    }
  }
  return out;
}

// Rendered at its natural size: the committed file carries a viewBox and no
// width, so an untouched `<svg>` in HTML lays out at 300x150 and scales
// everything, which would put the text boxes and the font-size attribute in
// two different units.
async function showAtNaturalSize(page, name) {
  const svg = fs.readFileSync(path.join(STANDALONE_DIR, `${name}.svg`), 'utf8');
  await page.setContent(harness(svg));
  await page.evaluate(() => {
    const el = document.querySelector('svg');
    const vb = el.viewBox.baseVal;
    el.style.width = `${vb.width}px`;
    el.style.height = `${vb.height}px`;
  });
  await page.evaluate(() => document.fonts.ready);
}

// Both halves of the premise, in one measurement: the CSS rule beats the
// baked presentation attribute, AND what it resolved to is Arial's metric.
// If this fails, every verdict below is about some other face and none of
// them means what it says - so it fails loudly here rather than quietly
// there.
test('the pinned fallback face displaces the baked font stack', async ({ page }) => {
  await page.setContent(harness(
    '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="200"'
    + ' font-family="Inter, &quot;Segoe UI&quot;, Roboto, Helvetica, Arial, sans-serif">'
    + '<text id="probe" x="10" y="100" font-size="100">0123456789</text></svg>',
  ));
  const run = await page.evaluate(() => document.getElementById('probe').getComputedTextLength());

  expect(
    Math.abs(run - ARIAL_DIGIT_RUN) / ARIAL_DIGIT_RUN,
    `ten digits ran ${run.toFixed(2)} units, not Arial's ${ARIAL_DIGIT_RUN}: either the`
    + ' baked font-family attribute beat the stylesheet, or this machine has neither'
    + ' Arial nor Liberation Sans and fell through to a third face',
  ).toBeLessThan(DIGIT_RUN_SLACK);
});

// A disk-driven suite with an empty list is a green run that measured
// nothing. That the list is the WHOLE scene set, with nothing missing and no
// orphan, is `npm run export:diagrams -- --check`'s business, not this
// file's.
test('the standalone copies to measure were found', () => {
  expect(SCENES.length).toBeGreaterThan(0);
});

for (const scene of SCENES) {
  test(`${scene} fits its shapes without Inter`, async ({ page }) => {
    await showAtNaturalSize(page, scene);
    const over = await page.evaluate(labelsOverflowing, { scene, tolerance: TOLERANCE });

    expect(over, 'labels wider than the shape they sit in, with Inter unavailable').toEqual([]);
  });
}
