// APP COLOURS WITHIN A SCENE, which nothing checked until a scene nearly
// shipped two different applications painted the same green.
//
// THE RULE. `APP` in engine.mjs is an ordered palette, and the apps in one
// scene take its entries in order: the first app is APP[0], the second APP[1],
// and so on. The colour is how a reader tells one application from another
// when both are hexagons of the same size with short names on them -
// `service-invocation-example` and `pubsub-publish-raw` both lean on it.
//
// THE EXCEPTION, which is why this is a test and not just a sentence in
// SKILL.md. A scene may draw the SAME application more than once - two
// instances of one app competing for a lock, the same service shown at two
// moments - and then sharing a colour is not a mistake, it is the whole
// point: differently coloured hexagons would say two applications, and on
// `distributed-lock-overview` that would say two app ids, which would mean
// two separate locks and no contention at all.
//
// So the rule this enforces is the one that distinguishes those two cases:
//
//   two app hexagons in one scene may share a fill ONLY IF they carry the
//   same name.
//
// Same app, same name, same colour - fine. Different names, different
// colours - fine. Different names on the same colour is the mistake, and it
// is invisible to every other check in the suite: both hexagons draw, both
// names are legible, the canvas is the right size and the theme resolves.
//
// WHAT AN APP HEXAGON IS, in the built tree. hex() tags its group
// `d-hex d-hex-solid` when it is drawn solid, which is what every APP entry
// asks for, and puts the fill on the polygon and the name in the first label
// inside the same group. appSidecar() composes hex(), so a combined app and
// sidecar is found the same way. The Dapr sidecar's own hexagon is NOT solid
// and so is never counted.

import test from 'node:test';
import assert from 'node:assert/strict';
import { scenes } from './scenes/index.mjs';
import { APP } from './engine.mjs';
import { setIconScope } from './icons.mjs';
import { setCanvasWidth } from './shapes.mjs';

const PALETTE = new Set(APP.map((a) => a.fill));

const classes = (node) => {
  const cls = node.attrs && node.attrs.class;
  return typeof cls === 'string' ? cls.split(' ') : [];
};

// The name on an app hexagon, as one string.
//
// Taken from the FIRST <text> in the group - hex() emits the name before any
// sub-line - and every piece of content inside it is joined, because a
// two-line name is tspans, and reading only the first line would make an
// "Order Service" and an "Order Processor" the same name. That can only ever
// hide a real violation, never invent one, which makes it exactly the kind of
// bug a check like this would carry silently.
//
// A text node is engine.mjs's `{ [TEXT]: true, content }`, keyed by a symbol
// that module keeps to itself, so it is recognised by its `content` string.
// Reading `node.text` instead - the obvious guess - found nothing at all, and
// the test then passed on a deliberately broken scene.
function allContent(node, out = []) {
  if (!node || typeof node !== 'object') return out;
  if (Array.isArray(node)) {
    for (const child of node) allContent(child, out);
    return out;
  }
  if (typeof node.content === 'string') out.push(node.content);
  if (node.children) allContent(node.children, out);
  return out;
}

function firstTextNode(node) {
  if (!node || typeof node !== 'object') return null;
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = firstTextNode(child);
      if (found) return found;
    }
    return null;
  }
  if (node.tag === 'text') return node;
  return node.children ? firstTextNode(node.children) : null;
}

const hexName = (group) => {
  const node = firstTextNode(group);
  return node ? allContent(node).join(' ').trim() : '';
};

function polygonFill(node) {
  if (!node || typeof node !== 'object') return null;
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = polygonFill(child);
      if (found !== null) return found;
    }
    return null;
  }
  if (node.tag === 'polygon' && node.attrs && typeof node.attrs.fill === 'string') {
    return node.attrs.fill;
  }
  return node.children ? polygonFill(node.children) : null;
}

// Every solid app hexagon in a scene, as { fill, name }.
function appHexes(node, out = []) {
  if (!node || typeof node !== 'object') return out;
  if (Array.isArray(node)) {
    for (const child of node) appHexes(child, out);
    return out;
  }
  if (classes(node).includes('d-hex-solid')) {
    const fill = polygonFill(node);
    // Only the palette: a scene is free to draw a solid hexagon in something
    // else - a store, a gateway - and that is not an application.
    // An UNNAMED hexagon is skipped. `observability-tracing` ends with a row
    // of small blank hexagons, one per app, each in that app's own colour -
    // swatches tying a visualisation back to the apps above it, where sharing
    // the colour is the entire job. A shape with no name cannot be telling
    // one app from another by name, so it has nothing to say here.
    const name = fill && PALETTE.has(fill) ? hexName(node) : '';
    if (name) out.push({ fill, name });
    // No recursion past a hexagon: nothing inside one is another app.
    return out;
  }
  if (node.children) appHexes(node.children, out);
  return out;
}

function built(name, scene) {
  setIconScope(name);
  setCanvasWidth(scene.width);
  try {
    return appHexes(scene.build());
  } finally {
    setIconScope('');
    setCanvasWidth(null);
  }
}

test('two app hexagons share a colour only when they are the same app', () => {
  const wrong = [];
  for (const [name, scene] of Object.entries(scenes)) {
    const byFill = new Map();
    for (const hex of built(name, scene)) {
      if (!byFill.has(hex.fill)) byFill.set(hex.fill, new Set());
      byFill.get(hex.fill).add(hex.name);
    }
    for (const [fill, names] of byFill) {
      if (names.size < 2) continue;
      wrong.push(
        `${name} paints ${names.size} differently named app hexagons the same `
        + `colour (${fill}): ${[...names].map((n) => JSON.stringify(n)).join(', ')}. `
        + 'Apps in one scene take APP entries in order, because the colour is how a '
        + 'reader tells one application from another. Two hexagons share a colour only '
        + 'when they are the same application drawn twice - and then they carry the '
        + 'same name, and say which instance each is beside the shape.',
      );
    }
  }
  assert.deepEqual(wrong, [], `an app colour is doing two jobs:\n${wrong.join('\n')}`);
});

test('the palette has no duplicate fills, so taking entries in order is enough', () => {
  // The rule above is only worth anything if distinct entries are distinct
  // colours. If two APP entries ever resolve to the same token, a scene could
  // follow the rule to the letter and still draw two apps the same.
  assert.equal(PALETTE.size, APP.length);
});
