---
type: docs
title: "Deploy Dapr on a Kubernetes cluster"
linkTitle: "Deploy Dapr"
weight: 20000
description: "Follow these steps to deploy Dapr on Kubernetes."
aliases:
    - /getting-started/install-dapr-kubernetes/
---

When setting up Kubernetes you can use either the Dapr CLI or Helm.

For more information on what is deployed to your Kubernetes cluster read the [Kubernetes overview]({{< ref kubernetes-overview.md >}})

## Prerequisites

- Install [Dapr CLI]({{< ref install-dapr-cli.md >}})
- Install [kubectl](https://kubernetes.io/docs/tasks/tools/)
- Kubernetes cluster (see below if needed)

### Create cluster

You can install Dapr on any Kubernetes cluster. Here are some helpful links:

- [Setup KiNd Cluster]({{< ref setup-kind.md >}})
- [Setup Minikube Cluster]({{< ref setup-minikube.md >}})
- [Setup Azure Kubernetes Service Cluster]({{< ref setup-aks.md >}})
- [Setup Google Cloud Kubernetes Engine](https://docs.dapr.io/operations/hosting/kubernetes/cluster/setup-gke/)
- [Setup Amazon Elastic Kubernetes Service](https://docs.aws.amazon.com/eks/latest/userguide/getting-started.html)

{{% alert title="Hybrid clusters" color="primary" %}}
Both the Dapr CLI and the Dapr Helm chart automatically deploy with affinity for nodes with the label `kubernetes.io/os=linux`. You can deploy Dapr to Windows nodes if your application requires it. For more information see [Deploying to a hybrid Linux/Windows Kubernetes cluster]({{<ref kubernetes-hybrid-clusters>}}).
{{% /alert %}}


## Install with Dapr CLI

You can install Dapr to a Kubernetes cluster using the [Dapr CLI]({{< ref install-dapr-cli.md >}}).

### Install Dapr (from an official Dapr Helm chart)

The `-k` flag initializes Dapr on the Kubernetes cluster in your current context.

{{% alert title="Ensure correct cluster is set" color="warning" %}}
Make sure the correct "target" cluster is set. Check `kubectl context (kubectl config get-contexts)` to verify. You can set a different context using `kubectl config use-context <CONTEXT>`.
{{% /alert %}}

Run the following command on your local machine to init Dapr on your cluster:

```bash
dapr init -k
```

```bash
⌛  Making the jump to hyperspace...

✅  Deploying the Dapr control plane to your cluster...
✅  Success! Dapr has been installed to namespace dapr-system. To verify, run "dapr status -k" in your terminal. To get started, go here: https://aka.ms/dapr-getting-started
```

### Install Dapr (a private Dapr Helm chart)
There are some scenarios where it's necessary to install Dapr from a private Helm chart, such as:
- needing more granular control of the Dapr Helm chart
- having a custom Dapr deployment
- pulling Helm charts from trusted registries that are managed and maintained by your organization

```shell
export DAPR_HELM_REPO_URL="https://helm.custom-domain.com/dapr/dapr"
export DAPR_HELM_REPO_USERNAME="username_xxx"
export DAPR_HELM_REPO_PASSWORD="passwd_xxx"
```

Setting the above parameters will allow `dapr init -k` to install Dapr images from the configured Helm repository.

### Install in custom namespace

The default namespace when initializing Dapr is `dapr-system`. You can override this with the `-n` flag.

```bash
dapr init -k -n mynamespace
```

### Install in highly available mode

You can run Dapr with 3 replicas of each control plane pod in the dapr-system namespace for [production scenarios]({{< ref kubernetes-production.md >}}).

```bash
dapr init -k --enable-ha=true
```

### Disable mTLS

Dapr is initialized by default with [mTLS]({{< ref "security-concept.md#sidecar-to-sidecar-communication" >}}). You can disable it with:

```bash
dapr init -k --enable-mtls=false
```

### Wait for the installation to complete

 You can wait for the installation to complete its deployment with the `--wait` flag.

 The default timeout is 300s (5 min), but can be customized with the `--timeout` flag.

```bash
dapr init -k --wait --timeout 600
```

### Uninstall Dapr on Kubernetes with CLI

Run the following command on your local machine to uninstall Dapr on your cluster:

```bash
dapr uninstall -k
```

## Install with Helm (advanced)

You can install Dapr on Kubernetes using a Helm 3 chart.

{{% alert title="Ensure you are on Helm v3" color="primary" %}}
The latest Dapr helm chart no longer supports Helm v2. Please migrate from Helm v2 to Helm v3 by following [this guide](https://helm.sh/blog/migrate-from-helm-v2-to-helm-v3/).
{{% /alert %}}

### Add and install Dapr Helm chart

1. Make sure [Helm 3](https://github.com/helm/helm/releases) is installed on your machine
2. Add Helm repo and update

    ```bash
    // Add the official Dapr Helm chart.
    helm repo add dapr https://dapr.github.io/helm-charts/
    // Or also add a private Dapr Helm chart.
    helm repo add dapr http://helm.custom-domain.com/dapr/dapr/ \
       --username=xxx --password=xxx
    helm repo update
    # See which chart versions are available
    helm search repo dapr --devel --versions
    ```
3. Install the Dapr chart on your cluster in the `dapr-system` namespace.

    ```bash
    helm upgrade --install dapr dapr/dapr \
    --version={{% dapr-latest-version short="true" %}} \
    --namespace dapr-system \
    --create-namespace \
    --wait
    ```

   To install in high availability mode:

    ```bash
    helm upgrade --install dapr dapr/dapr \
    --version={{% dapr-latest-version short="true" %}} \
    --namespace dapr-system \
    --create-namespace \
    --set global.ha.enabled=true \
    --wait
    ```


   See [Guidelines for production ready deployments on Kubernetes]({{<ref kubernetes-production.md>}}) for more information on    installing and upgrading Dapr using Helm.

### Uninstall Dapr on Kubernetes

```bash
helm uninstall dapr --namespace dapr-system
```

### More information

- Read [this guide]({{< ref kubernetes-production.md >}}) for recommended Helm chart values for production setups
- See [this page](https://github.com/dapr/dapr/blob/master/charts/dapr/README.md) for details on Dapr Helm charts.

## Verify installation

Once the installation is complete, verify that the dapr-operator, dapr-placement, dapr-sidecar-injector and dapr-sentry pods are running in the `dapr-system` namespace:

```bash
kubectl get pods --namespace dapr-system
```

```bash
NAME                                     READY     STATUS    RESTARTS   AGE
dapr-dashboard-7bd6cbf5bf-xglsr          1/1       Running   0          40s
dapr-operator-7bd6cbf5bf-xglsr           1/1       Running   0          40s
dapr-placement-7f8f76778f-6vhl2          1/1       Running   0          40s
dapr-sidecar-injector-8555576b6f-29cqm   1/1       Running   0          40s
dapr-sentry-9435776c7f-8f7yd             1/1       Running   0          40s
```

## Using Mariner-based images

When deploying Dapr, whether on Kubernetes or in Docker self-hosted, the default container images that are pulled are based on [*distroless*](https://github.com/GoogleContainerTools/distroless).

Alternatively, you can use Dapr container images based on Mariner 2 (minimal distroless). [Mariner](https://github.com/microsoft/CBL-Mariner/), officially known as CBL-Mariner, is a free and open-source Linux distribution and container base image maintained by Microsoft. For some Dapr users, leveraging container images based on Mariner can help you meet compliance requirements.

To use Mariner-based images for Dapr, you need to add `-mariner` to your Docker tags. For example, while `ghcr.io/dapr/dapr:latest` is the Docker image based on *distroless*, `ghcr.io/dapr/dapr:latest-mariner` is based on Mariner. Tags pinned to a specific version are also available, such as `{{% dapr-latest-version short="true" %}}-mariner`.

With Kubernetes and Helm, you can use Mariner-based images by setting the `global.tag` option and adding `-mariner`. For example:

```sh
helm upgrade --install dapr dapr/dapr \
  --version={{% dapr-latest-version short="true" %}} \
  --namespace dapr-system \
  --create-namespace \
  --set global.tag={{% dapr-latest-version long="true" %}}-mariner \
  --wait
```

## Next steps

- [Configure state store & pubsub message broker]({{< ref "getting-started/tutorials/configure-state-pubsub.md" >}})
