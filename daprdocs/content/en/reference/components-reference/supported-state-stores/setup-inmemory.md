---
type: docs
title: "In Memory"
linkTitle: "In Memory"
description: "Detailed documentation on the In Memory state component"
aliases:
  - "/operations/components/setup-state-store/supported-state-stores/setup-inmemory/"
---

The In Memory state store component is useful for development purposes and works inside of a single machine boundary.

This component **shouldn't be used for production**. It is developer only and will never be stable. If you come across a scenario and want to use it in production, you can submit an issue and discuss it with the community.

## Component format
To setup in-memory state store, create a component of type `state.in-memory`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.in-memory
  version: v1
  metadata: []
```

> Note: While in-memory does not require any specific metadata for the component to work, `spec.metadata` is a required field.

## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Learn [how to create and configure state store components]({{< ref howto-get-save-state.md >}}) 
- Read more about the [state management building block]({{< ref state-management >}})
