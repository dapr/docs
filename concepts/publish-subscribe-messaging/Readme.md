# Pub/Sub

Dapr allows developers to design their application using the Pub/Sub pattern, where event consumers and producers are decoupled from one another, and communicate via sending and receiving messages that are associated with a namespace, usually in the form of topics.

This allows event producers to send messages to consumers that aren't running, and consumers to receive messages based on subscriptions to topics.

Dapr provides At-Least-Once messaging guarantees, and integrates with a various message bus implementations.
These implementations are pluggable, and developed outside of the core Dapr runtime in [components-contrib](https://github.com/dapr/components-contrib/tree/master/pubsub).

## Pub/Sub API

The API for Pub/Sub can be found in the [spec repo](https://github.com/dapr/spec/blob/master/pubsub.md).

## Behavior and guarantees

Dapr guarantees At-Least-Once semantics for message delivery.
That is, when an application publishes a message to a topic using the Pub/Sub API, it can assume the message will be delivered at least once to any subscriber when the response status code from that endpoint is `200`, or returns no error if using the gRPC client.

The burden of dealing with concepts like consumer groups and multiple instances inside consumer groups is all catered for by Dapr.

Dapr has the concept of an `id`.
Dapr requires an ID to be assigned to every app/service.

When an app with multiple instances subscribes to a topic, Dapr will invoke only one instance for that app id.
If two apps with different IDs subscribe to a topic, at least one consumer in each app will get a copy of the same message.

## Cloud Events

Dapr follows the [Cloud Events 0.3 spec](https://github.com/cloudevents/spec/tree/v0.3) and will wrap any payload sent to a topic inside a Cloud Events envelope.

The following fields from the Cloud Events spec are implemented with Dapr:

* `id`
* `source`
* `specversion`
* `type`
* `datacontenttype` (Optional)
