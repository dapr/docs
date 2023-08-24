---
type: docs
title: "Overview of Dapr on Kubernetes"
linkTitle: "Overview"
weight: 10000
description: "Overview of how to get Dapr running on your Kubernetes cluster"
---

Dapr can be configured to run on any supported versions of Kubernetes. To achieve this, Dapr begins by deploying the following Kubernetes services, which provide first-class integration to make running applications with Dapr easy.

| Kubernetes services | Description |
| ------------------- | ----------- |
| `dapr-operator` | Manages [component]({{< ref components >}}) updates and Kubernetes services endpoints for Dapr (state stores, pub/subs, etc.) |
| `dapr-sidecar-injector` | Injects Dapr into [annotated](#adding-dapr-to-a-kubernetes-deployment) deployment pods and adds the environment variables `DAPR_HTTP_PORT` and `DAPR_GRPC_PORT` to enable user-defined applications to easily communicate with Dapr without hard-coding Dapr port values. |
| `dapr-placement` | Used for [actors]({{< ref actors >}}) only. Creates mapping tables that map actor instances to pods |
| `dapr-sentry` | Manages mTLS between services and acts as a certificate authority. For more information read the [security overview]({{< ref "security-concept.md" >}}) |

<img src="/images/overview-kubernetes.png" width=1000>

## Supported versions
Dapr support for Kubernetes is aligned with [Kubernetes Version Skew Policy](https://kubernetes.io/releases/version-skew-policy).

## Deploying Dapr to a Kubernetes cluster

Read [Deploy Dapr on a Kubernetes cluster]({{< ref kubernetes-deploy.md >}}) to learn how to deploy Dapr to your Kubernetes cluster.

## Adding Dapr to a Kubernetes deployment

Deploying and running a Dapr-enabled application into your Kubernetes cluster is as simple as adding a few annotations to the pods schema. For example, in the following example, your Kubernetes pod is annotated to:
- Give your service an `id` and `port` known to Dapr
- Turn on tracing through configuration
- Launch the Dapr sidecar container

```yml
  annotations:
    dapr.io/enabled: "true"
    dapr.io/app-id: "nodeapp"
    dapr.io/app-port: "3000"
    dapr.io/config: "tracing"
```

For more information, check [Dapr annotations]({{< ref arguments-annotations-overview.md >}}).

## Pulling container images from private registries

Dapr works seamlessly with any user application container image, regardless of its origin. Simply [initialize Dapr]({{< ref install-dapr-selfhost.md >}}) and add the [Dapr annotations]({{< ref arguments-annotations-overview.md >}}) to your Kubernetes definition to add the Dapr sidecar.

The Dapr control plane and sidecar images come from the [daprio Docker Hub](https://hub.docker.com/u/daprio) container registry, which is a public registry.

For information about:
- Pulling your application images from a private registry, reference the [official Kubernetes documentation](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/). 
- Using Azure Container Registry with Azure Kubernetes Service, reference the [AKS documentation](https://docs.microsoft.com/azure/aks/cluster-container-registry-integration).

## Tutorials

[Work through the Hello Kubernetes tutorial](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes) to learn more about getting started with Dapr on your Kubernetes cluster.

## Related links

- [Deploy Dapr to a Kubernetes cluster]({{< ref kubernetes-deploy >}})
- [Upgrade Dapr on a Kubernetes cluster]({{< ref kubernetes-upgrade >}})
- [Production guidelines for Dapr on Kubernetes]({{< ref kubernetes-production.md >}})
- [Dapr Kubernetes Quickstart](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes)
- [Use Bridge to Kubernetes to debug Dapr apps locally, while connected to your Kubernetes cluster]({{< ref bridge-to-kubernetes >}})
