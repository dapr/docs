---
type: docs
title: "Isolation"
linkTitle: "Isolation"
weight: 700
description: How Dapr provides namespacing and isolation
---

Dapr namespacing provides isolation and multi-tenancy. Dapr supports namespaced service invocation, components, pub/sub, and actors in both self-hosted mode and on Kubernetes. 

To get started, create and configure your namespace.

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}

In self-hosted mode, specify the namespace for a Dapr instance by setting the `NAMESPACE` environment variable.

{{% /codetab %}}

{{% codetab %}}

On Kubernetes, create and configure the namespace:

```bash
kubectl create namespace namespaceA
kubectl config set-context --current --namespace=namespaceA
```

Then deploy your applications into this namespace.

{{% /codetab %}}

{{< /tabs >}}

Learn how to use namespacing throughout Dapr:

- [Service Invocation namespaces]({{< ref service-invocation-namespaces.md >}})
- [Scope pub/sub topic access]({{< ref pubsub-scopes.md >}})
- [Scope components to one or more applications]({{< ref component-scopes.md >}})
- [Namespaced actors](todo)