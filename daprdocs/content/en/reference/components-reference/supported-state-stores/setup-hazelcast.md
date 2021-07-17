---
type: docs
title: "Hazelcast"
linkTitle: "Hazelcast"
description: Detailed information on the Hazelcast state store component
aliases:
  - "/operations/components/setup-state-store/supported-state-stores/setup-hazelcast/"
---

## Create a Dapr component

To setup Hazelcast state store create a component of type `state.hazelcast`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.hazelcast
  version: v1
  metadata:
  - name: hazelcastServers
    value: <REPLACE-WITH-HOSTS> # Required. A comma delimited string of servers. Example: "hazelcast:3000,hazelcast2:3000"
  - name: hazelcastMap
    value: <REPLACE-WITH-MAP> # Required. Hazelcast map configuration.
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| hazelcastServers   | Y        | A comma delimited string of servers | `"hazelcast:3000,hazelcast2:3000"`
| hazelcastMap       | Y        | Hazelcast Map configuration | `"foo-map"`

## Setup Hazelcast

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
You can run Hazelcast locally using Docker:

```
docker run -e JAVA_OPTS="-Dhazelcast.local.publicAddress=127.0.0.1:5701" -p 5701:5701 hazelcast/hazelcast
```

You can then interact with the server using the `127.0.0.1:5701`.
{{% /codetab %}}

{{% codetab %}}
The easiest way to install Hazelcast on Kubernetes is by using the [Helm chart](https://github.com/helm/charts/tree/master/stable/hazelcast).
{{% /codetab %}}

{{< /tabs >}}

## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
