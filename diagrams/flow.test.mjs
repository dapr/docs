// The flow vocabulary is shared by every workflow pattern and every agent
// pattern - about seventeen scenes. The point of holding it in one module is
// that none of them carries its own copy of "a step is teal, a wait is gold",
// which is the drift the skill's "a definition copied into a scene drifts"
// trap describes.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { C } from './engine.mjs';
import { FLOW, flowLane, note } from './flow.mjs';
import { box, node, decision, lineWidth, captionReach } from './shapes.mjs';
import { serialize } from './engine.mjs';

const find = (n, pred, out = []) => {
  if (!n || typeof n !== 'object') return out;
  if (Array.isArray(n)) { for (const k of n) find(k, pred, out); return out; }
  if (pred(n)) out.push(n);
  for (const k of n.children ?? []) find(k, pred, out);
  return out;
};

test('a work step and a wait step are different colours', () => {
  // The whole reason a timer or a wait-for-event is drawn differently from an
  // activity: one is doing work, the other is doing nothing on purpose.
  assert.notEqual(FLOW.step.fill, FLOW.wait.fill);
});

test('start and end are different colours, and neither is a step colour', () => {
  assert.notEqual(FLOW.start.fill, FLOW.end.fill);
  for (const terminal of [FLOW.start, FLOW.end]) {
    assert.notEqual(terminal.fill, FLOW.step.fill);
    assert.notEqual(terminal.fill, FLOW.wait.fill);
  }
});

test('every flow colour is a var(--d-*) token', () => {
  // A role now carries layout facts beside its colours - a terminal says its
  // name goes inside the circle - so only the strings are colours.
  for (const [name, role] of Object.entries(FLOW)) {
    if (typeof role !== 'object') continue;
    for (const [k, v] of Object.entries(role)) {
      if (typeof v !== 'string') continue;
      assert.match(v, /^var\(--d-[a-z-]+\)$/, `FLOW.${name}.${k} is ${v}`);
    }
  }
});

test('the kit is frozen, so a scene cannot mutate the shared vocabulary', () => {
  assert.throws(() => { FLOW.step.fill = 'red'; }, TypeError);
  assert.throws(() => { FLOW.W = 1; }, TypeError);
});

test('a step and a wait drawn from the kit are the same size', () => {
  // They sit in the same column in the monitor and compensation patterns, so a
  // difference of a pixel reads as a mistake.
  const a = box({ x: 0, y: 0, w: FLOW.W, h: FLOW.H, label: 'A', ...FLOW.step });
  const b = box({ x: 0, y: 0, w: FLOW.W, h: FLOW.H, label: 'B', ...FLOW.wait });
  const rect = (g) => g.children.find((c) => c.tag === 'rect').attrs;
  assert.equal(rect(a).width, rect(b).width);
  assert.equal(rect(a).height, rect(b).height);
});

test('a terminal node names itself INSIDE the circle, like the source flowcharts', () => {
  // The first draft hung the name underneath, on the grounds that C.orange is
  // the ink version of the brand orange rather than a fill meant to carry dark
  // type. Measured, C.appInk on it is 5.5:1 in light and 7.0:1 in dark, which
  // clears the floor both ways, so the name goes where the source puts it.
  for (const terminal of [FLOW.start, FLOW.end]) {
    const g = node({ x: 100, y: 200, r: FLOW.NODE_R, ...terminal, label: 'End' });
    const text = g.children.find((c) => c.tag === 'text');
    assert.ok(
      Math.abs(Number(text.attrs.y) - 200) < FLOW.NODE_R,
      `the name sits inside the circle (baseline ${text.attrs.y})`,
    );
    assert.equal(text.attrs.fill, C.appInk, 'and in the fill\'s own ink, not the page\'s body colour');
  }
});

test('a terminal is at least as tall as the step beside it', () => {
  // Start and End sit on the same line as the activities in five of these six
  // diagrams. A marker smaller than the box it points at reads as a bullet,
  // and the name will not fit in it - which is what the review found.
  assert.ok(FLOW.NODE_R * 2 >= FLOW.H, `${FLOW.NODE_R * 2} against a step's ${FLOW.H}`);
});

test('a decision from the kit matches the wait colour', () => {
  // A gate and a timer are both "the flow is not doing work here", and the
  // source diagrams colour them the same.
  const g = decision({ x: 0, y: 0, ...FLOW.wait, label: 'Gate' });
  const poly = g.children.find((c) => c.tag === 'polygon').attrs;
  assert.equal(poly.fill, FLOW.wait.fill);
  assert.equal(poly['stroke-width'], lineWidth());
});

