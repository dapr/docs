---
type: docs
title: "Deploy Dapr on a Kubernetes cluster"
linkTitle: "Deploy Dapr"
weight: 20000
description: "Follow these steps to deploy Dapr on Kubernetes."
aliases:
    - /getting-started/install-dapr-kubernetes/
---

When [setting up Dapr on Kubernetes]({{< ref kubernetes-overview.md >}}), you can use either the Dapr CLI or Helm.

{{% alert title="Hybrid clusters" color="primary" %}}
Both the Dapr CLI and the Dapr Helm chart automatically deploy with affinity for nodes with the label `kubernetes.io/os=linux`. You can deploy Dapr to Windows nodes if your application requires it. For more information, see [Deploying to a hybrid Linux/Windows Kubernetes cluster]({{< ref kubernetes-hybrid-clusters >}}).
{{% /alert %}}

{{< tabs "Dapr CLI" "Helm" >}}
 <!-- Dapr CLI -->
{{% codetab %}}
## Install with Dapr CLI

You can install Dapr on a Kubernetes cluster using the [Dapr CLI]({{< ref install-dapr-cli.md >}}).

### Prerequisites

- Install: 
   - [Dapr CLI]({{< ref install-dapr-cli.md >}})
   - [kubectl](https://kubernetes.io/docs/tasks/tools/)
- Create a Kubernetes cluster with Dapr. Here are some helpful links:
   - [Set up KiNd Cluster]({{< ref setup-kind.md >}})
   - [Set up Minikube Cluster]({{< ref setup-minikube.md >}})
   - [Set up Azure Kubernetes Service Cluster]({{< ref setup-aks.md >}})
   - [Set up GKE cluster]({{< ref setup-gke.md >}})
   - [Set up Amazon Elastic Kubernetes Service](https://docs.aws.amazon.com/eks/latest/userguide/getting-started.html)


### Installation options

You can install Dapr from an official Helm chart or a private chart, using a custom namespace, etc.

#### Install Dapr from an official Dapr Helm chart

The `-k` flag initializes Dapr on the Kubernetes cluster in your current context.

1. Verify the correct "target" cluster is set by checking `kubectl context (kubectl config get-contexts)`.
   - You can set a different context using `kubectl config use-context <CONTEXT>`.

1. Initialize Dapr on your cluster with the following command:

    ```bash
    dapr init -k
    ```

    **Expected output**
    
    ```bash
    ⌛  Making the jump to hyperspace...
    
    ✅  Deploying the Dapr control plane to your cluster...
    ✅  Success! Dapr has been installed to namespace dapr-system. To verify, run "dapr status -k" in your terminal. To get started, go here: https://aka.ms/dapr-getting-started
    ```
    
1. Run the dashboard:

    ```bash
    dapr dashboard -k
    ```

    If you installed Dapr in a **non-default namespace**, run:
    
    ```bash
    dapr dashboard -k -n <your-namespace>
    ```

#### Install Dapr from a private Dapr Helm chart

Installing Dapr from a private Helm chart can be helpful for when you:
- Need more granular control of the Dapr Helm chart
- Have a custom Dapr deployment
- Pull Helm charts from trusted registries that are managed and maintained by your organization

Set the following parameters to allow `dapr init -k` to install Dapr images from the configured Helm repository.

```
export DAPR_HELM_REPO_URL="https://helm.custom-domain.com/dapr/dapr"
export DAPR_HELM_REPO_USERNAME="username_xxx"
export DAPR_HELM_REPO_PASSWORD="passwd_xxx"
```
#### Install in high availability mode

You can run Dapr with three replicas of each control plane pod in the `dapr-system` namespace for [production scenarios]({{< ref kubernetes-production.md >}}).

```bash
dapr init -k --enable-ha=true
```

#### Install in custom namespace

The default namespace when initializing Dapr is `dapr-system`. You can override this with the `-n` flag.

```bash
dapr init -k -n mynamespace
```

#### Disable mTLS

Dapr is initialized by default with [mTLS]({{< ref "security-concept.md#sidecar-to-sidecar-communication" >}}). You can disable it with:

```bash
dapr init -k --enable-mtls=false
```

#### Wait for the installation to complete

You can wait for the installation to complete its deployment with the `--wait` flag. The default timeout is 300s (5 min), but can be customized with the `--timeout` flag.

```bash
dapr init -k --wait --timeout 600
```

### Uninstall Dapr on Kubernetes with CLI

Run the following command on your local machine to uninstall Dapr on your cluster:

```bash
dapr uninstall -k
```

{{% /codetab %}}

 <!-- Helm -->
{{% codetab %}}

## Install with Helm

You can install Dapr on Kubernetes using a Helm v3 chart.

❗**Important:** The latest Dapr Helm chart no longer supports Helm v2. [Migrate from Helm v2 to Helm v3](https://helm.sh/blog/migrate-from-helm-v2-to-helm-v3/).

### Prerequisites

- Install: 
   - [Helm v3](https://helm.sh/docs/intro/install/)
   - [kubectl](https://kubernetes.io/docs/tasks/tools/)
- Create a Kubernetes cluster with Dapr. Here are some helpful links:
   - [Set up KiNd Cluster]({{< ref setup-kind.md >}})
   - [Set up Minikube Cluster]({{< ref setup-minikube.md >}})
   - [Set up Azure Kubernetes Service Cluster]({{< ref setup-aks.md >}})
   - [Set up GKE cluster]({{< ref setup-gke.md >}})
   - [Set up Amazon Elastic Kubernetes Service](https://docs.aws.amazon.com/eks/latest/userguide/getting-started.html)


### Add and install Dapr Helm chart

1. Add the Helm repo and update:

    ```bash
    // Add the official Dapr Helm chart.
    helm repo add dapr https://dapr.github.io/helm-charts/
    // Or also add a private Dapr Helm chart.
    helm repo add dapr http://helm.custom-domain.com/dapr/dapr/ \
       --username=xxx --password=xxx
    helm repo update
    // See which chart versions are available
    helm search repo dapr --devel --versions
    ```

1. Install the Dapr chart on your cluster in the `dapr-system` namespace.

    ```bash
    helm upgrade --install dapr dapr/dapr \
    --version={{% dapr-latest-version short="true" %}} \
    --namespace dapr-system \
    --create-namespace \
    --wait
    ```

   To install in **high availability** mode:

    ```bash
    helm upgrade --install dapr dapr/dapr \
    --version={{% dapr-latest-version short="true" %}} \
    --namespace dapr-system \
    --create-namespace \
    --set global.ha.enabled=true \
    --wait
    ```

See [Guidelines for production ready deployments on Kubernetes]({{< ref kubernetes-production.md >}}) for more information on installing and upgrading Dapr using Helm.

### (optional) Install the Dapr dashboard as part of the control plane

If you want to install the Dapr dashboard, use this Helm chart with the additional settings of your choice:

`helm install dapr dapr/dapr-dashboard --namespace dapr-system`

For example:

```bash
helm repo add dapr https://dapr.github.io/helm-charts/
helm repo update
kubectl create namespace dapr-system
# Install the Dapr dashboard
helm install dapr dapr/dapr-dashboard --namespace dapr-system
```

### Verify installation

Once the installation is complete, verify that the `dapr-operator`, `dapr-placement`, `dapr-sidecar-injector`, and `dapr-sentry` pods are running in the `dapr-system` namespace:

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

### Uninstall Dapr on Kubernetes

```bash
helm uninstall dapr --namespace dapr-system
```

### More information

- Read [the Kubernetes productions guidelines]({{< ref kubernetes-production.md >}}) for recommended Helm chart values for production setups
- [More details on Dapr Helm charts](https://github.com/dapr/dapr/blob/master/charts/dapr/README.md)

{{% /codetab %}}

{{< /tabs >}}

### Use Mariner-based images

The default container images pulled on Kubernetes are based on [*distroless*](https://github.com/GoogleContainerTools/distroless).

Alternatively, you can use Dapr container images based on Mariner 2 (minimal distroless). [Mariner](https://github.com/microsoft/CBL-Mariner/), officially known as CBL-Mariner, is a free and open-source Linux distribution and container base image maintained by Microsoft. For some Dapr users, leveraging container images based on Mariner can help you meet compliance requirements.

To use Mariner-based images for Dapr, you need to add `-mariner` to your Docker tags. For example, while `ghcr.io/dapr/dapr:latest` is the Docker image based on *distroless*, `ghcr.io/dapr/dapr:latest-mariner` is based on Mariner. Tags pinned to a specific version are also available, such as `{{% dapr-latest-version short="true" %}}-mariner`.

{{< tabs "Dapr CLI" "Helm" >}}
 <!-- Dapr CLI -->
{{% codetab %}}

In the Dapr CLI, you can switch to using Mariner-based images with the `--image-variant` flag.

```sh
dapr init --image-variant mariner
```

{{% /codetab %}}

 <!-- Helm -->
{{% codetab %}}

With Kubernetes and Helm, you can use Mariner-based images by setting the `global.tag` option and adding `-mariner`. For example:

```sh
helm upgrade --install dapr dapr/dapr \
  --version={{% dapr-latest-version short="true" %}} \
  --namespace dapr-system \
  --create-namespace \
  --set global.tag={{% dapr-latest-version long="true" %}}-mariner \
  --wait
```

{{% /codetab %}}

{{< /tabs >}}

## Related links
- [Deploy Dapr with Helm parameters and other details]({{< ref "kubernetes-production.md#deploy-dapr-with-helm" >}})
- [Upgrade Dapr on Kubernetes]({{< ref kubernetes-upgrade.md >}})
- [Kubernetes production guidelines]({{< ref kubernetes-production.md >}})
- [Configure state store & pubsub message broker]({{< ref "getting-started/tutorials/configure-state-pubsub.md" >}})
