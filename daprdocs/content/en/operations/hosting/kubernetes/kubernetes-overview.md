---
type: docs
title: "Overview of Dapr on Kubernetes"
linkTitle: "Overview"
weight: 10000
description: "Overview of how to get Dapr running on your Kubernetes cluster"
---

## Dapr on Kubernetes

Dapr can be configured to run on any supported versions of Kubernetes. To achieve this, Dapr begins by deploying the `dapr-sidecar-injector`, `dapr-operator`, `dapr-placement`, and `dapr-sentry` Kubernetes services. These provide first-class integration to make running applications with Dapr easy.
- **dapr-operator:** Manages [component]({{< ref components >}}) updates and Kubernetes services endpoints for Dapr (state stores, pub/subs, etc.)
- **dapr-sidecar-injector:** Injects Dapr into [annotated](#adding-dapr-to-a-kubernetes-deployment) deployment pods and adds the environment variables `DAPR_HTTP_PORT` and `DAPR_GRPC_PORT` to enable user-defined applications to easily communicate with Dapr without hard-coding Dapr port values.
- **dapr-placement:** Used for [actors]({{< ref actors >}}) only. Creates mapping tables that map actor instances to pods
- **dapr-sentry:** Manages mTLS between services and acts as a certificate authority. For more information read the [security overview]({{< ref "security-concept.md" >}}).

<img src="/images/overview_kubernetes.png" width=1000>

## Deploying Dapr to a Kubernetes cluster

Read [this guide]({{< ref kubernetes-deploy.md >}}) to learn how to deploy Dapr to your Kubernetes cluster.

## Adding Dapr to a Kubernetes deployment

Deploying and running a Dapr enabled application into your Kubernetes cluster is as simple as adding a few annotations to the deployment schemes. To give your service an `id` and `port` known to Dapr, turn on tracing through configuration and launch the Dapr sidecar container, you annotate your Kubernetes deployment like this. For more information check  [dapr annotations]({{< ref arguments-annotations-overview.md >}})

```yml
  annotations:
    dapr.io/enabled: "true"
    dapr.io/app-id: "nodeapp"
    dapr.io/app-port: "3000"
    dapr.io/config: "tracing"
```

## Pulling container images from private registries

Dapr works seamlessly with any user application container image, regardless of its origin. Simply init Dapr and add the [Dapr annotations]({{< ref arguments-annotations-overview.md >}}) to your Kubernetes definition to add the Dapr sidecar.

The Dapr control-plane and sidecar images come from the [daprio Docker Hub](https://hub.docker.com/u/daprio) container registry, which is a public registry.

For information about pulling your application images from a private registry, reference the [Kubernetes documentation](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/). If you are using Azure Container Registry with Azure Kubernetes Service, reference the [AKS documentation](https://docs.microsoft.com/azure/aks/cluster-container-registry-integration).

## Quickstart

You can see some examples [here](https://github.com/dapr/quickstarts/tree/master/hello-kubernetes) in the Kubernetes getting started quickstart.

## Supported versions
Dapr support for Kubernetes is aligned with [Kubernetes Version Skew Policy](https://kubernetes.io/releases/version-skew-policy).

## Related links

- [Deploy Dapr to a Kubernetes cluster]({{< ref kubernetes-deploy >}})
- [Upgrade Dapr on a Kubernetes cluster]({{< ref kubernetes-upgrade >}})
- [Production guidelines for Dapr on Kubernetes]({{< ref kubernetes-production.md >}})
- [Dapr Kubernetes Quickstart](https://github.com/dapr/quickstarts/tree/master/hello-kubernetes)
- [Use Bridge to Kubernetes to debug Dapr apps locally, while connected to your Kubernetes cluster]({{< ref bridge-to-kubernetes >}})
