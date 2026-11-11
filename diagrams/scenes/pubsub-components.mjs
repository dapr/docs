// WHERE THE COMPONENT CONFIGURATION COMES FROM: three services, each loading
// its own component files, all pointing at the same broker.
//
// Replaces /images/pubsub-overview-components.png on
// developing-applications/building-blocks/pubsub/pubsub-overview.md, under
// "a 'shipping' service and an 'email' service have both subscribed to topics
// published by a 'cart' service".
//
// Fact-check, against that sentence: "Each service loads pub/sub component
// configuration files that point to the same pub/sub message broker
// component; for example: Redis Streams, NATS Streaming, Azure Service Bus,
// or GCP pub/sub." Three services, each with its own configuration, one
// broker between them - which is what the source draws and what this draws.
//
// THE FOURTH COMPONENT IS RabbitMQ, not GCP Pub/Sub, and the page's sentence
// was changed with the picture. The reason is recorded in
// diagrams/pubsub-bands.mjs, where the list lives: there is no Google Cloud
// Pub/Sub mark this repo can carry, and RabbitMQ is a supported component the
// pub/sub how-to is already written around.
//
// It shares every measurement with `pubsub-publish-api`, the picture directly
// below it on the same page, through diagrams/pubsub-bands.mjs. The two are
// the same three bands with different things hanging off the sidecars, and a
// reader meets them one after the other.

import { pubsubBands } from '../pubsub-bands.mjs';

export default pubsubBands({
  annotation: 'config',
  title: 'Three services loading their own pub/sub component configuration, all pointing at one broker',
  desc:
    'Three dashed bands side by side. The left, captioned Publish, holds a '
    + 'green hexagon named Cart joined to a hexagon carrying the Dapr logo. '
    + 'The middle, captioned Pub/sub components, lists four marks with their '
    + 'names: Redis, NATS, Azure Service Bus and RabbitMQ. The right, '
    + 'captioned Subscribe, holds two rows, each a Dapr sidecar joined to a '
    + 'service hexagon, named Shipping and Email. An arrow runs from the cart '
    + 'sidecar into the components band, and from there to each subscriber '
    + 'sidecar. Under each of the three sidecars is a cogs mark named '
    + 'Component configuration.',
});
