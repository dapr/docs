// ONE NAMESPACE, TWO APPS, TWO CONSUMER GROUPS - the starting point the
// namespace how-to argues from.
//
// Replaces /images/howto-namespace/basic-pubsub.png on
// developing-applications/building-blocks/pubsub/howto-namespace.md, under
// "Without namespace consumer groups".
//
// Fact-check, against the paragraph directly above the image:
//   - "two applications (App1 and App2) deployed to the same namespace
//     (namespace-a)"
//   - "App1 publishes to a topic called `order`, while App2 subscribes to the
//     topic called `order`"
//   - "This will create two consumer groups, named after your applications
//     (App1 and App2)" - which is what the card lists.
//
// THE TWO ROLES WERE SWAPPED, in the page and in all three pictures together.
// The page used to have App2 publishing and App1 subscribing, which put the
// publisher on the RIGHT of each namespace and the subscriber on the LEFT -
// and since a publish run ends at the broker's left rim and a subscribe run
// starts at its right one, every pair of runs crossed. Maintainer's call,
// 2026-11-03: App1 publishes, App2 subscribes, and the prose was changed with
// the drawings so the two still agree. Which app does which is arbitrary in
// this example; the crossing was not.
//
// DISCREPANCY, raised and not resolved here: the page calls the topic `order`
// in this paragraph and in all three images, and `orders` in its closing
// paragraph under the third one. The pictures follow the images and the
// paragraph that sets the example up; the stray plural is a line of prose and
// is the maintainers' to fix.
//
// The arrangement, and every measurement in it, is shared with
// `pubsub-namespace-without` and `pubsub-namespace-with` through
// diagrams/pubsub-namespace.mjs: the three are read as a sequence and the
// consumer group card is the thing that changes.

import { namespaceScene, PUBLISH, SUBSCRIBE } from '../pubsub-namespace.mjs';

export default namespaceScene({
  title: 'Two apps in one namespace, publishing and subscribing to one topic',
  desc:
    'At the top, a green message broker named order, with Message broker '
    + 'written under it, and beside it a card titled Consumer group names '
    + 'listing App1 and App2. Below, a dashed region captioned Kubernetes '
    + 'cluster holds a second dashed region captioned namespace-a, which holds '
    + 'two hexagons with Dapr sidecars: App1, whose line goes up to the '
    + 'broker and is labelled publish, and App2, whose line comes down from '
    + 'the broker and is labelled subscribe.',
  namespaces: [
    {
      name: 'namespace-a',
      captionW: 104,
      apps: [
        { name: 'App1', role: PUBLISH },
        { name: 'App2', role: SUBSCRIBE },
      ],
    },
  ],
  groups: ['App1', 'App2'],
});
