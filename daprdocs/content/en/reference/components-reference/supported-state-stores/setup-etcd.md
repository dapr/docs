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
    value: <CA> # Optional. Required if tlsEnable is `true`.
  - name: cert
    value: <CERT> # Optional. Required if tlsEnable is `true`.
  - name: key
    value: <KEY> # Optional. Required if tlsEnable is `true`.
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
| ca                 | N        | Contents of Etcd server CA file. Can be `secretKeyRef` to use a [secret reference]({{< ref component-secrets.md >}}).| `"-----BEGIN CERTIFICATE-----\nMIIC9TCCA..."`
| cert               | N        | Contents of Etcd server certificate file. Can be `secretKeyRef` to use a [secret reference]({{< ref component-secrets.md >}}).| `"-----BEGIN CERTIFICATE-----\nMIIDUTCC..."`
| key                | N        | Contents of Etcd server key file. Can be `secretKeyRef` to use a [secret reference]({{< ref component-secrets.md >}}).| `"-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIB..."`

## Setup Etcd

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}

You can run Etcd database locally using Docker Compose. Create a new file called `docker-compose.yml` and add the following contents as an example:

```
version: '2'
services:
  etcd:
    image: gcr.io/etcd-development/etcd:v3.4.20
    ports:
      - "12379:2379"
    command: etcd --listen-client-urls http://0.0.0.0:2379 --advertise-client-urls http://0.0.0.0:2379```
```
Save the `docker-compose.yml` file and run the following command to start the Etcd server:

```
docker-compose up -d
```

This starts the Etcd server in the background and expose the default Etcd port of `2379`. You can then interact with the server using the `etcdctl` command-line client on `localhost:12379`. For example:

```
etcdctl --endpoints=localhost:2379 put mykey myvalue
```

{{% /codetab %}}

{{% codetab %}}

Use [Helm](https://helm.sh/) to quickly create an Etcd instance in your Kubernetes cluster. This approach requires [Installing Helm](https://github.com/helm/helm#install).

Follow the [Bitnami instructions](https://github.com/bitnami/charts/tree/main/bitnami/etcd) to get started with setting up Etcd in Kubernetes.

{{% /codetab %}}

{{< /tabs >}}

## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
