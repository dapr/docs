---
type: docs
title: "Memcached"
linkTitle: "Memcached"
description: Detailed information on the Memcached state store component
aliases:
  - "/operations/components/setup-state-store/supported-state-stores/setup-memcached/"
---

## Component format

To setup Memcached state store create a component of type `state.memcached`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.memcached
  version: v1
  metadata:
  - name: hosts
    value: <REPLACE-WITH-COMMA-DELIMITED-ENDPOINTS> # Required. Example: "memcached.default.svc.cluster.local:11211"
  - name: maxIdleConnections
    value: <REPLACE-WITH-MAX-IDLE-CONNECTIONS> # Optional. default: "2"
  - name: timeout
    value: <REPLACE-WITH-TIMEOUT> # Optional. default: "1000ms"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| hosts              | Y        | Comma delimited endpoints | `"memcached.default.svc.cluster.local:11211"`
| maxIdleConnections | N        | The max number of idle connections. Defaults to `"2"` | `"3"`
| timeout            | N        | The timeout for the calls. Defaults to `"1000ms"` | `"1000ms"`

## Setup Memcached

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
You can run Memcached locally using Docker:

```
docker run --name my-memcache -d memcached
```

You can then interact with the server using `localhost:11211`.
{{% /codetab %}}

{{% codetab %}}
The easiest way to install Memcached on Kubernetes is by using the [Helm chart](https://github.com/helm/charts/tree/master/stable/memcached):

```
helm install memcached stable/memcached
```

This installs Memcached into the `default` namespace.
To interact with Memcached, find the service with: `kubectl get svc memcached`.

For example, if installing using the example above, the Memcached host address would be:

`memcached.default.svc.cluster.local:11211`
{{% /codetab %}}

{{< /tabs >}}

## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
