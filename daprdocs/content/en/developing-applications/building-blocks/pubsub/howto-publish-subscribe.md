---
type: docs
title: "How-To: Publish a message and subscribe to a topic"
linkTitle: "How-To: Publish & subscribe"
weight: 2000
description: "Learn how to send messages to a topic with one service and subscribe to that topic in another service"
---
## Step 4: ACK-ing a message

In order to tell Dapr that a message was processed successfully, return a `200 OK` response. If Dapr receives any other return status code than `200`, or if your app crashes, Dapr will attempt to redeliver the message following at-least-once semantics.


## Next steps

- Try the [Pub/Sub quickstart sample](https://github.com/dapr/quickstarts/tree/master/tutorials/pub-sub)
- Learn about [PubSub routing]({{< ref howto-route-messages >}})
- Learn about [topic scoping]({{< ref pubsub-scopes.md >}})
- Learn about [message time-to-live]({{< ref pubsub-message-ttl.md >}})
- Learn [how to configure Pub/Sub components with multiple namespaces]({{< ref pubsub-namespaces.md >}})
- List of [pub/sub components]({{< ref setup-pubsub >}})
- Read the [API reference]({{< ref pubsub_api.md >}})
