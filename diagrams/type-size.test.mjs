// A scene's BODY TYPE SIZE, which nothing checked until a scene shipped with
// the wrong one.
//
// `render-width.mjs` answers "how wide should this canvas be asked to render",
// and it is calibrated against a 13-unit label: give it a canvas and it
// returns the percentage that puts 13 units at the house size on the page.
// That contract has a second half nobody was holding up - the scene has to
// actually use 13. A scene that sets its body type to 15 renders 15% larger
// than everything around it at whatever width the formula returns, and every
// test passes: the scene exports, the width matches the formula, the labels
// clear their shapes, the canvas is centred.
//
// That is how `binding-output-kafka` was first drawn, at 15 units, and how
// `bindings-overview` sits at 15 today. Both were caught by eye at review,
// one after the other, which is the signal that it wants a test.
//
// WHAT "BODY TYPE" MEANS HERE, and it took a wrong answer to pin down. A
// shape's NAME is not body type: it belongs to the shape and scales with it,
// which is why hex() derives it from the radius. Counting it reads a scene
// backwards - `service-invocation-example` has two app names at 17 against one
// caption at 13, so counting everything made the MODE 17 and reported a scene
// whose body type was already correct as 31% oversized. Only the scene's own
// FREE labels count, and every shape builder tags its group with a `d-` class
// while group() does not, so the two are told apart by that.
//
// WHAT THIS DOES NOT CLAIM. SKILL.md says one type size across the set; the
// set does not have one. Measured when this test was written, 12 of 36 scenes
// set their free labels at 13 and 18 do not, from 10 to 17.25; 6 more place no
// free label at all and have no body type to check. So this is not a rule
// being enforced retroactively - it is a ratchet. Scenes already off 13 are
// listed below with the size they actually use, so a NEW scene cannot drift in
// and an OLD one cannot drift further without saying so. The list is the
// backlog, and every entry removed from it is a scene brought onto the house
// size.

import test from 'node:test';
import assert from 'node:assert/strict';
import { scenes } from './scenes/index.mjs';
import { setIconScope } from './icons.mjs';
import { setCanvasWidth } from './shapes.mjs';

// The size render-width.mjs is calibrated against. Changing it is a change to
// that calibration, not just to this test.
const BODY = 13;

// Scenes whose body type is not BODY, with the size they use, as measured on
// 2026-11-02 when this test was written. An entry is a debt, not a licence:
// the value is recorded so the scene cannot drift further without this failing
// and making someone decide. A scene brought onto BODY must be deleted from
// here - the last test below enforces that, so the list can only shrink.
//
// Scenes that PIN their render width are not listed: pinning is the documented
// way to say "this scene's type is deliberately not the house size, and here
// is the width that compensates", so the pin already records the decision.
// `bindings-overview` (15) and `building-blocks-concept` (10.5) are both that.
const OFF_BODY = {
  'agents-overview': 10.5,
  'api-scoping': 12,
  'components-concept': 10,
  'hosting-standalone': 14,
  'observability-tracing': 14,
  overview: 17.25,
  'resiliency-policies': 14,
  'security-end-to-end': 14,
  'security-threat-model': 12,
  'service-mesh': 15,
  'sidecar-apis': 12,
  'sidecar-health': 12,
  'sidecar-model': 12.6,
  'workflow-async-http': 12,
  'workflow-compensation': 12,
  'workflow-cross-app-client': 12,
  'workflow-external-system': 12,
  'workflow-monitor': 12,
  // Every free label it places is a note() - the branch words and the two
  // questions - and note() is NOTE_SIZE by design. That is the flow kit
  // working, not a scene drifting, which is why every flow scene above is
  // here at the same number.
  'workflow-stateful-client': 12,
  // Same again, and for the same reason: every free label on the fast-path
  // flowchart is a note() - the branch words and the nine questions - and
  // note() is NOTE_SIZE. The shapes it names are all at FLOW.SIZE.
  'workflow-fast-path': 12,
  // The four history-signing scenes, same again. The chain scene is the
  // clearest case: eight of its labels are note()s - six cert indices and two
  // prev digests - and every one is HALOED, which draws the text twice, so
  // the notes outnumber the fourteen shape names that are at FLOW.SIZE.
  'workflow-signing-chain': 12,
  'workflow-signing-verify': 12,
  'workflow-signing-failure': 12,
  // The RAG orchestrator, same reason as every flow scene above it: each of
  // its edge labels is a note() at NOTE_SIZE, each is haloed - which draws
  // the text twice - and there are more of them than there are activities.
  'rag-overview': 12,
};

