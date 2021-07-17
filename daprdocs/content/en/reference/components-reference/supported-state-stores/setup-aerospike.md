---
type: docs
title: "Aerospike"
linkTitle: "Aerospike"
description: Detailed information on the Aerospike state store component
aliases:
  - "/operations/components/setup-state-store/supported-state-stores/setup-aerospike/"
---

## Component format

To setup Aerospike state store create a component of type `state.Aerospike`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.Aerospike
  version: v1
  metadata:
  - name: hosts
    value: <REPLACE-WITH-HOSTS> # Required. A comma delimited string of hosts. Example: "aerospike:3000,aerospike2:3000"
  - name: namespace
    value: <REPLACE-WITH-NAMESPACE> # Required. The aerospike namespace.
  - name: set
    value: <REPLACE-WITH-SET> # Optional
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| hosts              | Y        | Host name/port of database server  | `"localhost:3000"`, `"aerospike:3000,aerospike2:3000"`
| namespace          | Y        | The Aerospike namespace | `"namespace"`
| set                | N        | The setName in the database  | `"myset"`

## Setup Aerospike

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
You can run Aerospike locally using Docker:

```
docker run -d --name aerospike -p 3000:3000 -p 3001:3001 -p 3002:3002 -p 3003:3003 aerospike
```

You can then interact with the server using `localhost:3000`.
{{% /codetab %}}

{{% codetab %}}
The easiest way to install Aerospike on Kubernetes is by using the [Helm chart](https://github.com/helm/charts/tree/master/stable/aerospike):

```
helm repo add incubator http://storage.googleapis.com/kubernetes-charts-incubator
helm install --name my-aerospike --namespace aerospike stable/aerospike
```

This installs Aerospike into the `aerospike` namespace.
To interact with Aerospike, find the service with: `kubectl get svc aerospike -n aerospike`.

For example, if installing using the example above, the Aerospike host address would be:

`aerospike-my-aerospike.aerospike.svc.cluster.local:3000`
{{% /codetab %}}

{{< /tabs >}}

## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
