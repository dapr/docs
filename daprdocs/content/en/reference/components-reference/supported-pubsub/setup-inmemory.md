---
type: docs
title: "In-memory"
linkTitle: "In-memory"
description: "Detailed documentation on the In Memory pubsub component"
aliases:
  - "/operations/components/setup-pubsub/supported-pubsub/setup-inmemory/"
---

The in-memory pub/sub component operates within a single Dapr sidecar. This is primarily meant for development purposes. State is not replicated across multiple sidecars and is lost when the Dapr sidecar is restarted.

## Component format

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
spec:
  type: pubsub.in-memory
  version: v1
  metadata: []
```

> Note: in-memory does not require any specific metadata for the component to work, however spec.metadata is a required field.

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}}) in the Related links section
- Read [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components
- [Pub/Sub building block]({{< ref pubsub >}})
