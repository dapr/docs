---
type: docs
title: "RethinkDB binding spec"
linkTitle: "RethinkDB"
description: "Detailed documentation on the RethinkDB binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/rethinkdb/"
---

## Component format

The [RethinkDB state store]({{<ref setup-rethinkdb.md>}}) supports transactions which means it can be used to support Dapr actors. Dapr persists only the actor's current state which doesn't allow the users to track how actor's state may have changed over time.

To enable users to track change of the state of actors, this binding leverages RethinkDB's built-in capability to monitor RethinkDB table and event on change with both the `old` and `new` state. This binding creates a subscription on the Dapr state table and streams these changes using the Dapr input binding interface.

To setup RethinkDB statechange binding create a component of type `bindings.rethinkdb.statechange`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: changes
spec:
  type: bindings.rethinkdb.statechange
  version: v1
  metadata:
  - name: address
    value: <REPLACE-RETHINKDB-ADDRESS> # Required, e.g. 127.0.0.1:28015 or rethinkdb.default.svc.cluster.local:28015).
  - name: database
    value: <REPLACE-RETHINKDB-DB-NAME> # Required, e.g. dapr (alpha-numerics only)
```

## Spec metadata fields

| Field              | Required | Binding support |  Details | Example |
|--------------------|:--------:|------------|-----|---------|
| address | Y | Input | Address of RethinkDB server | `"27.0.0.1:28015"`, `"rethinkdb.default.svc.cluster.local:28015"` |
| database | Y | Input | RethinDB database name | `"dapr"` |

## Binding support

This component only supports **input** binding interface.

## Related links

- [Combine this binding with Dapr Pub/Sub](https://github.com/mchmarny/dapr-state-store-change-handler) to stream state changes to a topic
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
