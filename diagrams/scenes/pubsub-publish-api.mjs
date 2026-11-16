// THE SAME THREE SERVICES, SHOWING THE CALLS THE API MAKES.
//
// Replaces /images/pubsub-overview-publish-API.png on
// developing-applications/building-blocks/pubsub/pubsub-overview.md, under
// "the Dapr API posts an 'order' topic from the publishing 'cart' service to
// 'order' endpoints on the 'shipping' and 'email' subscribing services".
//
// Fact-check, against that sentence: the cart publishes the `order` topic and
// both subscribers answer on an `order` endpoint, which is what the three
// calls say.
//
// NOTHING MOVES BETWEEN THIS AND `pubsub-components` except what hangs under
// the sidecars - the same three bands, the same services, the same component
// list, through diagrams/pubsub-bands.mjs. The page shows the two one after
// the other and the second says "the Dapr API posts", so the reader is meant
// to be looking at the same picture with the calls filled in.
//
// THE HOSTS COME OFF, as they do everywhere in this set but the service
// invocation example. The source writes `http://localhost:3500/...` for the
// publish and `http://10.0.0.5:8005/order` and `http://10.0.0.4:8004/order`
// for the two deliveries. The first is whatever `dapr run` chose; the other
// two are whatever those services happened to resolve to, and this page
// never mentions either. The paths are what a reader can act on, and both
// subscribers answer the same one, which is the point the sentence makes.

import { pubsubBands } from '../pubsub-bands.mjs';

export default pubsubBands({
  annotation: 'calls',
  title: 'The Dapr API posting an order topic from the cart service to the shipping and email services',
  desc:
    'Three dashed bands side by side. The left, captioned Publish, holds a '
    + 'green hexagon named Cart joined to a hexagon carrying the Dapr logo. '
    + 'The middle, captioned Pub/sub components, lists Redis, NATS, Azure '
    + 'Service Bus and RabbitMQ. The right, captioned Subscribe, holds two '
    + 'rows, each a Dapr sidecar joined to a service hexagon, named Shipping '
    + 'and Email. Under the cart sidecar is the call it makes: POST over the '
    + 'path /v1.0/publish/pubsub/order, carrying the order data. Under each '
    + 'subscriber sidecar is the call that reaches it: POST over the path '
    + '/order, carrying the same data.',
});
