// Two instances of one application ask for the same lock: the first gets it
// and may update the shared resource, the second does not and may not.
//
// Replaces building-block-lock-example.png on
// developing-applications/building-blocks/distributed-lock/
// howto-use-distributed-lock.md, under "In the diagram below, two instances
// of the same application acquire a lock, where one instance is successful
// and the other is denied."
//
// THE ARRANGEMENT IS SHARED. This page draws it three times - acquire, unlock,
// and two different apps - so all three come from diagrams/lock-example.mjs
// and this file says only what is true of THIS state. See that module's
// header for why, and for how it agrees with distributed-lock-overview on the
// page before.
//
// Fact-check, against the page's own prose: "two instances of the same
// application", so both hexagons carry one name and one colour and are
// captioned Instance 1 and Instance 2 - the overview page's Features section
// adds that locks are scoped to a Dapr app-id, which is what makes these two
// contend at all.
//
// The denied run is RED and dashed with `fluent-dismiss-circle` beside it,
// which is the house default for a blocked path and what `api-scoping` and
// `distributed-lock-overview` draw. The dashing carries the distinction on
// its own; the colour is a second signal on top of it.

import { C } from '../engine.mjs';
import { lockExample } from '../lock-example.mjs';

export default lockExample({
  apps: [{ name: 'App 1' }, { name: 'App 1' }],
  instances: true,
  top: {
    step: 1,
    mark: 'fluent-lock-closed',
    caption: 'Acquire lock on resource\nfor mutually exclusive access',
  },
  bottom: {
    step: 2,
    mark: 'fluent-dismiss-circle',
    color: C.red,
    dash: true,
    caption: 'Lock denies access to\nupdate resource',
  },
  title: 'One instance of an app holding a lock while the other is refused it',
  desc:
    'Two green hexagons, one above the other, both named App 1 and captioned Instance 1 and Instance 2, each with a hexagon carrying the Dapr logo overlapping its lower right corner. From the upper Dapr hexagon a line runs right and turns down into the top of a gold data-store cylinder named Shared resource; beside it a numbered step 1, a closed padlock, and the words "Acquire lock on resource for mutually exclusive access". From the lower Dapr hexagon a dashed red line runs right and turns up into the foot of the same store; beside it a numbered step 2, a cross in a circle, and the words "Lock denies access to update resource".',
});