test('the kit emits no literal colour through a drawn shape', () => {
  const svg = [
    serialize(node({ x: 0, y: 0, r: FLOW.NODE_R, ...FLOW.start, label: 'Start' })),
    serialize(box({ x: 0, y: 0, w: FLOW.W, h: FLOW.H, label: 'Step', ...FLOW.step })),
    serialize(decision({ x: 0, y: 0, ...FLOW.wait, label: 'Gate' })),
  ].join('');
  assert.equal(/#[0-9a-fA-F]{3,6}/.test(svg), false, 'a hex colour reached the output');
});

// ---------------------------------------------------------- the lane builder
//
// The middle layer the workflow scenes were missing. The concept scenes have
// `app.mjs`, `services.mjs`, `cards.mjs` - modules that own an arrangement, so
// a scene names a thing instead of re-deriving it. The workflow scenes had
// only the vocabulary above and re-derived everything else, and three of the
// four defects the page-3 review found were that one shape: five copies of
// `PAD = 26`, five hand-written note labels, four hand-rolled lane helpers,
// and a `captionSize` every one of them forgot to pass.

test('a lane captions itself in the flow`s own type size, with no help from the scene', () => {
  // The defect this exists for: region() defaults to 15, every workflow scene
  // took the default, and a 15 pill sat two steps above the 13 activity names
  // underneath it. A scene cannot forget what it does not pass.
  const g = flowLane({ x: 0, y: 0, w: 400, h: 120, caption: 'Workflow1', captionW: 90 });
  const text = find(g, (n) => n.tag === 'text')[0];
  assert.equal(Number(text.attrs['font-size']), FLOW.SIZE);
});

test('a lane leaves its contents clear of the caption pill that hangs into it', () => {
  // PAD is measured from how far the pill reaches INSIDE the border, not from
  // the border, which is the rule the skill states and five scenes each
  // re-derived as their own `const PAD = 26`.
  assert.ok(FLOW.PAD >= captionReach(), `${FLOW.PAD} against a pill's ${captionReach()}`);
});

test('a lane is tall enough for whatever kind of row it holds', () => {
  // Terminals are circles and taller than a step box, so the two lane heights
  // are different numbers - and every scene that holds both had written both
  // of them out itself.
  assert.equal(FLOW.LANE_TERMINAL_H, FLOW.NODE_R * 2 + FLOW.PAD * 2);
  assert.equal(FLOW.LANE_ACTIVITY_H, FLOW.H + FLOW.PAD * 2);
  assert.ok(FLOW.LANE_TERMINAL_H > FLOW.LANE_ACTIVITY_H);
});

test('a note is set below the names of the shapes it annotates, in the caption colour', () => {
  // An annotation on a leg - "allowed", "caller identity over mTLS" - is about
  // the flow, not a name for a shape, and reads as secondary because it is
  // smaller and lighter. Five scenes each declared this, all at 12 but each
  // from scratch, which is how the caption size drifted in the first place.
  const g = note({ x: 10, y: 20, text: 'allowed' });
  const text = find(g, (n) => n.tag === 'text')[0];
  assert.equal(Number(text.attrs['font-size']), FLOW.NOTE_SIZE);
  assert.ok(FLOW.NOTE_SIZE < FLOW.SIZE, `${FLOW.NOTE_SIZE} against a shape name's ${FLOW.SIZE}`);
  assert.equal(text.attrs.fill, C.caption);
});

test('a note can be anchored and haloed, which is why the scenes kept their own', () => {
  // The two variants that made five copies look like five different helpers:
  // one sits beside a line and needs a halo under it, one hangs off a point
  // and needs to start there rather than be centred on it.
  const plain = note({ x: 0, y: 0, text: 'No' });
  const haloed = note({ x: 0, y: 0, text: 'denied', halo: true, anchor: 'start' });
  const text = (g) => find(g, (n) => n.tag === 'text');
  assert.equal(text(haloed)[0].attrs['text-anchor'], 'start');
  // A halo paints a copy of the text underneath in the page colour, so the
  // line passes behind the words: two texts where there was one.
  assert.ok(text(haloed).length > text(plain).length, `${text(haloed).length} against ${text(plain).length}`);
});

test('no flow scene carries its own copy of any of this', () => {
  // The guard that makes the refactor stick. A scene that imports the flow
  // vocabulary draws its lanes and its notes from it; one that re-declares the
  // pad, hand-rolls a caption-coloured label, or calls region() directly is
  // the drift this module exists to stop, and it is invisible in the render
  // until the numbers disagree.
  const dir = fileURLToPath(new URL('./scenes/', import.meta.url));
  const scenes = readdirSync(dir).filter((f) => f.endsWith('.mjs') && f !== 'index.mjs');
  const offenders = [];
  for (const f of scenes) {
    const src = readFileSync(join(dir, f), 'utf8');
    if (!/from '\.\.\/flow\.mjs'/.test(src)) continue;
    const code = src.replace(/^\s*\/\/.*$/gm, '');
    if (/\bconst PAD\b/.test(code)) offenders.push(`${f}: declares its own PAD - use FLOW.PAD`);
    if (/\bC\.caption\b/.test(code)) offenders.push(`${f}: hand-rolls a note label - use note()`);
    if (/\bregion\(/.test(code)) offenders.push(`${f}: calls region() directly - use flowLane()`);
  }
  assert.deepEqual(offenders, []);
});
