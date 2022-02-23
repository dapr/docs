---
type: docs
title: "JetStream KV"
linkTitle: "JetStream KV"
description: Detailed information on the JetStream KV state store component
aliases:
  - "/operations/components/setup-state-store/supported-state-stores/setup-nats-jetstream-kv/"
---

## Component format

To setup a JetStream KV state store create a component of type `state.jetstream`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.jetstream
  version: v1
  metadata:
  - name: natsURL
    value: "nats://localhost:4222"
  - name: jwt
    value: "eyJhbGciOiJ...6yJV_adQssw5c" # Optional. Used for decentralized JWT authentication
  - name: seedKey
    value: "SUACS34K232O...5Z3POU7BNIL4Y" # Optional. Used for decentralized JWT authentication
  - name: bucket
    value: "<bucketName>"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadatafield

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| natsURL            |        Y | NATS server address URL | "`nats://localhost:4222`"|
| jwt                |        N | NATS decentralized authentication JWT | "`eyJhbGciOiJ...6yJV_adQssw5c`"|
| seedKey            |        N | NATS decentralized authentication seed key | "`SUACS34K232O...5Z3POU7BNIL4Y`"|
| bucket             |        Y | JetStream KV bucket name | `"<bucketName>"`|

## Create a NATS server

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
You can run a NATS Server with JetStream enabled locally using Docker:

```bash
docker run -d -p 4222:4222 nats:latest -js
```

You can then interact with the server using the client port: `localhost:4222`.
{{% /codetab %}}

{{% codetab %}}
Install NATS JetStream on Kubernetes by using the [helm](https://github.com/nats-io/k8s/tree/main/helm/charts/nats#jetstream):

```bash
helm repo add nats https://nats-io.github.io/k8s/helm/charts/
helm install my-nats nats/nats
```

This installs a single NATS server into the `default` namespace. To interact
with NATS, find the service with: `kubectl get svc my-nats`.
{{% /codetab %}}

{{< /tabs >}}

## Creating a JetStream KV bucket

It is necessary to create a key value bucket, this can easily done via NATS CLI.

```bash
nats kv add <bucketName>
```

## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
- [JetStream Documentation](https://docs.nats.io/nats-concepts/jetstream)
- [Key Value Store Documentation](https://docs.nats.io/nats-concepts/jetstream/key-value-store)
- [NATS CLI](https://github.com/nats-io/natscli)
