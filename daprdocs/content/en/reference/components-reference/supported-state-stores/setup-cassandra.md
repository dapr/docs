---
type: docs
title: "Cassandra"
linkTitle: "Cassandra"
description: Detailed information on the Cassandra state store component
aliases:
  - "/operations/components/setup-state-store/supported-state-stores/setup-cassandra/"
---

## Component format

To setup Cassandra state store create a component of type `state.cassandra`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.cassandra
  version: v1
  metadata:
  - name: hosts
    value: <REPLACE-WITH-COMMA-DELIMITED-HOSTS> # Required. Example: cassandra.cassandra.svc.cluster.local
  - name: username
    value: <REPLACE-WITH-PASSWORD> # Optional. default: ""
  - name: password
    value: <REPLACE-WITH-PASSWORD> # Optional. default: ""
  - name: consistency
    value: <REPLACE-WITH-CONSISTENCY> # Optional. default: "All"
  - name: table
    value: <REPLACE-WITH-TABLE> # Optional. default: "items"
  - name: keyspace
    value: <REPLACE-WITH-KEYSPACE> # Optional. default: "dapr"
  - name: protoVersion
    value: <REPLACE-WITH-PROTO-VERSION> # Optional. default: "4"
  - name: replicationFactor
    value: <REPLACE-WITH-REPLICATION-FACTOR> #  Optional. default: "1"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| hosts             | Y        | Comma separated value of the hosts | `"cassandra.cassandra.svc.cluster.local"`.
| port              | N        |  Port for communication. Default `"9042"` | `"9042"`
| username          | Y        | The username of database user. No default | `"user"`
| password          | Y        | The password for the user  | `"password"`
| consistency       | N        | The consistency values | `"All"`, `"Quorum"`
| table             | N        | Table name. Defaults to `"items"` | `"items"`, `"tab"`
| keyspace          | N        | The cassandra keyspace to use. Defaults to `"dapr"` | `"dapr"`
| protoVersion      | N        | The proto version for the client. Defaults to `"4"` | `"3"`, `"4"`
| replicationFactor | N        | The replication factor for the calls. Defaults to `"1"` | `"3"`

## Setup Cassandra

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
You can run Cassandra locally with the Datastax Docker image:

```
docker run -e DS_LICENSE=accept --memory 4g --name my-dse -d datastax/dse-server -g -s -k
```

You can then interact with the server using `localhost:9042`.
{{% /codetab %}}

{{% codetab %}}
The easiest way to install Cassandra on Kubernetes is by using the [Helm chart](https://github.com/helm/charts/tree/master/incubator/cassandra):

```
kubectl create namespace cassandra
helm install cassandra incubator/cassandra --namespace cassandra
```

This installs Cassandra into the `cassandra` namespace by default.
To interact with Cassandra, find the service with: `kubectl get svc -n cassandra`.

For example, if installing using the example above, the Cassandra DNS would be:

`cassandra.cassandra.svc.cluster.local`
{{% /codetab %}}

{{< /tabs >}}

## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