// The sizes of the scene's own FREE labels, from the built node tree.
//
// Text inside a shape is skipped, and that distinction is the whole point. A
// shape's name belongs to the shape and scales with it - hex() derives it from
// the radius - so it is not body type and must not be read as it. Counting it
// got this exactly backwards on a two-app scene: two app names at 17 against
// one caption at 13 made the MODE 17, and the test reported a scene whose body
// type was already 13 as being 31% oversized.
//
// Every shape builder tags its group with a `d-` class and `group()` does not,
// so "no `d-` ancestor" is precisely "a label the scene placed itself".
function fontSizes(node, out = [], inShape = false) {
  if (!node || typeof node !== 'object') return out;
  if (Array.isArray(node)) {
    for (const child of node) fontSizes(child, out, inShape);
    return out;
  }
  const cls = node.attrs && node.attrs.class;
  const shape = inShape || (typeof cls === 'string' && cls.split(' ').some((c) => c.startsWith('d-')));
  const size = node.attrs && node.attrs['font-size'];
  if (!shape && size !== undefined && Number.isFinite(Number(size))) out.push(Number(size));
  if (node.children) fontSizes(node.children, out, shape);
  return out;
}

// The MODAL size, not the smallest. A scene's body type is the size most of
// its text is set in; the smallest is whatever its quietest annotation uses,
// and taking that would read a scene with one small tag as a small-type scene.
// Ties go to the smaller size, so the metric is deterministic.
function bodySize(name, scene) {
  setIconScope(name);
  setCanvasWidth(scene.width);
  let children;
  try {
    children = scene.build();
  } finally {
    setIconScope('');
    setCanvasWidth(null);
  }
  const sizes = fontSizes(children);
  if (!sizes.length) return null;
  const counts = new Map();
  for (const size of sizes) counts.set(size, (counts.get(size) || 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0][0];
}

const measured = Object.entries(scenes)
  .map(([name, scene]) => ({ name, scene, body: bodySize(name, scene) }))
  .filter((row) => row.body !== null);

test('every scene sets its body type to the size the width formula assumes', () => {
  const wrong = [];
  for (const { name, scene, body } of measured) {
    if (body === BODY) continue;
    if (scene.renderWidth !== undefined) continue; // pinned: a recorded decision
    const allowed = OFF_BODY[name];
    if (allowed === undefined) {
      wrong.push(
        `${name} sets its body type to ${body}, not ${BODY}. render-width.mjs is `
        + `calibrated against ${BODY}, so this renders ${Math.round((body / BODY - 1) * 100)}% `
        + `off the house size whatever width the formula returns. Use ${BODY}, or pin `
        + `renderWidth on the scene to compensate and say why.`,
      );
    } else if (+body.toFixed(2) !== allowed) {
      // Rounded: a size derived from a radius is a float, and the list records
      // what a reader can read rather than its last binary digit.
      wrong.push(
        `${name} is listed at ${allowed} and now reads ${body}. A scene already off `
        + `${BODY} may not drift further: bring it to ${BODY} and delete its entry, or `
        + `update the entry deliberately.`,
      );
    }
  }
  assert.deepEqual(wrong, [], `body type:\n${wrong.join('\n')}`);
});

test('the off-body list names only scenes that are still off body', () => {
  // The list may only shrink. Without this an entry outlives the problem and
  // the next author reads it as permission to use that size.
  const stale = [];
  for (const name of Object.keys(OFF_BODY)) {
    const row = measured.find((r) => r.name === name);
    if (!row) {
      stale.push(`${name} is listed but is not a registered scene`);
    } else if (+row.body.toFixed(2) === BODY) {
      stale.push(`${name} now uses ${BODY}; delete its entry`);
    } else if (row.scene.renderWidth !== undefined) {
      stale.push(`${name} now pins its render width; delete its entry, the pin records it`);
    }
  }
  assert.deepEqual(stale, [], `stale entries:\n${stale.join('\n')}`);
});

test('bodySize() reads the modal size, not the smallest', () => {
  // Guards the metric itself: a scene with one tiny tag is not a small-type
  // scene, and a min-based reading would call it one.
  const scene = {
    width: 400,
    height: 200,
    build: () => [
      { tag: 'text', attrs: { 'font-size': 13 }, children: [] },
      { tag: 'text', attrs: { 'font-size': 13 }, children: [] },
      { tag: 'g', attrs: {}, children: [{ tag: 'text', attrs: { 'font-size': 10 }, children: [] }] },
    ],
  };
  assert.equal(bodySize('fixture', scene), 13);
});
