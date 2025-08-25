---
type: docs
title: "Isolation"
linkTitle: "Isolation"
weight: 700
description: How Dapr provides namespacing and isolation
---

Dapr namespacing provides isolation and multi-tenancy across many capabilities, giving greater security. Typically applications and components are deployed to namespaces to provide isolation in a given environment, such as Kubernetes. 

Dapr supports namespacing in service invocation calls between applications, when accessing components, sending pub/sub messages in consumer groups, and with actors type deployments as examples. Namespacing isolation is supported in both self-hosted and Kubernetes modes. 

To get started, create and configure your namespace.

{{< tabpane text=true >}}

{{% tab header="Self-Hosted" %}}

In self-hosted mode, specify the namespace for a Dapr instance by setting the `NAMESPACE` environment variable.

{{% /tab %}}

{{% tab header="Kubernetes" %}}

On Kubernetes, create and configure the namespace:

```bash
kubectl create namespace namespaceA
kubectl config set-context --current --namespace=namespaceA
```

Then deploy your applications into this namespace.

{{% /tab %}}

{{< /tabpane >}}

Learn how to use namespacing throughout Dapr:

- [Service Invocation namespaces]({{% ref service-invocation-namespaces %}})
- [How to: Set up pub/sub namespace consumer groups]({{% ref howto-namespace %}})
- Components:
  - [How to: Configure pub/sub components with multiple namespaces]({{% ref pubsub-namespaces %}})
  - [Scope components to one or more applications]({{% ref component-scopes %}})
