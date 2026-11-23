// The same two instances, one step later: the first releases its lock, and
// the second is then free to update the shared resource.
//
// Replaces building-block-lock-unlock-example.png on
// developing-applications/building-blocks/distributed-lock/
// howto-use-distributed-lock.md, under "The diagram below shows two instances
// of the same application, where one instance releases the lock and the other
// instance is then able to acquire the lock."
//
// THE ARRANGEMENT IS SHARED with lock-example and lock-multiple-example:
// diagrams/lock-example.mjs. This file says only what is true of THIS state.
// It is the same two instances in the same places as the picture above it on
// the page, which is the point - the reader is watching one thing change.
//
// The source's green tick is the navy `fluent-checkmark-circle` this set uses
// for a call that is permitted, as `api-scoping` draws one. Green is not
// available for it: `C.green` is a FILL token that assertInk() refuses as
// label or glyph ink, because it is an app hexagon's colour and not something
// that can sit on the page in either theme.
//
// The open padlock is `fluent-lock-open`, the pair of the closed one the
// picture above uses.

import { lockExample } from '../lock-example.mjs';

export default lockExample({
  apps: [{ name: 'App 1' }, { name: 'App 1' }],
  instances: true,
  top: {
    step: 1,
    mark: 'fluent-lock-open',
    caption: 'Release lock on resource',
  },
  bottom: {
    step: 2,
    mark: 'fluent-checkmark-circle',
    caption: 'Other apps can update\nthe resource',
  },
  title: 'One instance releasing its lock so the other can update the resource',
  desc:
    'Two green hexagons, one above the other, both named App 1 and captioned Instance 1 and Instance 2, each with a hexagon carrying the Dapr logo overlapping its lower right corner. From the upper Dapr hexagon a line runs right and turns down into the top of a gold data-store cylinder named Shared resource; beside it a numbered step 1, an open padlock, and the words "Release lock on resource". From the lower Dapr hexagon a line runs right and turns up into the foot of the same store; beside it a numbered step 2, a tick in a circle, and the words "Other apps can update the resource".',
});
