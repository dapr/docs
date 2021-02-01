---
type: docs
title: "How-To: Install Dapr into a Kubernetes cluster"
linkTitle: "(optional) Init Dapr on Kubernetes"
weight: 70
description: "Install Dapr in a Kubernetes cluster"
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
This command downloads and installs Dapr runtime v0.11. To install v1.0-rc3 preview, the release candidate for the upcoming v1.0 release please visit the [v1.0-rc3 docs version of this page](https://v1-rc1.docs.dapr.io/getting-started/install-dapr-kubernetes/). Note you will need to ensure you are also using the preview version of the CLI (instructions to install the latest preview CLI can be found [here](https://v1-rc3.docs.dapr.io/getting-started/install-dapr-cli/)).
{{% /alert %}}

### Install Dapr

The `-k` flag initializes Dapr on the Kubernetes cluster in your current context.

{{% alert title="Target cluster" color="primary" %}}
Make sure the correct "target" cluster is set. Check `kubectl context (kubectl config kubectl config get-contexts)` to verify. You can set a different context using `kubectl config use-context <CONTEXT>`.
{{% /alert %}}

Run on your local machine:

```bash
dapr init -k
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
dapr init -k -n mynamespace
```


### Install in highly available mode:

You can run Dapr with 3 replicas of each control plane pod with the exception of the Placement pod in the dapr-system namespace for [production scenarios]({{< ref kubernetes-production.md >}}).

```bash
dapr init -k --enable-ha=true
```

### Disable mTLS

Dapr is initialized by default with [mTLS]({{< ref "security-concept.md#sidecar-to-sidecar-communication" >}}). You can disable it with:

```bash
dapr init -k --enable-mtls=false
```

### Uninstall Dapr on Kubernetes with CLI

```bash
dapr uninstall --kubernetes
```

## Install with Helm (advanced)

You can install Dapr to Kubernetes cluster using a Helm 3 chart.


{{% alert title="Note" color="primary" %}}
The latest Dapr helm chart no longer supports Helm v2. Please migrate from helm v2 to helm v3 by following [this guide](https://helm.sh/blog/migrate-from-helm-v2-to-helm-v3/).
{{% /alert %}}

### Add and install Dapr helm chart

1. Make sure [Helm 3](https://github.com/helm/helm/releases) is installed on your machine
2. Add Helm repo and update

    ```bash
    helm repo add dapr https://dapr.github.io/helm-charts/
    helm repo update
    ```

3. Create `dapr-system` namespace on your kubernetes cluster

    ```bash
    kubectl create namespace dapr-system
    ```

4. Install the Dapr chart on your cluster in the `dapr-system` namespace.

    ```bash
    helm install dapr dapr/dapr --namespace dapr-system
    ```

### Verify installation

Once the chart installation is complete verify the dapr-operator, dapr-placement, dapr-sidecar-injector and dapr-sentry pods are running in the `dapr-system` namespace:

```bash
kubectl get pods -n dapr-system -w
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
helm uninstall dapr -n dapr-system
```

### More information

See [this page](https://github.com/dapr/dapr/blob/master/charts/dapr/README.md) for details on Dapr helm charts.

## Next steps

- [Configure state store & pubsub message broker]({{< ref configure-state-pubsub.md >}})
