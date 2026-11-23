// Two DIFFERENT applications, each taking its own lock on the same resource.
//
// Replaces building-block-lock-multiple-example.png on
// developing-applications/building-blocks/distributed-lock/
// howto-use-distributed-lock.md, under "The diagram below shows two instances
// of different applications, acquiring different locks on the same resource."
//
// THE ARRANGEMENT IS SHARED with lock-example and lock-unlock-example:
// diagrams/lock-example.mjs.
//
// TWO APPLICATIONS, SO TWO COLOURS. The other two pictures on this page draw
// one application twice and give both hexagons the same name and the same
// green; this one draws two, so they take APP[0] and APP[1] in order, as the
// palette is meant to be used. diagrams/app-colour.test.mjs is the check that
// keeps the three honest about which case each is.
//
// DISCREPANCY, raised and not resolved silently. The source captions BOTH
// runs "acquires lock on resource for mutually exclusive access", and taken
// together those two sentences cannot both be true of one resource. What is
// actually happening is in the page's own prose and in the overview page's
// Features section: locks are scoped to a Dapr app-id, so App 1's lock and
// App 2's lock are DIFFERENT locks and do not exclude each other at all. Each
// caption is defensible read on its own - each app is excluding other
// instances of ITSELF - and misleading read together, which is the reading a
// diagram invites. The captions here follow the source; the fix is a line of
// prose on the page, and that is the maintainers' call rather than this
// file's.

import { APP } from '../engine.mjs';
import { lockExample } from '../lock-example.mjs';

export default lockExample({
  apps: [
    { name: 'App 1', palette: APP[0] },
    { name: 'App 2', palette: APP[1] },
  ],
  top: {
    step: 1,
    mark: 'fluent-lock-closed',
    caption: 'App 1 acquires lock on resource\nfor mutually exclusive access',
  },
  bottom: {
    step: 2,
    mark: 'fluent-lock-closed',
    caption: 'App 2 acquires lock on resource\nfor mutually exclusive access',
  },
  title: 'Two different applications each taking their own lock on one resource',
  desc:
    'Two hexagons, one above the other: a green one named App 1 and a blue one named App 2, each with a hexagon carrying the Dapr logo overlapping its lower right corner. From each Dapr hexagon a line runs right to a gold data-store cylinder named Shared resource, the upper one turning down into its top and the lower one up into its foot. Beside the upper run, a numbered step 1, a closed padlock, and the words "App 1 acquires lock on resource for mutually exclusive access"; beside the lower run, a numbered step 2, a second closed padlock, and the same words for App 2.',
});
