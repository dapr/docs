// Getting configuration from a store: the order processing service asks its
// Dapr sidecar, and the sidecar reads the Redis configuration store. Both
// calls answer, so both lines carry a head at each end.
//
// Replaces building-block-configuration-example.png on
// developing-applications/building-blocks/configuration/
// howto-manage-configuration.md, under "This example uses the Redis
// configuration store component".
//
// Fact-check, against the page's own commands and component file:
//   - the source labels the sidecar "ID: orderprocessing", which is the app
//     id the page's five language tabs all run with. This names the shape
//     "Dapr sidecar" instead - a maintainer decision of 2026-11-02: the
//     diagram's subject is where configuration is read from, not what the app
//     is called, and the id is in every `dapr run` command on the page.
//   - the component is `name: configstore`, `type: configuration.redis`, so
//     the store at the far end is Redis and the page runs it in Docker.
//   - the page is "get application configuration AND subscribe for changes".
//     The source draws only the get, and names it "Get configuration"; this
//     is a redraw, so it draws the get and the page's own prose covers the
//     subscribe.
//
// WHO THE ARROWS TOUCH. The app asks its SIDECAR and the sidecar reads the
// store, which is the maintainer ruling of 2026-11-02 recorded in
// bindings-overview.mjs. The source already draws it that way - app, sidecar,
// store, with a line between each pair - so unlike the bindings pages nothing
// had to be re-routed here.
//
// Where this departs from the source image, and why:
//   - the source is drawn in an older style this set does not use: grey boxes,
//     a blue square sidecar, a white circle for Redis. The shapes are mapped
//     onto the house ones - an app hexagon, the Dapr hexagon, and a marked
//     hexagon for the component, which is exactly how the two bindings how-tos
//     next door draw Kafka.
//   - a Dapr hexagon carries the Dapr mark and nothing else here, so its name
//     sits under it the way every mark in this set is named - and it is a
//     NAME, in the body font, rather than the id the source set there.
//   - Redis is a CYLINDER, where the bindings pages draw Kafka in a hexagon.
//     It is a data store, and the cylinder is the one outline in this set that
//     says so; Kafka there is a broker reached through a binding, not a store.
//     Gold with dark ink on it, as every store in the set is.
//   - the mark is `redis.svg`, Simple Icons' current one, not the older
//     stacked-cubes `redis-color.svg`. It is single-colour, so it takes the
//     ink the store's own fill carries and needs no plate - the plate exists
//     for full-colour marks that cannot be tinted.

import { C } from '../engine.mjs';
import { componentCall } from '../component-call.mjs';

// THE CALL IS A GET, not a POST. The request that added it asked for "a POST
// call to their respective http endpoints"; on the state management page next
// door that is right, but this page's own command is
// `curl http://localhost:3601/v1.0/configuration/configstore?key=orderId1`,
// and reference/api/configuration_api.md gives the same verb. A diagram
// showing POST would contradict the command printed eleven screens below it.
// Drawn as the page documents it - raised rather than resolved silently.
//
// The HOST is left off, as conversation-overview leaves its own off: `3601` is
// whatever port the reader's `dapr run` chose, and the path is the fact.
const CALL = {
  method: 'GET',
  path: [
    { text: '/v1.0/' },
    { text: 'configuration', color: C.orange, weight: 700 },
    { text: '/configstore?key=orderId1' },
  ],
  // Measured on the rendered page in the code face at 13 - the exporter has no
  // font metrics. It is a fixed-width face, so the bold segment costs nothing.
  width: 344,
};

// The picture is diagrams/component-call.mjs, which the state management
// how-to draws too: the same source image with one word different. This file
// is what is true of THIS page - its caption, its call, and the fact-check
// above.
export default componentCall({
  caption: 'Get configuration',
  call: CALL,
  title: 'A service reading configuration from a Redis store through its Dapr sidecar',
  desc:
    'Three shapes in a row. On the left, a green hexagon named Order Processing Service. In the middle, a hexagon carrying the Dapr logo, named Dapr sidecar. On the right, a gold data-store cylinder holding the Redis mark, named Redis. A line with a head at each end joins the service to its sidecar, and a second joins the sidecar to Redis, labelled Get configuration. Below the row, the call the service makes: GET over the path /v1.0/configuration/configstore?key=orderId1.',
});
