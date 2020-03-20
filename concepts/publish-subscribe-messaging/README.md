# Publish/Subscribe Messaging

Dapr enables developers to design their application with a pub/sub pattern using a message broker, where event consumers and producers are decoupled from one another, and communicate by sending and receiving messages that are associated with a namespace, usually in the form of topics.

This allows event producers to send messages to consumers that aren't running, and consumers to receive messages based on subscriptions to topics.

Dapr provides At-Least-Once messaging guarantees, and integrates with various message brokers implementations.
These implementations are pluggable, and developed outside of the Dapr runtime in [components-contrib](https://github.com/dapr/components-contrib/tree/master/pubsub).

## Publish/Subscribe API

The API for Publish/Subscribe can be found in the [spec repo](../../reference/api/pubsub_api.md).

## Behavior and guarantees

Dapr guarantees At-Least-Once semantics for message delivery.
That is, when an application publishes a message to a topic using the Publish/Subscribe API, it can assume the message is delivered at least once to any subscriber when the response status code from that endpoint is `200`, or returns no error if using the gRPC client.

The burden of dealing with concepts like consumer groups and multiple instances inside consumer groups is all catered for by Dapr.

### App ID

Dapr has the concept of an `id`. This is specified in Kubernetes using the `dapr.io/id` annotation and with the `app-id` flag using the Dapr CLI. Dapr requires an ID to be assigned to every application.

When multiple instances of the same application ID subscribe to a topic, Dapr will make sure to deliver the message to only one instance. If two different applications with different IDs subscribe to a topic, at least one instance in each application receives a copy of the same message.

## Cloud events

Dapr follows the [Cloud Events 0.3 Spec](https://github.com/cloudevents/spec/tree/v0.3) and wraps any payload sent to a topic inside a Cloud Events envelope.

The following fields from the Cloud Events spec are implemented with Dapr:

* `id`
* `source`
* `specversion`
* `type`
* `datacontenttype` (Optional)
