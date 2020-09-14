# Setup a Dapr state store

Dapr integrates with existing databases to provide apps with state management capabilities for CRUD operations, transactions and more.
Currently, Dapr supports the configuration of one state store per cluster.

State stores are extensible and can be found in the [components-contrib repo](https://github.com/dapr/components-contrib).

A state store in Dapr is described using a `Component` file:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: default
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
Even though you can put plain text secrets in there, it is recommended you use a [secret store](../../concepts/secrets/README.md).

## Running locally

When running locally with the Dapr CLI, a component file for a Redis state store will be automatically created in a `components` directory in your current working directory.

You can make changes to this file the way you see fit, whether to change connection values or replace it with a different store.

## Running in Kubernetes

Dapr uses a Kubernetes Operator to update the sidecars running in the cluster with different components.
To setup a state store in Kubernetes, use `kubectl` to apply the component file:

```bash
kubectl apply -f statestore.yaml
```
 ## Related Topics
*  [State management concepts](../../concepts/state-management/README.md)
* [State management API specification](../../reference/api/state_api.md)

## Reference

* [Setup Aerospike](./setup-aerospike.md)
* [Setup Cassandra](./setup-cassandra.md)
* [Setup Cloudstate](./setup-cloudstate.md)
* [Setup Couchbase](./setup-couchbase.md)
* [Setup etcd](./setup-etcd.md)
* [Setup Hashicorp Consul](./setup-consul.md)
* [Setup Hazelcast](./setup-hazelcast.md)
* [Setup Memcached](./setup-memcached.md)
* [Setup MongoDB](./setup-mongodb.md)
* [Setup PostgreSQL](./setup-postgresql.md)
* [Setup Redis](./setup-redis.md)
* [Setup Zookeeper](./setup-zookeeper.md)
* [Setup Azure CosmosDB](./setup-azure-cosmosdb.md)
* [Setup Azure SQL Server](./setup-sqlserver.md)
* [Setup Azure Table Storage](./setup-azure-tablestorage.md)
* [Setup Azure Blob Storage](./setup-azure-blobstorage.md)
* [Setup Google Cloud Firestore (Datastore mode)](./setup-firestore.md)
* [Supported State Stores](./supported-state-stores.md)
