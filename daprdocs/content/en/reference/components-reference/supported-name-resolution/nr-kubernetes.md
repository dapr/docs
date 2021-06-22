---
type: docs
title: "Kubernetes DNS name resolution provider spec"
linkTitle: "Kubernetes DNS"
description: Detailed information on the Kubernetes DNS name resolution component
---

## Configuration format

Kubernetes DNS name resolution is configured automatically in [Kubernetes mode]({{< ref kubernetes >}}) by Dapr. There is no configuration needed to use Kubernetes DNS as your name resolution provider.

## Behaviour

The component resolves target apps by using the Kubernetes cluster's DNS provider. You can learn more in the [Kubernetes docs](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/).

## Spec configuration fields

Not applicable, as Kubernetes DNS is configured by Dapr when running in Kubernetes mode.

## Related links

- [Service invocation building block]({{< ref service-invocation >}})
- [Kubernetes DNS docs](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/)