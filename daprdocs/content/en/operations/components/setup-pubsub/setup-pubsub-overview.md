---
type: docs
title: "Overview"
linkTitle: "Overview"
description: "General overview on set up of message brokers for Dapr Pub/Sub"
weight: 10000
type: docs
---

Dapr integrates with pub/sub message buses to provide apps with the ability to create event-driven, loosely coupled architectures where producers send events to consumers via topics. It supports the configuration of multiple, named, pub/sub components *per application*. Each pub/sub component has a name and this name is used when publishing a message topic

Pub/Sub message buses are extensible and can be found in the [components-contrib repo](https://github.com/dapr/components-contrib).

A pub/sub in Dapr is described using a `Component` file:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
  namespace: default
spec:
  type: pubsub.<NAME>
  metadata:
  - name: <KEY>
    value: <VALUE>
  - name: <KEY>
    value: <VALUE>
...
```

The type of pub/sub is determined by the `type` field, and things like connection strings and other metadata are put in the `.metadata` section.
Even though you can put plain text secrets in there, it is recommended you use a [secret store]({{< ref component-secrets.md >}}) using a `secretKeyRef`

Visit [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components.

## Related links

- [Supported pub/sub components]({{< ref supported-pubsub >}})