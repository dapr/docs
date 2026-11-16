// THE SAME TWO APPS IN A SECOND NAMESPACE, AND WHY ONE OF THEM GETS NOTHING.
//
// Replaces /images/howto-namespace/without-namespace.png on
// developing-applications/building-blocks/pubsub/howto-namespace.md, under
// "you create another namespace with two applications of the same `app-id`".
//
// Fact-check, against the two paragraphs around the image:
//   - "another namespace with two applications of the same `app-id`, App1 and
//     App2" - so both namespaces hold an App1 and an App2, and the names are
//     the SAME names, which is the entire problem.
//   - "Dapr creates consumer groups using the `app-id` of individual
//     applications, so the consumer group names will remain App1 and App2" -
//     the card is unchanged from the picture before it, which is the point.
//
// WHY THE TWO App1s ARE THE SAME COLOUR. They are the same application id in
// two namespaces, which is what the page is complaining about, so they carry
// one name and one colour - the rule diagrams/app-colour.test.mjs enforces,
// and the distinction it exists to make. Two colours would say two
// applications, and then there would be no problem to explain.
//
// The blocked app is marked ORANGE, not the source's red roundel: deny in
// this set is orange and allow is navy.

import { namespaceScene, PUBLISH, SUBSCRIBE } from '../pubsub-namespace.mjs';

export default namespaceScene({
  title: 'Two namespaces with the same app ids, where one subscriber is cut off',
  desc:
    'At the top, a green message broker named order, with Message broker '
    + 'written under it, and beside it a card titled Consumer group names '
    + 'listing only App1 and App2. Below, a dashed region captioned Kubernetes '
    + 'cluster holds two dashed regions, namespace-a and namespace-b. Each '
    + 'holds an App1 and an App2 with Dapr sidecars, the same two app ids in '
    + 'both. In namespace-a, App1 publishes and App2 subscribes; in '
    + 'namespace-b, App1 publishes but App2 is marked with an orange cross, '
    + 'because it shares a consumer group with the App2 in namespace-a and '
    + 'receives nothing.',
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
        // THE BLOCKED ONE IS THE SUBSCRIBER, and the subscriber is now App2.
        // It shares a consumer group with namespace-a's App2, so one of the
        // two gets every message and this one gets none. Publishing is never
        // what fails here: a publisher does not belong to a consumer group.
        { name: 'App2', role: SUBSCRIBE, blocked: true },
      ],
    },
  ],
  groups: ['App1', 'App2'],
});
