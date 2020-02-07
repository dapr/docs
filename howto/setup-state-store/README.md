# Setup a Dapr state store

Dapr integrates with existing databases to provide apps with state management capabilities for CRUD operations, transactions and more.
Currently, Dapr supports the configuration of one state store per cluster.

State stores are extensible and can be found in the [components-contrib repo](https://github.com/dapr/components-contrib).

A state store in Dapr is described using a `Component` file:

```
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.<DATABASE>
  metadata:
  - name: <KEY>
    value: <VALUE>
  - name: <KEY>
    value: <VALUE>
...
```

The type of database is determined by the `type` field, and things like connection strings and other metadata are put in the `.metadata` section.
Even though you can put plain text secrets in there, it is recommended you use a [secret store](../../concepts/components/secrets.md).

## Running locally

When running locally with the Dapr CLI, a component file for a Redis state store will be automatically created in a `components` directory in your current working directory.

You can make changes to this file the way you see fit, whether to change connection values or replace it with a different store.

## Running in Kubernetes

Dapr uses a Kubernetes Operator to update the sidecars running in the cluster with different components.
To setup a state store in Kubernetes, use `kubectl` to apply the component file:

```
kubectl apply -f statestore.yaml
```

## Reference

* [Setup Redis](./setup-redis.md)
* [Setup Cassandra](./setup-cassandra.md)
* [Setup etcd](./setup-etcd.md)
* [Setup Consul](./setup-consul.md)
* [Setup Memcached](./setup-memcached.md)
* [Setup Azure CosmosDB](./setup-azure-cosmosdb.md)
* [Setup Azure Table Storage](./setup-azure-tablestorage.md)
* [Setup Google Cloud Firestore (Datastore mode)](./setup-firestore.md)
* [Setup MongoDB](./setup-mongodb.md)
* [Setup Zookeeper](./setup-zookeeper.md)
* [Setup Aerospike](./setup-aerospike.md)
* [Setup Hazelcast](./setup-hazelcast.md)
* [Supported State Stores](./supported-state-stores.md)
