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
- **The default actor state store is still required.** Actor hosting, placement, reminders and workflows depend on it, as before, even when every actor type is bound.
- **Startup warning.** If a bound store is not loaded when the sidecar starts, Dapr logs a warning such as `Actor type TransactionActor is bound to state store wallet-transactions, which is not loaded`, and keeps starting.
- **Hot reloading.** When [hot reloading]({{% ref "component-updates.md" %}}) is enabled, adding, updating or removing a bound state store component takes effect without restarting the sidecar. Removing it fails only the actor types bound to it; adding it back makes their existing state available again. Changing `spec.actors.stateStores` itself is a Configuration change, which gracefully restarts the sidecar like any other.
- **Actors are deactivated when their bound store is removed or reloaded.** So that no actor keeps state it read from the previous store, Dapr deactivates the active actors of the actor types bound to the store. In-flight calls to those actors are drained as in a rebalance: with `drainRebalancedActors` enabled, they get `drainOngoingCallTimeout` to complete. The actors reactivate on their next call. Adding a bound store that was not loaded deactivates nothing.
- **Timers do not survive a reload of the bound store.** [Actor timers]({{% ref "actors-timers-reminders.md" %}}) of the deactivated actors are deleted, and nothing registers them again. If an actor of a bound type needs periodic work to continue across a reload, register its timers again when it activates, or use reminders, which are persisted.
- **Store requirements.** Like the default actor state store, a bound store must support transactions and ETags, for every state operation including reads. See the [state store components]({{% ref supported-state-stores %}}) for the stores that support both.

## Validation

The sidecar refuses to start if `spec.actors.stateStores` is not valid:

- Each binding must have a `name` and at least one non-empty actor type.
- An actor type can be listed only once in a binding, and can be bound to only one state store.
- Internal actor types, such as the ones Dapr uses for workflows (`dapr.internal.*`), cannot be listed. To bind the workflow actor types, use [`spec.workflow.stateStore`](#bind-workflow-state-to-a-state-store).

On Kubernetes, the Configuration resource also rejects an empty `name`, an empty `actorTypes` list and an empty actor type when it is applied.

## Bind workflow state to a state store

[Dapr Workflow]({{% ref workflow-overview.md %}}) keeps its state in internal actors. With `spec.workflow.stateStore`, you bind all the workflow actor types of an app to one state store, without naming them:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: wallet
spec:
  workflow:
    stateStore: wallet-workflows
```

The state of the app's workflows and activities is then kept in `wallet-workflows`, and listing and purging workflow instances use that store too. You can combine it with `spec.actors.stateStores` in the same Configuration, to keep workflow state apart from the state of your own actors.

The behavior described above applies, with these differences:

- A workflow's state moves as one unit. You cannot keep parts of it, such as its history, in a different store.
- Workflow operations fail with an error that names the store when the bound store is not loaded, or does not support transactions and ETags.
- In a [multi-app workflow]({{% ref workflow-multi-app.md %}}), each app keeps the state of its own workflows and activities in the store of its own Configuration.

{{% alert title="Warning" color="warning" %}}
Setting or changing `spec.workflow.stateStore` does not migrate state. The workflows started with another store stay in that store, where Dapr no longer reads, lists or purges them: they are not found and do not continue. Set or change it only when the app has no workflows in progress.
{{% /alert %}}

## Roll out a binding

Each sidecar applies the bindings of its own Configuration, and the placement service does not know about them. Follow these rules to keep the replicas of an app consistent:

- **Use the same bindings on every replica of an app.** If replicas disagree, for example during a rolling update that changes a binding, an actor that moves between them reads and writes a different store.
- **Binding an actor type that has no state yet is safe.** Binding or rebinding an actor type that already has state does not migrate it: stop all the replicas of the app and copy the state to the new store first. Actor state keys do not depend on the store, so the keys can be copied as they are.
- **On Kubernetes, upgrade the Configuration CRD before using the fields.** With a CRD from a Dapr version that does not have them, Kubernetes drops the fields when the Configuration is applied, and every actor type uses the default actor state store. Helm does not upgrade CRDs on its own: see [upgrading Dapr on Kubernetes]({{% ref kubernetes-upgrade.md %}}).
- **A sidecar from a Dapr version without this feature ignores the bindings** and uses the default actor state store. Take this into account before rolling back.

## Verify the bindings

The [metadata API]({{% ref metadata_api.md %}}) reports the bindings that the sidecar applies under `actorRuntime.stateStores`, with the actor types of each store and whether the store is usable:

```shell
curl http://localhost:3500/v1.0/metadata
```

```json
{
  "actorRuntime": {
    "runtimeStatus": "RUNNING",
    "hostReady": true,
    "placement": "placement: connected",
    "stateStores": [
      {
        "name": "wallet-balance",
        "actorTypes": ["BalanceActor"],
        "usable": false,
        "error": "the state store is not loaded"
      },
      {
        "name": "wallet-transactions",
        "actorTypes": ["AuditActor", "TransactionActor"],
        "usable": true
      }
    ]
  }
}
```

A binding that is missing from the list was not applied, for example because the Configuration CRD is outdated. A store with `"usable": false` cannot keep actor state, and the state operations of its actor types fail: `error` says whether the store is not loaded, or does not support transactions and ETags. With `spec.workflow.stateStore`, the list includes the store with the internal workflow actor types of the app.

## Separate actor types within one database server

A binding names a state store component, and a component already defines where its data is kept. To separate actor types inside one server, declare one component per table, collection, database or prefix:

| State store | Setting to separate | What is separated |
|-------------|---------------------|-------------------|
| Azure Cosmos DB | `database`, `collection` | Container |
| AWS DynamoDB | `table` | Table |
| CockroachDB | `tableName` | Table |
| etcd | `keyPrefixPath` | Key prefix |
| MongoDB | `databaseName`, `collectionName` | Database or collection |
| MySQL and MariaDB | `tableName`, `schemaName` | Table or schema |
| Oracle Database | `tableName` | Table |
| PostgreSQL v1 | `tableName` | Table |
| PostgreSQL v2 | `tablePrefix` | Table |
| RavenDB | `DatabaseName` | Database |
| Redis | `redisDB` | Key namespace |
| SQL Server | `tableName`, `schemaName` | Table or schema |
| SQLite | `tableName`, or a separate file | Table or file |

How much this isolates depends on the store. Separate tables or collections have their own indexes and storage. A key prefix or a Redis database only organizes the keys. For full isolation, point each component at a different server.

Keep in mind:

- **On SQL stores, give each component its own `metadataTableName`.** PostgreSQL v1 and SQLite record the schema migrations of a component under a fixed key of the metadata table, so a second component on the same metadata table does not create its state table. PostgreSQL v1, MySQL, SQL Server and SQLite also keep one time-to-live cleanup record per metadata table. PostgreSQL v2 includes `tablePrefix` in both keys, so its components can share the metadata table.
- **Each component opens its own connections.** Account for the number of components times the number of sidecars in the connection limits of the server.

## Related links

- [Actors overview]({{% ref actors-overview.md %}})
- [Configuration spec]({{% ref configuration-schema.md %}})
- [Metadata API reference]({{% ref metadata_api.md %}})
- [Workflow architecture]({{% ref workflow-architecture.md %}})
- [Error codes reference]({{% ref error-codes-reference.md %}})
