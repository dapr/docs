// The rule this enforces is in SKILL.md under "A small canvas renders BIG":
// `_diagrams.scss` sets `svg { width: 100% }`, so a scene unit renders at
// `columnWidth / canvasWidth` and the NARROWER the canvas the larger
// everything in it comes out. The lever is the shortcode's `width`, and it is
// computed from the canvas rather than chosen by eye.
//
// It was written down and it still did not happen. Seven diagrams were
// converted in this branch by someone who had read that section, and all seven
// shortcodes went in without a width - six on one page, which then rendered at
// six different type sizes, and one that called a scene its OTHER call site
// already narrowed to 85. Nothing failed: the scenes exported, the pages
// built, the rendered suite passed. Prose cannot catch this. The value is
// computable from the canvas, so a test can.

import test from 'node:test';
import assert from 'node:assert/strict';
import { renderWidth, expectedWidth, diagramCalls } from './render-width.mjs';
import { scenes } from './scenes/index.mjs';

test('renderWidth() reproduces the table in SKILL.md', () => {
  // Copied from the skill, which is the published contract. If the formula and
  // the table ever disagree, one of them is wrong and this says which.
  const published = [[680, 60], [730, 65], [770, 70], [880, 80], [900, 80], [914, 85], [940, 85]];
  for (const [canvas, expected] of published) {
    assert.equal(renderWidth(canvas), expected, `canvas ${canvas}`);
  }
});

test('renderWidth() returns null above 85, where the markup is not worth it', () => {
  // "Leave `width` out above 85: the difference is not worth the markup."
  assert.equal(renderWidth(1050), null);
  assert.equal(renderWidth(1512), null);
  // The boundary itself is still passed, not dropped.
  assert.equal(renderWidth(940), 85);
});

test('renderWidth() never exceeds 100, whatever the canvas', () => {
  // The shortcode rejects anything outside 10..100, so a wide canvas must not
  // produce a value the template will refuse.
  for (const canvas of [200, 400, 600]) {
    const w = renderWidth(canvas);
    if (w !== null) assert.ok(w >= 10 && w <= 100, `canvas ${canvas} gave ${w}`);
  }
});

test('every diagram shortcode passes the width its canvas calls for', () => {
  const wrong = [];
  for (const call of diagramCalls()) {
    const scene = scenes[call.name];
    // A name that is not a scene fails the Hugo build already; this test is
    // about the width, so it says so and moves on rather than throwing here.
    if (!scene) {
      wrong.push(`${call.file}:${call.line} calls "${call.name}", which is not a registered scene`);
      continue;
    }
    const expected = expectedWidth(scene);
    if (call.width !== expected) {
      wrong.push(
        `${call.file}:${call.line} ${call.name} (canvas ${scene.width}`
        + `${scene.renderWidth === undefined ? '' : ', pinned'}) passes `
        + `${call.width === null ? 'no width' : `width="${call.width}"`}, `
        + `expected ${expected === null ? 'no width' : `width="${expected}"`}`,
      );
    }
  }
  assert.deepEqual(wrong, [], `a diagram renders at the wrong size:\n${wrong.join('\n')}`);
});

test('the sweep actually reaches the content, so a green run means something', () => {
  // A scanner that silently matched nothing would pass the test above forever.
  const calls = diagramCalls();
  assert.ok(calls.length >= 30, `only ${calls.length} diagram calls found`);
  assert.ok(calls.every((c) => c.file && c.line > 0), 'every call reports where it is');
});

test('diagramCalls() reads both call forms and ignores fenced examples', () => {
  const body = [
    '{{< diagram overview >}}',
    '{{< diagram name="api-scoping" width="70" >}}',
    '```',
    '{{< diagram name="not-a-real-call" width="10" >}}',
    '```',
  ].join('\n');
  const found = diagramCalls({ sources: [{ file: 'x.md', body }] });
  assert.deepEqual(
    found.map((c) => [c.name, c.width]),
    [['overview', null], ['api-scoping', 70]],
    'a positional call passes no width, and a fenced example is documentation',
  );
});

// The formula sizes a scene against the rest of the set, which is the right
// default and a poor master: a maintainer looking at the page can want one
// drawing larger than its canvas asks for. A scene may say so once, on the
// scene, and then every page that draws it draws it at that size - which is
// the property that matters, since the same scene appears on several pages.
test('expectedWidth() follows the formula when the scene says nothing', () => {
  assert.equal(expectedWidth({ width: 680 }), renderWidth(680));
  assert.equal(expectedWidth({ width: 1200 }), null);
});

test('expectedWidth() honours a scene that pins its own render width', () => {
  assert.equal(expectedWidth({ width: 680, renderWidth: 75 }), 75);
});

test('a pinned render width is one the shortcode will accept', () => {
  // daprdocs/layouts/shortcodes/diagram.html refuses anything outside 10..100,
  // so a pin the formula never produced still has to be in range.
  for (const [name, scene] of Object.entries(scenes)) {
    if (scene.renderWidth === undefined) continue;
    assert.ok(
      Number.isInteger(scene.renderWidth) && scene.renderWidth >= 10 && scene.renderWidth <= 100,
      `${name} pins renderWidth ${scene.renderWidth}, which the shortcode rejects`,
    );
  }
});
