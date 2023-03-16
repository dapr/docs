---
type: docs
title: "Etcd"
linkTitle: "Etcd"
description: Detailed information on the Etcd state store component
aliases:
- "/operations/components/setup-state-store/supported-state-stores/setup-etcd/"
---

## Component format

To setup Etcd state store create a component of type `state.etcd`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: state.etcd
  version: v1
  metadata:
  - name: endpoints
    value: <CONNECTION STRING> # Required. Example: 192.168.0.1:2379,192.168.0.2:2379,192.168.0.3:2379
  - name: keyPrefixPath
    value: <KEY PREFIX STRING> # Optional. default: "". Example: "dapr"
  - name: tlsEnable
    value: <ENABLE TLS> # Optional. Example: "false"
  - name: ca
    value: <CA> # Optional.
  - name: cert
    value: <CERT> # Optional.
  - name: key
    value: <KEY> # Optional.
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| endpoints          | Y        | Connection string to Etcd server | `"192.168.0.1:2379,192.168.0.2:2379,192.168.0.3:2379"`
| keyPrefixPath      | N        | Key prefix path in Etcd. Default is `""` | `"dapr"`
| tlsEnable          | N        | Whether to enable tls  | `"false"`
| ca                 | N        | Contents of Etcd server CA file | `"ca value"`
| cert               | N        | Contents of Etcd server certificate file | `"cert value"`
| key                | N        | Contents of Etcd server key file | `"key value"`

## Setup Etcd

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}

You can run Etcd locally using Docker Compose:
```
version: '2'
services:
  etcd:
    image: gcr.io/etcd-development/etcd:v3.4.20
    ports:
      - "12379:2379"
    command: etcd --listen-client-urls http://0.0.0.0:2379 --advertise-client-urls http://0.0.0.0:2379```
```
You can then interact with the server using `localhost:12379`.

{{% /codetab %}}

{{% codetab %}}

We can use [Helm](https://helm.sh/) to quickly create an Etcd instance in our Kubernetes cluster. This approach requires [Installing Helm](https://github.com/helm/helm#install).

Follow the instructions [here](https://github.com/bitnami/charts/tree/main/bitnami/etcd) to get started with setting up Etcd in Kubernetes.

{{% /codetab %}}

{{< /tabs >}}

## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
