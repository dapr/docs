// The downloaded SVG, measured in a face that is NOT the site's.
//
// `daprdocs/static/diagrams/<name>.svg` is the copy the download button hands
// over. Away from this site it has no webfonts: its root carries the font
// STACK the page uses, and whatever machine opens it resolves that stack to
// whichever face it happens to own. The shapes, meanwhile, were hand-sized
// against Inter's metrics, and every other test in this suite measures them
// with Inter loaded on a real page. Nobody has ever measured the download.
//
// This guard pins the substitute faces rather than taking the machine's. A
// guard that merely blocked Inter would measure Segoe UI on Windows and
// Liberation Sans on an Ubuntu runner - two different verdicts from one
// assertion, which is the worst possible shape for a guard. `Arial,
// "Liberation Sans", sans-serif` resolves to the same METRICS on both: the
// two faces are metric-compatible by design, and the tests below prove the
// faces in use really are those metrics rather than a third face.
//
// Three things make the pin work:
//
//   * `standalone()` writes the stack as a PRESENTATION ATTRIBUTE on the root
//     `<svg>`, and any CSS rule beats a presentation attribute. A stylesheet
//     rule of `svg{font-family:...}` therefore wins over the baked stack. The
//     first test here confirms that in the browser rather than assuming it:
//     drop the rule and the same probe measures 539.06 on this Windows
//     machine - Segoe UI, the stack's second name - rather than Arial's
//     556.16, so the rule is demonstrably the one that applies.
//   * A MONO label needs a rule of its own. `standalone()` resolves
//     `var(--font-mono)` onto the element that carries the code, and a
//     presentation attribute on an element beats an INHERITED value - it loses
//     only to a rule that matches that same element. `svg{...}` reaches the
//     root and nothing else, so the set's 104 mono labels kept whatever
//     monospace the machine owned: Cascadia Mono here at 585.94, Consolas at
//     549.81, something else again on a runner. The second rule below matches
//     them and pins them to Courier New's metric, which Liberation Mono
//     matches; it moves the measured width of 55 labels that sit in a shape,
//     the widest of them from 0.938 of its room to 0.960.
//
//     103 of those 104 are a whole `<text>`. The other is a `<tspan>`:
//     `richLabel()` in `diagrams/shapes.mjs` marks up one RUN of a mixed line
//     as code - "Invoke `/orders` method", where only the path is a path - and
//     that run's own font-family beats the face its parent `<text>` was pinned
//     to. So the rule and the scan below both have to reach a `tspan`, or a
//     label like that is read in the machine's own monospace while every test
//     here stays green.
//   * The page loads NO webfonts at all, so "Inter" and "Geist Mono" in those
//     stacks can never resolve, whatever the machine has installed.

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

// Courier New is the widest of the monospaces a machine is likely to hand
// over (0.600 em a character, against Cascadia Mono's 0.586 and Consolas'
// 0.550), so a mono label that fits under this pin fits under the others too.
// Liberation Mono is its metric-compatible stand-in where it is absent, the
// same pairing the sans stack makes.
const FALLBACK_MONO_STACK = '"Courier New", "Liberation Mono", monospace';

// Every mono stack `standalone()` bakes ends in the generic `monospace`
// keyword, and no other label carries a font-family of its own - which the
// last test in this file holds to. `tspan` as well as `text`, because a mixed
// line wears the mono stack on the run rather than on the whole label.
const MONO_LABEL = ':is(text, tspan)[font-family*="monospace"]';

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

// Courier New's digits advance 1229/2048 em, so the same ten run 600.11.
// Liberation Mono matches it; DejaVu Sans Mono, the other common Linux
// monospace, runs 602 and so clears the slack below as well.
const COURIER_DIGIT_RUN = 600.11;

const DIGIT_RUN_SLACK = 0.01; // 1%, which no metric-compatible pair exceeds

function harness(body) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
body{margin:0}
svg{font-family:${FALLBACK_STACK}}
svg ${MONO_LABEL}{font-family:${FALLBACK_MONO_STACK}}
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

// The same claim for the mono path, which the rule above does NOT reach: a
// code label carries its own font-family, and a presentation attribute on the
// element beats an inherited value. Without the second rule this probe
// measures 585.94 - Cascadia Mono, whatever `ui-monospace` happens to mean
// here - and every mono label inside a measured shape is judged in a face that
// differs from machine to machine, which is the one thing this file exists to
// rule out.
test("the pinned fallback face reaches a mono label's own font-family", async ({ page }) => {
  await page.setContent(harness(
    '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="200">'
    + '<text id="probe" x="10" y="100" font-size="100"'
    + ' font-family="&quot;Geist Mono&quot;, ui-monospace, &quot;Cascadia Mono&quot;, Consolas, monospace">'
    + '0123456789</text></svg>',
  ));
  const run = await page.evaluate(() => document.getElementById('probe').getComputedTextLength());

  expect(
    Math.abs(run - COURIER_DIGIT_RUN) / COURIER_DIGIT_RUN,
    `ten mono digits ran ${run.toFixed(2)} units, not Courier New's ${COURIER_DIGIT_RUN}:`
    + ' either the baked font-family attribute beat the stylesheet, or this machine has'
    + ' neither Courier New nor Liberation Mono and fell through to a third face',
  ).toBeLessThan(DIGIT_RUN_SLACK);
});

// What keeps the two rules above a COMPLETE account of the file: the root
// carries a face, mono labels carry a face, and nothing else does. The day
// `standalone()` bakes a stack onto some other label, that label stops
// being pinned and starts being measured in the machine's own sans - silently,
// because every test here would still pass. This is the test that would not.
test('no label carries a baked face the harness leaves unpinned', () => {
  const unpinned = [];
  for (const scene of SCENES) {
    const svg = fs.readFileSync(path.join(STANDALONE_DIR, `${scene}.svg`), 'utf8');
    for (const [, face] of svg.matchAll(/<(?:text|tspan)\b[^>]*\sfont-family="([^"]*)"/g)) {
      if (!face.includes('monospace')) unpinned.push({ scene, face });
    }
  }
  expect(
    unpinned,
    `a <text> or <tspan> carries a face no rule in harness() matches - pin it or widen ${MONO_LABEL}`,
  ).toEqual([]);
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
