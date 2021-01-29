---
type: docs
title: "MongoDB"
linkTitle: "MongoDB"
description: Detailed information on the MongoDB state store component
---

## Component format

To setup MongoDB state store create a component of type `state.mongodb`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.mongodb
  version: v1
  metadata:
  - name: host
    value: <REPLACE-WITH-HOST> # Required. Example: "mongo-mongodb.default.svc.cluster.local:27017"
  - name: username
    value: <REPLACE-WITH-USERNAME> # Optional. Example: "admin"
  - name: password
    value: <REPLACE-WITH-PASSWORD> # Optional.
  - name: databaseName
    value: <REPLACE-WITH-DATABASE-NAME> # Optional. default: "daprStore"
  - name: collectionName
    value: <REPLACE-WITH-COLLECTION-NAME> # Optional. default: "daprCollection"
  - name: writeconcern
    value: <REPLACE-WITH-WRITE-CONCERN> # Optional.
  - name: readconcern
    value: <REPLACE-WITH-READ-CONCERN> # Optional.
  - name: operationTimeout
    value: <REPLACE-WITH-OPERATION-TIMEOUT> # Optional. default: "5s"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

If you wish to use MongoDB as an actor store, append the following to the yaml.

```yaml
  - name: actorStateStore
    value: "true"
```


## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| host               | Y        | The host to connect to | `"mongo-mongodb.default.svc.cluster.local:27017"`
| username           | N        | The username of the user to connect with | `"admin"`
| password           | N        | The password of the user | `"password"`
| databaseName       | N        | The name of the database to use. Defaults to `"daprStore"` | `"daprStore"`
| collectionName     | N        | The name of the collection to use. Defaults to `"daprCollection"` | `"daprCollection"`
| writeconcern       | N        | The write concern to use | `"majority"`
| readconcern        | N        | The read concern to use  | `"majority"`, `"local"`,`"available"`, `"linearizable"`, `"snapshot"`
| operationTimeout   | N        | The timeout for the operation. Defautls to `"5s"` | `"5s"`

## Setup MongoDB

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
You can run MongoDB locally using Docker:

```
docker run --name some-mongo -d mongo
```

You can then interact with the server using `localhost:27017`.
{{% /codetab %}}

{{% codetab %}}
The easiest way to install MongoDB on Kubernetes is by using the [Helm chart](https://github.com/helm/charts/tree/master/stable/mongodb):

```
helm install mongo stable/mongodb
```

This installs MongoDB into the `default` namespace.
To interact with MongoDB, find the service with: `kubectl get svc mongo-mongodb`.

For example, if installing using the example above, the MongoDB host address would be:

`mongo-mongodb.default.svc.cluster.local:27017`


Follow the on-screen instructions to get the root password for MongoDB.
The username is `admin` by default.
{{% /codetab %}}

{{< /tabs >}}

## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
