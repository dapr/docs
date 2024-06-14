---
type: docs
title: "In-memory"
linkTitle: "In-memory"
description: "Detailed documentation on the in-memory state component"
aliases:
  - "/operations/components/setup-state-store/supported-state-stores/setup-inmemory/"
---

The in-memory state store component maintains state in the Dapr sidecar's memory. This is primarily meant for development purposes. State is not replicated across multiple sidecars and is lost when the Dapr sidecar is restarted.

## Component format

To setup in-memory state store, create a component of type `state.in-memory`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: state.in-memory
  version: v1
  metadata: 
  # Uncomment this if you wish to use In-memory as a state store for actors (optional)
  #- name: actorStateStore
  #  value: "true"
```

> Note: While in-memory does not require any specific metadata for the component to work, `spec.metadata` is a required field.

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Learn [how to create and configure state store components]({{< ref howto-get-save-state.md >}}) 
- Read more about the [state management building block]({{< ref state-management >}})
