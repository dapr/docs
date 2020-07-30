# Publish/Subscribe Messaging

The [publish/subscribe pattern](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) allows your microservices to communicate with each other purely by sending messages. In this system, the **producer** of a message sends it to a **topic**, with no knowledge of what service will receive the message. A messages can even be sent if there's no consumer for it.

Similarly, a **consumer** will receive messages from a topic without knowledge of what producer sent it. This pattern is especially useful when you need to decouple microservices from one another.

Dapr provides a publish/subscribe API that provides at-least-once guarantees and integrates with various message brokers implementations. These implementations are pluggable, and developed outside of the Dapr runtime in [components-contrib](https://github.com/dapr/components-contrib/tree/master/pubsub).

## Publish/Subscribe API

The API for Publish/Subscribe can be found in the [spec repo](../../reference/api/pubsub_api.md).

## Behavior and guarantees

Dapr guarantees At-Least-Once semantics for message delivery.
That means that when an application publishes a message to a topic using the Publish/Subscribe API, it can assume the message is delivered at least once to any subscriber when the response status code from that endpoint is `200`, or returns no error if using the gRPC client.

The burden of dealing with concepts like consumer groups and multiple instances inside consumer groups is all catered for by Dapr.

### App ID

Dapr has the concept of an `id`. This is specified in Kubernetes using the `dapr.io/id` annotation and with the `app-id` flag using the Dapr CLI. Dapr requires an ID to be assigned to every application.

When multiple instances of the same application ID subscribe to a topic, Dapr will make sure to deliver the message to only one instance. If two different applications with different IDs subscribe to a topic, at least one instance in each application receives a copy of the same message.

## Cloud events

Dapr follows the [Cloud Events 1.0 Spec](https://github.com/cloudevents/spec/tree/v1.0) and wraps any payload sent to a topic inside a Cloud Events envelope.

The following fields from the Cloud Events spec are implemented with Dapr:

* `id`
* `source`
* `specversion`
* `type`
* `datacontenttype` (Optional)
