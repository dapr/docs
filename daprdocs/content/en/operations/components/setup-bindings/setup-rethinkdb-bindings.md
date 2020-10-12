---
type: docs
title: "RethinkDB binding"
linkTitle: "RethinkDB"
description: "Use bindings to RethinkDB for tracking state store changes"
weight: 4000
type: docs
---

The RethinkDB state store supports transactions which means it can be used to support Dapr actors. Dapr persists only the actor's current state which doesn't allow the users to track how actor's state may have changed over time.

To enable users to track change of the state of actors, this binding leverages RethinkDB's built-in capability to monitor RethinkDB table and event on change with both the `old` and `new` state. This binding creates a subscription on the Dapr state table and streams these changes using the Dapr input binding interface. 

## Create a binding

Create the following YAML file and save this to the `components` directory in your application directory.
(Use the `--components-path` flag with `dapr run` to point to your custom components dir)

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: changes
spec:
  type: bindings.rethinkdb.statechange
  metadata:
  - name: address
    value: <REPLACE-RETHINKDB-ADDRESS> # Required, e.g. 127.0.0.1:28015 or rethinkdb.default.svc.cluster.local:28015).
  - name: database
    value: <REPLACE-RETHINKDB-DB-NAME> # Required, e.g. dapr (alpha-numerics only)
```

For example on how to combine this binding with Dapr Pub/Sub to stream state changes to a topic see [here](https://github.com/mchmarny/dapr-state-store-change-handler).
