---
type: docs
title: "MongoDB"
linkTitle: "MongoDB"
description: Detailed information on the MongoDB state store component
aliases:
  - "/operations/components/setup-state-store/supported-state-stores/setup-mongodb/"
---

## Component format

To setup MongoDB state store create a component of type `state.mongodb`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: state.mongodb
  version: v1
  metadata:
  - name: server
    value: <REPLACE-WITH-SERVER> # Required unless "host" field is set . Example: "server.example.com"
  - name: host
    value: <REPLACE-WITH-HOST> # Required unless "server" field is set . Example: "mongo-mongodb.default.svc.cluster.local:27017"
  - name: username
    value: <REPLACE-WITH-USERNAME> # Optional. Example: "admin"
  - name: password
    value: <REPLACE-WITH-PASSWORD> # Optional.
  - name: databaseName
    value: <REPLACE-WITH-DATABASE-NAME> # Optional. default: "daprStore"
  - name: collectionName
    value: <REPLACE-WITH-COLLECTION-NAME> # Optional. default: "daprCollection"
  - name: writeConcern
    value: <REPLACE-WITH-WRITE-CONCERN> # Optional.
  - name: readConcern
    value: <REPLACE-WITH-READ-CONCERN> # Optional.
  - name: operationTimeout
    value: <REPLACE-WITH-OPERATION-TIMEOUT> # Optional. default: "5s"
  - name: params
    value: <REPLACE-WITH-ADDITIONAL-PARAMETERS> # Optional. Example: "?authSource=daprStore&ssl=true"
  # Uncomment this if you wish to use MongoDB as a state store for actors (optional)
  #- name: actorStateStore
  #  value: "true"

```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

### Actor state store and transactions support

When using as an actor state store or to leverage transactions, MongoDB must be running in a [Replica Set](https://www.mongodb.com/docs/manual/replication/).

If you wish to use MongoDB as an actor store, add this metadata option to your Component YAML:

```yaml
  - name: actorStateStore
    value: "true"
```

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| server             | Y<sup>1</sup> | The server to connect to, when using DNS SRV record | `"server.example.com"`
| host               | Y<sup>1</sup> | The host to connect to | `"mongo-mongodb.default.svc.cluster.local:27017"`
| username           | N        | The username of the user to connect with (applicable in conjunction with `host`) | `"admin"`
| password           | N        | The password of the user (applicable in conjunction with `host`) | `"password"`
| databaseName       | N        | The name of the database to use. Defaults to `"daprStore"` | `"daprStore"`
| collectionName     | N        | The name of the collection to use. Defaults to `"daprCollection"` | `"daprCollection"`
| writeConcern       | N        | The write concern to use | `"majority"`
| readConcern        | N        | The read concern to use  | `"majority"`, `"local"`,`"available"`, `"linearizable"`, `"snapshot"`
| operationTimeout   | N        | The timeout for the operation. Defaults to `"5s"` | `"5s"`
| params             | N<sup>2</sup> | Additional parameters to use | `"?authSource=daprStore&ssl=true"`
| actorStateStore    | N        | Consider this state store for actors. Defaults to `"false"` | `"true"`, `"false"`

> <sup>[1]</sup> The `server` and `host` fields are mutually exclusive. If neither or both are set, Dapr returns an error.

> <sup>[2]</sup> The `params` field accepts a query string that specifies connection specific options as `<name>=<value>` pairs, separated by `&` and prefixed with `?`. e.g. to use "daprStore" db as authentication database and enabling SSL/TLS in connection, specify params as `?authSource=daprStore&ssl=true`. See [the mongodb manual](https://docs.mongodb.com/manual/reference/connection-string/#std-label-connections-connection-options) for the list of available options and their use cases.

## Setup MongoDB

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
You can run a single MongoDB instance locally using Docker:

```sh
docker run --name some-mongo -d mongo
```

You can then interact with the server at `localhost:27017`. If you do not specify a `databaseName` value in your component definition, make sure to create a database named `daprStore`.

In order to use the MongoDB state store for transactions and as an actor state store, you need to run MongoDB as a Replica Set. Refer to [the official documentation](https://www.mongodb.com/compatibility/deploying-a-mongodb-cluster-with-docker) for how to create a 3-node Replica Set using Docker.
{{% /codetab %}}

{{% codetab %}}
You can conveniently install MongoDB on Kubernetes using the [Helm chart packaged by Bitnami](https://github.com/bitnami/charts/tree/main/bitnami/mongodb/). Refer to the documentation for the Helm chart for deploying MongoDB, both as a standalone server, and with a Replica Set (required for using transactions and actors).
This installs MongoDB into the `default` namespace.
To interact with MongoDB, find the service with: `kubectl get svc mongo-mongodb`.
For example, if installing using the Helm defaults above, the MongoDB host address would be:
`mongo-mongodb.default.svc.cluster.local:27017`
Follow the on-screen instructions to get the root password for MongoDB.
The username is typically `admin` by default.
{{% /codetab %}}

{{< /tabs >}}

### TTLs and cleanups

This state store supports [Time-To-Live (TTL)]({{< ref state-store-ttl.md >}}) for records stored with Dapr. When storing data using Dapr, you can set the `ttlInSeconds` metadata property to indicate when the data should be considered "expired".

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
