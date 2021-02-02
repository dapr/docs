---
type: docs
title: "Deploy Dapr on a Kubernetes cluster"
linkTitle: "Deploy Dapr"
weight: 20000
description: "Follow these steps to deploy Dapr on Kubernetes."
aliases = [
    "/getting-started/install-dapr-kubernetes/"
]
---

When setting up Kubernetes you can use either the Dapr CLI or Helm.

As part of the Dapr initialization the following pods are installed:

- **dapr-operator:** Manages component updates and Kubernetes services endpoints for Dapr (state stores, pub/subs, etc.)
- **dapr-sidecar-injector:** Injects Dapr into annotated deployment pods
- **dapr-placement:** Used for actors only. Creates mapping tables that map actor instances to pods
- **dapr-sentry:** Manages mTLS between services and acts as a certificate authority

## Prerequisites

- Install [Dapr CLI]({{< ref install-dapr-cli.md >}})
- Install [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- Kubernetes cluster (see below if needed)

### Create cluster

You can install Dapr on any Kubernetes cluster. Here are some helpful links:

- [Setup Minikube Cluster]({{< ref setup-minikube.md >}})
- [Setup Azure Kubernetes Service Cluster]({{< ref setup-aks.md >}})
- [Setup Google Cloud Kubernetes Engine](https://cloud.google.com/kubernetes-engine/docs/quickstart)
- [Setup Amazon Elastic Kubernetes Service](https://docs.aws.amazon.com/eks/latest/userguide/getting-started.html)

{{% alert title="Hybrid clusters" color="primary" %}}
Both the Dapr CLI and the Dapr Helm chart automatically deploy with affinity for nodes with the label `kubernetes.io/os=linux`. You can deploy Dapr to Windows nodes if your application requires it. For more information see [Deploying to a hybrid Linux/Windows Kubernetes cluster]({{<ref kubernetes-hybrid-clusters>}}).
{{% /alert %}}


## Install with Dapr CLI

You can install Dapr to a Kubernetes cluster using the [Dapr CLI]({{< ref install-dapr-cli.md >}}).

{{% alert title="Release candidate" color="warning" %}}
This command downloads and install Dapr runtime v1.0-rc.3. To install v0.11, the latest release prior to the release candidates for the [upcoming v1.0 release](https://blog.dapr.io/posts/2020/10/20/the-path-to-v.1.0-production-ready-dapr/), please visit the [v0.11 docs](https://docs.dapr.io).
{{% /alert %}}

### Install Dapr

The `-k` flag initializes Dapr on the Kubernetes cluster in your current context.

{{% alert title="Target cluster" color="primary" %}}
Make sure the correct "target" cluster is set. Check `kubectl context (kubectl config kubectl config get-contexts)` to verify. You can set a different context using `kubectl config use-context <CONTEXT>`.
{{% /alert %}}

Run on your local machine:

```bash
dapr init -k --runtime-version 1.0.0-rc.3
```

```
⌛  Making the jump to hyperspace...
ℹ️  Note: To install Dapr using Helm, see here:  https://github.com/dapr/docs/blob/master/getting-started/environment-setup.md#using-helm-advanced

✅  Deploying the Dapr control plane to your cluster...
✅  Success! Dapr has been installed to namespace dapr-system. To verify, run "dapr status -k" in your terminal. To get started, go here: https://aka.ms/dapr-getting-started
```

### Install in custom namespace

The default namespace when initializing Dapr is `dapr-system`. You can override this with the `-n` flag.

```bash
dapr init -k -n mynamespace --runtime-version 1.0.0-rc.3
```


### Install in highly available mode:

You can run Dapr with 3 replicas of each control plane pod with the exception of the Placement pod in the dapr-system namespace for [production scenarios]({{< ref kubernetes-production.md >}}).

```bash
dapr init -k --enable-ha=true --runtime-version 1.0.0-rc.3
```

### Disable mTLS

Dapr is initialized by default with [mTLS]({{< ref "security-concept.md#sidecar-to-sidecar-communication" >}}). You can disable it with:

```bash
dapr init -k --enable-mtls=false --runtime-version 1.0.0-rc.3
```

### Uninstall Dapr on Kubernetes with CLI

```bash
dapr uninstall --kubernetes
```

### Upgrade Dapr on a cluster
To upgrade Dapr on a Kubernetes cluster you can use the CLI. See [upgrade Dapr on Kubernetes]({{< ref kubernetes-upgrade.md >}}) for more information. 

## Install with Helm (advanced)

You can install Dapr on Kubernetes using a Helm 3 chart.


{{% alert title="Note" color="primary" %}}
The latest Dapr helm chart no longer supports Helm v2. Please migrate from Helm v2 to Helm v3 by following [this guide](https://helm.sh/blog/migrate-from-helm-v2-to-helm-v3/).
{{% /alert %}}

### Add and install Dapr Helm chart

1. Make sure [Helm 3](https://github.com/helm/helm/releases) is installed on your machine

2. Add Helm repo and update

    ```bash
    helm repo add dapr https://dapr.github.io/helm-charts/
    helm repo update
    # See which chart versions are available
    helm search repo dapr --devel --versions
    ```

3. Install the Dapr chart on your cluster in the `dapr-system` namespace.

    ```bash
    helm upgrade --install dapr dapr/dapr \
    --version=1.0.0-rc.3 \
    --namespace dapr-system \
    --create-namespace \
    --wait
    ```

See [Guidelines for production ready deployments on Kubernetes]({{<ref kubernetes-production.md>}}) for more information on installing and upgrading Dapr using Helm.

### Verify installation

Once the chart installation is complete, verify that the dapr-operator, dapr-placement, dapr-sidecar-injector and dapr-sentry pods are running in the `dapr-system` namespace:

```bash
kubectl get pods --namespace dapr-system
```

```
NAME                                     READY     STATUS    RESTARTS   AGE
dapr-dashboard-7bd6cbf5bf-xglsr          1/1       Running   0          40s
dapr-operator-7bd6cbf5bf-xglsr           1/1       Running   0          40s
dapr-placement-7f8f76778f-6vhl2          1/1       Running   0          40s
dapr-sidecar-injector-8555576b6f-29cqm   1/1       Running   0          40s
dapr-sentry-9435776c7f-8f7yd             1/1       Running   0          40s
```

### Uninstall Dapr on Kubernetes

```bash
helm uninstall dapr --namespace dapr-system
```

### More information

- Read [this guide]({{< ref kubernetes-production.md >}}) for recommended Helm chart values for production setups
- See [this page](https://github.com/dapr/dapr/blob/master/charts/dapr/README.md) for details on Dapr Helm charts.


## Next steps

- [Configure state store & pubsub message broker]({{< ref configure-state-pubsub.md >}})
