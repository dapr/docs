---
type: docs
title: "Overview"
linkTitle: "Overview"
description: "Overview on setting up of pub/sub components for Dapr"
weight: 10000
type: docs
---

Dapr integrates with pub/sub message buses to provide applications with the ability to create event-driven, loosely coupled architectures where producers send events to consumers via topics. 

Dapr supports the configuration of multiple, named, pub/sub components *per application*. Each pub/sub component has a name and this name is used when publishing a message topic. Read the [API reference]({{< ref pubsub_api.md >}}) for details on how to publish and subscribe to topics.

Pub/sub components are extensible. A list of support pub/sub components is [here]({{< ref supported-pubsub >}}) and the implementations can be found in the [components-contrib repo](https://github.com/dapr/components-contrib).

## Component files

A pub/sub is described using a `Component` file:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
  namespace: default
spec:
  type: pubsub.<NAME>
  version: v1
  metadata:
  - name: <KEY>
    value: <VALUE>
  - name: <KEY>
    value: <VALUE>
...
```

The type of pub/sub is determined by the `type` field, and properties such as connection strings and other metadata are put in the `.metadata` section.
Even though metadata values can contain secrets in plain text, it is recommended you use a [secret store]({{< ref component-secrets.md >}}) using a `secretKeyRef`.

{{% alert title="Topic creation" color="primary" %}}
Depending on the pub/sub message bus you are using and how it is configured, topics may be created automatically. Even if the message bus supports automatic topic creation, it is a common governance practice to disable it in production environments. You may still need to use a CLI, admin console, or request form to manually create the topics required by your application.
{{% /alert %}}

Visit [this guide]({{< ref "howto-publish-subscribe.md#step-3-publish-a-topic" >}}) for instructions on configuring and using pub/sub components.

## Related links

- Overview of the Dapr [Pub/Sub building block]({{< ref pubsub-overview.md >}})
- Try the [Pub/Sub tutorial sample](https://github.com/dapr/quickstarts/tree/master/tutorials/pub-sub)
- Read the [guide on publishing and subscribing]({{< ref howto-publish-subscribe.md >}})
- Learn about [topic scoping]({{< ref pubsub-scopes.md >}})
- Learn about [message time-to-live]({{< ref pubsub-message-ttl.md >}})
- Learn [how to configure Pub/Sub components with multiple namespaces]({{< ref pubsub-namespaces.md >}})
- List of [pub/sub components]({{< ref supported-pubsub >}})
- Read the [API reference]({{< ref pubsub_api.md >}})
