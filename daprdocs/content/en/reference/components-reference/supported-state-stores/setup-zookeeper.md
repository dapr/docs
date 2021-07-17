---
type: docs
title: "Zookeeper"
linkTitle: "Zookeeper"
description: Detailed information on the Zookeeper state store component
aliases:
  - "/operations/components/setup-state-store/supported-state-stores/setup-zookeeper/"
---

## Component format

To setup Zookeeper state store create a component of type `state.zookeeper`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.zookeeper
  version: v1
  metadata:
  - name: servers
    value: <REPLACE-WITH-COMMA-DELIMITED-SERVERS> # Required. Example: "zookeeper.default.svc.cluster.local:2181"
  - name: sessionTimeout
    value: <REPLACE-WITH-SESSION-TIMEOUT> # Required. Example: "5s"
  - name: maxBufferSize
    value: <REPLACE-WITH-MAX-BUFFER-SIZE> # Optional. default: "1048576"
  - name: maxConnBufferSize
    value: <REPLACE-WITH-MAX-CONN-BUFFER-SIZE> # Optional. default: "1048576"
  - name: keyPrefixPath
    value: <REPLACE-WITH-KEY-PREFIX-PATH> # Optional.
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| servers            | Y        | Comma delimited list of servers | `"zookeeper.default.svc.cluster.local:2181"`
| sessionTimeout     | Y        | The session timeout value       | `"5s"`
| maxBufferSize      | N        | The maximum size of buffer. Defaults to `"1048576"` | `"1048576"`
| maxConnBufferSize  | N        | The maximum size of connection buffer. Defaults to `"1048576`" | `"1048576"`
| keyPrefixPath      | N        | The key prefix path in Zookeeper. No default | `"dapr"`

## Setup Zookeeper

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
You can run Zookeeper locally using Docker:

```
docker run --name some-zookeeper --restart always -d zookeeper
```

You can then interact with the server using `localhost:2181`.
{{% /codetab %}}

{{% codetab %}}
The easiest way to install Zookeeper on Kubernetes is by using the [Helm chart](https://github.com/helm/charts/tree/master/incubator/zookeeper):

```
helm repo add incubator http://storage.googleapis.com/kubernetes-charts-incubator
helm install zookeeper incubator/zookeeper
```

This installs Zookeeper into the `default` namespace.
To interact with Zookeeper, find the service with: `kubectl get svc zookeeper`.

For example, if installing using the example above, the Zookeeper host address would be:

`zookeeper.default.svc.cluster.local:2181`
{{% /codetab %}}

{{< /tabs >}}


## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
