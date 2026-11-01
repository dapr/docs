// The flow vocabulary is shared by every workflow pattern and every agent
// pattern - about seventeen scenes. The point of holding it in one module is
// that none of them carries its own copy of "a step is teal, a wait is gold",
// which is the drift the skill's "a definition copied into a scene drifts"
// trap describes.

import test from 'node:test';
import assert from 'node:assert/strict';
import { C } from './engine.mjs';
import { FLOW } from './flow.mjs';
import { box, node, decision, lineWidth } from './shapes.mjs';
import { serialize } from './engine.mjs';

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
