# Publish/Subcribe message broker

Dapr enables  developers to design their application using the pub/sub pattern using a message broker, where event consumers and producers are decoupled from one another, and communicate by sending and receiving messages that are associated with a namespace, usually in the form of topics.

This allows event producers to send messages to consumers that aren't running, and consumers to receive messages based on subscriptions to topics.

Dapr provides At-Least-Once messaging guarantees, and integrates with various message brokers implementations.
These implementations are pluggable, and developed outside of the Dapr runtime in [components-contrib](https://github.com/dapr/components-contrib/tree/master/pubsub).

## Publish/Subcribe API

The API for Publish/Subcribe can be found in the [spec repo](https://github.com/dapr/spec/blob/master/pubsub.md).

## Behavior and guarantees

Dapr guarantees At-Least-Once semantics for message delivery.
That is, when an application publishes a message to a topic using the Publish/Subcribe API, it can assume the message is delivered at least once to any subscriber when the response status code from that endpoint is `200`, or returns no error if using the gRPC client.

The burden of dealing with concepts like consumer groups and multiple instances inside consumer groups is all catered for by Dapr.

Dapr has the concept of an `id`. Dapr requires a single ID to be assigned to every application instance

When an app with multiple instances subscribes to a topic, Dapr will invoke only one instance for that app id.
If two apps with different IDs subscribe to a topic, at least one consumer in each app will get a copy of the same message.

## Cloud Events

Dapr follows the [Cloud Events 0.3 spec](https://github.com/cloudevents/spec/tree/v0.3) and wraps any payload sent to a topic inside a Cloud Events envelope.

The following fields from the Cloud Events spec are implemented with Dapr:

* `id`
* `source`
* `specversion`
* `type`
* `datacontenttype` (Optional)
