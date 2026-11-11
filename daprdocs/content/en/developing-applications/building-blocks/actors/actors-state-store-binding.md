---
type: docs
title: "Bind actor types to state stores"
linkTitle: "State store binding"
weight: 45
description: "Keep the state of specific actor types in their own state stores"
---

By default, the state of every actor type is kept in the single state store marked with `actorStateStore: "true"`. With `spec.actors.stateStores` in a [Configuration]({{% ref configuration-schema.md %}}), you can bind actor types to other state stores, so that each bound actor type keeps its state in its own store.

This is useful when actor types have different load or data profiles. For example, you can keep a high-write `TransactionActor` and a read-mostly `BalanceActor` in separate stores, so that one does not slow down the other, or so that each can be tuned and scaled independently.

## Configure the bindings

Declare the state store components as usual. Exactly one of them keeps `actorStateStore: "true"`: it is the default actor state store, and it is still required.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: actorstore
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: actorStateStore
    value: "true"
---
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: wallet-transactions
spec:
  type: state.postgresql
  version: v2
  metadata:
  - name: connectionString
    value: "<CONNECTION-STRING>"
---
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: wallet-balance
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: balance-redis:6379
```

Then bind the actor types to the stores in the Configuration of the app that hosts them:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: wallet
spec:
  actors:
    stateStores:
    - name: wallet-transactions
      actorTypes: ["TransactionActor", "AuditActor"]
    - name: wallet-balance
      actorTypes: ["BalanceActor"]
```

| Field | Required | Description |
|-------|:--------:|-------------|
| `stateStores` | N | List of bindings. |
| `stateStores[].name` | Y | Name of the state store component that keeps the state of the listed actor types. |
| `stateStores[].actorTypes` | Y | Actor types whose state is kept in this store. |

With this configuration, `TransactionActor` and `AuditActor` keep their state in `wallet-transactions`, `BalanceActor` in `wallet-balance`, and every other actor type in `actorstore`. Without `spec.actors.stateStores`, nothing changes.

The bindings do not change the [actors API]({{% ref actors_api %}}) or the actor SDKs: apps keep reading and writing actor state as before, and Dapr routes each request to the store bound to its actor type.

## Behavior

- **No fallback.** A bound actor type uses only its bound store. If that store is not loaded, the actor type's state operations fail with `ERR_ACTOR_STATE_STORE_NOT_FOUND` (HTTP `500`, gRPC `Internal`), whose message names the actor type and the store. Its state is never written to the default actor state store.
- **The default actor state store is still required.** Actor hosting, placement, reminders and workflows depend on it, as before.
- **Startup warning.** If a bound store is not loaded when the sidecar starts, Dapr logs a warning such as `Actor type TransactionActor is bound to state store wallet-transactions, which is not loaded`, and keeps starting.
- **Hot reloading.** When [hot reloading]({{% ref "component-updates.md" %}}) is enabled, adding, updating or removing a bound state store component takes effect without restarting the sidecar. Removing it fails only the actor types bound to it; adding it back makes their existing state available again. Changing `spec.actors.stateStores` itself is a Configuration change, which gracefully restarts the sidecar like any other.
- **Store requirements.** Like the default actor state store, a bound store must support transactions and ETags, for every state operation including reads. See the [state store components]({{% ref supported-state-stores %}}) for the stores that support both.

## Validation

The sidecar refuses to start if `spec.actors.stateStores` is not valid:

- Each binding must have a `name` and at least one non-empty actor type.
- An actor type can be listed only once in a binding, and can be bound to only one state store.
- Internal actor types, such as the ones Dapr uses for workflows (`dapr.internal.*`), cannot be bound: their state always stays in the default actor state store.

On Kubernetes, the Configuration resource also rejects an empty `name`, an empty `actorTypes` list and an empty actor type when it is applied.

## Related links

- [Actors overview]({{% ref actors-overview.md %}})
- [Configuration spec]({{% ref configuration-schema.md %}})
- [Error codes reference]({{% ref error-codes-reference.md %}})
