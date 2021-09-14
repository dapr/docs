---
type: docs
title: "In Memory"
linkTitle: "In Memory"
description: "Detailed documentation on the In Memory pubsub component"
aliases:
  - "/operations/components/setup-pubsub/supported-pubsub/setup-inmemory/"
---

The In Memory pub/sub component is useful for development purposes and works inside of a single machine boundary.

## Component format

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
  namespace: default
spec:
  type: pubsub.in-memory
  version: v1
```

## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}}) in the Related links section
- Read [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components
- [Pub/Sub building block]({{< ref pubsub >}})
