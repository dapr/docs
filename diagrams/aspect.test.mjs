// Every scene should fit a 16:9 frame, so a diagram can be dropped into a
// slide without being shrunk to a stamp. A diagram WIDER than 16:9 is fine -
// it just leaves bands above and below - so the rule is a floor on the ratio,
// not a band.
//
// A scene that cannot fit says so here, with the reason. The list is meant to
// stay short: it is the record of the exceptions, not a place to park a scene
// that was never laid out with the frame in mind.

import test from 'node:test';
import assert from 'node:assert/strict';
import { scenes } from './scenes/index.mjs';

const SLIDE = 16 / 9;

// Within this much of the target counts as fitting: a frame is not a caliper,
// and a scene that is a few percent tall loses nothing on a slide.
const TOLERANCE = 0.9;

const EXCEPTIONS = {
  'components-concept':
    'Thirteen building blocks, each over a column of its components. Laid out '
    + 'for a slide it would be a strip of unreadable marks; it is a reference '
    + 'table that happens to be drawn, and it is read on the page.',
};

test('every scene fits a 16:9 frame, or is a recorded exception', () => {
  const tall = [];
  for (const [name, scene] of Object.entries(scenes)) {
    const ratio = scene.width / scene.height;
    if (ratio >= SLIDE * TOLERANCE) {
      assert.ok(!EXCEPTIONS[name], `${name} fits 16:9 now (${ratio.toFixed(2)}); drop it from EXCEPTIONS`);
      continue;
    }
    if (!EXCEPTIONS[name]) tall.push(`${name} is ${ratio.toFixed(2)} (${scene.width}x${scene.height})`);
  }
  assert.deepEqual(tall, [], `too tall for a slide and not listed as an exception:\n  ${tall.join('\n  ')}`);
});

test('the exception list names only scenes that exist', () => {
  for (const name of Object.keys(EXCEPTIONS)) {
    assert.ok(scenes[name], `EXCEPTIONS names "${name}", which is not a scene`);
  }
});
