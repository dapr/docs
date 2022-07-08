---
type: docs
title: "Overview of Dapr on Kubernetes"
linkTitle: "Overview"
weight: 10000
description: "Overview of how to get Dapr running on your Kubernetes cluster"
---

## Dapr on Kubernetes

Dapr can be configured to run on any Kubernetes cluster. To achieve this, Dapr begins by deploying the `dapr-sidecar-injector`, `dapr-operator`, `dapr-placement`, and `dapr-sentry` Kubernetes services. These provide first-class integration to make running applications with Dapr easy.
- **dapr-operator:** Manages [component]({{< ref components >}}) updates and Kubernetes services endpoints for Dapr (state stores, pub/subs, etc.)
- **dapr-sidecar-injector:** Injects Dapr into [annotated](#adding-dapr-to-a-kubernetes-deployment) deployment pods and adds the environment variables `DAPR_HTTP_PORT` and `DAPR_GRPC_PORT` to enable user-defined applications to easily communicate with Dapr without hard-coding Dapr port values.
- **dapr-placement:** Used for [actors]({{< ref actors >}}) only. Creates mapping tables that map actor instances to pods
- **dapr-sentry:** Manages mTLS between services and acts as a certificate authority. For more information read the [security overview]({{< ref "security-concept.md" >}}).

<img src="/images/overview_kubernetes.png" width=800>

## Deploying Dapr to a Kubernetes cluster

Read [this guide]({{< ref kubernetes-deploy.md >}}) to learn how to deploy Dapr to your Kubernetes cluster.

## Adding Dapr to a Kubernetes deployment

Deploying and running a Dapr enabled application into your Kubernetes cluster is as simple as adding a few annotations to the deployment schemes. To give your service an `id` and `port` known to Dapr, turn on tracing through configuration and launch the Dapr sidecar container, you annotate your Kubernetes deployment like this. For more information check  [dapr annotations]({{< ref kubernetes-annotations.md >}})

```yml
  annotations:
    dapr.io/enabled: "true"
    dapr.io/app-id: "nodeapp"
    dapr.io/app-port: "3000"
    dapr.io/config: "tracing"
```

## Quickstart

You can see some examples [here](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes) in the Kubernetes getting started tutorial.

## Related links

- [Deploy Dapr to a Kubernetes cluster]({{< ref kubernetes-deploy >}})
- [Upgrade Dapr on a Kubernetes cluster]({{< ref kubernetes-upgrade >}})
- [Production guidelines for Dapr on Kubernetes]({{< ref kubernetes-production.md >}})
- [Dapr Kubernetes tutorial](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes)
