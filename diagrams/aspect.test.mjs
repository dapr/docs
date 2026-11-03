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
  // A pod inside a cluster, a store beside it and the call beneath is
  // naturally about 3:2. These two were laid out to the frame first, and the
  // only lever that reached 16:9 was the run from the sidecar to the store:
  // deriving it from the floor made it 236 units on one and stranded Key Vault
  // 300 units off the cluster edge on the other. The maintainer rejected both
  // on sight (2026-11-03), so the run is now the length the drawing wants and
  // the frame is the thing that gives.
  //
  // The lever is still there. Put the derived gap back in either scene and it
  // clears the floor again; what you get for it is a third of the canvas spent
  // on empty line.
  // The one-namespace state of the namespace triptych. It was sized for two
  // namespaces so the three pictures would line up, and the empty right half
  // that left was rejected on sight (2026-11-03); sized to what it actually
  // holds, one namespace under a broker and a card is naturally about 5:4.
  // The two-namespace states clear the floor comfortably at 2.04.
  'pubsub-namespace-basic':
    'One namespace, a broker above it and the consumer group card beside '
    + 'that. Reaching 16:9 means padding the cluster out to a second, empty '
    + 'namespace slot, which is what it used to do and what was rejected.',
  'secrets-kubernetes-store':
    'A pod in a cluster with the secret store beside it and the GET beneath. '
    + 'Reaching 16:9 means 236 units of empty line between the sidecar and the '
    + 'store, which reads worse than the short frame does.',
  'secrets-azure-aks-keyvault':
    'The same picture with Key Vault outside the cluster and the pod identity '
    + 'inside it. Reaching 16:9 strands the vault 300 units off the cluster '
    + 'edge.',
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
