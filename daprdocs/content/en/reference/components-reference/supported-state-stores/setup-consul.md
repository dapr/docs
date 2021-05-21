---
type: docs
title: "HashiCorp Consul"
linkTitle: "HashiCorp Consul"
description: Detailed information on the HashiCorp Consul state store component
aliases:
  - "/operations/components/setup-state-store/supported-state-stores/setup-consul/"
---

## Component format

To setup Hashicorp Consul state store create a component of type `state.consul`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.consul
  version: v1
  metadata:
  - name: datacenter
    value: <REPLACE-WITH-DATA-CENTER> # Required. Example: dc1
  - name: httpAddr
    value: <REPLACE-WITH-CONSUL-HTTP-ADDRESS> # Required. Example: "consul.default.svc.cluster.local:8500"
  - name: aclToken
    value: <REPLACE-WITH-ACL-TOKEN> # Optional. default: ""
  - name: scheme
    value: <REPLACE-WITH-SCHEME> # Optional. default: "http"
  - name: keyPrefixPath
    value: <REPLACE-WITH-TABLE> # Optional. default: ""
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| datacenter         | Y        | Datacenter to use                     | `"dc1"`
| httpAddr           | Y        | Address of the Consul server          | `"consul.default.svc.cluster.local:8500"`
| aclToken           | N        | Per Request ACL Token. Default is `""` | `"token"`
| scheme             | N        | Scheme is the URI scheme for the Consul server. Default is `"http"` | `"http"`
| keyPrefixPath      | N        | Key prefix path in Consul. Default is `""` | `"dapr"`

## Setup HashiCorp Consul

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
You can run Consul locally using Docker:

```
docker run -d --name=dev-consul -e CONSUL_BIND_INTERFACE=eth0 consul
```

You can then interact with the server using `localhost:8500`.
{{% /codetab %}}

{{% codetab %}}
The easiest way to install Consul on Kubernetes is by using the [Helm chart](https://github.com/helm/charts/tree/master/stable/consul):

```
helm install consul stable/consul
```

This installs Consul into the `default` namespace.
To interact with Consul, find the service with: `kubectl get svc consul`.

For example, if installing using the example above, the Consul host address would be:

`consul.default.svc.cluster.local:8500`
{{% /codetab %}}

{{< /tabs >}}

## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
