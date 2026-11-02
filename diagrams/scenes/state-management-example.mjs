// Saving and getting state: the order processing service asks its Dapr
// sidecar, and the sidecar reads and writes the Redis state store.
//
// Replaces building-block-state-management-example.png on
// developing-applications/building-blocks/state-management/
// howto-get-save-state.md, under "The code example below loosely describes an
// application that processes orders".
//
// Fact-check, against the page's own prose, commands and component file:
//   - the page says it in words directly above the image: "an order processing
//     service which has a Dapr sidecar. The order processing service uses Dapr
//     to store state in a Redis state store." That is the drawing.
//   - the app id is `orderprocessing`, on every one of the page's four
//     language tabs.
//   - the component is `name: statestore`, `type: state.redis`, so the store
//     is Redis and it is a STATE store - which is why it is drawn as a store
//     rather than, say, the broker shape the bindings pages use for Kafka.
//
// THE PICTURE IS SHARED. This page and the configuration how-to ship the SAME
// source image with one word different, so they draw the same scene:
// diagrams/component-call.mjs. What is in this file is what is true of this
// page - its caption and the fact-check above. If either page ever wants a
// different arrangement, that page stops calling the shared picture and draws
// itself; a skeleton is shared only while both pictures want that shape.
//
// Where this departs from the source image, and why - all of them inherited
// from the shared picture, and all settled on 2026-11-02:
//   - the source is in an older style: grey boxes, a blue square sidecar, a
//     white circle for Redis. Those map onto the house shapes.
//   - Redis is a CYLINDER, gold with dark ink, because a data store is the one
//     thing in this set whose outline says what it is.
//   - the source sets the app id inside the sidecar as "ID: orderprocessing".
//     The shape is named "Dapr sidecar" instead: the diagram's subject is
//     where state is kept, not what the app is called, and the id is in every
//     `dapr run` command on the page.
//   - the caption is sentence case. The source sets it as "State Management";
//     the page's own prose calls it state management, and the rest of this set
//     captions in sentence case.

import { C } from '../engine.mjs';
import { componentCall } from '../component-call.mjs';

// THE SAVE, not the get. The page documents both -
// `curl -X POST ... http://localhost:3601/v1.0/state/statestore` and
// `curl http://localhost:3601/v1.0/state/statestore/order_1` - and the drawing
// shows the one the page leads with and the one its caption is about: the
// service SAVING its order. The get is the same path with a key on the end,
// and the line it travels already carries a head at each end.
//
// The HOST is left off, as conversation-overview leaves its own off: `3601` is
// whatever port the reader's `dapr run` chose, and the path is the fact.
const CALL = {
  method: 'POST',
  path: [
    { text: '/v1.0/' },
    { text: 'state', color: C.orange, weight: 700 },
    { text: '/statestore' },
  ],
  // The payload the page's own `curl -d` sends, character for character. It is
  // an ARRAY: the state API takes a list of key/value pairs even when there is
  // one of them, and a diagram showing a bare object would send a reader to a
  // 400 the page's command does not get.
  body: '[{ "key": "order_1", "value": "250"}]',
  // The WIDEST line, measured on the rendered page in the code face at 13 -
  // the exporter has no font metrics. That is the payload at 289, not the path
  // at 172. It is a fixed-width face, so the bold segment costs nothing.
  width: 289,
};

export default componentCall({
  caption: 'State management',
  call: CALL,
  title: 'A service saving and getting state in a Redis store through its Dapr sidecar',
  desc:
    'Three shapes in a row. On the left, a green hexagon named Order Processing Service. In the middle, a hexagon carrying the Dapr logo, named Dapr sidecar. On the right, a gold data-store cylinder holding the Redis mark, named Redis. A line with a head at each end joins the service to its sidecar, and a second joins the sidecar to Redis, labelled State management. Below the row, the call the service makes to save an order: POST over the path /v1.0/state/statestore, carrying the body [{ "key": "order_1", "value": "250"}].',
});
