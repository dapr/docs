// THE SAME TWO NAMESPACES WITH `consumerID: "{namespace}"`, AND FOUR CONSUMER
// GROUPS INSTEAD OF TWO.
//
// Replaces /images/howto-namespace/with-namespace.png on
// developing-applications/building-blocks/pubsub/howto-namespace.md, under
// "With namespace consumer groups".
//
// Fact-check, against the paragraph directly below the image:
//   - "two namespaces, each with applications of the same `app-id`,
//     publishing and subscribing to the same logical topic" - so the apps and
//     the topic are unchanged from the picture before it, and only the
//     consumer groups differ.
//   - the card lists A.App1, A.App2, B.App1 and B.App2, which is the source's
//     own list and what `consumerID: "{namespace}"` in the component above
//     produces.
//
// NOTHING MOVES BETWEEN THIS AND `pubsub-namespace-without` EXCEPT THE CARD
// AND THE CROSS. That is the argument: the same deployment, the same app ids,
// the same topic, and the only change is in the component metadata. The three
// scenes share every measurement through diagrams/pubsub-namespace.mjs so a
// reader scrolling between them sees exactly what changed.

import { namespaceScene, PUBLISH, SUBSCRIBE } from '../pubsub-namespace.mjs';

export default namespaceScene({
  title: 'Two namespaces with namespaced consumer groups, where both subscribers work',
  desc:
    'At the top, a green message broker named order, with Message broker '
    + 'written under it, and beside it a card titled Consumer group names '
    + 'listing four: A.App1, A.App2, B.App1 and B.App2. Below, a dashed region '
    + 'captioned Kubernetes cluster holds two dashed regions, namespace-a and '
    + 'namespace-b. Each holds an App1 that publishes and an App2 that '
    + 'subscribes, with Dapr sidecars, and nothing is blocked: the two App2s no '
    + 'longer share a consumer group.',
  namespaces: [
    {
      name: 'namespace-a',
      captionW: 104,
      apps: [
        { name: 'App1', role: PUBLISH },
        { name: 'App2', role: SUBSCRIBE },
      ],
    },
    {
      name: 'namespace-b',
      captionW: 104,
      apps: [
        { name: 'App1', role: PUBLISH },
        { name: 'App2', role: SUBSCRIBE },
      ],
    },
  ],
  groups: ['A.App1', 'A.App2', 'B.App1', 'B.App2'],
});
